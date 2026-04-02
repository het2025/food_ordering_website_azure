import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  Star,
  Clock,
  MapPin,
  Heart,
  SlidersHorizontal,
  X,
  Loader,
  ChevronDown,
  Check,
  ArrowUpDown
} from 'lucide-react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { restaurantService } from '../../services/api'
import RestaurantCard from '../../components/RestaurantCard'

// --- 🍑 WARM PEACH & DEEP WARM DARK THEME COLORS ---
// (Used via Tailwind arbitrary values in className)
// bgMain: '#FFF3E8'
// bgCard: '#1C1410'
// borderOrange: '#E85D04'
// accentAmber: '#F48C06'
// textOnMain: '#2C1810'
// textMutedOnMain: '#5C3D2E'

const Restaurants = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')

  const [sortBy, setSortBy] = useState('popular')
  const [showFilters, setShowFilters] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Applied filters (what's actually being used)
  const [appliedFilters, setAppliedFilters] = useState({
    priceRange: 'all',
    minRating: 0,
    maxDeliveryTime: 60,
    cuisines: [],
    deliveryFee: 'all',
    offers: false,
    features: [],
    distance: 10
  })

  // Temporary filters (what user is selecting)
  const [tempFilters, setTempFilters] = useState({
    priceRange: 'all',
    minRating: 0,
    maxDeliveryTime: 60,
    cuisines: [],
    deliveryFee: 'all',
    offers: false,
    features: [],
    distance: 10
  })

  // Dynamic data states
  const [restaurants, setRestaurants] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRestaurants, setTotalRestaurants] = useState(0)
  const [availableCuisines, setAvailableCuisines] = useState([])
  const [availableFeatures] = useState([
    'Free Delivery', 'Fast Delivery', 'Promoted', 'New', 'Discount Available'
  ])

  const sortOptions = [
    { value: 'popular', label: 'Most Popular', icon: '🔥' },
    { value: 'rating', label: 'Highest Rated', icon: '⭐' },
    { value: 'deliveryTime', label: 'Fastest Delivery', icon: '🚀' },
    { value: 'newest', label: 'Newest First', icon: '✨' },
    { value: 'priceLowToHigh', label: 'Price: Low to High', icon: '💰' },
    { value: 'priceHighToLow', label: 'Price: High to Low', icon: '💎' }
  ]

  // Load restaurants and cuisines
  useEffect(() => {
    loadRestaurants()
    loadCuisines()
  }, [currentPage, sortBy, appliedFilters])

  // Sync available search query from URL to state
  useEffect(() => {
    const query = searchParams.get('search');
    if (query !== null && query !== searchQuery) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  const loadCuisines = async () => {
    try {
      const response = await restaurantService.getCuisines()
      if (response.success) {
        setAvailableCuisines(response.data)
      }
    } catch (error) {
      console.error('Error loading cuisines:', error)
    }
  }

  const loadRestaurants = async () => {
    try {
      setLoading(true)
      setError('')

      const params = {
        page: currentPage,
        limit: 20,
        sortBy: sortBy
      };

      // Add search query
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      // --- Add all applied filters to the params object ---

      // Price Range
      if (appliedFilters.priceRange !== 'all') {
        if (appliedFilters.priceRange === 'budget') params.priceRange = '₹';
        if (appliedFilters.priceRange === 'mid') params.priceRange = '₹₹';
        if (appliedFilters.priceRange === 'premium') params.priceRange = '₹₹₹';
      }

      // Minimum Rating
      if (appliedFilters.minRating > 0) {
        params.minRating = appliedFilters.minRating;
      }

      // Max Delivery Time
      if (appliedFilters.maxDeliveryTime < 60) {
        params.maxDeliveryTime = appliedFilters.maxDeliveryTime;
      }

      // Cuisines
      if (appliedFilters.cuisines.length > 0) {
        params.cuisines = appliedFilters.cuisines.join(',');
      }

      // Features
      if (appliedFilters.features.length > 0) {
        params.features = appliedFilters.features.join(',');
      }

      // Delivery Fee
      if (appliedFilters.deliveryFee !== 'all') {
        params.deliveryFee = appliedFilters.deliveryFee;
      }

      // Offers
      if (appliedFilters.offers) {
        params.offers = appliedFilters.offers;
      }

      const response = await restaurantService.getRestaurants(params)

      if (response.success) {
        setRestaurants(response.data)
        setTotalPages(response.totalPages)
        setTotalRestaurants(response.total)
      } else {
        setError('Failed to load restaurants')
      }
    } catch (error) {
      console.error('Error loading restaurants:', error)
      setError('Failed to load restaurants. Please check your backend server.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    loadRestaurants()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const toggleFavorite = (restaurantId) => {
    setFavorites(prev =>
      prev.includes(restaurantId)
        ? prev.filter(id => id !== restaurantId)
        : [...prev, restaurantId]
    )
  }

  // Apply filters function
  const applyFilters = () => {
    setAppliedFilters({ ...tempFilters })
    setCurrentPage(1)
    setShowFilters(false)
  }

  // Reset filters
  const resetFilters = () => {
    const defaultFilters = {
      priceRange: 'all',
      minRating: 0,
      maxDeliveryTime: 60,
      cuisines: [],
      deliveryFee: 'all',
      offers: false,
      features: [],
      distance: 10
    }
    setTempFilters(defaultFilters)
    setAppliedFilters(defaultFilters)
    setCurrentPage(1)
  }

  const clearAllFilters = () => {
    setSearchQuery('')
    resetFilters()
    setSortBy('popular')
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0
    if (appliedFilters.priceRange !== 'all') count++
    if (appliedFilters.minRating > 0) count++
    if (appliedFilters.maxDeliveryTime < 60) count++
    if (appliedFilters.cuisines.length > 0) count++
    if (appliedFilters.deliveryFee !== 'all') count++
    if (appliedFilters.offers) count++
    if (appliedFilters.features.length > 0) count++
    if (appliedFilters.distance < 10) count++
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  // Toggle cuisine selection
  const toggleCuisine = (cuisine) => {
    setTempFilters(prev => ({
      ...prev,
      cuisines: prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter(c => c !== cuisine)
        : [...prev.cuisines, cuisine]
    }))
  }

  // Toggle feature selection
  const toggleFeature = (feature) => {
    setTempFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  // Render pagination buttons
  const renderPagination = () => {
    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 text-sm transition-colors bg-[#FFF3E8] border border-[rgba(44,24,16,0.15)] rounded-lg sm:px-4 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white text-[#2C1810]"
      >
        Prev
      </button>
    )

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm rounded-lg transition-colors font-bold ${currentPage === i
            ? 'bg-gradient-to-r from-[#E85D04] to-[#F48C06] text-[#FFE8D6] shadow-md border-none'
            : 'bg-[#FFF3E8] border border-[rgba(44,24,16,0.15)] text-[#2C1810] hover:border-[#E85D04] hover:text-[#E85D04]'
            }`}
        >
          {i}
        </button>
      )
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-sm transition-colors bg-[#FFF3E8] border border-[rgba(44,24,16,0.15)] rounded-lg sm:px-4 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white text-[#2C1810]"
      >
        Next
      </button>
    )

    return pages
  }

  if (loading && restaurants.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFF3E8]">
        <Header />
        <div className="pt-20 flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <Loader className="w-16 h-16 mx-auto mb-4 text-[#E85D04] animate-spin" />
            <p className="text-[#5C3D2E] font-medium">Loading restaurants...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF3E8] font-['Inter',_sans-serif]">
      <Header />

      <div className="pt-20">
        {/* Hero Section */}
        <div className="py-10 text-[#FFE8D6] md:py-16 bg-gradient-to-r from-[#E85D04] to-[#F48C06] shadow-[0_10px_30px_rgba(232,93,4,0.2)]">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:max-w-2xl"
            >
              <h1 className="mb-3 text-2xl font-extrabold sm:text-3xl md:text-4xl lg:text-5xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Discover Amazing Restaurants
              </h1>

              <p className="mb-6 text-base opacity-90 sm:text-lg md:text-xl md:mb-8 font-medium text-[#FFE8D6]/90">
                Find your favorite cuisines delivered fast to your doorstep
              </p>

              {/* Search Bar */}
              <div className="relative">
                <Search
                  className="absolute w-5 h-5 text-[#5C3D2E]/60 -translate-y-1/2 left-4 top-1/2"
                />
                <input
                  type="text"
                  placeholder="Search restaurants, cuisines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full py-4 pl-12 pr-24 text-[#2C1810] placeholder-[#5C3D2E]/60 bg-[#FFF3E8] rounded-2xl focus:outline-none focus:ring-4 focus:ring-white/30 text-sm sm:text-base font-medium shadow-inner"
                />
                <button
                  onClick={handleSearch}
                  className="absolute px-4 py-2 text-sm text-[#FFE8D6] font-bold transition-colors -translate-y-1/2 bg-[#1C1410] right-2 top-1/2 rounded-xl hover:bg-[#2C1810] sm:px-6"
                >
                  Search
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Error Message */}
          {error && (
            <div className="px-4 py-3 mb-6 text-[#E85D04] border border-[#E85D04]/30 rounded-lg bg-[#E85D04]/10 font-medium">
              {error}
              <button
                onClick={loadRestaurants}
                className="ml-4 underline hover:text-[#C1440E]"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Filters and Sort Section */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            {/* Left side - Filters */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3 transition-colors bg-[#FFF3E8] border border-[rgba(44,24,16,0.15)] shadow-sm rounded-xl hover:border-[#E85D04] hover:bg-white"
              >
                <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5 text-[#5C3D2E]" />
                <span className="text-sm font-bold text-[#2C1810] sm:text-base">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold text-[#FFE8D6] bg-[#E85D04] rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm font-bold text-[#E85D04] hover:text-[#C1440E] transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Right side - Sort */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 bg-[#FFF3E8] border border-[rgba(44,24,16,0.15)] rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 hover:border-[#E85D04] hover:bg-white transition-colors shadow-sm"
              >
                <ArrowUpDown className="flex-shrink-0 w-4 h-4 text-[#5C3D2E] sm:w-5 sm:h-5" />
                <span className="text-sm font-bold text-left text-[#2C1810] sm:text-base">
                  {sortOptions.find(opt => opt.value === sortBy)?.label}
                </span>
                <ChevronDown className={`flex-shrink-0 w-4 h-4 text-[#5C3D2E] transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Sort Dropdown */}
              <AnimatePresence>
                {showSortDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 z-20 mt-2 overflow-hidden bg-[#FFF3E8] border border-[rgba(44,24,16,0.15)] shadow-xl w-52 sm:w-64 top-full rounded-xl"
                  >
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value)
                          setCurrentPage(1)
                          setShowSortDropdown(false)
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-[#E85D04]/10 transition-colors flex items-center gap-3 ${sortBy === option.value ? 'bg-[#E85D04]/10 text-[#E85D04] font-bold' : 'text-[#2C1810] font-medium'
                          }`}
                      >
                        <span className="text-lg">{option.icon}</span>
                        <span className="text-sm sm:text-base">{option.label}</span>
                        {sortBy === option.value && (
                          <Check className="w-4 h-4 ml-auto text-[#E85D04]" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Results Header */}
          <div className="mb-6">
            {searchQuery && (
              <p className="mt-1 font-medium text-[#5C3D2E]">
                Results for "<span className="font-bold text-[#2C1810]">{searchQuery}</span>"
              </p>
            )}
          </div>

          {/* Restaurant Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="bg-[#1C1410] shadow-xl rounded-3xl animate-pulse overflow-hidden">
                  <div className="h-48 bg-[#2C1810]"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-[#3D2A20] rounded w-1/2"></div>
                    <div className="w-3/4 h-4 bg-[#3D2A20] rounded"></div>
                    <div className="flex justify-between">
                      <div className="w-1/4 h-3 bg-[#3D2A20] rounded"></div>
                      <div className="w-1/4 h-3 bg-[#3D2A20] rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center"
            >
              <div className="mb-4 text-6xl">🔍</div>
              <h3 className="mb-2 text-2xl font-bold text-[#2C1810]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>No restaurants found</h3>
              <p className="mb-6 text-[#5C3D2E] font-medium">
                Try adjusting your filters or search terms
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-3 font-bold text-[#FFE8D6] transition-colors bg-[#E85D04] rounded-lg hover:bg-[#C1440E] shadow-lg"
              >
                Clear Filters
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence>
                {restaurants.map((restaurant, index) => (
                  <RestaurantCard restaurant={restaurant} index={index} key={restaurant._id} />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-10">
              <div className="flex flex-wrap items-center justify-center gap-2">
                {renderPagination()}
              </div>
            </div>
          )}

          {/* Pagination Info */}
          {totalPages > 1 && (
            <div className="px-2 mt-3 text-sm font-medium text-center text-[#5C3D2E]">
              Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalRestaurants)} of {totalRestaurants} restaurants
            </div>
          )}
        </div>
      </div>

      {/* Smart Filter Overlay */}
      <AnimatePresence>
        {showFilters && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowFilters(false)}
            />

            {/* Filter Panel */}
            <motion.div
              initial={{ x: -400 }}
              animate={{ x: 0 }}
              exit={{ x: -400 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 h-full overflow-y-auto bg-[#FFF3E8] shadow-2xl w-full sm:w-96"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-extrabold text-[#2C1810]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 transition-colors rounded-lg hover:bg-[rgba(44,24,16,0.05)]"
                  >
                    <X className="w-5 h-5 text-[#5C3D2E]" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Price Range */}
                  <div>
                    <label className="block mb-3 text-sm font-bold text-[#2C1810]">
                      Price Range
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'all', label: 'All Prices' },
                        { value: 'budget', label: 'Budget (₹) - Under ₹200' },
                        { value: 'mid', label: 'Mid-range (₹₹) - ₹200-₹500' },
                        { value: 'premium', label: 'Premium (₹₹₹) - Above ₹500' }
                      ].map((option) => (
                        <label key={option.value} className="flex items-center space-x-3 cursor-pointer group">
                          <input
                            type="radio"
                            value={option.value}
                            checked={tempFilters.priceRange === option.value}
                            onChange={(e) => setTempFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                            className="w-4 h-4 text-[#E85D04] bg-[#FFF3E8] border-[rgba(44,24,16,0.3)] focus:ring-[#E85D04]"
                          />
                          <span className="text-sm font-medium text-[#5C3D2E] group-hover:text-[#2C1810] transition-colors">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block mb-3 text-sm font-bold text-[#2C1810]">
                      Minimum Rating: {tempFilters.minRating}+ ⭐
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.5"
                      value={tempFilters.minRating}
                      onChange={(e) => setTempFilters(prev => ({ ...prev, minRating: Number(e.target.value) }))}
                      className="w-full h-2 bg-[#5C3D2E]/20 rounded-lg appearance-none cursor-pointer accent-[#E85D04]"
                    />
                    <div className="flex justify-between mt-1 text-xs font-semibold text-[#5C3D2E]">
                      <span>Any</span>
                      <span>5 stars</span>
                    </div>
                  </div>

                  {/* Delivery Time */}
                  <div>
                    <label className="block mb-3 text-sm font-bold text-[#2C1810]">
                      Max Delivery Time: {tempFilters.maxDeliveryTime} mins
                    </label>
                    <input
                      type="range"
                      min="15"
                      max="60"
                      step="5"
                      value={tempFilters.maxDeliveryTime}
                      onChange={(e) => setTempFilters(prev => ({ ...prev, maxDeliveryTime: Number(e.target.value) }))}
                      className="w-full h-2 bg-[#5C3D2E]/20 rounded-lg appearance-none cursor-pointer accent-[#E85D04]"
                    />
                    <div className="flex justify-between mt-1 text-xs font-semibold text-[#5C3D2E]">
                      <span>15 min</span>
                      <span>60 min</span>
                    </div>
                  </div>

                  {/* Cuisines */}
                  <div>
                    <label className="block mb-3 text-sm font-bold text-[#2C1810]">
                      Cuisines
                    </label>
                    <div className="space-y-2 overflow-y-auto max-h-40 pr-2 custom-scrollbar">
                      {availableCuisines.map((cuisine) => (
                        <label key={cuisine} className="flex items-center space-x-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={tempFilters.cuisines.includes(cuisine)}
                            onChange={() => toggleCuisine(cuisine)}
                            className="w-4 h-4 text-[#E85D04] bg-[#FFF3E8] border-[rgba(44,24,16,0.3)] rounded focus:ring-[#E85D04]"
                          />
                          <span className="text-sm font-medium text-[#5C3D2E] group-hover:text-[#2C1810] transition-colors">{cuisine}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Fee */}
                  <div>
                    <label className="block mb-3 text-sm font-bold text-[#2C1810]">
                      Delivery Fee
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'all', label: 'Any delivery fee' },
                        { value: 'free', label: 'Free delivery only' },
                        { value: 'low', label: 'Under ₹50' }
                      ].map((option) => (
                        <label key={option.value} className="flex items-center space-x-3 cursor-pointer group">
                          <input
                            type="radio"
                            value={option.value}
                            checked={tempFilters.deliveryFee === option.value}
                            onChange={(e) => setTempFilters(prev => ({ ...prev, deliveryFee: e.target.value }))}
                            className="w-4 h-4 text-[#E85D04] bg-[#FFF3E8] border-[rgba(44,24,16,0.3)] focus:ring-[#E85D04]"
                          />
                          <span className="text-sm font-medium text-[#5C3D2E] group-hover:text-[#2C1810] transition-colors">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <label className="block mb-3 text-sm font-bold text-[#2C1810]">
                      Restaurant Features
                    </label>
                    <div className="space-y-2">
                      {availableFeatures.map((feature) => (
                        <label key={feature} className="flex items-center space-x-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={tempFilters.features.includes(feature)}
                            onChange={() => toggleFeature(feature)}
                            className="w-4 h-4 text-[#E85D04] bg-[#FFF3E8] border-[rgba(44,24,16,0.3)] rounded focus:ring-[#E85D04]"
                          />
                          <span className="text-sm font-medium text-[#5C3D2E] group-hover:text-[#2C1810] transition-colors">{feature}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Offers Toggle */}
                  <div>
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={tempFilters.offers}
                        onChange={(e) => setTempFilters(prev => ({ ...prev, offers: e.target.checked }))}
                        className="w-4 h-4 text-[#E85D04] bg-[#FFF3E8] border-[rgba(44,24,16,0.3)] rounded focus:ring-[#E85D04]"
                      />
                      <span className="text-sm font-bold text-[#2C1810]">Show only restaurants with offers</span>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 mt-8 border-t border-[rgba(44,24,16,0.1)]">
                  <button
                    onClick={resetFilters}
                    className="flex-1 px-4 py-3 font-bold text-[#2C1810] transition-colors bg-[rgba(44,24,16,0.05)] rounded-lg hover:bg-[rgba(44,24,16,0.1)]"
                  >
                    Reset
                  </button>
                  <button
                    onClick={applyFilters}
                    className="flex-1 px-4 py-3 font-bold text-[#FFE8D6] shadow-lg transition-all rounded-lg bg-gradient-to-r from-[#E85D04] to-[#F48C06] hover:scale-[1.02]"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Click outside to close sort dropdown */}
      {showSortDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowSortDropdown(false)}
        />
      )}

      <Footer />
    </div>
  )
}

export default Restaurants