import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  Wallet,
  DollarSign,
  CheckCircle,
  Loader,
  Clock
} from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useUser } from '../../context/UserContext'
import Header from '../../components/Header'

// --- 🍑 WARM PEACH THEME (With Clean White Cards) ---
// bgMain: '#FFF3E8'
// borderOrange: '#E85D04'
// accentAmber: '#F48C06'
// textDark: '#2C1810'
// textMuted: '#5C3D2E'

import { API_BASE_URL } from '../../api/axiosInstance';

const Payment = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { cartItems, clearCart } = useCart()
  const { addresses = [] } = useUser()

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('online')
  const [processing, setProcessing] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [error, setError] = useState(null)
  const [showDeliveryCheck, setShowDeliveryCheck] = useState(false)
  const [deliveryCheckStep, setDeliveryCheckStep] = useState('checking')
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduledTime, setScheduledTime] = useState('')

  // Get order details from location state (passed from Cart)
  const {
    subtotal = 0,
    taxes = 0,
    deliveryFee = 0,
    total = 0,
    discountAmount = 0,
    deliveryDistance = 0,
    deliveryTime = 0,
    selectedAddress: passedAddress
  } = location.state || {}

  useEffect(() => {
    // If no cart items or no order data, redirect back to cart
    if (!cartItems || cartItems.length === 0 || !location.state) {
      navigate('/cart')
    }

    // Set address from cart or use default
    if (passedAddress) {
      setSelectedAddress(passedAddress)
    } else if (addresses && addresses.length > 0) {
      const defaultAddr = addresses.find(addr => addr.isDefault) || addresses[0]
      setSelectedAddress(defaultAddr)
    }
  }, [cartItems, location.state, navigate, addresses, passedAddress])

  const paymentMethods = [
    {
      id: 'online',
      name: 'UPI / Cards / NetBanking',
      icon: CreditCard,
      description: 'Pay securely with UPI, Credit/Debit Cards, or NetBanking'
    },
    {
      id: 'wallet',
      name: 'Digital Wallets',
      icon: Wallet,
      description: 'Paytm, PhonePe, Google Pay & more'
    },
    {
      id: 'COD',
      name: 'Cash on Delivery',
      icon: DollarSign,
      description: 'Pay with cash when your order arrives'
    }
  ]

  const handlePayment = async () => {
    setError(null)
    if (!addresses || addresses.length === 0) {
      setError('Please add a delivery address first');
      navigate('/addresses');
      return;
    }

    if (!selectedAddress) {
      setError('Please select a delivery address');
      return;
    }

    if (isScheduled && !scheduledTime) {
      setError('Please select a delivery time for your scheduled order');
      return;
    }

    if (isScheduled && new Date(scheduledTime) < new Date(Date.now() + 29 * 60000)) {
      setError('Scheduled time must be at least 30 minutes in the future');
      return;
    }

    setShowDeliveryCheck(true);
    setDeliveryCheckStep('checking');

    setTimeout(async () => {
      setDeliveryCheckStep('available');

      setTimeout(async () => {
        try {
          const token = localStorage.getItem('token');

          if (!token) {
            setError('Please login to continue');
            navigate('/login');
            return;
          }

          console.log('Cart items:', cartItems); // Debug log

          // ✅ FIXED: Prepare order data with STRING customization
          const orderData = {
            items: cartItems.map(item => {
              console.log('Processing item:', item);

              // ✅ Convert customization to string or empty string
              let customizationStr = '';
              if (item.customization) {
                if (Array.isArray(item.customization)) {
                  customizationStr = item.customization.join(', ');
                } else if (typeof item.customization === 'object') {
                  customizationStr = JSON.stringify(item.customization);
                } else {
                  customizationStr = String(item.customization);
                }
              }

              return {
                menuItem: item._id || item.id || null,
                name: item.name || 'Unknown Item',
                price: Number(item.price) || 0,
                quantity: Number(item.qty) || 1,
                image: item.image || '/placeholder.jpg',
                customization: customizationStr // ✅ Always STRING
              };
            }),
            restaurantName: cartItems[0]?.restaurantName ||
              cartItems[0]?.restaurant?.name ||
              'Restaurant',
            restaurantImage: cartItems[0]?.restaurantImage ||
              cartItems[0]?.restaurant?.image ||
              '/placeholder.jpg',
            restaurant: cartItems[0]?.restaurantId ||
              cartItems[0]?.restaurant?._id ||
              null,
            deliveryAddress: {
              street: selectedAddress.street || '',
              city: selectedAddress.city || '',
              state: selectedAddress.state || '',
              pincode: selectedAddress.pincode || '',
              landmark: selectedAddress.landmark || '',
              type: selectedAddress.type || 'home'
            },
            subtotal: Number(subtotal) || 0,
            deliveryFee: Number(deliveryFee) || 0,
            taxes: Number(taxes) || 0,
            discount: Number(discountAmount) || 0,
            total: Number(total) || 0,
            paymentMethod: selectedPaymentMethod,
            estimatedDeliveryTime: new Date(Date.now() + 30 * 60000),
            deliveryDistance: Number(deliveryDistance) || 0,
            deliveryDuration: Number(deliveryTime) || 30,
            instructions: '',
            isScheduled: isScheduled,
            scheduledFor: isScheduled ? new Date(scheduledTime) : null
          };

          console.log('🐞 Payload Debug:', {
            subtotal: orderData.subtotal,
            discount: orderData.discount,
            total: orderData.total
          });

          console.log('Sending order data:', orderData);

          const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
          });

          const data = await response.json();
          console.log('Backend response:', data);

          if (data.success) {
            const navOrderData = {
              orderId: data.data._id,
              orderNumber: data.data.orderId || data.data._id,
              items: orderData.items,
              total: orderData.total,
              totalAmount: orderData.total,
              paymentMethod: selectedPaymentMethod,
              estimatedDeliveryTime: data.data.estimatedDeliveryTime || orderData.estimatedDeliveryTime,
              deliveryAddress: orderData.deliveryAddress,
              restaurantName: orderData.restaurantName,
              isScheduled: orderData.isScheduled,
              scheduledFor: orderData.scheduledFor
            };

            navigate('/order-success', {
              state: navOrderData
            });

            setTimeout(() => {
              if (clearCart) clearCart();
            }, 500);

            setShowDeliveryCheck(false);
          } else {
            throw new Error(data.message || 'Failed to create order');
          }

        } catch (error) {
          console.error('Error creating order:', error);
          setShowDeliveryCheck(false);
          setError('Order failed: ' + error.message);
        }
      }, 1500);
    }, 2500);
  };

  if (!location.state) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#FFF3E8] font-['Inter',_sans-serif]">
      <Header />

      <div className="pt-16 pb-6 sm:pt-20 sm:pb-8">
        <div className="max-w-4xl px-3 mx-auto sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center mb-4 font-semibold text-[#5C3D2E] hover:text-[#E85D04] transition-colors sm:mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2 shrink-0" />
            <span className="text-sm sm:text-base">Back to Cart</span>
          </button>

          <h1 className="mb-4 text-xl font-extrabold text-[#2C1810] sm:mb-8 sm:text-3xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Complete Your Payment</h1>

          {/* Error Message */}
          {error && (
            <div className="px-3 py-3 mb-4 text-[#C1440E] bg-red-50 border border-red-200 rounded-xl sm:px-4 sm:mb-6 shadow-sm">
              <p className="text-sm font-bold sm:text-base">Error:</p>
              <p className="text-sm font-medium sm:text-base">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:gap-8 lg:grid-cols-3">
            {/* Payment Methods & Schedule */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <div className="p-4 bg-white border border-[rgba(44,24,16,0.05)] shadow-[0_8px_30px_rgba(44,24,16,0.04)] sm:p-6 rounded-3xl">
                <h2 className="mb-4 text-base font-extrabold text-[#2C1810] sm:mb-6 sm:text-xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Select Payment Method</h2>

                <div className="space-y-3 sm:space-y-4">
                  {paymentMethods.map((method) => (
                    <motion.div
                      key={method.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`p-3 sm:p-4 border-2 rounded-2xl cursor-pointer transition-all ${selectedPaymentMethod === method.id
                        ? 'border-[#E85D04] bg-[#FFF3E8]'
                        : 'border-[rgba(44,24,16,0.05)] hover:border-[#E85D04]/30'
                        }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className={`p-2.5 sm:p-3 rounded-xl shrink-0 transition-colors ${selectedPaymentMethod === method.id
                          ? 'bg-[#E85D04] text-white shadow-md'
                          : 'bg-gray-50 text-[#5C3D2E]'
                          }`}>
                          <method.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-sm font-bold text-[#2C1810] sm:text-base">{method.name}</h3>
                            {selectedPaymentMethod === method.id && (
                              <CheckCircle className="w-4 h-4 text-[#E85D04] sm:w-5 sm:h-5 shrink-0" />
                            )}
                          </div>
                          <p className="mt-0.5 sm:mt-1 text-xs font-medium sm:text-sm text-[#5C3D2E]/80">{method.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              {selectedAddress ? (
                <div className="p-4 bg-white border border-[rgba(44,24,16,0.05)] shadow-[0_8px_30px_rgba(44,24,16,0.04)] sm:p-6 rounded-3xl">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h2 className="text-base font-extrabold text-[#2C1810] sm:text-xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Delivery Address</h2>
                    <button
                      onClick={() => navigate('/addresses')}
                      className="text-xs font-bold text-[#E85D04] sm:text-sm hover:text-[#C1440E] transition-colors"
                    >
                      Change
                    </button>
                  </div>
                  <div className="p-3 rounded-2xl sm:p-4 bg-[#FFF3E8]/50 border border-[rgba(44,24,16,0.05)]">
                    <p className="text-sm font-bold text-[#2C1810] capitalize sm:text-base">{selectedAddress.type}</p>
                    <p className="mt-1 text-sm font-medium text-[#5C3D2E] sm:mt-2 sm:text-base">
                      {selectedAddress.street}
                    </p>
                    <p className="text-sm font-medium text-[#5C3D2E] sm:text-base">
                      {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                    </p>
                    {selectedAddress.landmark && (
                      <p className="mt-1 text-xs font-medium text-[#5C3D2E]/80 sm:text-sm">
                        Landmark: {selectedAddress.landmark}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="px-4 py-4 text-[#C1440E] bg-[#FFF3E8] border border-[#E85D04]/30 rounded-2xl shadow-sm">
                  <p className="text-sm font-bold sm:text-base">No delivery address selected</p>
                  <button
                    onClick={() => navigate('/addresses')}
                    className="mt-2 text-sm font-bold text-[#E85D04] sm:text-base hover:text-[#C1440E]"
                  >
                    Add Delivery Address →
                  </button>
                </div>
              )}
            </div>

            {/* Right column: Schedule + Order Summary */}
            <div className="space-y-4 sm:space-y-6">
              <div className="p-4 bg-white border border-[rgba(44,24,16,0.05)] shadow-[0_8px_30px_rgba(44,24,16,0.04)] sm:p-6 rounded-3xl lg:sticky lg:top-24">

                {/* Schedule Delivery */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4">
                    <div className="p-2 bg-[#FFF3E8] rounded-xl shrink-0">
                      <Clock className="w-5 h-5 text-[#E85D04]" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-[#2C1810] sm:text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Schedule Delivery</h2>
                      <p className="text-xs font-medium text-[#5C3D2E] sm:text-sm">Choose when you want your food</p>
                    </div>
                  </div>

                  <div className="flex p-1 mb-4 bg-gray-50 border border-[rgba(44,24,16,0.05)] sm:mb-6 rounded-xl">
                    <button
                      onClick={() => setIsScheduled(false)}
                      className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 ${!isScheduled
                        ? 'bg-white text-[#2C1810] shadow-sm'
                        : 'text-[#5C3D2E] hover:text-[#2C1810]'
                        }`}
                    >
                      Deliver Now
                    </button>
                    <button
                      onClick={() => setIsScheduled(true)}
                      className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 ${isScheduled
                        ? 'bg-white text-[#2C1810] shadow-sm'
                        : 'text-[#5C3D2E] hover:text-[#2C1810]'
                        }`}
                    >
                      Schedule Later
                    </button>
                  </div>

                  <motion.div
                    initial={false}
                    animate={{ height: isScheduled ? 'auto' : 0, opacity: isScheduled ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mb-2">
                      <label className="block mb-2 text-xs font-bold text-[#2C1810] sm:text-sm">
                        Select Date & Time
                      </label>
                      <div className="relative">
                        <input
                          type="datetime-local"
                          min={new Date(Date.now() + 30 * 60000).toISOString().slice(0, 16)}
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-[#2C1810] bg-[#FFF3E8]/50 border border-[rgba(44,24,16,0.1)] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E85D04] transition-colors"
                        />
                      </div>
                      <div className="flex items-start gap-2 mt-2 text-xs font-medium text-[#5C3D2E] sm:mt-3">
                        <div className="mt-1 min-w-[4px] h-1 bg-[#E85D04] rounded-full shrink-0" />
                        <p>Please select a time at least 30 mins from now</p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <hr className="border-[rgba(44,24,16,0.05)] mb-6" />

                {/* Order Summary */}
                <h3 className="mb-4 text-base font-extrabold text-[#2C1810] sm:mb-5 sm:text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Order Summary</h3>

                <div className="space-y-3 sm:space-y-3 font-medium text-[#5C3D2E]">
                  <div className="flex justify-between">
                    <span className="text-sm sm:text-base">Items ({cartItems.length})</span>
                    <span className="text-sm font-bold text-[#2C1810] sm:text-base">₹{subtotal}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm sm:text-base">Taxes & Fees</span>
                    <span className="text-sm font-bold text-[#2C1810] sm:text-base">₹{taxes}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm sm:text-base">Delivery Fee</span>
                    <span className="text-sm font-bold text-[#2C1810] sm:text-base">
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                    </span>
                  </div>

                  {deliveryDistance > 0 && (
                    <div className="text-xs text-[#5C3D2E]/80">
                      Distance: {deliveryDistance} km • Time: {deliveryTime} mins
                    </div>
                  )}

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600 font-bold">
                      <span className="text-sm sm:text-base">Discount</span>
                      <span className="text-sm sm:text-base">-₹{discountAmount}</span>
                    </div>
                  )}

                  <hr className="border-[rgba(44,24,16,0.05)] my-2" />

                  <div className="flex justify-between text-base font-extrabold text-[#2C1810] sm:text-xl">
                    <span>Total</span>
                    <span className="text-[#E85D04]">₹{Math.round(total)}</span>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={processing || !selectedAddress}
                  className="flex gap-2 justify-center items-center py-3.5 sm:py-4 mt-6 w-full font-bold text-sm sm:text-base text-white bg-gradient-to-r from-[#E85D04] to-[#F48C06] rounded-xl shadow-lg transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {processing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin shrink-0" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      {selectedPaymentMethod === 'COD' ? 'Place Order' : `Pay ₹${Math.round(total)}`}
                    </>
                  )}
                </button>

                {selectedPaymentMethod === 'COD' && (
                  <p className="mt-3 text-xs font-medium text-center text-[#5C3D2E]">
                    💵 Cash on Delivery - Pay when your order arrives
                  </p>
                )}

                {selectedPaymentMethod === 'online' && (
                  <p className="mt-3 text-xs font-medium text-center text-[#5C3D2E]">
                    🔒 Secure payment powered by Razorpay
                  </p>
                )}
              </div>

              {/* Safety Info */}
              <div className="p-3 border border-blue-200 rounded-xl sm:p-4 bg-blue-50 shadow-sm">
                <p className="text-xs text-blue-800 sm:text-sm font-medium">
                  <span className="font-bold">Safe & Secure:</span> Your payment information is encrypted and secure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Payment