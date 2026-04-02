import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bell,
  Moon,
  Globe,
  Shield,
  CreditCard,
  User,
  ArrowLeft,
  ChevronRight,
  LogOut,
  Trash2
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

// --- 🍑 WARM PEACH THEME (With Clean White Cards) ---
// bgMain: '#FFF3E8'
// borderOrange: '#E85D04'
// accentAmber: '#F48C06'
// textDark: '#2C1810'
// textMuted: '#5C3D2E'

const Settings = () => {
  const navigate = useNavigate()
  const { logoutUser } = useUser()

  const [settings, setSettings] = useState({
    notifications: {
      orderUpdates: true,
      offers: true,
      newsletter: false,
      sms: true
    },
    preferences: {
      darkMode: false,
      language: 'English',
      currency: 'INR'
    },
    privacy: {
      profileVisibility: 'public',
      dataSharing: false
    }
  })

  const handleToggle = (category, setting) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting]
      }
    }))
  }

  const handleLogout = () => {
    navigate('/')
    setTimeout(() => {
      if (logoutUser) logoutUser()
    }, 0)
  }

  const settingsGroups = [
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        { key: 'orderUpdates', label: 'Order Updates', description: 'Get notified about your order status' },
        { key: 'offers', label: 'Offers & Promotions', description: 'Receive special offers and deals' },
        { key: 'newsletter', label: 'Newsletter', description: 'Weekly food recommendations' },
        { key: 'sms', label: 'SMS Notifications', description: 'Receive SMS for important updates' }
      ]
    },
    {
      title: 'Preferences',
      icon: Globe,
      items: [
        { key: 'darkMode', label: 'Dark Mode', description: 'Switch to dark theme' },
        { key: 'language', label: 'Language', description: 'Choose your preferred language', type: 'select' },
        { key: 'currency', label: 'Currency', description: 'Display prices in your currency', type: 'select' }
      ]
    },
    {
      title: 'Privacy',
      icon: Shield,
      items: [
        { key: 'profileVisibility', label: 'Profile Visibility', description: 'Control who can see your profile', type: 'select' },
        { key: 'dataSharing', label: 'Data Sharing', description: 'Share data to improve recommendations' }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-[#FFF3E8] font-['Inter',_sans-serif]">
      <Header />

      <div className="pt-16 sm:pt-24 pb-20 sm:pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex items-center gap-2 mb-6 sm:mb-8 flex-wrap">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-[#5C3D2E] hover:text-[#E85D04] min-h-[44px] px-1 transition-colors font-semibold"
            >
              <ArrowLeft className="w-5 h-5 mr-1.5" />
              <span className="text-sm sm:text-base">Back</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C1810]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Settings</h1>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {settingsGroups.map((group, groupIndex) => (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1 }}
                className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(44,24,16,0.04)] border border-[rgba(44,24,16,0.05)] p-5 sm:p-8"
              >
                <div className="flex items-center gap-3 mb-5 sm:mb-8">
                  <div className="p-2.5 bg-[#FFF3E8] rounded-xl border border-[rgba(44,24,16,0.05)]">
                    <group.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#E85D04] flex-shrink-0" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#2C1810]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{group.title}</h2>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  {group.items.map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-3.5 border-b border-[rgba(44,24,16,0.05)] last:border-0">
                      <div className="flex-1 min-w-0 pr-4">
                        <h3 className="font-bold text-[#2C1810] text-sm sm:text-base leading-tight mb-1">{item.label}</h3>
                        <p className="text-xs sm:text-sm font-medium text-[#5C3D2E] leading-snug">{item.description}</p>
                      </div>

                      <div className="flex-shrink-0">
                        {item.type === 'select' ? (
                          <select className="border border-[rgba(44,24,16,0.1)] rounded-xl px-3 py-2.5 text-sm font-bold text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#E85D04] max-w-[120px] sm:max-w-none bg-[#FFF3E8]/50 shadow-sm hover:border-[#E85D04]/50 transition-colors">
                            {item.key === 'language' && (
                              <>
                                <option>English</option>
                                <option>Hindi</option>
                                <option>Gujarati</option>
                              </>
                            )}
                            {item.key === 'currency' && (
                              <>
                                <option>INR</option>
                                <option>USD</option>
                              </>
                            )}
                            {item.key === 'profileVisibility' && (
                              <>
                                <option>Public</option>
                                <option>Private</option>
                              </>
                            )}
                          </select>
                        ) : (
                          <button
                            onClick={() => handleToggle(group.title.toLowerCase(), item.key)}
                            className={`relative inline-flex h-7 w-12 sm:h-8 sm:w-14 items-center rounded-full transition-colors flex-shrink-0 shadow-inner ${settings[group.title.toLowerCase()]?.[item.key]
                                ? 'bg-[#E85D04]'
                                : 'bg-[rgba(44,24,16,0.15)]'
                              }`}
                          >
                            <span
                              className={`inline-block h-5 w-5 sm:h-6 sm:w-6 transform rounded-full bg-white transition-transform shadow-md ${settings[group.title.toLowerCase()]?.[item.key]
                                  ? 'translate-x-6 sm:translate-x-7'
                                  : 'translate-x-1'
                                }`}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* Account Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(44,24,16,0.04)] border border-[rgba(44,24,16,0.05)] p-5 sm:p-8"
            >
              <h2 className="text-lg sm:text-xl font-extrabold text-[#2C1810] mb-5 sm:mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Account</h2>

              <div className="space-y-2">
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full flex items-center justify-between min-h-[56px] text-left hover:bg-[#FFF3E8]/50 rounded-2xl px-4 transition-colors border border-transparent hover:border-[rgba(44,24,16,0.05)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[rgba(44,24,16,0.02)] rounded-lg">
                      <User className="w-5 h-5 text-[#5C3D2E] flex-shrink-0" />
                    </div>
                    <span className="font-bold text-[#2C1810] text-sm sm:text-base">Edit Profile</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#5C3D2E]/60 flex-shrink-0" />
                </button>

                <button
                  onClick={() => navigate('/payment-methods')}
                  className="w-full flex items-center justify-between min-h-[56px] text-left hover:bg-[#FFF3E8]/50 rounded-2xl px-4 transition-colors border border-transparent hover:border-[rgba(44,24,16,0.05)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[rgba(44,24,16,0.02)] rounded-lg">
                      <CreditCard className="w-5 h-5 text-[#5C3D2E] flex-shrink-0" />
                    </div>
                    <span className="font-bold text-[#2C1810] text-sm sm:text-base">Payment Methods</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#5C3D2E]/60 flex-shrink-0" />
                </button>

                <div className="h-px bg-[rgba(44,24,16,0.05)] my-2 mx-4"></div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 min-h-[56px] text-left hover:bg-red-50 rounded-2xl px-4 transition-colors text-red-600 border border-transparent hover:border-red-100 group"
                >
                  <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                  </div>
                  <span className="font-bold text-sm sm:text-base">Sign Out</span>
                </button>

                <button className="w-full flex items-center gap-3 min-h-[56px] text-left hover:bg-red-50 rounded-2xl px-4 transition-colors text-red-600 border border-transparent hover:border-red-100 group">
                  <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                    <Trash2 className="w-5 h-5 flex-shrink-0" />
                  </div>
                  <span className="font-bold text-sm sm:text-base">Delete Account</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Settings