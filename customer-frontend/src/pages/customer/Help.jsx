import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HelpCircle,
  Phone,
  Mail,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Search,
  Clock,
  MapPin,
  CreditCard,
  Package
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

const Help = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeAccordion, setActiveAccordion] = useState(null)

  const faqCategories = [
    {
      title: 'Orders & Delivery',
      icon: Package,
      faqs: [
        {
          question: 'How do I place an order?',
          answer: 'Browse restaurants, select items, add to cart, choose delivery address, select payment method, and confirm your order.'
        },
        {
          question: 'What are the delivery charges?',
          answer: 'Delivery charges vary by distance and restaurant. Free delivery is available on orders above ₹299.'
        },
        {
          question: 'How long does delivery take?',
          answer: 'Most orders are delivered within 25-45 minutes. Exact time depends on restaurant preparation and distance.'
        },
        {
          question: 'Can I track my order?',
          answer: 'Yes! You can track your order in real-time through the "My Orders" section in your account.'
        }
      ]
    },
    {
      title: 'Payments',
      icon: CreditCard,
      faqs: [
        {
          question: 'What payment methods are accepted?',
          answer: 'We accept credit/debit cards, UPI, net banking, wallets, and cash on delivery (COD).'
        },
        {
          question: 'Is it safe to pay online?',
          answer: 'Yes, all online transactions are secured with bank-grade encryption. We do not store your card details.'
        },
        {
          question: 'When am I charged for my order?',
          answer: 'For online payments, you are charged immediately. For COD, payment is collected upon delivery.'
        }
      ]
    },
    {
      title: 'Account & Profile',
      icon: MapPin,
      faqs: [
        {
          question: 'How do I update my profile?',
          answer: 'Go to Settings > Profile to update your name, email, phone number, and other details.'
        },
        {
          question: 'How do I add/change my address?',
          answer: 'Visit "My Addresses" in your profile to add, edit, or delete delivery addresses.'
        },
        {
          question: 'Can I change my registered mobile number?',
          answer: 'Yes, you can update your mobile number in Profile Settings. Verification may be required.'
        }
      ]
    },
    {
      title: 'Offers & Refunds',
      icon: Clock,
      faqs: [
        {
          question: 'How do I apply a coupon?',
          answer: 'Enter your coupon code in the cart page before checkout. Valid coupons will show instant discount.'
        },
        {
          question: 'What is your refund policy?',
          answer: 'Refunds are processed within 3-5 business days for cancelled or undelivered orders.'
        },
        {
          question: 'How do I get loyalty points?',
          answer: 'Earn points on every order. 1 rupee = 1 point. Use points for discounts on future orders.'
        }
      ]
    }
  ]

  const contactOptions = [
    {
      title: 'Call Us',
      description: 'Speak with our support team',
      icon: Phone,
      action: 'tel:1800-123-4567',
      color: 'bg-[#E85D04]/10 text-[#E85D04]'
    },
    {
      title: 'Email Support',
      description: 'Send us your queries',
      icon: Mail,
      action: 'mailto:support@quickbites.com',
      color: 'bg-[#F48C06]/10 text-[#F48C06]'
    },
    {
      title: 'Live Chat',
      description: 'Chat with us now',
      icon: MessageCircle,
      action: 'chat',
      color: 'bg-[#2C1810]/10 text-[#2C1810]'
    }
  ]

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0)

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-[#FFF3E8] font-['Inter',_sans-serif]">
      <Header />

      <div className="pt-16 sm:pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex flex-wrap items-center gap-2 mb-5 sm:mb-8 pt-4 sm:pt-0">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-[#5C3D2E] hover:text-[#2C1810] min-h-[44px] px-1 transition-colors font-semibold"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              <span className="text-sm sm:text-base">Back</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C1810]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Help & Support
            </h1>
          </div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-[#5C3D2E]/60 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border border-[rgba(44,24,16,0.1)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#E85D04] bg-white shadow-[0_8px_30px_rgba(44,24,16,0.04)] text-[#2C1810] placeholder-[#5C3D2E]/50 text-sm sm:text-base font-medium transition-shadow"
              />
            </div>
          </motion.div>

          {/* Contact Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-12"
          >
            {contactOptions.map((option) => (
              <button
                key={option.title}
                onClick={() => {
                  if (option.action.startsWith('tel:') || option.action.startsWith('mailto:')) {
                    window.open(option.action)
                  }
                }}
                className={`p-3 sm:p-6 rounded-2xl sm:rounded-3xl ${option.color} hover:-translate-y-1 transition-all duration-300 min-h-[90px] sm:min-h-auto border border-[rgba(44,24,16,0.05)] shadow-sm hover:shadow-md`}
              >
                <option.icon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1.5 sm:mb-3" />
                <h3 className="font-extrabold text-xs sm:text-lg mb-0.5 sm:mb-1 leading-tight">{option.title}</h3>
                <p className="text-xs font-medium opacity-80 hidden sm:block">{option.description}</p>
              </button>
            ))}
          </motion.div>

          {/* FAQ Categories */}
          <div className="space-y-4 sm:space-y-8">
            {filteredFAQs.map((category, categoryIndex) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + categoryIndex * 0.1 }}
                className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(44,24,16,0.04)] border border-[rgba(44,24,16,0.05)] p-4 sm:p-6"
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <category.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#E85D04] flex-shrink-0" />
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#2C1810]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {category.title}
                  </h2>
                </div>

                <div className="space-y-3">
                  {category.faqs.map((faq, faqIndex) => {
                    const globalIndex = categoryIndex * 100 + faqIndex

                    return (
                      <div key={faqIndex} className="border border-[rgba(44,24,16,0.05)] rounded-2xl overflow-hidden transition-colors">
                        <button
                          onClick={() => toggleAccordion(globalIndex)}
                          className="w-full flex items-center justify-between p-3 sm:p-4 text-left hover:bg-[#FFF3E8]/50 transition-colors min-h-[48px]"
                        >
                          <span className="font-bold text-[#2C1810] pr-3 text-sm sm:text-base leading-snug">{faq.question}</span>
                          {activeAccordion === globalIndex ? (
                            <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#E85D04] flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-[#5C3D2E]/50 flex-shrink-0" />
                          )}
                        </button>

                        <AnimatePresence>
                          {activeAccordion === globalIndex && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="border-t border-[rgba(44,24,16,0.05)] bg-[#FFF3E8]/30"
                            >
                              <p className="p-3 sm:p-4 text-[#5C3D2E] font-medium leading-relaxed text-sm sm:text-base">
                                {faq.answer}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty Search State */}
          {filteredFAQs.length === 0 && searchQuery && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 sm:py-16 bg-white rounded-3xl shadow-[0_8px_30px_rgba(44,24,16,0.04)] border border-[rgba(44,24,16,0.05)]"
            >
              <HelpCircle className="w-12 h-12 sm:w-16 sm:h-16 text-[#E85D04]/30 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-extrabold text-[#2C1810] mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>No results found</h3>
              <p className="text-[#5C3D2E] font-medium mb-6 text-sm sm:text-base px-2">
                Try different keywords or contact our support team
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 px-4">
                <button
                  onClick={() => window.open('tel:1800-123-4567')}
                  className="bg-[#E85D04] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#C1440E] transition-colors min-h-[48px] shadow-lg shadow-[#E85D04]/20"
                >
                  Call Support
                </button>
                <button
                  onClick={() => window.open('mailto:support@quickbites.com')}
                  className="bg-[#2C1810] text-[#FFF3E8] px-6 py-3 rounded-xl font-bold hover:bg-[#4D2E18] transition-colors min-h-[48px] shadow-lg shadow-[#2C1810]/20"
                >
                  Email Us
                </button>
              </div>
            </motion.div>
          )}

          {/* Still Need Help (CTA) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 sm:mt-12 bg-gradient-to-r from-[#E85D04] to-[#F48C06] shadow-[0_10px_30px_rgba(232,93,4,0.2)] rounded-3xl p-6 sm:p-10 text-white text-center"
          >
            <h2 className="text-xl sm:text-3xl font-extrabold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Still need help?</h2>
            <p className="text-[#FFF3E8]/90 font-medium mb-6 sm:mb-8 text-sm sm:text-base">
              Our friendly support team is available 24/7 to assist you
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={() => window.open('tel:1800-123-4567')}
                className="bg-[#FFF3E8] text-[#E85D04] px-5 sm:px-8 py-3.5 rounded-xl font-bold hover:bg-white transition-all hover:scale-105 min-h-[48px] text-sm sm:text-base shadow-lg"
              >
                Call: 1800-123-4567
              </button>
              <button
                onClick={() => window.open('mailto:support@quickbites.com')}
                className="bg-black/10 text-white px-5 sm:px-8 py-3.5 rounded-xl font-bold hover:bg-black/20 transition-all hover:scale-105 min-h-[48px] text-sm sm:text-base"
              >
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

export default Help