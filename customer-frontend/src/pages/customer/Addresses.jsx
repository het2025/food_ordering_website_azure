import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Plus,
  MapPin,
  Home as HomeIcon,
  Briefcase,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  Navigation,
  Loader
} from 'lucide-react'
import { useUser } from '../../context/UserContext'
import Header from '../../components/Header'
import { searchAddress, getCurrentLocation, getAddressFromCoords } from '../../services/locationService'

// --- 🍑 WARM PEACH THEME COLORS ---
// (Used via Tailwind arbitrary values in className)
// bgMain: '#FFF3E8'
// borderOrange: '#E85D04'
// accentAmber: '#F48C06'
// textDark: '#2C1810'
// textMuted: '#5C3D2E'

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
]

const Addresses = () => {
  const navigate = useNavigate()
  const { user, addresses = [], addAddress, updateAddress, deleteAddress } = useUser()

  const [showModal, setShowModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [formData, setFormData] = useState({
    type: 'home',
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    isDefault: false
  })
  const [errors, setErrors] = useState({})
  const [filteredStates, setFilteredStates] = useState([])
  const [showStateDropdown, setShowStateDropdown] = useState(false)

  // Location service states
  const [addressSuggestions, setAddressSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [searchingAddress, setSearchingAddress] = useState(false)

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name === 'state') {
      setFormData(prev => ({ ...prev, [name]: value }))

      if (value.trim()) {
        const filtered = INDIAN_STATES.filter(state =>
          state.toLowerCase().includes(value.toLowerCase())
        )
        setFilteredStates(filtered)
        setShowStateDropdown(filtered.length > 0)
      } else {
        setFilteredStates([])
        setShowStateDropdown(false)
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Handle address search with OpenStreetMap
  const handleAddressSearch = async (value) => {
    setFormData(prev => ({ ...prev, street: value }))

    if (value.length > 2) {
      setSearchingAddress(true)
      const suggestions = await searchAddress(value)
      setAddressSuggestions(suggestions)
      setShowSuggestions(suggestions.length > 0)
      setSearchingAddress(false)
    } else {
      setShowSuggestions(false)
      setAddressSuggestions([])
    }
  }

  // Select suggestion from OpenStreetMap
  const handleSelectSuggestion = (suggestion) => {
    setFormData(prev => ({
      ...prev,
      street: suggestion.detailedStreet || suggestion.placeAddress.split(',')[0],
      city: suggestion.city || 'Vadodara',
      state: suggestion.state || 'Gujarat',
      pincode: suggestion.pincode || '',
      landmark: suggestion.suburb || suggestion.neighbourhood || ''
    }))
    setShowSuggestions(false)
    setAddressSuggestions([])
  }

  // Detect user's current location
  const handleDetectLocation = async () => {
    setLoadingLocation(true);

    try {
      // Step 1: Get GPS coordinates
      const coords = await getCurrentLocation();
      console.log('GPS coords:', coords);

      // Step 2: Get address from backend
      const address = await getAddressFromCoords(coords.lat, coords.lng);
      console.log('Address data:', address);

      if (address && address.street) {
        // SUCCESS: Auto-fill the form
        setFormData(prev => ({
          ...prev,
          street: address.street,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          landmark: address.landmark || ''
        }));

        alert('✅ Location detected and address filled automatically!');
      } else {
        // FAILED: Manual entry
        alert('⚠️ Location detected but address not available. Please enter manually.');
        setFormData(prev => ({
          ...prev,
          city: 'Vadodara',
          state: 'Gujarat'
        }));
      }
    } catch (error) {
      console.error('Location error:', error);
      alert('❌ ' + error.message);
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleStateSelect = (state) => {
    setFormData(prev => ({ ...prev, state }))
    setShowStateDropdown(false)
    setFilteredStates([])
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.street.trim()) newErrors.street = 'Street address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state.trim()) newErrors.state = 'State is required'
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required'
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Enter valid 6-digit pincode'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      if (editingAddress !== null) {
        const addressId = addresses[editingAddress]._id
        await updateAddress(addressId, formData)
      } else {
        await addAddress(formData)
      }
      handleCloseModal()
    } catch (error) {
      alert('Failed to save address. Please try again.')
    }
  }

  const handleEdit = (address, index) => {
    setEditingAddress(index)
    setFormData(address)
    setShowModal(true)
  }

  const handleDelete = async (address) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteAddress(address._id)
      } catch (error) {
        alert('Failed to delete address')
      }
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingAddress(null)
    setFormData({
      type: 'home',
      street: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
      isDefault: false
    })
    setErrors({})
    setFilteredStates([])
    setShowStateDropdown(false)
    setAddressSuggestions([])
    setShowSuggestions(false)
  }

  const getAddressIcon = (type) => {
    switch (type) {
      case 'home': return <HomeIcon className="w-5 h-5" />
      case 'work': return <Briefcase className="w-5 h-5" />
      default: return <MapPin className="w-5 h-5" />
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF3E8] font-['Inter',_sans-serif]">
      <Header />

      <div className="pt-16 pb-8 sm:pt-20">
        <div className="max-w-4xl px-3 mx-auto sm:px-4 md:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center py-1 mb-4 text-[#5C3D2E] font-semibold transition-colors sm:mb-6 hover:text-[#2C1810] touch-manipulation"
          >
            <ArrowLeft className="w-4 h-4 mr-2 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Back</span>
          </button>

          <div className="flex flex-col gap-3 mb-6 sm:mb-8 sm:flex-row sm:justify-between sm:items-center">
            <h1 className="text-xl font-extrabold text-[#2C1810] sm:text-2xl md:text-3xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Delivery Addresses</h1>
            <button
              onClick={() => setShowModal(true)}
              className="flex gap-2 items-center justify-center px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#E85D04] to-[#F48C06] rounded-xl shadow-md transition-transform hover:scale-105 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Add New Address
            </button>
          </div>

          {/* Address List */}
          {addresses && addresses.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              <AnimatePresence>
                {addresses.map((address, index) => (
                  <motion.div
                    key={address._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-white border border-[rgba(44,24,16,0.05)] shadow-[0_8px_30px_rgba(44,24,16,0.04)] sm:p-6 rounded-3xl"
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex-shrink-0 p-2 text-[#E85D04] bg-[#FFF3E8] rounded-xl sm:p-3 shadow-sm">
                        {getAddressIcon(address.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex gap-2 items-start sm:items-center mb-1.5 sm:mb-2 justify-between">
                          <div className="flex flex-wrap items-center min-w-0 gap-2">
                            <h3 className="text-base font-bold text-[#2C1810] capitalize sm:text-lg">
                              {address.type}
                            </h3>
                            {address.isDefault && (
                              <span className="flex gap-1 items-center px-2 py-0.5 text-xs font-bold text-green-700 bg-green-50 border border-green-200 rounded-full whitespace-nowrap">
                                <CheckCircle className="w-3 h-3" />
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex flex-shrink-0 gap-1 sm:gap-2">
                            <button
                              onClick={() => handleEdit(address, index)}
                              className="p-2 text-[#E85D04] transition-colors rounded-xl hover:bg-[#E85D04]/10 active:bg-[#E85D04]/20 touch-manipulation"
                              style={{ minWidth: 40, minHeight: 40 }}
                            >
                              <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(address)}
                              className="p-2 text-red-500 transition-colors rounded-xl hover:bg-red-50 active:bg-red-100 touch-manipulation"
                              style={{ minWidth: 40, minHeight: 40 }}
                            >
                              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-sm font-medium text-[#5C3D2E] sm:text-base line-clamp-2">{address.street}</p>
                        <p className="text-sm font-medium text-[#5C3D2E]/80 mt-0.5">
                          {address.city}, {address.state} - {address.pincode}
                        </p>
                        {address.landmark && (
                          <p className="mt-1 text-xs font-semibold text-[#5C3D2E]/60 sm:text-sm line-clamp-1">
                            Landmark: {address.landmark}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="py-12 text-center bg-white rounded-3xl border border-[rgba(44,24,16,0.05)] shadow-[0_8px_30px_rgba(44,24,16,0.04)] sm:py-16">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-[#E85D04]/30 sm:mb-6 sm:w-24 sm:h-24" />
              <h2 className="mb-3 text-xl font-extrabold text-[#2C1810] sm:mb-4 sm:text-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>No addresses added yet</h2>
              <p className="mb-6 text-sm font-medium text-[#5C3D2E] sm:mb-8 sm:text-base">Add your first delivery address to start ordering</p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex gap-2 items-center px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-bold text-white bg-gradient-to-r from-[#E85D04] to-[#F48C06] rounded-xl shadow-lg transition-transform hover:scale-105"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Add Address
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Address Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-end p-0 bg-black/60 backdrop-blur-sm sm:justify-center sm:items-center sm:p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="bg-white w-full sm:rounded-3xl sm:max-w-2xl sm:w-full rounded-t-3xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl border border-[rgba(44,24,16,0.05)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal drag handle on mobile */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-12 h-1.5 bg-[#FFF3E8] rounded-full"></div>
              </div>

              <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white border-b border-[rgba(44,24,16,0.05)] sm:px-6 sm:py-4">
                <h2 className="text-lg font-extrabold text-[#2C1810] sm:text-xl md:text-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {editingAddress !== null ? 'Edit Address' : 'Add New Address'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 transition-colors rounded-xl hover:bg-[#FFF3E8] active:bg-[#FFF3E8]/80 text-[#5C3D2E]"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-4 py-4 space-y-5 sm:px-6 sm:py-6">
                {/* Detect Location Button */}
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={loadingLocation}
                  className="flex items-center justify-center w-full gap-2 px-4 py-3 text-sm font-bold text-[#E85D04] transition-colors bg-[#E85D04]/10 border border-[#E85D04]/20 rounded-xl sm:text-base hover:bg-[#E85D04]/20 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                >
                  {loadingLocation ? (
                    <>
                      <Loader className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      Detecting Location...
                    </>
                  ) : (
                    <>
                      <Navigation className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
                      Detect My Current Location
                    </>
                  )}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[rgba(44,24,16,0.1)]"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 font-bold text-[#5C3D2E]/60 bg-white">OR ENTER MANUALLY</span>
                  </div>
                </div>

                {/* Address Type */}
                <div>
                  <label className="block mb-2 text-sm font-bold text-[#2C1810] sm:mb-3">
                    Address Type
                  </label>
                  <div className="flex gap-2">
                    {['home', 'work', 'other'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, type }))}
                        className={`flex-1 py-2.5 sm:py-3 px-1 border-2 rounded-xl capitalize text-xs sm:text-sm font-bold transition-all touch-manipulation ${formData.type === type
                            ? 'border-[#E85D04] bg-[#E85D04]/10 text-[#E85D04]'
                            : 'border-[rgba(44,24,16,0.1)] bg-[#FFF3E8]/30 hover:border-[#E85D04]/50 text-[#5C3D2E]'
                          }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Street Address with Autocomplete */}
                <div className="relative">
                  <label className="block mb-1.5 sm:mb-2 text-sm font-bold text-[#2C1810]">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={(e) => handleAddressSearch(e.target.value)}
                    placeholder="Start typing your address..."
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base font-medium text-[#2C1810] bg-[#FFF3E8]/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E85D04] placeholder-[#5C3D2E]/50 ${errors.street ? 'border-red-500' : 'border-[rgba(44,24,16,0.1)]'
                      }`}
                  />
                  {searchingAddress && (
                    <div className="absolute right-3 top-9 sm:top-10">
                      <Loader className="w-4 h-4 text-[#E85D04] sm:w-5 sm:h-5 animate-spin" />
                    </div>
                  )}
                  {errors.street && (
                    <p className="mt-1 text-xs font-semibold text-red-500 sm:text-sm">{errors.street}</p>
                  )}

                  {/* Address Suggestions Dropdown */}
                  {showSuggestions && addressSuggestions.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 overflow-y-auto bg-white border border-[rgba(44,24,16,0.1)] rounded-xl shadow-xl max-h-48 sm:max-h-60">
                      {addressSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className="p-3 sm:p-4 border-b border-[rgba(44,24,16,0.05)] transition-colors cursor-pointer hover:bg-[#FFF3E8] last:border-b-0 active:bg-[#E85D04]/10"
                        >
                          <p className="text-sm font-bold text-[#2C1810]">{suggestion.placeName}</p>
                          <p className="text-xs font-medium text-[#5C3D2E] mt-0.5 line-clamp-1">{suggestion.placeAddress}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* City and State */}
                <div className="grid grid-cols-1 gap-4 sm:gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block mb-1.5 sm:mb-2 text-sm font-bold text-[#2C1810]">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base font-medium text-[#2C1810] bg-[#FFF3E8]/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E85D04] placeholder-[#5C3D2E]/50 ${errors.city ? 'border-red-500' : 'border-[rgba(44,24,16,0.1)]'
                        }`}
                    />
                    {errors.city && (
                      <p className="mt-1 text-xs font-semibold text-red-500 sm:text-sm">{errors.city}</p>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block mb-1.5 sm:mb-2 text-sm font-bold text-[#2C1810]">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      onFocus={() => {
                        if (formData.state) {
                          const filtered = INDIAN_STATES.filter(state =>
                            state.toLowerCase().includes(formData.state.toLowerCase())
                          )
                          setFilteredStates(filtered)
                          setShowStateDropdown(filtered.length > 0)
                        }
                      }}
                      placeholder="Type to search state"
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base font-medium text-[#2C1810] bg-[#FFF3E8]/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E85D04] placeholder-[#5C3D2E]/50 ${errors.state ? 'border-red-500' : 'border-[rgba(44,24,16,0.1)]'
                        }`}
                      autoComplete="off"
                    />
                    {errors.state && (
                      <p className="mt-1 text-xs font-semibold text-red-500 sm:text-sm">{errors.state}</p>
                    )}

                    {showStateDropdown && filteredStates.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 overflow-y-auto bg-white border border-[rgba(44,24,16,0.1)] rounded-xl shadow-xl max-h-48 sm:max-h-60">
                        {filteredStates.map((state, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleStateSelect(state)}
                            className="px-4 py-3 w-full text-sm font-bold text-[#5C3D2E] text-left transition-colors hover:bg-[#FFF3E8] hover:text-[#E85D04] active:bg-[#E85D04]/10"
                          >
                            {state}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Pincode */}
                <div>
                  <label className="block mb-1.5 sm:mb-2 text-sm font-bold text-[#2C1810]">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="6-digit pincode"
                    maxLength={6}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base font-medium text-[#2C1810] bg-[#FFF3E8]/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E85D04] placeholder-[#5C3D2E]/50 ${errors.pincode ? 'border-red-500' : 'border-[rgba(44,24,16,0.1)]'
                      }`}
                  />
                  {errors.pincode && (
                    <p className="mt-1 text-xs font-semibold text-red-500 sm:text-sm">{errors.pincode}</p>
                  )}
                </div>

                {/* Landmark */}
                <div>
                  <label className="block mb-1.5 sm:mb-2 text-sm font-bold text-[#2C1810]">
                    Landmark <span className="text-[#5C3D2E]/60 font-medium">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleInputChange}
                    placeholder="Nearby landmark for easy location"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base font-medium text-[#2C1810] bg-[#FFF3E8]/50 border border-[rgba(44,24,16,0.1)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E85D04] placeholder-[#5C3D2E]/50"
                  />
                </div>

                {/* Set as Default */}
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    name="isDefault"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                    className="flex-shrink-0 w-5 h-5 text-[#E85D04] bg-[#FFF3E8] border-[rgba(44,24,16,0.2)] rounded focus:ring-[#E85D04] cursor-pointer"
                  />
                  <label htmlFor="isDefault" className="text-sm font-bold text-[#2C1810] cursor-pointer select-none">
                    Set as default address
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 pb-2 border-t border-[rgba(44,24,16,0.05)]">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-3 sm:py-3.5 text-sm font-bold transition-colors bg-[rgba(44,24,16,0.05)] text-[#2C1810] rounded-xl sm:px-6 sm:text-base hover:bg-[rgba(44,24,16,0.1)] active:bg-[rgba(44,24,16,0.15)] touch-manipulation"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 sm:py-3.5 text-sm font-bold text-white transition-transform bg-gradient-to-r from-[#E85D04] to-[#F48C06] shadow-lg rounded-xl sm:px-6 sm:text-base hover:scale-105 active:scale-95 touch-manipulation"
                  >
                    {editingAddress !== null ? 'Update Address' : 'Save Address'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Addresses