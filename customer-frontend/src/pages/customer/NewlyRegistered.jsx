import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, Star, MapPin, ChevronRight, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { API_BASE_URL } from '../../api/axiosInstance';

// --- 🍑 WARM PEACH THEME (With Clean White Cards) ---
// bgMain: '#FFF3E8'
// bgCard: '#FFFFFF' (Reverted to previous)
// borderOrange: '#E85D04'
// accentAmber: '#F48C06'
// textDark: '#2C1810'
// textMuted: '#5C3D2E'

function NewlyRegistered() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNewlyRegistered();
  }, []);

  const fetchNewlyRegistered = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching newly registered restaurants...');

      const response = await fetch(`${API_BASE_URL}/restaurants/newly-registered`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log('📊 API Response:', data);

      if (data.success) {
        setRestaurants(data.data || []);
        console.log(`✅ Loaded ${data.data.length} restaurants`);
      } else {
        throw new Error(data.message || 'Failed to fetch restaurants');
      }
    } catch (error) {
      console.error('❌ Error fetching newly registered:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantClick = (restaurant) => {
    // Navigate to restaurant menu page
    navigate(`/menu/${restaurant.restaurantId || restaurant._id}`, {
      state: { restaurant }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF3E8]">
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full border-4 border-[#E85D04] animate-spin border-t-transparent"></div>
            <p className="text-lg font-medium text-[#5C3D2E]">Loading new restaurants...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FFF3E8]">
        <Header />
        <div className="flex justify-center items-center min-h-screen px-4">
          <div className="p-8 max-w-md text-center bg-white rounded-2xl shadow-xl">
            <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-[#E85D04]/10 rounded-full">
              <span className="text-3xl">❌</span>
            </div>
            <h3 className="mb-2 text-xl font-bold text-[#2C1810]">Error Loading Restaurants</h3>
            <p className="mb-6 font-medium text-[#5C3D2E]">{error}</p>
            <button
              onClick={fetchNewlyRegistered}
              className="px-6 py-2.5 font-bold text-white bg-gradient-to-r from-[#E85D04] to-[#F48C06] rounded-lg transition-all hover:scale-105 shadow-lg"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF3E8] font-['Inter',_sans-serif]">
      <Header />

      <div className="pt-20 pb-16">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">

          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 sm:mt-8 mb-6 sm:mb-12 text-center"
          >
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center items-center mb-3 sm:mb-4">
              <Sparkles className="w-6 h-6 sm:w-10 sm:h-10 text-[#E85D04] animate-pulse" />
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-[#2C1810]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Newly Registered Restaurants
              </h1>
              <Sparkles className="w-6 h-6 sm:w-10 sm:h-10 text-[#E85D04] animate-pulse" />
            </div>
            <p className="mx-auto max-w-2xl text-sm sm:text-lg font-medium text-[#5C3D2E] px-2">
              Discover fresh restaurants that just joined QuickBite! Be the first to try their delicious food 🎉
            </p>
            <div className="inline-flex gap-2 items-center px-3 sm:px-4 py-1.5 sm:py-2 mt-3 sm:mt-4 text-[#E85D04] bg-[#E85D04]/10 border border-[#E85D04]/20 rounded-full text-sm sm:text-base shadow-sm">
              <span className="font-bold">{restaurants.length}</span>
              <span className="font-medium">new restaurants available</span>
            </div>
          </motion.div>

          {/* Restaurants Grid */}
          {restaurants.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 sm:py-16 mx-auto max-w-2xl text-center bg-white rounded-3xl shadow-xl px-4 border border-[rgba(44,24,16,0.05)]"
            >
              <div className="flex justify-center items-center mx-auto mb-4 sm:mb-6 w-16 h-16 sm:w-24 sm:h-24 bg-[#FFF3E8] rounded-full shadow-inner">
                <Store className="w-8 h-8 sm:w-12 sm:h-12 text-[#E85D04]" />
              </div>
              <h3 className="mb-2 sm:mb-3 text-lg sm:text-2xl font-bold text-[#2C1810]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                No New Restaurants Yet
              </h3>
              <p className="mb-6 sm:mb-8 text-sm sm:text-base font-medium text-[#5C3D2E]">Check back soon for exciting new additions!</p>
              <button
                onClick={() => navigate('/restaurants')}
                className="px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-bold text-white bg-gradient-to-r from-[#E85D04] to-[#F48C06] rounded-xl transition-all duration-200 hover:scale-105 shadow-lg shadow-[#E85D04]/20"
              >
                Browse All Restaurants
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {restaurants.map((restaurant, index) => (
                <motion.div
                  key={restaurant._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleRestaurantClick(restaurant)}
                  className="overflow-hidden bg-white rounded-3xl shadow-[0_8px_30px_rgba(44,24,16,0.08)] transition-all duration-300 transform cursor-pointer hover:shadow-[0_20px_40px_rgba(232,93,4,0.15)] hover:-translate-y-2 border border-[rgba(44,24,16,0.05)] hover:border-[#E85D04]/30 flex flex-col"
                >
                  {/* Image Section */}
                  <div className="overflow-hidden relative h-48 bg-[#FFF3E8] flex-shrink-0">
                    {restaurant.image && restaurant.image.trim() !== '' ? (
                      <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="object-cover w-full h-full transition-transform duration-500 transform hover:scale-110"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = document.createElement('div');
                          fallback.className = 'flex justify-center items-center w-full h-full bg-gradient-to-br from-[#E85D04] to-[#F48C06]';
                          fallback.innerHTML = `
                            <div class="p-4 text-center text-white">
                              <svg class="mx-auto mb-2 w-16 h-16 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                              </svg>
                              <p class="text-sm font-bold">${restaurant.name}</p>
                            </div>
                          `;
                          e.target.parentElement.appendChild(fallback);
                        }}
                      />
                    ) : (
                      <div className="flex justify-center items-center w-full h-full bg-gradient-to-br from-[#E85D04] to-[#F48C06]">
                        <div className="p-4 text-center text-white">
                          <Store className="mx-auto mb-2 w-16 h-16 opacity-70" />
                          <p className="text-sm font-bold">{restaurant.name}</p>
                        </div>
                      </div>
                    )}

                    {/* New Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="flex gap-2 items-center px-3 py-1.5 text-white bg-gradient-to-r from-[#E85D04] to-[#F48C06] rounded-full shadow-lg animate-bounce border border-white/20">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="text-xs font-extrabold tracking-wider">NEW</span>
                      </div>
                    </div>

                    {/* Gradient Overlay (Lighter for white cards) */}
                    <div className="absolute inset-0 bg-gradient-to-t to-transparent from-black/60"></div>
                  </div>

                  {/* Content Section */}
                  <div className="p-5 relative z-10 bg-white flex flex-col flex-grow">
                    <h3 className="mb-1.5 text-lg font-extrabold text-[#2C1810] line-clamp-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {restaurant.name}
                    </h3>

                    <p className="text-[#5C3D2E] text-sm mb-3 line-clamp-2 min-h-[40px] font-medium flex-grow">
                      {restaurant.description || 'Delicious food awaits you!'}
                    </p>

                    {/* Cuisine Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {restaurant.cuisine?.slice(0, 2).map((c, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 text-[11px] font-bold text-[#E85D04] bg-[#FFF3E8] border border-[#E85D04]/20 rounded-full"
                        >
                          {c}
                        </span>
                      ))}
                      {restaurant.cuisine?.length > 2 && (
                        <span className="px-2.5 py-1 text-[11px] font-bold text-[#5C3D2E] bg-gray-100 rounded-full">
                          +{restaurant.cuisine.length - 2}
                        </span>
                      )}
                    </div>

                    {/* Info Row */}
                    <div className="flex justify-between items-center mb-4 text-sm font-medium">
                      <div className="flex gap-1 items-center text-[#5C3D2E]">
                        <Clock className="w-4 h-4 text-[#E85D04]" />
                        <span>{restaurant.deliveryTime || '30'} mins</span>
                      </div>

                      <div className="flex gap-1 items-center text-[#F48C06]">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-bold text-[#2C1810]">
                          {restaurant.rating > 0 ? restaurant.rating.toFixed(1) : 'New'}
                        </span>
                      </div>

                      <span className="font-extrabold text-[#E85D04]">
                        {restaurant.priceRange || '₹₹'}
                      </span>
                    </div>

                    {/* Location & Registration Footer */}
                    <div className="pt-3 mt-auto border-t border-[rgba(44,24,16,0.05)]">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-1.5 items-center text-xs text-[#A07850] font-semibold max-w-[60%]">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">
                            {restaurant.location?.area || 'Local'}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-[#F48C06]">
                          Joined {new Date(restaurant.registeredAt || restaurant.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Call to Action */}
          {restaurants.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-4 sm:p-8 mt-8 sm:mt-12 text-center bg-white border border-[#E85D04]/20 rounded-3xl shadow-xl"
            >
              <h3 className="mb-2 sm:mb-3 text-xl sm:text-2xl font-extrabold text-[#2C1810]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Support New Restaurants! 🍽️
              </h3>
              <p className="mx-auto mb-4 sm:mb-6 max-w-xl text-sm sm:text-base font-medium text-[#5C3D2E]">
                Help new restaurant partners grow by being their first customer.
                Your order makes a huge difference!
              </p>
              <button
                onClick={() => navigate('/restaurants')}
                className="px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-bold text-white bg-gradient-to-r from-[#E85D04] to-[#F48C06] rounded-full shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-[#E85D04]/30"
              >
                Explore All Restaurants
              </button>
            </motion.div>
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
}

export default NewlyRegistered;