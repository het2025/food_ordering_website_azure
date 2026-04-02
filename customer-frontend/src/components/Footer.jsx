import { Link } from 'react-router-dom'
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa'

// --- 🍑 WARM PEACH & DEEP WARM DARK THEME ---
// bgDark: '#1C1410' (Deep espresso brown for footer grounding)
// textMain: '#FFF3E8' (Warm Peach)
// textMuted: '#EDCFB8' (Soft Tan/Peach)
// accentOrange: '#E85D04'
// accentAmber: '#F48C06'

const Footer = () => {
  return (
    <footer className="text-[#FFF3E8] bg-[#1C1410] font-['Inter',_sans-serif] border-t border-[#E85D04]/10">
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Branding Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src="/quickbite_logo.svg"
                alt="QuickBites Logo"
                className="object-contain w-16 h-8"
              />
              <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#E85D04] to-[#F48C06]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                QuickBite
              </span>
            </div>
            <p className="text-sm font-medium text-[#EDCFB8] leading-relaxed pr-4">
              QuickBite – Your favorite meals, delivered fast. Experience the best food in town, hot and fresh at your doorstep.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold text-[#FFF3E8] tracking-wide" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Quick Links</h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/home"
                  className="text-[#EDCFB8] font-medium transition-colors duration-200 hover:text-[#E85D04]"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/restaurants"
                  className="text-[#EDCFB8] font-medium transition-colors duration-200 hover:text-[#E85D04]"
                >
                  Restaurants
                </Link>
              </li>
              <li>
                <Link
                  to="/orders"
                  className="text-[#EDCFB8] font-medium transition-colors duration-200 hover:text-[#E85D04]"
                >
                  My Orders
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-[#EDCFB8] font-medium transition-colors duration-200 hover:text-[#E85D04]"
                >
                  Subscriptions
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-[#EDCFB8] font-medium transition-colors duration-200 hover:text-[#E85D04]"
                >
                  Wallet
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold text-[#FFF3E8] tracking-wide" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Support</h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/help"
                  className="text-[#EDCFB8] font-medium transition-colors duration-200 hover:text-[#E85D04]"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/help#faqs"
                  className="text-[#EDCFB8] font-medium transition-colors duration-200 hover:text-[#E85D04]"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  to="/help#contact"
                  className="text-[#EDCFB8] font-medium transition-colors duration-200 hover:text-[#E85D04]"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/refund-policy"
                  className="text-[#EDCFB8] font-medium transition-colors duration-200 hover:text-[#E85D04]"
                >
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold text-[#FFF3E8] tracking-wide" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Follow Us</h3>
            <div className="flex space-x-4 mt-2">
              <a
                href="https://facebook.com/quickbites"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-[#2C1810] rounded-xl text-[#EDCFB8] transition-all duration-200 transform hover:bg-[#E85D04] hover:text-white hover:scale-110 hover:-translate-y-1 shadow-sm"
                aria-label="Facebook"
              >
                <FaFacebook size={20} />
              </a>
              <a
                href="https://instagram.com/quickbites"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-[#2C1810] rounded-xl text-[#EDCFB8] transition-all duration-200 transform hover:bg-[#E85D04] hover:text-white hover:scale-110 hover:-translate-y-1 shadow-sm"
                aria-label="Instagram"
              >
                <FaInstagram size={20} />
              </a>
              <a
                href="https://twitter.com/quickbites"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-[#2C1810] rounded-xl text-[#EDCFB8] transition-all duration-200 transform hover:bg-[#E85D04] hover:text-white hover:scale-110 hover:-translate-y-1 shadow-sm"
                aria-label="Twitter"
              >
                <FaTwitter size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="pt-8 mt-12 text-center border-t border-[rgba(255,243,232,0.1)]">
          <p className="text-sm font-medium text-[#EDCFB8]/80">
            © {new Date().getFullYear()} QuickBites. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer