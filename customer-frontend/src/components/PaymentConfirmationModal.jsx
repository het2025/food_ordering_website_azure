import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, X, CreditCard, Clock, Package, Star } from 'lucide-react'

const PaymentConfirmationModal = ({ isOpen, onClose, paymentDetails }) => {
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowAnimation(true), 500)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isOpen) return null

  const {
    orderId = 'ORD12345',
    amount = 450,
    paymentMethod = 'Credit Card',
    transactionId = 'TXN789012345',
    restaurantName = 'Pizza Palace',
    estimatedTime = '25-30 mins',
    loyaltyPoints = 45
  } = paymentDetails || {}

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-2xl"
      >
        
        {/* Success Animation */}
        <div className="relative p-8 overflow-hidden text-center text-white bg-gradient-to-br from-green-400 to-green-600">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: showAnimation ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="relative z-10"
          >
            <CheckCircle className="w-20 h-20 mx-auto mb-4" />
            <h2 className="mb-2 text-2xl font-bold">Payment Successful!</h2>
            <p className="text-green-100">Your order has been confirmed</p>
          </motion.div>
          
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 bg-white rounded-full bg-opacity-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 -mb-12 -ml-12 bg-white rounded-full bg-opacity-10"></div>
        </div>

        <div className="p-6">
          {/* Order Details */}
          <div className="p-4 mb-6 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Order Details</h3>
              <button
                onClick={onClose}
                className="p-1 transition-colors rounded-full hover:bg-gray-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Order ID</span>
                <span className="font-semibold text-gray-800">{orderId}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Restaurant</span>
                <span className="font-semibold text-gray-800">{restaurantName}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Amount</span>
                <span className="text-xl font-bold text-green-600">₹{amount}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-gray-600">
                  <CreditCard className="w-4 h-4" />
                  Payment Method
                </span>
                <span className="font-semibold text-gray-800">{paymentMethod}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Transaction ID</span>
                <span className="font-mono text-sm text-gray-800">{transactionId}</span>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="p-4 mb-6 border border-blue-200 bg-blue-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-gray-800">Delivery Info</h4>
            </div>
            <p className="mb-1 text-gray-700">Estimated delivery time: <strong>{estimatedTime}</strong></p>
            <p className="text-sm text-gray-600">We'll keep you updated via notifications</p>
          </div>

          {/* Loyalty Points */}
          {loyaltyPoints > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="p-4 mb-6 border border-purple-200 bg-purple-50 rounded-xl"
            >
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-gray-800">Loyalty Points Earned</h4>
              </div>
              <p className="text-purple-700">
                <strong>{loyaltyPoints} points</strong> added to your account!
              </p>
              <p className="text-sm text-purple-600">Use points for discounts on future orders</p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => {
                onClose()
                // Navigate to order tracking
              }}
              className="flex items-center justify-center w-full gap-2 px-4 py-3 font-semibold text-white transition-all duration-200 shadow-lg bg-gradient-to-r from-orange-500 to-red-500 rounded-xl hover:from-orange-600 hover:to-red-600 hover:shadow-xl"
            >
              <Package className="w-5 h-5" />
              Track Your Order
            </button>
            
            <button
              onClick={onClose}
              className="w-full px-4 py-3 font-semibold text-gray-700 transition-colors bg-gray-200 rounded-xl hover:bg-gray-300"
            >
              Continue Ordering
            </button>
          </div>

          {/* Footer Note */}
          <div className="mt-6 text-center">
            <p className="mb-2 text-sm text-gray-500">
              Order confirmation sent to your email
            </p>
            <p className="text-xs text-gray-400">
              Need help? Contact support at{' '}
              <span className="text-blue-600">1800-123-4567</span>
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default PaymentConfirmationModal
