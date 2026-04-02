import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  Tag,
  Clock,
  ShoppingBag,
  MapPin,
  Home as HomeIcon,
  Briefcase,
  Loader,
  CheckCircle
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

const Cart = () => {
  const navigate = useNavigate()

  const cartContext = useCart()
  const userContext = useUser()

  useEffect(() => {
    const handlePopState = (e) => {
      e.preventDefault?.();
      navigate('/home', { replace: true });
    };
    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);


  if (!cartContext || !userContext) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#FFF3E8]">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-[rgba(44,24,16,0.05)]">
          <p className="mb-4 font-bold text-[#E85D04]">Context not available</p>
          <button
            onClick={() => navigate('/home')}
            className="px-6 py-2.5 font-bold text-white bg-gradient-to-r from-[#E85D04] to-[#F48C06] rounded-xl shadow-lg transition-transform hover:scale-105"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  const {
    cartItems,
    updateQty,
    removeFromCart,
    appliedCoupon,
    discountAmount,
    applyCoupon,
    removeCoupon
  } = cartContext

  const { addresses = [] } = userContext

  const [selectedAddress, setSelectedAddress] = useState(null)
  const [couponCode, setCouponCode] = useState('')

  // Delivery check modal states
  const [showDeliveryCheck, setShowDeliveryCheck] = useState(false)
  const [deliveryCheckStep, setDeliveryCheckStep] = useState('checking') // 'checking' | 'available' | 'unavailable'

  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddress) {
      const defaultAddr = addresses.find(addr => addr.isDefault) || addresses[0]
      setSelectedAddress(defaultAddr)
    }
  }, [addresses, selectedAddress])

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.price || 0
    const qty = item.qty || 0
    return sum + (price * qty)
  }, 0)

  const taxes = Math.round(subtotal * 0.05)
  const deliveryFee = 30 // Fixed delivery fee
  const total = subtotal + taxes + deliveryFee - discountAmount

  const handleApplyCoupon = async () => {
    if (couponCode.trim() && applyCoupon) {
      const result = await applyCoupon(couponCode.trim());
      if (result && result.success) {
        setCouponCode('');
      } else {
        alert(result.message || 'Invalid coupon code');
      }
    }
  };

  const handleAddressSelection = (addr) => {
    setSelectedAddress(addr)
  }

  const handleProceedToPayment = async () => {
    if (!addresses || addresses.length === 0) {
      alert('Please add a delivery address first')
      navigate('/addresses')
      return
    }

    if (!selectedAddress) {
      alert('Please select a delivery address')
      return
    }

    // Show delivery check modal
    setShowDeliveryCheck(true)
    setDeliveryCheckStep('checking')

    // Simulate delivery availability check (2-3 seconds)
    setTimeout(() => {
      setDeliveryCheckStep('available')

      // After showing available, proceed to payment
      setTimeout(() => {
        setShowDeliveryCheck(false)
        navigate('/payment', {
          state: {
            subtotal,
            taxes,
            deliveryFee,
            total,
            discountAmount,
            deliveryDistance: 5, // Default distance
            deliveryTime: 30,    // Default time
            selectedAddress
          }
        })
      }, 1500) // Show success for 1.5 seconds
    }, 2500) // Check for 2.5 seconds
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFF3E8] font-['Inter',_sans-serif]">
        <Header />
        <div className="pt-20 pb-8">
          <div className="px-4 mx-auto max-w-4xl sm:px-6 lg:px-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center mb-6 font-semibold text-[#5C3D2E] transition-colors hover:text-[#2C1810]"
            >
              <ArrowLeft className="mr-2 w-5 h-5" />
              Back
            </button>

            <div className="py-12 sm:py-16 text-center bg-white rounded-3xl shadow-[0_8px_30px_rgba(44,24,16,0.04)] border border-[rgba(44,24,16,0.05)]">
              <ShoppingBag className="mx-auto mb-6 w-16 h-16 sm:w-24 sm:h-24 text-[#E85D04]/30" />
              <h2 className="mb-3 sm:mb-4 text-xl sm:text-3xl font-extrabold text-[#2C1810]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Your cart is empty</h2>
              <p className="mb-6 sm:mb-8 text-sm sm:text-base font-medium text-[#5C3D2E]">Add some delicious items to get started!</p>
              <button
                onClick={() => navigate('/home')}
                className="px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-bold text-white bg-gradient-to-r from-[#E85D04] to-[#F48C06] rounded-xl shadow-lg transition-transform hover:scale-105"
              >
                Order Now
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF3E8] font-['Inter',_sans-serif]">
      <Header />

      <div className="pt-16 sm:pt-20 pb-44 lg:pb-8">
        <div className="px-3 sm:px-4 mx-auto max-w-4xl md:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center mb-4 sm:mb-6 font-semibold text-[#5C3D2E] transition-colors hover:text-[#2C1810]"
          >
            <ArrowLeft className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Back</span>
          </button>

          <h1 className="mb-5 sm:mb-8 text-lg sm:text-2xl md:text-3xl font-extrabold text-[#2C1810]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Your Cart ({cartItems.length} items)
          </h1>

          <div className="grid grid-cols-1 gap-4 sm:gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="space-y-3 sm:space-y-4 lg:col-span-2">
              <AnimatePresence>
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item._id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 sm:p-4 md:p-6 bg-white rounded-3xl border border-[rgba(44,24,16,0.05)] shadow-[0_8px_30px_rgba(44,24,16,0.04)]"
                  >
                    <div className="flex gap-3 items-start">
                      <img
                        src={item.image || '/placeholder.jpg'}
                        alt={item.name || 'Food item'}
                        className="object-cover flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#FFF3E8]"
                        onError={(e) => {
                          e.target.src = '/placeholder.jpg'
                        }}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-1 sm:gap-2 mb-1">
                          <h3 className="flex-1 text-sm sm:text-base font-extrabold leading-tight text-[#2C1810] min-w-0 line-clamp-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            {item.name || 'Unknown Item'}
                          </h3>
                          <p className="flex-shrink-0 text-sm sm:text-base font-extrabold text-[#E85D04]">
                            ₹{(item.price || 0) * (item.qty || 1)}
                          </p>
                        </div>
                        <p className="mb-2 text-xs sm:text-sm font-medium text-[#5C3D2E]">₹{item.price || 0} each</p>
                        <div className="flex gap-2 items-center">
                          <div className="flex gap-0 items-center text-white bg-gradient-to-r from-[#E85D04] to-[#F48C06] rounded-xl shadow-md">
                            <button
                              onClick={() => {
                                const newQty = (item.qty || 1) - 1
                                if (newQty <= 0) {
                                  removeFromCart(item._id)
                                } else {
                                  updateQty(item._id, newQty)
                                }
                              }}
                              className="flex justify-center items-center w-9 h-9 sm:w-11 sm:h-11 rounded-l-xl transition-colors hover:bg-black/10 active:bg-black/20"
                            >
                              <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                            </button>
                            <span className="px-2 sm:px-3 text-sm font-bold min-w-[28px] text-center">{item.qty || 1}</span>
                            <button
                              onClick={() => updateQty(item._id, (item.qty || 1) + 1)}
                              className="flex justify-center items-center w-9 h-9 sm:w-11 sm:h-11 rounded-r-xl transition-colors hover:bg-black/10 active:bg-black/20"
                            >
                              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="p-2 text-red-500 rounded-xl transition-colors hover:bg-red-50 active:bg-red-100 border border-transparent hover:border-red-100 ml-auto"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Delivery Address Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-4 sm:p-6 bg-white rounded-3xl border border-[rgba(44,24,16,0.05)] shadow-[0_8px_30px_rgba(44,24,16,0.04)]"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2 sm:gap-3 items-center">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#E85D04] flex-shrink-0" />
                    <h3 className="text-base sm:text-lg font-extrabold text-[#2C1810]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Delivery Address</h3>
                  </div>
                  <button
                    onClick={() => navigate('/addresses')}
                    className="text-xs sm:text-sm font-bold text-[#E85D04] hover:text-[#C1440E] whitespace-nowrap transition-colors"
                  >
                    + Add New
                  </button>
                </div>

                {addresses && addresses.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    {addresses.map((addr, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleAddressSelection(addr)}
                        className={`p-3 sm:p-4 border-2 rounded-2xl cursor-pointer transition-all ${selectedAddress === addr
                            ? 'border-[#E85D04] bg-[#E85D04]/5'
                            : 'border-[rgba(44,24,16,0.05)] hover:border-[#E85D04]/30 bg-[#FFF3E8]/30'
                          }`}
                      >
                        <div className="flex gap-2 sm:gap-3 items-start">
                          <div className={`p-1.5 sm:p-2 rounded-xl flex-shrink-0 transition-colors ${selectedAddress === addr ? 'bg-[#E85D04] text-white shadow-md' : 'bg-[#FFF3E8] text-[#E85D04]'
                            }`}>
                            {addr.type === 'home' && <HomeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                            {addr.type === 'work' && <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                            {addr.type === 'other' && <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold capitalize text-sm sm:text-base text-[#2C1810]">{addr.type}</p>
                            <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-medium text-[#5C3D2E] line-clamp-2">
                              {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                            {addr.landmark && (
                              <p className="mt-0.5 sm:mt-1 text-xs font-semibold text-[#5C3D2E]/70 line-clamp-1">Near: {addr.landmark}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 sm:py-8 text-center bg-[#FFF3E8]/50 rounded-2xl border border-[rgba(44,24,16,0.05)]">
                    <MapPin className="mx-auto mb-3 w-10 h-10 sm:w-12 sm:h-12 text-[#E85D04]/30" />
                    <p className="mb-3 sm:mb-4 text-sm sm:text-base font-medium text-[#5C3D2E]">No delivery address added yet</p>
                    <button
                      onClick={() => navigate('/addresses')}
                      className="px-5 sm:px-6 py-2.5 text-sm font-bold text-white bg-[#E85D04] rounded-xl transition-transform hover:scale-105 shadow-md"
                    >
                      Add Address
                    </button>
                  </div>
                )}
              </motion.div>

              {/* Coupon Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 sm:p-6 bg-white rounded-3xl border border-[rgba(44,24,16,0.05)] shadow-[0_8px_30px_rgba(44,24,16,0.04)]"
              >
                <div className="flex gap-2 sm:gap-3 items-center mb-4">
                  <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-[#E85D04] flex-shrink-0" />
                  <h3 className="text-base sm:text-lg font-extrabold text-[#2C1810]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Apply Coupon</h3>
                </div>

                {appliedCoupon ? (
                  <div className="flex justify-between items-center p-3 sm:p-4 bg-green-50 rounded-2xl border border-green-200">
                    <div className="flex flex-wrap gap-1 items-center min-w-0">
                      <span className="font-extrabold text-sm sm:text-base text-green-600">{appliedCoupon}</span>
                      <span className="text-xs sm:text-sm font-medium text-green-600">applied! Saved ₹{discountAmount}</span>
                    </div>
                    <button
                      onClick={() => removeCoupon && removeCoupon()}
                      className="text-sm font-bold text-red-500 transition-colors hover:text-red-700 ml-2 flex-shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      placeholder="Enter coupon code"
                      autoCapitalize="characters"
                      className="flex-1 min-w-0 px-3 sm:px-4 py-3 text-base font-semibold text-[#2C1810] placeholder-[#5C3D2E]/60 bg-[#FFF3E8]/50 rounded-xl border border-[rgba(44,24,16,0.1)] focus:outline-none focus:ring-2 focus:ring-[#E85D04] uppercase"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="w-full sm:w-auto px-4 sm:px-6 py-3 text-sm sm:text-base font-bold text-white bg-[#E85D04] rounded-xl shadow-md transition-transform hover:scale-105 touch-manipulation"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-4 sm:p-6 bg-white rounded-3xl border border-[rgba(44,24,16,0.05)] shadow-[0_8px_30px_rgba(44,24,16,0.04)]"
              >
                <h3 className="mb-4 text-base sm:text-lg font-extrabold text-[#2C1810]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Order Summary</h3>

                <div className="space-y-3 sm:space-y-4 font-medium text-[#5C3D2E]">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Subtotal</span>
                    <span className="font-bold text-[#2C1810]">₹{subtotal}</span>
                  </div>

                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Taxes & Fees</span>
                    <span className="font-bold text-[#2C1810]">₹{taxes}</span>
                  </div>

                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Delivery Fee</span>
                    <span className="font-bold text-[#2C1810]">₹{deliveryFee}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm sm:text-base text-green-600">
                      <span>Discount</span>
                      <span className="font-bold">-₹{discountAmount}</span>
                    </div>
                  )}

                  <hr className="border-[rgba(44,24,16,0.05)] my-2" />

                  <div className="flex justify-between text-base sm:text-xl font-extrabold text-[#2C1810]">
                    <span>Total</span>
                    <span className="text-[#E85D04]">₹{Math.round(total)}</span>
                  </div>
                </div>

                <div className="flex gap-2 items-center justify-center p-3 mt-4 sm:mt-6 text-xs sm:text-sm font-semibold text-[#E85D04] bg-[#FFF3E8] rounded-xl border border-[#E85D04]/10">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>Estimated delivery: 25-30 mins</span>
                </div>

                <button
                  onClick={handleProceedToPayment}
                  className="hidden lg:block py-4 mt-6 w-full font-bold text-white bg-gradient-to-r from-[#E85D04] to-[#F48C06] rounded-xl shadow-lg transition-transform hover:scale-105"
                >
                  Proceed to Payment
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky bottom bar — mobile only */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[rgba(44,24,16,0.05)] shadow-[0_-10px_30px_rgba(44,24,16,0.05)] lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="px-4 pt-3 pb-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-xs font-semibold text-[#5C3D2E]">Grand Total</p>
              <p className="text-lg sm:text-xl font-extrabold text-[#E85D04]">₹{Math.round(total)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-[#2C1810]">{cartItems.length} item{cartItems.length > 1 ? 's' : ''}</p>
              <p className="text-xs font-medium text-[#5C3D2E]/80">Incl. taxes &amp; delivery</p>
            </div>
          </div>
          <button
            onClick={handleProceedToPayment}
            className="py-3.5 w-full text-sm sm:text-base font-bold text-white bg-gradient-to-r from-[#E85D04] to-[#F48C06] rounded-xl shadow-lg transition-transform active:scale-95 touch-manipulation"
          >
            Proceed to Payment
          </button>
        </div>
      </div>

      {/* Delivery Check Modal */}
      <AnimatePresence>
        {showDeliveryCheck && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="p-6 sm:p-8 w-full max-w-sm sm:max-w-md mx-3 text-center bg-white rounded-3xl shadow-2xl border border-[rgba(44,24,16,0.05)]"
            >
              {deliveryCheckStep === 'checking' && (
                <>
                  <Loader className="mx-auto mb-5 w-12 h-12 sm:w-16 sm:h-16 text-[#E85D04] animate-spin" />
                  <h3 className="mb-2 text-lg sm:text-xl font-extrabold text-[#2C1810]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Checking Delivery Availability
                  </h3>
                  <p className="text-sm sm:text-base font-medium text-[#5C3D2E]">
                    Please wait while we verify if we can deliver to your location...
                  </p>
                </>
              )}

              {deliveryCheckStep === 'available' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                >
                  <div className="flex justify-center items-center mx-auto mb-5 w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full shadow-inner">
                    <CheckCircle className="w-9 h-9 sm:w-12 sm:h-12 text-green-500" />
                  </div>
                  <h3 className="mb-2 text-lg sm:text-xl font-extrabold text-[#2C1810]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Delivery Available! ✅
                  </h3>
                  <p className="mb-3 text-sm sm:text-base font-semibold text-[#5C3D2E]">
                    Great! We can deliver to your address.
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-[#E85D04] animate-pulse">
                    Redirecting to payment...
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Cart