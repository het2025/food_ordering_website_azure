import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Shield, Users, AlertCircle } from 'lucide-react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

// --- 🍑 WARM PEACH THEME (With Clean White Cards) ---
// bgMain: '#FFF3E8'
// borderOrange: '#E85D04'
// accentAmber: '#F48C06'
// textDark: '#2C1810'
// textMuted: '#5C3D2E'

const Terms = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#FFF3E8] font-['Inter',_sans-serif]">
      <Header />

      <div className="pt-20 pb-16">
        <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex flex-wrap items-center gap-y-2 mb-6 sm:mb-8 pt-4 sm:pt-0">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-[#5C3D2E] hover:text-[#E85D04] mr-4 flex-shrink-0 transition-colors font-semibold min-h-[44px]"
            >
              <ArrowLeft className="w-5 h-5 mr-1 sm:mr-2" />
              <span className="text-sm sm:text-base">Back</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C1810]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Terms of Service</h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 sm:p-10 mb-8 bg-white border border-[rgba(44,24,16,0.05)] shadow-[0_10px_40px_rgba(44,24,16,0.04)] rounded-3xl"
          >
            <div className="max-w-none">
              <p className="mb-6 text-sm font-semibold text-[#5C3D2E]/70">Last updated: September 13, 2025</p>

              <p className="mb-10 text-base sm:text-lg leading-relaxed font-medium text-[#5C3D2E]">
                Welcome to QuickBites! These Terms of Service govern your use of our food delivery platform. By using our services, you agree to these terms.
              </p>

              <h2 className="flex flex-wrap items-center gap-2 mb-4 sm:mb-5 text-xl font-extrabold text-[#2C1810] sm:text-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <Users className="flex-shrink-0 w-5 h-5 text-[#E85D04] sm:w-6 sm:h-6" />
                User Agreement
              </h2>
              <div className="p-5 sm:p-6 mb-8 sm:mb-10 border border-[#E85D04]/20 rounded-2xl bg-[#FFF3E8]/50">
                <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base font-medium text-[#5C3D2E]">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-2.5 h-2.5 mt-1.5 bg-[#F48C06] rounded-full shadow-sm"></span>
                    <span>You must be at least 18 years old to use QuickBites</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-2.5 h-2.5 mt-1.5 bg-[#F48C06] rounded-full shadow-sm"></span>
                    <span>You are responsible for maintaining the security of your account</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-2.5 h-2.5 mt-1.5 bg-[#F48C06] rounded-full shadow-sm"></span>
                    <span>You agree to provide accurate and up-to-date information</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-2.5 h-2.5 mt-1.5 bg-[#F48C06] rounded-full shadow-sm"></span>
                    <span>You will not use our platform for any illegal or unauthorized purposes</span>
                  </li>
                </ul>
              </div>

              <h2 className="mb-4 sm:mb-5 text-xl font-extrabold text-[#2C1810] sm:text-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Service Description</h2>
              <div className="mb-8 sm:mb-10 space-y-4 sm:space-y-5">
                <p className="text-sm sm:text-base leading-relaxed font-medium text-[#5C3D2E]">
                  QuickBites is a food delivery platform that connects you with local restaurants. We facilitate orders and coordinate delivery but are not directly responsible for food preparation.
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                  <div className="p-4 sm:p-6 border border-[rgba(44,24,16,0.1)] rounded-2xl shadow-sm">
                    <h3 className="mb-3 text-base sm:text-lg font-bold text-[#2C1810]">Our Role</h3>
                    <ul className="space-y-2 text-sm sm:text-base font-medium text-[#5C3D2E]">
                      <li>• Platform and app operation</li>
                      <li>• Order processing and tracking</li>
                      <li>• Customer support</li>
                      <li>• Payment processing</li>
                    </ul>
                  </div>
                  <div className="p-4 sm:p-6 border border-[rgba(44,24,16,0.1)] rounded-2xl shadow-sm">
                    <h3 className="mb-3 text-base sm:text-lg font-bold text-[#2C1810]">Restaurant Role</h3>
                    <ul className="space-y-2 text-sm sm:text-base font-medium text-[#5C3D2E]">
                      <li>• Food preparation and quality</li>
                      <li>• Order accuracy</li>
                      <li>• Food safety compliance</li>
                      <li>• Menu and pricing updates</li>
                    </ul>
                  </div>
                </div>
              </div>

              <h2 className="mb-4 sm:mb-5 text-xl font-extrabold text-[#2C1810] sm:text-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Payment Terms</h2>
              <div className="p-5 sm:p-6 mb-8 sm:mb-10 border border-[#F48C06]/30 rounded-2xl bg-[#FFF3E8]/30">
                <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base font-medium text-[#5C3D2E]">
                  <li>• All prices are inclusive of applicable taxes</li>
                  <li>• Payment is required at the time of order placement (except COD)</li>
                  <li>• We accept various payment methods as displayed during checkout</li>
                  <li>• Delivery charges and service fees are clearly disclosed</li>
                  <li>• Promotional codes and discounts are subject to terms and conditions</li>
                </ul>
              </div>

              <h2 className="mb-4 sm:mb-5 text-xl font-extrabold text-[#2C1810] sm:text-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Order and Delivery</h2>
              <div className="mb-8 sm:mb-10 space-y-4 sm:space-y-5">
                <div className="p-4 sm:p-6 border border-[rgba(44,24,16,0.1)] rounded-2xl shadow-sm">
                  <h3 className="mb-2 text-base sm:text-lg font-bold text-[#2C1810]">Order Acceptance</h3>
                  <p className="text-sm sm:text-base font-medium text-[#5C3D2E]">Orders are subject to availability and restaurant acceptance. We reserve the right to cancel orders in exceptional circumstances.</p>
                </div>
                <div className="p-4 sm:p-6 border border-[rgba(44,24,16,0.1)] rounded-2xl shadow-sm">
                  <h3 className="mb-2 text-base sm:text-lg font-bold text-[#2C1810]">Delivery Times</h3>
                  <p className="text-sm sm:text-base font-medium text-[#5C3D2E]">Estimated delivery times are approximate and may vary due to weather, traffic, or high demand.</p>
                </div>
              </div>

              <h2 className="flex flex-wrap items-center gap-2 mb-4 sm:mb-5 text-xl font-extrabold text-[#2C1810] sm:text-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <AlertCircle className="flex-shrink-0 w-5 h-5 text-[#E85D04] sm:w-6 sm:h-6" />
                Limitation of Liability
              </h2>
              <div className="p-5 sm:p-6 mb-8 sm:mb-10 border border-[#E85D04]/30 rounded-2xl bg-[#E85D04]/5">
                <p className="mb-4 sm:mb-5 text-sm sm:text-base font-bold text-[#2C1810]">
                  QuickBites acts as an intermediary between customers and restaurants. Our liability is limited as follows:
                </p>
                <ul className="space-y-2.5 text-sm sm:text-base font-medium text-[#5C3D2E]">
                  <li>• We are not responsible for food quality, taste, or preparation</li>
                  <li>• Food allergies and dietary restrictions are the customer's responsibility</li>
                  <li>• We are not liable for any health issues resulting from food consumption</li>
                  <li>• Maximum liability is limited to the order value</li>
                </ul>
              </div>

              <h2 className="flex flex-wrap items-center gap-2 mb-4 sm:mb-5 text-xl font-extrabold text-[#2C1810] sm:text-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <Shield className="flex-shrink-0 w-5 h-5 text-[#A07850] sm:w-6 sm:h-6" />
                Privacy and Data
              </h2>
              <div className="p-5 sm:p-6 mb-8 sm:mb-10 border border-[#A07850]/20 rounded-2xl bg-[#FFF3E8]/50">
                <p className="mb-4 sm:mb-5 text-sm sm:text-base leading-relaxed font-medium text-[#5C3D2E]">
                  Your privacy is important to us. Please review our{' '}
                  <button
                    onClick={() => navigate('/privacy')}
                    className="font-bold text-[#E85D04] underline hover:text-[#C1440E] transition-colors"
                  >
                    Privacy Policy
                  </button>
                  {' '}for detailed information about how we collect, use, and protect your personal data.
                </p>
                <ul className="space-y-2.5 text-sm sm:text-base font-medium text-[#5C3D2E]">
                  <li>• We collect necessary information to provide our services</li>
                  <li>• Your data is protected with industry-standard security measures</li>
                  <li>• We do not sell your personal information to third parties</li>
                </ul>
              </div>

              <h2 className="mb-4 sm:mb-5 text-xl font-extrabold text-[#2C1810] sm:text-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Changes to Terms</h2>
              <div className="p-5 sm:p-6 mb-8 sm:mb-10 border border-[rgba(44,24,16,0.1)] rounded-2xl shadow-sm">
                <p className="text-sm sm:text-base leading-relaxed font-medium text-[#5C3D2E]">
                  We may update these Terms of Service from time to time. We will notify users of significant changes through the app or email. Continued use of our services after changes constitutes acceptance of the new terms.
                </p>
              </div>

              <h2 className="mb-4 sm:mb-5 text-xl font-extrabold text-[#2C1810] sm:text-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Contact Information</h2>
              <div className="p-6 sm:p-8 bg-gradient-to-r from-[#E85D04]/10 to-[#F48C06]/10 border border-[#E85D04]/20 rounded-3xl">
                <p className="mb-5 sm:mb-6 text-base sm:text-lg font-bold text-[#2C1810]">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="space-y-3 text-sm sm:text-base font-medium text-[#5C3D2E]">
                  <p>📧 <span className="font-bold ml-1 text-[#2C1810]">Email:</span> legal@quickbites.com</p>
                  <p>📞 <span className="font-bold ml-1 text-[#2C1810]">Phone:</span> 1800-123-4567</p>
                  <p>📍 <span className="font-bold ml-1 text-[#2C1810]">Address:</span> QuickBites Legal Team, Vadodara, Gujarat, India</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Terms