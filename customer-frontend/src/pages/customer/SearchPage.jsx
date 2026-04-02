import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Filter, Star, Clock, MapPin } from 'lucide-react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

// --- 🍑 WARM PEACH THEME (With Clean White Cards) ---
// bgMain: '#FFF3E8'
// borderOrange: '#E85D04'
// accentAmber: '#F48C06'
// textDark: '#2C1810'
// textMuted: '#5C3D2E'

const SearchPage = () => {
  const [searchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    cuisine: 'all',
    rating: 0,
    deliveryTime: 60,
    sortBy: 'relevance'
  })

  // Sample search results
  const sampleResults = [
    {
      id: 1,
      name: 'Pizza Palace',
      image: '/pizza.jpg',
      cuisine: 'Italian',
      rating: 4.5,
      deliveryTime: '25-30',
      description: 'Authentic Italian pizzas with fresh ingredients'
    },
    {
      id: 2,
      name: 'Biryani House',
      image: '/biryani.webp',
      cuisine: 'Indian',
      rating: 4.7,
      deliveryTime: '30-35',
      description: 'Traditional biryani and Indian curries'
    },
    {
      id: 3,
      name: 'Chinese Delight',
      image: '/chinese.jpg.webp',
      cuisine: 'Chinese',
      rating: 4.3,
      deliveryTime: '20-25',
      description: 'Delicious Chinese dishes and noodles'
    }
  ]

  useEffect(() => {
    if (searchTerm) {
      setLoading(true)
      // Simulate API call
      setTimeout(() => {
        const filtered = sampleResults.filter(restaurant =>
          restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase()) ||
          restaurant.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setResults(filtered)
        setLoading(false)
      }, 500)
    } else {
      setResults([])
    }
  }, [searchTerm])

  const handleSearch = (e) => {
    e.preventDefault()
    // Trigger search with current searchTerm
  }

  return (
    <div className="min-h-screen bg-[#FFF3E8] font-['Inter',_sans-serif]">
      <Header />

      <div className="pt-24 pb-16">
        <div className="max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">

          {/* Search Header */}
          <div className="mb-6 sm:mb-8">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute w-5 h-5 text-[#5C3D2E]/60 transform -translate-y-1/2 left-4 top-1/2 sm:w-6 sm:h-6" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search for restaurants, cuisines, or dishes..."
                  className="w-full pl-12 pr-4 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-[#2C1810] placeholder-[#5C3D2E]/50 rounded-2xl border border-[rgba(44,24,16,0.1)] focus:outline-none focus:ring-2 focus:ring-[#E85D04] bg-white shadow-[0_8px_30px_rgba(44,24,16,0.04)] transition-shadow"
                />
              </div>
            </form>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 p-4 sm:p-5 mb-8 bg-white shadow-[0_8px_30px_rgba(44,24,16,0.04)] border border-[rgba(44,24,16,0.05)] rounded-2xl sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <Filter className="w-4 h-4 text-[#E85D04] sm:w-5 sm:h-5" />
              <span className="text-sm font-extrabold text-[#2C1810] sm:text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Filters:</span>
            </div>

            <select
              value={filters.cuisine}
              onChange={(e) => setFilters(prev => ({ ...prev, cuisine: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm font-bold text-[#2C1810] bg-[#FFF3E8]/50 border border-[rgba(44,24,16,0.1)] rounded-xl sm:w-auto focus:outline-none focus:ring-2 focus:ring-[#E85D04] transition-colors"
            >
              <option value="all">All Cuisines</option>
              <option value="italian">Italian</option>
              <option value="indian">Indian</option>
              <option value="chinese">Chinese</option>
              <option value="american">American</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm font-bold text-[#2C1810] bg-[#FFF3E8]/50 border border-[rgba(44,24,16,0.1)] rounded-xl sm:w-auto focus:outline-none focus:ring-2 focus:ring-[#E85D04] transition-colors"
            >
              <option value="relevance">Relevance</option>
              <option value="rating">Highest Rated</option>
              <option value="delivery-time">Fastest Delivery</option>
              <option value="price">Price: Low to High</option>
            </select>
          </div>

          {/* Search Results */}
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-b-4 border-[#E85D04] rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {searchTerm && (
                  <div className="mb-6">
                    <h2 className="text-lg font-extrabold text-[#2C1810] sm:text-xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {results.length} results for "<span className="text-[#E85D04]">{searchTerm}</span>"
                    </h2>
                  </div>
                )}

                {results.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {results.map((restaurant, index) => (
                      <motion.div
                        key={restaurant.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="overflow-hidden flex flex-col transition-all duration-300 bg-white border border-[rgba(44,24,16,0.05)] shadow-[0_8px_30px_rgba(44,24,16,0.04)] rounded-3xl hover:shadow-[0_20px_40px_rgba(232,93,4,0.15)] hover:-translate-y-1 hover:border-[#E85D04]/30"
                      >
                        <img
                          src={restaurant.image}
                          alt={restaurant.name}
                          className="object-cover w-full h-44 sm:h-48 bg-[#FFF3E8]"
                          onError={(e) => {
                            e.target.src = '/placeholder-restaurant.jpg';
                          }}
                        />

                        <div className="p-5 sm:p-6 flex flex-col flex-grow">
                          <h3 className="mb-1.5 text-lg font-extrabold text-[#2C1810] sm:text-xl line-clamp-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            {restaurant.name}
                          </h3>
                          <p className="mb-4 text-sm font-medium text-[#5C3D2E] sm:text-base line-clamp-2 min-h-[40px] flex-grow">
                            {restaurant.description}
                          </p>

                          <div className="flex items-center justify-between mb-5 text-sm font-medium text-[#5C3D2E]">
                            <div className="flex items-center gap-1.5">
                              <Star className="w-4 h-4 text-[#F48C06] fill-current" />
                              <span className="font-extrabold text-[#2C1810]">{restaurant.rating}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-[#E85D04]" />
                              <span>{restaurant.deliveryTime} mins</span>
                            </div>
                            <span className="px-2.5 py-1 text-[11px] font-bold text-[#E85D04] bg-[#FFF3E8] border border-[#E85D04]/20 rounded-full">
                              {restaurant.cuisine}
                            </span>
                          </div>

                          <button className="w-full bg-gradient-to-r from-[#E85D04] to-[#F48C06] text-white py-3 rounded-xl text-sm font-bold sm:text-base hover:scale-[1.02] transition-transform duration-200 shadow-md mt-auto">
                            View Menu
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : searchTerm ? (
                  <div className="py-16 text-center bg-white rounded-3xl border border-[rgba(44,24,16,0.05)] shadow-sm">
                    <div className="mb-4 text-5xl sm:text-6xl opacity-80">🔍</div>
                    <h3 className="mb-3 text-xl font-extrabold text-[#2C1810]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>No results found</h3>
                    <p className="px-4 mb-6 text-sm font-medium text-[#5C3D2E] sm:text-base">
                      Try searching with different keywords or browse our popular restaurants
                    </p>
                    <button className="bg-gradient-to-r from-[#E85D04] to-[#F48C06] text-white px-8 py-3.5 rounded-xl text-sm font-bold sm:text-base hover:scale-105 transition-transform shadow-lg">
                      Browse Restaurants
                    </button>
                  </div>
                ) : (
                  <div className="py-16 text-center bg-white/50 rounded-3xl border border-[rgba(44,24,16,0.05)]">
                    <div className="mb-4 text-5xl sm:text-6xl opacity-90">🍽️</div>
                    <h3 className="mb-2 text-xl font-extrabold text-[#2C1810]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Start your food journey</h3>
                    <p className="px-4 text-sm font-medium text-[#5C3D2E] sm:text-base">Search for your favorite restaurants, cuisines, or dishes</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default SearchPage