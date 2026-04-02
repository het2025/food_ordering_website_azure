import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  Star,
  ArrowLeft,
  Phone,
  MapPin,
  Loader,
  XCircle,
  Store
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

// --- 🍑 WARM PEACH THEME (With Clean White Cards) ---
// bgMain: '#FFF3E8'
// borderOrange: '#E85D04'
// accentAmber: '#F48C06'
// textDark: '#2C1810'
// textMuted: '#5C3D2E'

import { API_BASE_URL } from '../../api/axiosInstance';

const Orders = () => {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('All')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [pendingCancelId, setPendingCancelId] = useState(null)
  const [showRateModal, setShowRateModal] = useState(false)
  const [pendingRateId, setPendingRateId] = useState(null)
  const [pendingRatingStar, setPendingRatingStar] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [activeFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('token')

      if (!token) {
        navigate('/login')
        return
      }

      const url = activeFilter === 'All'
        ? `${API_BASE_URL}/orders/my-orders`
        : `${API_BASE_URL}/orders/my-orders?status=${activeFilter}`

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      console.log('Orders API Response:', data)

      if (data.success) {
        setOrders(Array.isArray(data.data) ? data.data : [])
      } else {
        setError(data.message || 'Failed to load orders')
        setOrders([])
      }

    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('Failed to load orders. Please try again.')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = (orderId) => {
    setPendingCancelId(orderId)
    setShowCancelModal(true)
  }

  const confirmCancelOrder = async () => {
    setShowCancelModal(false)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/orders/${pendingCancelId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: 'Cancelled by customer'
        })
      })

      const data = await response.json()

      if (data.success) {
        setNotification({ type: 'success', message: 'Order cancelled successfully' })
        fetchOrders()
      } else {
        setNotification({ type: 'error', message: data.message || 'Could not cancel order' })
      }

    } catch (error) {
      console.error('Error cancelling order:', error)
      setNotification({ type: 'error', message: 'Failed to cancel order' })
    } finally {
      setPendingCancelId(null)
    }
  }

  const handleRateOrder = (orderId, star) => {
    setPendingRateId(orderId)
    setPendingRatingStar(star)
    setReviewText('')
    setShowRateModal(true)
  }

  const submitRating = async () => {
    setShowRateModal(false)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/orders/${pendingRateId}/rate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rating: pendingRatingStar,
          review: reviewText
        })
      })

      const data = await response.json()

      if (data.success) {
        setNotification({ type: 'success', message: 'Thank you for your rating!' })
        fetchOrders()
      } else {
        setNotification({ type: 'error', message: data.message || 'Could not submit rating' })
      }

    } catch (error) {
      console.error('Error rating order:', error)
      setNotification({ type: 'error', message: 'Failed to submit rating' })
    } finally {
      setPendingRateId(null)
      setPendingRatingStar(0)
    }
  }

  const handleTrackOrder = (orderId) => {
    navigate(`/track-order/${orderId}`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'Out for Delivery': return <Truck className="w-5 h-5 text-blue-600" />
      case 'Preparing': return <Clock className="w-5 h-5 text-[#E85D04]" />
      case 'Cancelled': return <XCircle className="w-5 h-5 text-red-600" />
      default: return <Package className="w-5 h-5 text-[#5C3D2E]" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800 border border-green-200'
      case 'Out for Delivery': return 'bg-blue-100 text-blue-800 border border-blue-200'
      case 'Preparing': return 'bg-[#FFF3E8] text-[#E85D04] border border-[#E85D04]/30'
      case 'Confirmed': return 'bg-purple-100 text-purple-800 border border-purple-200'
      case 'Cancelled': return 'bg-red-100 text-red-800 border border-red-200'
      default: return 'bg-[rgba(44,24,16,0.05)] text-[#2C1810] border border-[rgba(44,24,16,0.1)]'
    }
  }

  const filters = ['All', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled']

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF3E8] font-['Inter',_sans-serif]">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh] pt-20 pb-16">
          <div className="text-center">
            <Loader className="w-12 h-12 mx-auto mb-4 text-[#E85D04] animate-spin" />
            <p className="text-[#5C3D2E] font-medium">Loading your orders...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF3E8] font-['Inter',_sans-serif]">
      <Header />

      <div className="pt-20 pb-16">
        <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex items-center mb-4 sm:mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center mr-3 font-semibold text-[#5C3D2E] sm:mr-4 hover:text-[#2C1810] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Back</span>
            </button>
            <h1 className="text-xl font-extrabold text-[#2C1810] sm:text-3xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>My Orders</h1>
          </div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-4 pb-2 mb-6 -mx-4 overflow-x-auto sm:gap-3 sm:mb-8 sm:mx-0 sm:px-0 custom-scrollbar"
          >
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`whitespace-nowrap px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-xl font-bold transition-all flex-shrink-0 ${activeFilter === filter
                  ? 'bg-[#E85D04] text-white shadow-md border-none'
                  : 'bg-white text-[#5C3D2E] hover:border-[#E85D04]/50 border border-[rgba(44,24,16,0.1)] shadow-sm'
                  }`}
              >
                {filter}
              </button>
            ))}
          </motion.div>

          {/* Error Message */}
          {error && (
            <div className="px-4 py-3 mb-6 text-[#E85D04] bg-[#E85D04]/10 border border-[#E85D04]/30 rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Notification Toast */}
          <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onAnimationComplete={() => setTimeout(() => setNotification(null), 3000)}
                className={`px-4 py-3 mb-6 rounded-xl border font-bold shadow-sm ${notification.type === 'success'
                    ? 'text-green-700 bg-green-50 border-green-200'
                    : 'text-red-700 bg-red-50 border-red-200'
                  }`}
              >
                {notification.message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Orders List */}
          <div className="space-y-6">
            <AnimatePresence>
              {orders && orders.length > 0 && orders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-5 sm:p-6 transition-all bg-white border border-[rgba(44,24,16,0.05)] shadow-[0_8px_30px_rgba(44,24,16,0.04)] rounded-3xl hover:shadow-[0_15px_30px_rgba(232,93,4,0.1)] hover:-translate-y-1 hover:border-[#E85D04]/30"
                >
                  <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:justify-between sm:items-start">
                    <div className="flex items-start gap-4">
                      {/* Restaurant Icon */}
                      <div className="flex items-center justify-center flex-shrink-0 rounded-2xl w-14 h-14 sm:w-16 sm:h-16 bg-[#FFF3E8] border border-[#E85D04]/20 shadow-inner">
                        <Store className="text-[#E85D04] w-7 h-7 sm:w-8 sm:h-8" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-extrabold text-[#2C1810] sm:text-lg mb-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{order.restaurantName}</h3>
                        <p className="text-sm font-medium text-[#5C3D2E]">Order #{order.orderId}</p>
                        {order.deliveryAddress && (
                          <div className="flex items-start gap-2 mt-2 font-medium">
                            <MapPin className="mt-0.5 w-4 h-4 text-[#A07850] flex-shrink-0" />
                            <p className="text-sm text-[#5C3D2E]/80">
                              {order.deliveryAddress.street}, {order.deliveryAddress.city}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-bold self-start sm:self-auto ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </div>
                  </div>

                  <div className="pt-5 border-t border-[rgba(44,24,16,0.05)]">
                    <div className="grid grid-cols-1 gap-5 mb-5 md:grid-cols-2">
                      <div>
                        <p className="mb-2 text-sm font-bold text-[#2C1810]">Items Ordered:</p>
                        <ul className="space-y-1 text-sm font-medium text-[#5C3D2E]">
                          {order.items && order.items.map((item, idx) => (
                            <li key={idx} className="flex justify-between">
                              <span>• {item.name}</span>
                              <span className="font-bold text-[#2C1810]">x {item.quantity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-[#FFF3E8]/50 p-4 rounded-2xl border border-[rgba(44,24,16,0.05)]">
                        <p className="mb-2 text-sm font-bold text-[#2C1810]">Order Details:</p>
                        <div className="space-y-1.5 text-sm font-medium text-[#5C3D2E]">
                          <p>
                            <span className="text-[#A07850] font-semibold">Ordered:</span>{' '}
                            <span className="text-[#2C1810]">
                              {new Date(order.orderTime).toLocaleString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </p>
                          {order.actualDeliveryTime && (
                            <p>
                              <span className="text-[#A07850] font-semibold">Delivered:</span>{' '}
                              <span className="text-[#2C1810]">
                                {new Date(order.actualDeliveryTime).toLocaleString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </p>
                          )}
                          {order.isScheduled && order.scheduledFor && (
                            <p>
                              <span className="text-[#A07850] font-semibold">Scheduled For:</span>{' '}
                              <span className="text-[#2C1810]">
                                {new Date(order.scheduledFor).toLocaleString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </p>
                          )}
                          {!order.isScheduled && order.estimatedDeliveryTime && !order.actualDeliveryTime && (
                            <p>
                              <span className="text-[#A07850] font-semibold">Estimated:</span>{' '}
                              <span className="text-[#2C1810]">
                                {new Date(order.estimatedDeliveryTime).toLocaleString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </p>
                          )}
                          <p className="pt-2 text-base font-extrabold text-[#E85D04] sm:text-lg">Total: ₹{order.total}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-4">
                      {/* View Details */}
                      <button
                        onClick={() => navigate(`/order/${order._id}`)}
                        className="flex-1 min-w-[calc(50%-6px)] sm:min-w-[140px] px-3 sm:px-4 py-2.5 text-sm sm:text-base font-bold text-[#2C1810] bg-[rgba(44,24,16,0.05)] rounded-xl transition-colors hover:bg-[rgba(44,24,16,0.1)] text-center touch-manipulation"
                      >
                        View Details
                      </button>

                      {/* Track Order Button - Only for active orders */}
                      {!['Cancelled', 'Delivered', 'OutForDelivery'].includes(order.status) && (
                        <button
                          onClick={() => handleTrackOrder(order._id)}
                          className="flex-1 min-w-[calc(50%-6px)] sm:min-w-0 flex gap-2 items-center justify-center px-3 sm:px-4 py-2.5 text-sm sm:text-base font-bold text-white bg-[#E85D04] rounded-xl transition-colors hover:bg-[#C1440E] shadow-lg shadow-[#E85D04]/20 touch-manipulation"
                        >
                          <Truck className="w-4 h-4" />
                          Track Order
                        </button>
                      )}

                      {/* Cancel Order - Only for pending/preparing orders */}
                      {['Preparing', 'Confirmed', 'Pending', 'Accepted'].includes(order.status) && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="flex-1 min-w-[calc(50%-6px)] sm:min-w-0 flex gap-2 items-center justify-center px-3 sm:px-4 py-2.5 text-sm sm:text-base font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl transition-colors hover:bg-red-100 touch-manipulation"
                        >
                          <XCircle className="w-4 h-4" />
                          Cancel
                        </button>
                      )}

                      {/* Call Delivery - Only when out for delivery */}
                      {order.status === 'Out for Delivery' && (
                        <button className="flex-1 min-w-[calc(50%-6px)] sm:min-w-0 flex gap-2 items-center justify-center px-3 sm:px-4 py-2.5 text-sm sm:text-base font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl transition-colors hover:bg-blue-100 touch-manipulation">
                          <Phone className="w-4 h-4" />
                          Call Delivery
                        </button>
                      )}

                      {/* Reorder */}
                      {order.restaurant && (
                        <button
                          onClick={() => navigate(`/restaurant/${order.restaurant}`)}
                          className="flex-1 min-w-[calc(50%-6px)] sm:min-w-0 px-3 sm:px-4 py-2.5 text-sm sm:text-base font-bold text-[#FFE8D6] bg-gradient-to-r from-[#E85D04] to-[#F48C06] rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-[#E85D04]/20 text-center touch-manipulation"
                        >
                          Reorder
                        </button>
                      )}

                      {/* Show rating if already rated */}
                      {order.status === 'Delivered' && order.rating && (
                        <div className="flex items-center justify-center flex-shrink-0 gap-1.5 px-4 py-2.5 text-[#F48C06] bg-[#FFF3E8] border border-[#F48C06]/20 rounded-xl min-w-[80px]">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm font-extrabold sm:text-base text-[#2C1810]">{order.rating}</span>
                        </div>
                      )}

                      {/* Rate order - Only for delivered orders without rating */}
                      {order.status === 'Delivered' && !order.rating && (
                        <div className="flex justify-around w-full py-1.5 sm:justify-start sm:gap-3 bg-[#FFF3E8]/50 rounded-xl px-2 border border-[rgba(44,24,16,0.05)]">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleRateOrder(order._id, star)}
                              className="p-1.5 transition-transform hover:scale-110 active:scale-95"
                              title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                            >
                              <Star
                                className={`w-8 h-8 sm:w-6 sm:h-6 transition-colors ${star <= pendingRatingStar ? 'text-[#F48C06] fill-current drop-shadow-sm' : 'text-[#5C3D2E]/30'
                                  }`}
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* No Orders Found */}
          {!loading && orders.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center bg-white rounded-3xl border border-[rgba(44,24,16,0.05)] shadow-[0_8px_30px_rgba(44,24,16,0.04)]"
            >
              <Package className="w-16 h-16 mx-auto mb-4 text-[#E85D04]/30" />
              <h3 className="mb-2 text-xl font-extrabold text-[#2C1810]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>No orders found</h3>
              <p className="mb-6 font-medium text-[#5C3D2E]">
                {activeFilter === 'All'
                  ? "You haven't placed any orders yet"
                  : `No orders with status "${activeFilter}"`
                }
              </p>
              <button
                onClick={() => navigate('/home')}
                className="px-8 py-3.5 font-bold text-white transition-all bg-gradient-to-r from-[#E85D04] to-[#F48C06] rounded-xl hover:scale-105 shadow-lg shadow-[#E85D04]/20"
              >
                Start Ordering
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />

      {/* Cancel Order Confirmation Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCancelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm p-6 sm:p-8 bg-white shadow-2xl rounded-3xl border border-[rgba(44,24,16,0.05)]"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-2 text-xl font-extrabold text-[#2C1810]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Cancel Order?</h3>
              <p className="mb-6 font-medium text-[#5C3D2E]">Are you sure you want to cancel this order? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-3 font-bold text-[#2C1810] transition-colors bg-[rgba(44,24,16,0.05)] rounded-xl hover:bg-[rgba(44,24,16,0.1)]"
                >
                  Keep Order
                </button>
                <button
                  onClick={confirmCancelOrder}
                  className="flex-1 px-4 py-3 font-bold text-white transition-colors bg-red-500 rounded-xl hover:bg-red-600 shadow-md"
                >
                  Cancel Order
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rate Order Modal */}
      <AnimatePresence>
        {showRateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowRateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm p-6 sm:p-8 bg-white shadow-2xl rounded-3xl border border-[rgba(44,24,16,0.05)]"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-2 text-xl font-extrabold text-[#2C1810]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Rate Your Order</h3>
              <div className="flex justify-center gap-2 mt-4 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setPendingRatingStar(s)}
                    className="p-1 transition-transform hover:scale-110 active:scale-95"
                    title={`Rate ${s} star${s > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`w-9 h-9 transition-colors ${s <= pendingRatingStar ? 'text-[#F48C06] fill-current drop-shadow-sm' : 'text-[#5C3D2E]/20'
                        }`}
                    />
                  </button>
                ))}
              </div>
              <label className="block mb-2 text-sm font-bold text-[#2C1810]">Review <span className="text-[#5C3D2E]/60 font-medium">(optional)</span></label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={3}
                placeholder="Share your experience..."
                className="w-full px-4 py-3 mb-6 text-sm font-medium text-[#2C1810] placeholder-[#5C3D2E]/50 bg-[#FFF3E8]/50 border border-[rgba(44,24,16,0.1)] rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#E85D04]"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRateModal(false)}
                  className="flex-1 px-4 py-3 font-bold text-[#2C1810] transition-colors bg-[rgba(44,24,16,0.05)] rounded-xl hover:bg-[rgba(44,24,16,0.1)]"
                >
                  Cancel
                </button>
                <button
                  onClick={submitRating}
                  disabled={pendingRatingStar === 0}
                  className="flex-1 px-4 py-3 font-bold text-white transition-colors bg-[#E85D04] rounded-xl hover:bg-[#C1440E] shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Orders