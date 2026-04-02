import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, CreditCard, Clock, Phone, Mail } from 'lucide-react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

const RefundPolicy = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-20 pb-16">
        <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="flex flex-wrap items-center mb-6 gap-y-2 sm:mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center flex-shrink-0 mr-4 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-5 h-5 mr-1 sm:mr-2" />
              <span className="text-sm sm:text-base">Back</span>
            </button>
            <h1 className="text-xl font-bold text-gray-800 sm:text-3xl">Refund Policy</h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 mb-8 bg-white shadow-lg rounded-2xl sm:p-8"
          >
            <div className="prose prose-lg max-w-none">
              <p className="mb-6 text-lg text-gray-700">
                At QuickBites, we're committed to ensuring your complete satisfaction with every order. If you're not happy with your food delivery experience, we're here to make it right.
              </p>

              <h2 className="flex items-center gap-2 mb-4 text-xl font-bold text-gray-800 sm:text-2xl">
                <CreditCard className="w-5 h-5 text-orange-500 sm:w-6 sm:h-6" />
                Refund Eligibility
              </h2>
              <div className="p-6 mb-6 border border-orange-200 rounded-lg bg-orange-50">
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-2 h-2 mt-2 bg-orange-500 rounded-full"></span>
                    <span><strong>Order Cancellation:</strong> Full refund if cancelled within 5 minutes of placing the order</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-2 h-2 mt-2 bg-orange-500 rounded-full"></span>
                    <span><strong>Quality Issues:</strong> Full or partial refund for damaged, incorrect, or poor quality food</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-2 h-2 mt-2 bg-orange-500 rounded-full"></span>
                    <span><strong>Delivery Issues:</strong> Refund available for significantly delayed or undelivered orders</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-2 h-2 mt-2 bg-orange-500 rounded-full"></span>
                    <span><strong>Missing Items:</strong> Refund or replacement for missing items from your order</span>
                  </li>
                </ul>
              </div>

              <h2 className="flex items-center gap-2 mb-4 text-xl font-bold text-gray-800 sm:text-2xl">
                <Clock className="w-5 h-5 text-blue-500 sm:w-6 sm:h-6" />
                Refund Process & Timeline
              </h2>
              <div className="p-6 mb-6 border border-blue-200 rounded-lg bg-blue-50">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 text-white bg-blue-500 rounded-full">
                      <span className="font-bold">1</span>
                    </div>
                    <h3 className="mb-2 font-semibold text-gray-800">Report Issue</h3>
                    <p className="text-sm text-gray-600">Contact us within 24 hours of delivery</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 text-white bg-blue-500 rounded-full">
                      <span className="font-bold">2</span>
                    </div>
                    <h3 className="mb-2 font-semibold text-gray-800">Review</h3>
                    <p className="text-sm text-gray-600">We review your case within 2 hours</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 text-white bg-blue-500 rounded-full">
                      <span className="font-bold">3</span>
                    </div>
                    <h3 className="mb-2 font-semibold text-gray-800">Refund</h3>
                    <p className="text-sm text-gray-600">Refund processed in 3-5 business days</p>
                  </div>
                </div>
              </div>

              <h2 className="mb-4 text-xl font-bold text-gray-800 sm:text-2xl">Refund Methods</h2>
              <div className="mb-6 space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="mb-2 font-semibold text-gray-800">Original Payment Method</h3>
                  <p className="text-gray-600">Refunds are processed back to your original payment method (card, UPI, wallet)</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="mb-2 font-semibold text-gray-800">QuickBites Credits</h3>
                  <p className="text-gray-600">Get instant credits in your QuickBites wallet for faster future orders</p>
                </div>
              </div>

              <h2 className="mb-4 text-xl font-bold text-gray-800 sm:text-2xl">Important Notes</h2>
              <div className="p-6 mb-6 border border-yellow-200 rounded-lg bg-yellow-50">
                <ul className="space-y-2 text-gray-700">
                  <li>• Refund requests must be submitted within 24 hours of delivery</li>
                  <li>• Partial consumption may affect refund eligibility</li>
                  <li>• Bank processing times may vary (3-7 business days)</li>
                  <li>• Screenshots or photos may be required for quality issues</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 text-center text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl sm:p-8"
          >
            <h2 className="mb-3 text-xl font-bold sm:text-2xl sm:mb-4">Need Help with a Refund?</h2>
            <p className="mb-4 text-sm text-orange-100 sm:mb-6 sm:text-base">Our customer support team is here to assist you 24/7</p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <button
                onClick={() => window.open('tel:1800-123-4567')}
                className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-orange-600 transition-colors bg-white rounded-lg sm:px-6 hover:bg-orange-50 sm:text-base"
              >
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                Call: 1800-123-4567
              </button>
              <button
                onClick={() => window.open('mailto:support@quickbites.com')}
                className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white transition-colors bg-white rounded-lg bg-opacity-20 sm:px-6 hover:bg-opacity-30 sm:text-base"
              >
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                Email Support
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default RefundPolicy
