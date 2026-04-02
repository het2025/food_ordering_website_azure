import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Package,
  Gift,
  Settings,
  Edit3,
  Save,
  Clock,
  CheckCircle,
  Loader,
  Store,
  Heart
} from 'lucide-react'
import { useUser } from '../../context/UserContext'
import { useCart } from '../../context/CartContext'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

// --- 🍑 WARM PEACH THEME (With Clean White Cards) ---
// bgMain: '#FFF3E8'
// borderOrange: '#E85D04'
// accentAmber: '#F48C06'
// textDark: '#2C1810'
// textMuted: '#5C3D2E'

import { API_BASE_URL } from '../../api/axiosInstance';

const ProfilePage = () => {
  const { user, updateProfile } = useUser()
  const { lastOrder } = useCart()
  const navigate = useNavigate()

  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Varun Patel',
    email: user?.email || 'varun@example.com',
    phone: user?.phone || '+91 98765 43210',
    joinDate: user?.joinDate || '2023-01-15'
  })

  // Fetch real order history from backend
  const [orderHistory, setOrderHistory] = useState([])
  const [totalOrders, setTotalOrders] = useState(0)

  // Fetch orders from backend
  useEffect(() => {
    fetchRecentOrders()
  }, [])

  const fetchRecentOrders = async () => {
    try {
      setOrdersLoading(true)

      const token = localStorage.getItem('token')

      if (!token) {
        navigate('/login')
        return
      }

      // Fetch all orders to get total count
      const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success && Array.isArray(data.data)) {
        const allOrders = data.data
        setTotalOrders(allOrders.length)

        // Get only the 3 most recent orders
        const recentOrders = allOrders
          .sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime))
          .slice(0, 3)

        setOrderHistory(recentOrders)
      } else {
        setOrderHistory([])
        setTotalOrders(0)
      }

    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrderHistory([])
      setTotalOrders(0)
    } finally {
      setOrdersLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      updateProfile(profileData)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800 border-green-200'
      case 'Out for Delivery': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Preparing': return 'bg-[#FFF3E8] text-[#E85D04] border-[#E85D04]/30'
      case 'Confirmed': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-[rgba(44,24,16,0.05)] text-[#2C1810] border-[rgba(44,24,16,0.1)]'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'Out for Delivery': return <Clock className="w-4 h-4 text-blue-600" />
      case 'Preparing': return <Clock className="w-4 h-4 text-[#E85D04]" />
      default: return <Package className="w-4 h-4 text-[#5C3D2E]" />
    }
  }

  // Calculate average rating from delivered orders
  const calculateAverageRating = () => {
    const ratedOrders = orderHistory.filter(order => order.rating)
    if (ratedOrders.length === 0) return 'N/A'
    const avgRating = ratedOrders.reduce((sum, order) => sum + order.rating, 0) / ratedOrders.length
    return avgRating.toFixed(1)
  }

  return (
    <div className="min-h-screen bg-[#FFF3E8] font-['Inter',_sans-serif]">
      <Header />

      <div className="pt-20 pb-16">
        <div className="px-4 mx-auto max-w-6xl sm:px-6 lg:px-8">

          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 sm:p-8 mb-6 sm:mb-8 text-white bg-gradient-to-r from-[#E85D04] to-[#F48C06] rounded-3xl shadow-[0_10px_40px_rgba(232,93,4,0.2)]"
          >
            <div className="flex flex-col gap-4 sm:gap-6 items-center md:flex-row">
              <div className="relative flex-shrink-0">
                <div className="flex justify-center items-center w-20 h-20 sm:w-24 sm:h-24 rounded-full backdrop-blur-sm bg-white/20 border-2 border-white/30 shadow-inner">
                  <User className="w-10 h-10 sm:w-12 sm:h-12 text-white drop-shadow-sm" />
                </div>
                <div className="flex absolute right-0 bottom-0 justify-center items-center w-7 h-7 sm:w-8 sm:h-8 bg-green-500 rounded-full border-4 border-white shadow-sm">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>

              <div className="flex-1 text-center md:text-left min-w-0">
                <h1 className="mb-1 sm:mb-2 text-2xl sm:text-4xl font-extrabold truncate drop-shadow-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{profileData.name}</h1>
                <p className="mb-2 sm:mb-3 text-[#FFF3E8]/90 font-medium text-sm sm:text-base truncate">{profileData.email}</p>
                <div className="flex gap-1.5 sm:gap-2 justify-center items-center text-white/90 md:justify-start text-xs sm:text-sm font-semibold">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>Member since {new Date(profileData.joinDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center w-full md:w-auto mt-4 md:mt-0 p-4 md:p-0 bg-white/10 md:bg-transparent rounded-2xl md:rounded-none backdrop-blur-sm md:backdrop-blur-none">
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold drop-shadow-sm">{totalOrders}</div>
                  <div className="text-xs sm:text-sm font-medium text-white/80">Orders</div>
                </div>
                <div className="w-px h-full bg-white/20 mx-auto"></div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold flex items-center justify-center gap-1 drop-shadow-sm">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                    {calculateAverageRating()}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-white/80">Rating</div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 lg:gap-8 lg:grid-cols-3">

            {/* Left Column: Profile Info & Quick Actions */}
            <div className="lg:col-span-1 space-y-6 lg:space-y-8">

              {/* Profile Information */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="p-5 sm:p-6 bg-white rounded-3xl shadow-[0_8px_30px_rgba(44,24,16,0.04)] border border-[rgba(44,24,16,0.05)]"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-extrabold text-[#2C1810]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Profile Info</h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex gap-1.5 items-center text-[#E85D04] hover:text-[#C1440E] font-bold text-sm transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block mb-1.5 text-xs font-bold text-[#5C3D2E] uppercase tracking-wider">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        className="px-4 py-3 w-full rounded-xl bg-[#FFF3E8]/50 border border-[rgba(44,24,16,0.1)] focus:outline-none focus:ring-2 focus:ring-[#E85D04] text-[#2C1810] font-semibold transition-all"
                      />
                    ) : (
                      <div className="flex gap-3 items-center text-[#2C1810] font-bold">
                        <User className="w-5 h-5 text-[#E85D04]" />
                        <span>{profileData.name}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1.5 text-xs font-bold text-[#5C3D2E] uppercase tracking-wider">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="px-4 py-3 w-full rounded-xl bg-[#FFF3E8]/50 border border-[rgba(44,24,16,0.1)] focus:outline-none focus:ring-2 focus:ring-[#E85D04] text-[#2C1810] font-semibold transition-all"
                      />
                    ) : (
                      <div className="flex gap-3 items-center text-[#5C3D2E] font-medium">
                        <Mail className="w-5 h-5 text-[#E85D04]" />
                        <span>{profileData.email}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1.5 text-xs font-bold text-[#5C3D2E] uppercase tracking-wider">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        className="px-4 py-3 w-full rounded-xl bg-[#FFF3E8]/50 border border-[rgba(44,24,16,0.1)] focus:outline-none focus:ring-2 focus:ring-[#E85D04] text-[#2C1810] font-semibold transition-all"
                      />
                    ) : (
                      <div className="flex gap-3 items-center text-[#5C3D2E] font-medium">
                        <Phone className="w-5 h-5 text-[#E85D04]" />
                        <span>{profileData.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="flex gap-2 justify-center items-center py-3 mt-6 w-full font-bold text-white bg-gradient-to-r from-[#E85D04] to-[#F48C06] rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-lg disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-b-white animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                )}
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="p-5 sm:p-6 bg-white rounded-3xl shadow-[0_8px_30px_rgba(44,24,16,0.04)] border border-[rgba(44,24,16,0.05)]"
              >
                <h3 className="mb-4 text-xl font-extrabold text-[#2C1810]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/addresses')}
                    className="flex gap-3 items-center p-3.5 w-full text-left rounded-xl transition-colors hover:bg-[#FFF3E8]/50 border border-transparent hover:border-[#E85D04]/20 group"
                  >
                    <div className="p-2 bg-[#FFF3E8] rounded-lg group-hover:bg-[#E85D04] transition-colors">
                      <MapPin className="w-5 h-5 text-[#E85D04] group-hover:text-white transition-colors" />
                    </div>
                    <span className="font-bold text-[#2C1810]">Manage Addresses</span>
                  </button>
                  <button
                    onClick={() => navigate('/settings')}
                    className="flex gap-3 items-center p-3.5 w-full text-left rounded-xl transition-colors hover:bg-[#FFF3E8]/50 border border-transparent hover:border-[#E85D04]/20 group"
                  >
                    <div className="p-2 bg-[#FFF3E8] rounded-lg group-hover:bg-[#E85D04] transition-colors">
                      <Settings className="w-5 h-5 text-[#E85D04] group-hover:text-white transition-colors" />
                    </div>
                    <span className="font-bold text-[#2C1810]">Account Settings</span>
                  </button>
                  <button
                    onClick={() => navigate('/favorites')}
                    className="flex gap-3 items-center p-3.5 w-full text-left rounded-xl transition-colors hover:bg-[#FFF3E8]/50 border border-transparent hover:border-[#E85D04]/20 group"
                  >
                    <div className="p-2 bg-[#FFF3E8] rounded-lg group-hover:bg-[#E85D04] transition-colors">
                      <Heart className="w-5 h-5 text-[#E85D04] group-hover:text-white transition-colors" />
                    </div>
                    <span className="font-bold text-[#2C1810]">Favorite Dishes</span>
                  </button>
                  <button
                    onClick={() => navigate('/rewards')}
                    className="flex gap-3 items-center p-3.5 w-full text-left rounded-xl transition-colors hover:bg-[#FFF3E8]/50 border border-transparent hover:border-[#E85D04]/20 group"
                  >
                    <div className="p-2 bg-[#FFF3E8] rounded-lg group-hover:bg-[#E85D04] transition-colors">
                      <Gift className="w-5 h-5 text-[#E85D04] group-hover:text-white transition-colors" />
                    </div>
                    <span className="font-bold text-[#2C1810]">Rewards & Offers</span>
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Order History */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="p-5 sm:p-6 bg-white rounded-3xl shadow-[0_8px_30px_rgba(44,24,16,0.04)] border border-[rgba(44,24,16,0.05)] h-full"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-extrabold text-[#2C1810]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Recent Orders</h2>
                  {totalOrders > 3 && (
                    <button
                      onClick={() => navigate('/orders')}
                      className="font-bold text-[#E85D04] hover:text-[#C1440E] transition-colors bg-[#FFF3E8] px-4 py-1.5 rounded-lg text-sm border border-[#E85D04]/20"
                    >
                      View All ({totalOrders})
                    </button>
                  )}
                </div>

                {ordersLoading ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader className="w-10 h-10 text-[#E85D04] animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orderHistory.map((order, index) => (
                      <motion.div
                        key={order._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="p-4 rounded-2xl border border-[rgba(44,24,16,0.05)] transition-shadow hover:shadow-[0_10px_20px_rgba(44,24,16,0.04)] hover:border-[#E85D04]/20 bg-[#FFF3E8]/30"
                      >
                        <div className="flex justify-between items-start mb-4 gap-2">
                          <div className="flex gap-3 sm:gap-4 items-center flex-1 min-w-0">
                            <div className="flex justify-center items-center w-12 h-12 sm:w-14 sm:h-14 bg-white border border-[#E85D04]/10 shadow-sm rounded-xl flex-shrink-0">
                              <Store className="w-6 h-6 sm:w-7 sm:h-7 text-[#E85D04]" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-extrabold text-[#2C1810] text-sm sm:text-base truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{order.restaurantName}</h3>
                              <p className="text-xs sm:text-sm font-medium text-[#5C3D2E]/80">Order #{order.orderId}</p>
                            </div>
                          </div>
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm shrink-0 ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span>{order.status}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap justify-between items-center text-xs sm:text-sm text-[#5C3D2E] gap-y-2 mb-4 bg-white p-3 rounded-xl border border-[rgba(44,24,16,0.05)]">
                          <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
                            <span className="font-semibold">{order.items?.length || 0} items</span>
                            <span className="w-1 h-1 bg-[#5C3D2E]/30 rounded-full"></span>
                            <span className="font-extrabold text-[#2C1810]">₹{order.total}</span>
                            <span className="w-1 h-1 bg-[#5C3D2E]/30 rounded-full"></span>
                            <span className="font-medium">{new Date(order.orderTime).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}</span>
                          </div>
                          {order.rating && (
                            <div className="flex gap-1 items-center bg-[#FFF3E8] px-2 py-1 rounded-md border border-[#F48C06]/20">
                              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-[#F48C06] fill-current" />
                              <span className="font-extrabold text-[#2C1810]">{order.rating}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => navigate(`/order/${order._id}`)}
                            className="flex-1 px-4 py-2.5 font-bold text-[#2C1810] bg-white border border-[rgba(44,24,16,0.1)] rounded-xl transition-colors hover:bg-[#FFF3E8] text-xs sm:text-sm shadow-sm"
                          >
                            View Details
                          </button>
                          {order.restaurant && (
                            <button
                              onClick={() => navigate(`/restaurant/${order.restaurant}`)}
                              className="flex-1 px-4 py-2.5 font-bold text-white bg-gradient-to-r from-[#E85D04] to-[#F48C06] rounded-xl transition-all hover:scale-105 text-xs sm:text-sm shadow-md"
                            >
                              Reorder
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {!ordersLoading && orderHistory.length === 0 && (
                  <div className="py-16 text-center bg-[#FFF3E8]/50 rounded-2xl border border-[rgba(44,24,16,0.05)]">
                    <Package className="mx-auto mb-4 w-16 h-16 text-[#E85D04]/30" />
                    <h3 className="mb-2 text-lg font-extrabold text-[#2C1810]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>No orders yet</h3>
                    <p className="mb-6 font-medium text-[#5C3D2E]">Start ordering to see your history here</p>
                    <button
                      onClick={() => navigate('/home')}
                      className="px-8 py-3 font-bold text-white bg-gradient-to-r from-[#E85D04] to-[#F48C06] rounded-xl transition-transform hover:scale-105 shadow-lg"
                    >
                      Browse Restaurants
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default ProfilePage