import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  Package,
  ChefHat,
  Truck,
  Store,
  MapPin,
  Phone,
  Loader,
  Home,
  Shield
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { useSocket } from '../../context/SocketContext'
import { API_BASE_URL } from '../../api/axiosInstance'

// --- 🍑 WARM PEACH THEME (With Clean White Cards) ---
// bgMain: '#FFF3E8'
// borderOrange: '#E85D04'
// accentAmber: '#F48C06'
// textDark: '#2C1810'
// textMuted: '#5C3D2E'

const OrderTrackingPage = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [estimatedTime, setEstimatedTime] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const socket = useSocket()

  // Status configuration with theme-matched icons and colors
  const statusSteps = [
    {
      key: 'Pending',
      label: 'Order Placed',
      icon: Package,
      color: 'from-[#5C3D2E]/40 to-[#5C3D2E]/60',
      bgColor: 'bg-[#FFF3E8]/50',
      textColor: 'text-[#5C3D2E]'
    },
    {
      key: 'Accepted',
      label: 'Order Accepted',
      icon: CheckCircle,
      color: 'from-[#F48C06] to-[#E85D04]',
      bgColor: 'bg-[#FFF3E8]',
      textColor: 'text-[#E85D04]'
    },
    {
      key: 'Preparing',
      label: 'Preparing Your Food',
      icon: ChefHat,
      color: 'from-[#E85D04] to-[#C1440E]',
      bgColor: 'bg-[#E85D04]/10',
      textColor: 'text-[#E85D04]'
    },
    {
      key: 'Ready',
      label: 'Ready for Pickup',
      icon: Store,
      color: 'from-[#A07850] to-[#5C3D2E]',
      bgColor: 'bg-[#A07850]/10',
      textColor: 'text-[#5C3D2E]'
    },
    {
      key: 'OutForDelivery',
      altKeys: ['Out for Delivery', 'out_for_delivery'], // Handle variations
      label: 'Out for Delivery',
      icon: Truck,
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      key: 'Delivered',
      label: 'Delivered',
      icon: Home,
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    }
  ]

  // Fetch order details
  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()

      if (data.success) {
        const order = data.data
        setOrderData(order)

        // ✅ Calculate total preparation time from all items
        if (order.items && order.items.length > 0) {
          const totalPrepTime = order.items.reduce((total, item) => {
            // Use item's preparation time or default to 15 minutes
            const itemPrepTime = item.preparationTime || 15
            return total + itemPrepTime
          }, 0)

          // Average prep time + delivery time (estimate 10 min delivery)
          const avgPrepTime = Math.ceil(totalPrepTime / order.items.length)
          setEstimatedTime(avgPrepTime + 10)
        } else {
          setEstimatedTime(30) // Default fallback
        }

        // Calculate elapsed time since order placed
        if (order.orderTime || order.createdAt) {
          const orderTime = new Date(order.orderTime || order.createdAt)
          const now = new Date()
          const elapsed = Math.floor((now - orderTime) / (1000 * 60)) // in minutes
          setElapsedTime(elapsed)
        }
      } else {
        setError('Order not found')
      }
    } catch (err) {
      console.error('Error fetching order:', err)
      setError('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Initial fetch
  useEffect(() => {
    fetchOrderDetails()
  }, [orderId])

  // ✅ Real-time updates with Socket.io
  useEffect(() => {
    if (socket && orderId) {
      socket.emit('join_order', orderId)

      socket.on('orderStatusUpdated', (data) => {
        console.log('🔔 Order status updated:', data.status)
        setOrderData(prev => ({ ...prev, status: data.status, ...data.updatedOrder }))
      })

      return () => {
        socket.off('orderStatusUpdated')
      }
    }
  }, [socket, orderId])

  // ✅ Update elapsed time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      if (orderData?.orderTime || orderData?.createdAt) {
        const orderTime = new Date(orderData.orderTime || orderData.createdAt)
        const now = new Date()
        const elapsed = Math.floor((now - orderTime) / (1000 * 60))
        setElapsedTime(elapsed)
      }
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [orderData])

  // Get current step index
  const getCurrentStepIndex = () => {
    if (!orderData) return 0
    // Handle status variations (e.g. "Out for Delivery" vs "OutForDelivery")
    return statusSteps.findIndex(step =>
      step.key === orderData.status ||
      (step.altKeys && step.altKeys.includes(orderData.status))
    )
  }

  // Calculate progress percentage
  const getProgressPercentage = () => {
    const currentIndex = getCurrentStepIndex()
    if (currentIndex === -1) return 0
    return ((currentIndex + 1) / statusSteps.length) * 100
  }

  // Get remaining time
  const getRemainingTime = () => {
    if (orderData?.status === 'Delivered') return 0
    const remaining = estimatedTime - elapsedTime
    return remaining > 0 ? remaining : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF3E8] font-['Inter',_sans-serif]">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="text-center">
            <Loader className="mx-auto mb-4 w-12 h-12 text-[#E85D04] animate-spin" />
            <p className="text-[#5C3D2E] font-medium">Loading order details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-[#FFF3E8] font-['Inter',_sans-serif]">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <div className="p-8 bg-white rounded-3xl shadow-xl border border-[rgba(44,24,16,0.05)] text-center">
            <p className="mb-6 text-lg sm:text-xl font-bold text-red-600">{error || 'Order not found'}</p>
            <button
              onClick={() => navigate('/orders')}
              className="px-8 py-3 text-white font-bold bg-gradient-to-r from-[#E85D04] to-[#F48C06] rounded-xl hover:scale-105 transition-transform shadow-lg"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentStepIndex = getCurrentStepIndex()
  const progressPercentage = getProgressPercentage()
  const remainingTime = getRemainingTime()
  const isDelivered = orderData.status === 'Delivered'
  const CurrentIcon = statusSteps[currentStepIndex]?.icon || Package

  return (
    <div className="min-h-screen bg-[#FFF3E8] font-['Inter',_sans-serif]">
      <Header />

      {/* OTP Display - Fixed below header on right side (only show if not delivered) */}
      {orderData?.deliveryOTP && !isDelivered && (
        <div className="fixed top-16 right-0 left-0 z-40 bg-[#FFF3E8]/95 backdrop-blur-sm border-b border-[rgba(44,24,16,0.05)]">
          <div className="container px-3 sm:px-4 mx-auto max-w-4xl">
            <div className="flex justify-end items-center py-2">
              <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 rounded-xl border border-[#E85D04]/20">
                <Shield className="w-4 h-4 text-[#E85D04]/70" />
                <span className="text-xs font-medium text-[#5C3D2E]/70">Delivery OTP:</span>
                <span className="text-base sm:text-lg font-bold text-[#E85D04] tracking-wider">
                  {orderData.deliveryOTP}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`pt-20 sm:pt-24 pb-8 sm:pb-16 ${orderData?.deliveryOTP && !isDelivered ? 'mt-10' : ''}`}>
        <div className="container px-3 sm:px-4 mx-auto max-w-4xl">
          {/* Back Button */}
          <button
            onClick={() => navigate('/orders')}
            className="flex gap-2 items-center mb-4 sm:mb-6 font-semibold text-[#5C3D2E] transition-colors hover:text-[#E85D04]"
          >
            <ArrowLeft className="w-5 h-5 shrink-0" />
            <span className="text-sm sm:text-base">Back to Orders</span>
          </button>

          {/* Page Title with animated icon */}
          <motion.div
            className="mb-6 sm:mb-8 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
              className="inline-block mb-3 sm:mb-4"
            >
              <CurrentIcon className={`w-12 h-12 sm:w-16 sm:h-16 drop-shadow-md ${isDelivered ? 'text-green-500' : 'text-[#E85D04]'}`} />
            </motion.div>
            <h1 className="mb-1 sm:mb-2 text-2xl sm:text-4xl font-extrabold text-[#2C1810]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {isDelivered ? 'Order Delivered!' : 'Track Your Order'}
            </h1>
            <p className="text-sm sm:text-base font-medium text-[#5C3D2E] break-all px-2">
              Order #{orderData.orderNumber || orderData._id?.slice(-8)}
            </p>
          </motion.div>

          {/* ✅ Main Tracking Card */}
          <motion.div
            className="p-5 sm:p-8 mb-5 sm:mb-8 bg-white border border-[rgba(44,24,16,0.05)] rounded-3xl shadow-[0_20px_60px_rgba(44,24,16,0.08)]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {/* Restaurant Info */}
            <div className="flex gap-3 sm:gap-4 items-center pb-4 sm:pb-6 mb-4 sm:mb-6 border-b border-[rgba(44,24,16,0.05)] min-w-0">
              <div className="flex justify-center items-center w-12 h-12 sm:w-16 sm:h-16 bg-[#FFF3E8] border border-[rgba(44,24,16,0.05)] rounded-2xl shrink-0 shadow-inner">
                <Store className="w-6 h-6 sm:w-8 sm:h-8 text-[#E85D04]" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-extrabold text-[#2C1810] truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {orderData.restaurantName || 'Restaurant'}
                </h2>
                <p className="text-xs sm:text-sm font-medium text-[#5C3D2E]">
                  {orderData.items?.length || 0} items • ₹{orderData.total || orderData.totalAmount}
                </p>
              </div>
            </div>

            {/* ✅ Time Estimate Card */}
            <div className={`p-4 sm:p-6 mb-6 sm:mb-8 rounded-2xl border border-[rgba(44,24,16,0.05)] shadow-sm ${isDelivered ? 'bg-green-50/50' : 'bg-[#FFF3E8]/50'}`}>
              <div className="flex gap-4 sm:gap-6 justify-center items-center">
                <div className="text-center flex-1">
                  <Clock className={`mx-auto mb-1.5 sm:mb-2 w-6 h-6 sm:w-8 sm:h-8 ${isDelivered ? 'text-green-600' : 'text-[#E85D04]'}`} />
                  <p className="text-xs sm:text-sm font-bold text-[#5C3D2E]">
                    {isDelivered ? 'Delivered At' : 'Estimated Time'}
                  </p>
                  <p className={`text-xl sm:text-2xl font-extrabold ${isDelivered ? 'text-green-600' : 'text-[#E85D04]'}`}>
                    {isDelivered
                      ? new Date(orderData.actualDeliveryTime || orderData.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : `${estimatedTime} min`
                    }
                  </p>
                </div>
                <div className="w-px h-12 sm:h-16 bg-[rgba(44,24,16,0.1)] shrink-0"></div>
                <div className="text-center flex-1">
                  <div className="flex gap-1.5 sm:gap-2 justify-center items-center mb-1.5 sm:mb-2">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-sm ${isDelivered ? 'bg-green-500' : 'bg-[#10B981] animate-pulse'}`}></div>
                    <span className="text-xs sm:text-sm font-bold text-[#5C3D2E]">
                      {isDelivered ? 'Status' : 'Time Remaining'}
                    </span>
                  </div>
                  <p className="text-xl sm:text-2xl font-extrabold text-[#10B981]">
                    {isDelivered
                      ? 'Completed'
                      : (remainingTime > 0 ? `${remainingTime} min` : 'Arriving Soon!')
                    }
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 sm:mt-5">
                <div className="overflow-hidden h-2.5 bg-[rgba(44,24,16,0.05)] rounded-full shadow-inner">
                  <motion.div
                    className={`h-full rounded-full ${isDelivered ? 'bg-green-500' : 'bg-gradient-to-r from-[#E85D04] to-[#F48C06]'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>

            {/* ✅ Status Timeline */}
            <div className="relative">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStepIndex
                const isCurrent = index === currentStepIndex
                const StepIcon = step.icon

                return (
                  <motion.div
                    key={step.key}
                    className="flex relative gap-4 sm:gap-5 items-start mb-6 sm:mb-8 last:mb-0"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {/* Vertical Line */}
                    {index < statusSteps.length - 1 && (
                      <div
                        className={`absolute left-5 sm:left-6 top-12 w-0.5 h-[calc(100%-8px)] transition-colors ${isCompleted ? 'bg-gradient-to-b from-[#E85D04] to-[#F48C06]' : 'bg-[rgba(44,24,16,0.1)]'
                          }`}
                      />
                    )}

                    {/* Icon Circle */}
                    <motion.div
                      className={`relative z-10 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all shrink-0 ${isCompleted
                        ? `bg-gradient-to-br ${step.color} border-transparent shadow-md`
                        : 'bg-[#FFF3E8] border-[rgba(44,24,16,0.1)]'
                        }`}
                      animate={isCurrent ? {
                        scale: [1, 1.1, 1],
                        boxShadow: [
                          '0 0 0 0 rgba(232, 93, 4, 0)',
                          '0 0 0 8px rgba(232, 93, 4, 0.15)',
                          '0 0 0 0 rgba(232, 93, 4, 0)'
                        ]
                      } : {}}
                      transition={{
                        duration: 2,
                        repeat: isCurrent ? Infinity : 0
                      }}
                    >
                      <StepIcon
                        className={`w-5 h-5 sm:w-6 sm:h-6 ${isCompleted ? 'text-white drop-shadow-sm' : 'text-[#5C3D2E]/40'
                          }`}
                      />
                    </motion.div>

                    {/* Status Info */}
                    <div className="flex-1 pt-1 sm:pt-1.5 min-w-0">
                      <h3 className={`text-base sm:text-lg font-extrabold mb-1 ${isCompleted ? 'text-[#2C1810]' : 'text-[#5C3D2E]/50'
                        }`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {step.label}
                      </h3>

                      {isCurrent && !isDelivered && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex gap-2 items-center"
                        >
                          <div className="w-2.5 h-2.5 bg-[#E85D04] rounded-full animate-pulse shrink-0 shadow-sm"></div>
                          <p className="text-xs sm:text-sm font-bold text-[#E85D04] animate-pulse">
                            In Progress
                          </p>
                        </motion.div>
                      )}

                      {isCompleted && !isCurrent && (
                        <p className="flex gap-1.5 sm:gap-2 items-center text-xs sm:text-sm font-bold text-green-600">
                          <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                          Completed
                        </p>
                      )}

                      {isDelivered && isCurrent && (
                        <p className="flex gap-1.5 sm:gap-2 items-center text-xs sm:text-sm font-bold text-green-600">
                          <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                          Delivered Successfully
                        </p>
                      )}

                      {!isCompleted && !isCurrent && (
                        <p className="text-xs sm:text-sm font-medium text-[#5C3D2E]/40">Pending</p>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Order Items */}
          <motion.div
            className="p-5 sm:p-8 mb-5 sm:mb-8 bg-white border border-[rgba(44,24,16,0.05)] rounded-3xl shadow-[0_10px_40px_rgba(44,24,16,0.04)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="mb-4 sm:mb-5 text-lg sm:text-xl font-extrabold text-[#2C1810]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Order Items</h3>
            <div className="space-y-3 sm:space-y-4">
              {orderData.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center gap-3 min-w-0 p-3 sm:p-4 bg-[#FFF3E8]/50 border border-[rgba(44,24,16,0.05)] rounded-2xl">
                  <div className="flex gap-3 sm:gap-4 items-center min-w-0 flex-1">
                    <span className="flex justify-center items-center w-8 h-8 sm:w-10 sm:h-10 text-sm sm:text-base font-extrabold text-[#E85D04] bg-[#FFF3E8] border border-[#E85D04]/20 rounded-xl shrink-0 shadow-sm">
                      {item.quantity}x
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-[#2C1810] text-sm sm:text-base truncate mb-0.5">{item.name}</p>
                      <p className="text-xs font-semibold text-[#5C3D2E]">
                        <Clock className="inline mr-1 w-3 h-3 text-[#E85D04]" />
                        {item.preparationTime || 15} min prep time
                      </p>
                    </div>
                  </div>
                  <p className="font-extrabold text-[#E85D04] text-sm sm:text-base shrink-0 ml-1">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Delivery Address */}
          {orderData.deliveryAddress && (
            <motion.div
              className="p-5 sm:p-8 bg-white border border-[rgba(44,24,16,0.05)] rounded-3xl shadow-[0_10px_40px_rgba(44,24,16,0.04)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="flex gap-2 items-center mb-3 sm:mb-4 text-lg sm:text-xl font-extrabold text-[#2C1810]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <MapPin className="w-5 h-5 text-[#E85D04] shrink-0" />
                Delivery Address
              </h3>
              <div className="bg-[#FFF3E8]/50 p-4 sm:p-5 rounded-2xl border border-[rgba(44,24,16,0.05)]">
                <p className="text-sm sm:text-base font-medium text-[#5C3D2E] break-words leading-relaxed">
                  {typeof orderData.deliveryAddress === 'string'
                    ? orderData.deliveryAddress
                    : `${orderData.deliveryAddress.street}, ${orderData.deliveryAddress.city}, ${orderData.deliveryAddress.state} - ${orderData.deliveryAddress.pincode}`
                  }
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default OrderTrackingPage