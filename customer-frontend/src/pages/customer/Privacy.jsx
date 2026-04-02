import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Shield, Eye, Lock, Database } from 'lucide-react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

// --- 🍑 WARM PEACH THEME (With Clean White Cards) ---
// bgMain: '#FFF3E8'
// borderOrange: '#E85D04'
// accentAmber: '#F48C06'
// textDark: '#2C1810'
// textMuted: '#5C3D2E'

const Privacy = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#FFF3E8] font-['Inter',_sans-serif]">
      <Header />

      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex flex-wrap items-center gap-y-2 mb-6 sm:mb-8 pt-4 sm:pt-0">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-[#5C3D2E] hover:text-[#E85D04] mr-4 flex-shrink-0 transition-colors font-semibold min-h-[44px]"
            >
              <ArrowLeft className="w-5 h-5 mr-1 sm:mr-2" />
              <span className="text-sm sm:text-base">Back</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C1810]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Privacy Policy
            </h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(44,24,16,0.04)] border border-[rgba(44,24,16,0.05)] p-5 sm:p-10 mb-8"
          >
            <div className="prose prose-lg max-w-none">
              <p className="text-[#5C3D2E]/70 font-semibold text-sm mb-6">Last updated: September 13, 2025</p>

              <p className="text-[#5C3D2E] font-medium text-base sm:text-lg mb-10 leading-relaxed">
                Your privacy is important to us. This Privacy Policy explains how QuickBites collects, uses, discloses, and safeguards your information when you use our food delivery platform.
              </p>

              <h2 className="text-xl sm:text-2xl font-extrabold text-[#2C1810] mb-5 flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <Database className="w-5 h-5 sm:w-6 sm:h-6 text-[#E85D04]" />
                Information We Collect
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mb-10">
                <div className="bg-[#FFF3E8]/50 border border-[#E85D04]/10 rounded-2xl p-5 sm:p-6">
                  <h3 className="font-bold text-[#2C1810] mb-3 text-lg">Personal Information</h3>
                  <ul className="space-y-2.5 text-[#5C3D2E] font-medium text-sm sm:text-base">
                    <li>• Name and contact details</li>
                    <li>• Email address and phone number</li>
                    <li>• Delivery addresses</li>
                    <li>• Date of birth (optional)</li>
                    <li>• Profile preferences</li>
                  </ul>
                </div>
                <div className="bg-[#FFF3E8]/50 border border-[#E85D04]/10 rounded-2xl p-5 sm:p-6">
                  <h3 className="font-bold text-[#2C1810] mb-3 text-lg">Usage Information</h3>
                  <ul className="space-y-2.5 text-[#5C3D2E] font-medium text-sm sm:text-base">
                    <li>• Order history and preferences</li>
                    <li>• App usage and navigation data</li>
                    <li>• Device information and IP address</li>
                    <li>• Location data (with permission)</li>
                    <li>• Payment transaction details</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-[#2C1810] mb-5 flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-[#F48C06]" />
                How We Use Your Information
              </h2>
              <div className="bg-white border border-[rgba(44,24,16,0.1)] shadow-sm rounded-2xl p-5 sm:p-8 mb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  <div>
                    <h3 className="font-bold text-[#2C1810] mb-3 text-lg">Service Delivery</h3>
                    <ul className="space-y-2.5 text-[#5C3D2E] font-medium text-sm sm:text-base">
                      <li>• Process and fulfill your orders</li>
                      <li>• Coordinate delivery services</li>
                      <li>• Handle payments and refunds</li>
                      <li>• Provide customer support</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2C1810] mb-3 text-lg">Personalization</h3>
                    <ul className="space-y-2.5 text-[#5C3D2E] font-medium text-sm sm:text-base">
                      <li>• Recommend restaurants and dishes</li>
                      <li>• Customize app experience</li>
                      <li>• Send relevant offers and promotions</li>
                      <li>• Improve our services</li>
                    </ul>
                  </div>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-[#2C1810] mb-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Information Sharing</h2>
              <div className="space-y-5 mb-10">
                <div className="border border-green-200 bg-green-50/50 rounded-2xl p-5 sm:p-6">
                  <h3 className="font-extrabold text-green-700 mb-3 text-lg">✅ What We Share</h3>
                  <ul className="space-y-2.5 text-[#5C3D2E] font-medium text-sm sm:text-base">
                    <li>• Order details with restaurants for fulfillment</li>
                    <li>• Delivery information with delivery partners</li>
                    <li>• Anonymous analytics data for service improvement</li>
                    <li>• Information required by law or regulation</li>
                  </ul>
                </div>
                <div className="border border-red-200 bg-red-50/50 rounded-2xl p-5 sm:p-6">
                  <h3 className="font-extrabold text-red-600 mb-3 text-lg">❌ What We DON'T Share</h3>
                  <ul className="space-y-2.5 text-[#5C3D2E] font-medium text-sm sm:text-base">
                    <li>• We never sell your personal information</li>
                    <li>• No sharing with unauthorized third parties</li>
                    <li>• No marketing emails from external companies</li>
                    <li>• No access to your payment card details</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-[#2C1810] mb-5 flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-[#A07850]" />
                Data Security
              </h2>
              <div className="bg-[#FFF3E8]/30 border border-[#A07850]/20 rounded-2xl p-5 sm:p-8 mb-10">
                <p className="text-[#5C3D2E] font-medium text-base sm:text-lg mb-6">
                  We implement robust security measures to protect your personal information:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center bg-white p-4 rounded-xl border border-[rgba(44,24,16,0.05)] shadow-sm">
                    <div className="w-12 h-12 bg-[#A07850]/10 text-[#A07850] rounded-full flex items-center justify-center mx-auto mb-3">
                      🔒
                    </div>
                    <h4 className="font-bold text-[#2C1810] mb-2">Encryption</h4>
                    <p className="text-sm font-medium text-[#5C3D2E]">All data is encrypted in transit and at rest</p>
                  </div>
                  <div className="text-center bg-white p-4 rounded-xl border border-[rgba(44,24,16,0.05)] shadow-sm">
                    <div className="w-12 h-12 bg-[#A07850]/10 text-[#A07850] rounded-full flex items-center justify-center mx-auto mb-3">
                      🛡️
                    </div>
                    <h4 className="font-bold text-[#2C1810] mb-2">Secure Servers</h4>
                    <p className="text-sm font-medium text-[#5C3D2E]">Protected servers with regular security updates</p>
                  </div>
                  <div className="text-center bg-white p-4 rounded-xl border border-[rgba(44,24,16,0.05)] shadow-sm">
                    <div className="w-12 h-12 bg-[#A07850]/10 text-[#A07850] rounded-full flex items-center justify-center mx-auto mb-3">
                      👁️
                    </div>
                    <h4 className="font-bold text-[#2C1810] mb-2">Access Control</h4>
                    <p className="text-sm font-medium text-[#5C3D2E]">Limited access to authorized personnel only</p>
                  </div>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-[#2C1810] mb-5 flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#E85D04]" />
                Your Rights and Choices
              </h2>
              <div className="bg-white border border-[rgba(44,24,16,0.1)] rounded-2xl p-5 sm:p-8 mb-10 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  <div>
                    <h3 className="font-bold text-[#2C1810] mb-3 text-lg">Data Rights</h3>
                    <ul className="space-y-2.5 text-[#5C3D2E] font-medium text-sm sm:text-base">
                      <li>• Access your personal data</li>
                      <li>• Update or correct information</li>
                      <li>• Delete your account and data</li>
                      <li>• Download your data</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2C1810] mb-3 text-lg">Communication Choices</h3>
                    <ul className="space-y-2.5 text-[#5C3D2E] font-medium text-sm sm:text-base">
                      <li>• Opt out of marketing emails</li>
                      <li>• Control push notifications</li>
                      <li>• Manage location sharing</li>
                      <li>• Update privacy preferences</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-4 sm:p-5 bg-[#FFF3E8] border border-[#E85D04]/20 rounded-xl">
                  <p className="text-[#5C3D2E] font-medium text-sm sm:text-base">
                    <strong className="text-[#2C1810]">To exercise your rights:</strong> Visit your account settings or contact us at
                    <a href="mailto:privacy@quickbites.com" className="text-[#E85D04] hover:underline font-bold ml-1">privacy@quickbites.com</a>
                  </p>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-[#2C1810] mb-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Cookies and Tracking</h2>
              <div className="bg-[#FFF3E8]/50 border border-[#F48C06]/30 rounded-2xl p-5 sm:p-6 mb-10">
                <p className="text-[#5C3D2E] font-medium text-base sm:text-lg mb-4">
                  We use cookies and similar technologies to enhance your experience:
                </p>
                <div className="space-y-3.5">
                  <div className="flex items-start gap-3">
                    <span className="w-2.5 h-2.5 bg-[#F48C06] rounded-full mt-1.5 flex-shrink-0 shadow-sm"></span>
                    <div className="text-sm sm:text-base font-medium">
                      <strong className="text-[#2C1810] mr-1">Essential Cookies:</strong>
                      <span className="text-[#5C3D2E]">Required for basic functionality</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-2.5 h-2.5 bg-[#F48C06] rounded-full mt-1.5 flex-shrink-0 shadow-sm"></span>
                    <div className="text-sm sm:text-base font-medium">
                      <strong className="text-[#2C1810] mr-1">Analytics Cookies:</strong>
                      <span className="text-[#5C3D2E]">Help us understand usage patterns</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-2.5 h-2.5 bg-[#F48C06] rounded-full mt-1.5 flex-shrink-0 shadow-sm"></span>
                    <div className="text-sm sm:text-base font-medium">
                      <strong className="text-[#2C1810] mr-1">Preference Cookies:</strong>
                      <span className="text-[#5C3D2E]">Remember your choices and settings</span>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-[#2C1810] mb-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Children's Privacy</h2>
              <div className="bg-white border border-[rgba(44,24,16,0.1)] rounded-2xl p-5 sm:p-6 mb-10 shadow-sm">
                <p className="text-[#5C3D2E] font-medium leading-relaxed">
                  QuickBites is intended for users aged 18 and above. We do not knowingly collect personal information from children under 18. If you believe we have collected such information, please contact us immediately.
                </p>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-[#2C1810] mb-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Changes to This Policy</h2>
              <div className="bg-white border border-[rgba(44,24,16,0.1)] rounded-2xl p-5 sm:p-6 mb-10 shadow-sm">
                <p className="text-[#5C3D2E] font-medium leading-relaxed">
                  We may update this Privacy Policy periodically. We will notify you of significant changes through the app, email, or by posting a notice on our website. Your continued use of our services after such modifications constitutes acceptance of the updated policy.
                </p>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-[#2C1810] mb-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Contact Us</h2>
              <div className="bg-gradient-to-r from-[#E85D04]/10 to-[#F48C06]/10 border border-[#E85D04]/20 rounded-3xl p-6 sm:p-8">
                <p className="text-[#2C1810] font-bold text-base sm:text-lg mb-6">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  <div>
                    <p className="font-extrabold text-[#E85D04] mb-3 uppercase tracking-wider text-sm">Privacy Team</p>
                    <div className="space-y-2 font-medium text-[#5C3D2E]">
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#A07850]" />
                        privacy@quickbites.com
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#A07850]" />
                        1800-123-4567
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="font-extrabold text-[#E85D04] mb-3 uppercase tracking-wider text-sm">Mailing Address</p>
                    <div className="space-y-1 font-medium text-[#5C3D2E]">
                      <p>QuickBites Privacy Office</p>
                      <p>Vadodara, Gujarat, India</p>
                    </div>
                  </div>
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

export default Privacy