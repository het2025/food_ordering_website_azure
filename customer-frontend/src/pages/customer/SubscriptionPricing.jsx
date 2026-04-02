import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Crown, Star, Zap } from 'lucide-react'
import Header from '../../components/Header'

// --- 🍑 WARM PEACH THEME (With Clean White Cards) ---
// bgMain: '#FFF3E8'
// borderOrange: '#E85D04'
// accentAmber: '#F48C06'
// textDark: '#2C1810'
// textMuted: '#5C3D2E'

const SubscriptionPricing = () => {
  const [selectedPlan, setSelectedPlan] = useState('premium')
  const [billingCycle, setBillingCycle] = useState('monthly')

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      icon: Star,
      color: 'from-[#A07850] to-[#5C3D2E]', // Muted warm tones for basic
      monthlyPrice: 99,
      yearlyPrice: 999,
      features: [
        'Free delivery on orders above ₹299',
        'Access to basic discounts up to 10%',
        'Standard customer support',
        'Order tracking',
        'Basic app features'
      ],
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium',
      icon: Crown,
      color: 'from-[#E85D04] to-[#F48C06]', // Vibrant brand gradient
      monthlyPrice: 299,
      yearlyPrice: 2999,
      features: [
        'Free delivery on ALL orders',
        'Exclusive premium discounts up to 25%',
        'Priority customer support 24/7',
        'Advanced order tracking with live updates',
        'Early access to new restaurants',
        'Special member-only offers',
        'Premium app themes',
        'Monthly surprise rewards'
      ],
      popular: true
    },
    {
      id: 'pro',
      name: 'Pro',
      icon: Zap,
      color: 'from-[#C1440E] to-[#2C1810]', // Deep intense tones for pro
      monthlyPrice: 499,
      yearlyPrice: 4999,
      features: [
        'Everything in Premium',
        'Unlimited free delivery',
        'Exclusive restaurant partnerships',
        'Personal food curator',
        'VIP customer support',
        'Custom dietary preferences',
        'Advanced analytics dashboard',
        'Monthly chef consultations'
      ],
      popular: false
    }
  ]

  const handleSelectPlan = (id) => {
    setSelectedPlan(id)
  }

  const getPrice = (plan) => {
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice
  }

  const getSavings = (plan) => {
    if (billingCycle === 'yearly') {
      const yearlyDiscount = (plan.monthlyPrice * 12) - plan.yearlyPrice
      return Math.round((yearlyDiscount / (plan.monthlyPrice * 12)) * 100)
    }
    return 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF3E8] to-[#FFF3E8]/70 font-['Inter',_sans-serif]">
      <Header />

      <div className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10 sm:mb-16"
          >
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#2C1810] mb-4 sm:mb-6 leading-tight px-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Choose Your{' '}
              <span className="bg-gradient-to-r from-[#E85D04] to-[#F48C06] bg-clip-text text-transparent">
                QuickBites
              </span>{' '}
              Plan
            </h1>
            <p className="text-base sm:text-xl font-medium text-[#5C3D2E] max-w-3xl mx-auto mb-8 sm:mb-10 px-2 leading-relaxed">
              Unlock exclusive benefits, save more on every order, and enjoy the ultimate food delivery experience
            </p>

            {/* Billing Cycle Toggle */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
              <span className={`font-bold text-sm sm:text-base transition-colors ${billingCycle === 'monthly' ? 'text-[#E85D04]' : 'text-[#5C3D2E]'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className={`relative w-14 h-7 sm:w-16 sm:h-8 rounded-full transition-colors flex-shrink-0 shadow-inner ${billingCycle === 'yearly' ? 'bg-[#F48C06]' : 'bg-[#E85D04]'
                  }`}
              >
                <div className={`absolute w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full top-1 transition-transform shadow-sm ${billingCycle === 'yearly' ? 'translate-x-7 sm:translate-x-9' : 'translate-x-1'
                  }`} />
              </button>
              <span className={`font-bold text-sm sm:text-base transition-colors ${billingCycle === 'yearly' ? 'text-[#F48C06]' : 'text-[#5C3D2E]'}`}>
                Yearly
              </span>
              {billingCycle === 'yearly' && (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs sm:text-sm font-extrabold border border-green-200 ml-2 animate-pulse">
                  Save up to 17%
                </span>
              )}
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => {
              const IconComponent = plan.icon
              const isSelected = selectedPlan === plan.id
              const savings = getSavings(plan)

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative rounded-3xl transition-all duration-300 cursor-pointer bg-white flex flex-col ${isSelected
                      ? 'ring-4 ring-[#E85D04] shadow-[0_20px_60px_rgba(232,93,4,0.2)] md:-translate-y-4'
                      : 'hover:shadow-[0_15px_40px_rgba(44,24,16,0.08)] border border-[rgba(44,24,16,0.05)] hover:-translate-y-1'
                    }`}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="bg-gradient-to-r from-[#E85D04] to-[#F48C06] text-white px-6 py-1.5 rounded-full text-xs sm:text-sm font-extrabold shadow-lg whitespace-nowrap tracking-wide uppercase">
                        Most Popular
                      </div>
                    </div>
                  )}

                  {savings > 0 && (
                    <div className="absolute -top-4 right-4 z-10">
                      <div className="bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-extrabold shadow-lg tracking-wide uppercase">
                        Save {savings}%
                      </div>
                    </div>
                  )}

                  <div className="p-6 sm:p-8 flex flex-col flex-grow">
                    {/* Plan Header */}
                    <div className="text-center mb-6 sm:mb-8 pb-6 border-b border-[rgba(44,24,16,0.05)]">
                      <div className={`inline-flex p-3 sm:p-4 rounded-2xl bg-gradient-to-br ${plan.color} text-white mb-4 shadow-md`}>
                        <IconComponent className="w-6 h-6 sm:w-8 sm:h-8" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-[#2C1810] mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{plan.name}</h3>
                      <div className="text-center flex items-baseline justify-center gap-1">
                        <span className="text-4xl sm:text-5xl font-extrabold text-[#2C1810]">₹{getPrice(plan)}</span>
                        <span className="text-[#5C3D2E] font-medium text-sm sm:text-base">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-4 mb-8 flex-grow">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-[#5C3D2E] font-medium text-sm sm:text-base leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <button
                      className={`w-full py-3.5 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-base transition-all duration-200 mt-auto ${isSelected
                          ? `bg-gradient-to-r ${plan.color} text-white shadow-lg hover:opacity-90`
                          : 'bg-[#FFF3E8] text-[#E85D04] hover:bg-[#E85D04] hover:text-white border border-[#E85D04]/20'
                        }`}
                    >
                      {isSelected ? 'Selected Plan' : 'Choose Plan'}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-12 sm:mt-20"
          >
            <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(44,24,16,0.06)] border border-[rgba(44,24,16,0.05)] p-6 sm:p-10 max-w-3xl mx-auto relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#E85D04] to-[#F48C06]"></div>

              <h3 className="text-xl sm:text-3xl font-extrabold text-[#2C1810] mb-3 sm:mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Ready to upgrade your food experience?
              </h3>
              <p className="text-[#5C3D2E] font-medium mb-6 sm:mb-8 text-sm sm:text-base">
                Join thousands of food lovers who save more and eat better with QuickBites Premium
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                <button className="w-full sm:w-auto bg-gradient-to-r from-[#E85D04] to-[#F48C06] text-white px-8 py-3.5 rounded-xl font-bold text-base hover:scale-105 transition-transform duration-200 shadow-lg shadow-[#E85D04]/20">
                  Start Free Trial
                </button>
                <button className="w-full sm:w-auto bg-transparent border-2 border-[rgba(44,24,16,0.1)] text-[#2C1810] px-8 py-3.5 rounded-xl font-bold text-base hover:bg-[rgba(44,24,16,0.05)] hover:border-[rgba(44,24,16,0.2)] transition-colors duration-200">
                  Learn More
                </button>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-[#5C3D2E]/60 mt-6">
                30-day free trial • Cancel anytime • No commitment
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}

export default SubscriptionPricing