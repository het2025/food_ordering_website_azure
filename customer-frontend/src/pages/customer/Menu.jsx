import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, MapPin, Plus, Minus, Loader, Heart } from 'lucide-react';
import { restaurantService } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useUser } from '../../context/UserContext';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ReviewList from '../../components/ReviewList';
import ReviewForm from '../../components/ReviewForm';

// --- 🍑 WARM PEACH THEME (With Clean White Cards) ---
// bgMain: '#FFF3E8'
// borderOrange: '#E85D04'
// accentAmber: '#F48C06'
// textDark: '#2C1810'
// textMuted: '#5C3D2E'

const Menu = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const { user, toggleFavoriteDish } = useUser();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [foodFilter, setFoodFilter] = useState('all'); // 'all', 'veg', 'non-veg'
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' or 'reviews'
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    loadRestaurantDetails();
  }, [vendorId]);

  const loadRestaurantDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await restaurantService.getRestaurantById(vendorId);

      if (response.success) {
        setRestaurant(response.data);
        setMenu(response.data.menu || []);
      } else {
        setError('Restaurant not found');
      }
    } catch (error) {
      setError('Failed to load restaurant details');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredMenu = () => {
    let filteredMenu = menu;

    // Only filter by category if not 'All'
    if (selectedCategory !== 'All') {
      filteredMenu = menu.filter(category => category.category === selectedCategory);
    }

    // Apply food type filter
    if (foodFilter === 'veg') {
      filteredMenu = filteredMenu.map(category => ({
        ...category,
        items: category.items.filter(item => item.isVeg)
      })).filter(category => category.items.length > 0);
    } else if (foodFilter === 'non-veg') {
      filteredMenu = filteredMenu.map(category => ({
        ...category,
        items: category.items.filter(item => !item.isVeg)
      })).filter(category => category.items.length > 0);
    }

    return filteredMenu;
  };

  const handleAddToCart = (item, categoryName) => {
    const cartItem = {
      _id: `${restaurant._id}-${item.name}`,
      restaurantId: restaurant._id,
      restaurantName: restaurant.name,
      name: item.name,
      price: item.price,
      image: item.url || restaurant.image,
      category: categoryName,
      isVeg: item.isVeg,
      description: item.description
    };
    addToCart(cartItem);
  };

  const getItemQuantity = (item) => {
    const cartItem = cartItems.find(cartItem =>
      cartItem.name === item.name && cartItem.restaurantId === restaurant._id
    );
    return cartItem ? cartItem.quantity : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFF3E8]">
        <Loader className="w-12 h-12 text-[#E85D04] animate-spin" />
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 bg-[#FFF3E8] font-['Inter',_sans-serif]">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-[rgba(44,24,16,0.05)]">
          <h2 className="mb-4 text-xl font-extrabold text-[#2C1810] sm:text-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Restaurant Not Found</h2>
          <p className="mb-6 font-medium text-[#5C3D2E] sm:text-base">{error || 'The restaurant you are looking for does not exist.'}</p>
          <button onClick={() => navigate('/')} className="bg-gradient-to-r from-[#E85D04] to-[#F48C06] text-white font-bold px-6 py-3 rounded-xl hover:scale-105 transition-transform min-h-[48px] shadow-lg shadow-[#E85D04]/20">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const categories = ['All', ...menu.map(category => category.category)];
  const filteredMenu = getFilteredMenu();

  return (
    <div className="min-h-screen bg-[#FFF3E8] font-['Inter',_sans-serif]">
      <Header />

      <main className="container px-3 py-4 pt-20 mx-auto sm:px-4 sm:py-8 max-w-6xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#5C3D2E] font-semibold hover:text-[#E85D04] mb-4 sm:mb-6 min-h-[44px] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm sm:text-base">Back</span>
        </button>

        {/* Restaurant Header */}
        <div className="p-4 mb-5 bg-white shadow-[0_8px_30px_rgba(44,24,16,0.04)] border border-[rgba(44,24,16,0.05)] rounded-3xl sm:p-6 sm:mb-8">
          <div className="flex flex-col gap-4 md:flex-row sm:gap-6">
            <img
              src={restaurant.image || '/placeholder-restaurant.jpg'}
              alt={restaurant.name}
              className="object-cover w-full md:w-56 h-48 sm:h-56 md:h-48 rounded-2xl bg-[#FFF3E8]"
              onError={(e) => {
                e.target.src = '/placeholder-restaurant.jpg';
              }}
            />

            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h1 className="mb-2 text-2xl font-extrabold leading-snug text-[#2C1810] sm:text-4xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{restaurant.name}</h1>
              <p className="mb-3 text-sm font-medium text-[#5C3D2E] sm:mb-4 sm:text-base">{restaurant.description}</p>

              <div className="flex flex-wrap gap-3 mb-3 text-xs font-semibold text-[#5C3D2E] sm:gap-5 sm:text-sm sm:mb-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF3E8] rounded-xl border border-[rgba(44,24,16,0.05)]">
                  <Star className="w-4 h-4 text-[#F48C06] fill-current" />
                  <span className="font-extrabold text-[#2C1810]">{restaurant.rating}</span>
                  <span className="opacity-80">({restaurant.totalReviews})</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF3E8] rounded-xl border border-[rgba(44,24,16,0.05)]">
                  <Clock className="w-4 h-4 text-[#E85D04]" />
                  <span>{restaurant.deliveryTime}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF3E8] rounded-xl border border-[rgba(44,24,16,0.05)]">
                  <MapPin className="w-4 h-4 text-[#A07850]" />
                  <span>{restaurant.location.area}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {restaurant.cuisine.map((cuisine, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-[#E85D04]/10 text-[#E85D04] font-bold text-xs rounded-full border border-[#E85D04]/20"
                  >
                    {cuisine}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 border-b border-[rgba(44,24,16,0.1)] sm:mb-8">
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 sm:px-8 py-3.5 font-bold text-sm sm:text-base transition-colors relative min-h-[48px] ${activeTab === 'menu'
              ? 'text-[#E85D04]'
              : 'text-[#5C3D2E] hover:text-[#2C1810]'
              }`}
          >
            Menu
            {activeTab === 'menu' && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-[#E85D04] rounded-t-full shadow-[0_-2px_10px_rgba(232,93,4,0.5)]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 sm:px-8 py-3.5 font-bold text-sm sm:text-base transition-colors relative min-h-[48px] ${activeTab === 'reviews'
              ? 'text-[#E85D04]'
              : 'text-[#5C3D2E] hover:text-[#2C1810]'
              }`}
          >
            Reviews
            {activeTab === 'reviews' && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-[#E85D04] rounded-t-full shadow-[0_-2px_10px_rgba(232,93,4,0.5)]" />
            )}
          </button>
        </div>

        {activeTab === 'reviews' ? (
          <div>
            <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:justify-between sm:items-center sm:mb-8">
              <h2 className="text-2xl font-extrabold text-[#2C1810] sm:text-3xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Customer Reviews</h2>
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-[#E85D04] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#C1440E] transition-all hover:shadow-lg text-sm sm:text-base min-h-[44px] self-start sm:self-auto"
              >
                {showReviewForm ? 'Cancel Review' : 'Write a Review'}
              </button>
            </div>

            {showReviewForm && (
              <div className="mb-8 p-6 bg-white rounded-3xl border border-[rgba(44,24,16,0.05)] shadow-lg">
                <ReviewForm
                  restaurantId={restaurant.restaurantId}
                  onReviewSubmitted={() => {
                    setShowReviewForm(false);
                    // Trigger refresh of reviews list (you might need to lift state or use a ref/context)
                    // For now, we'll just close the form. Ideally ReviewList should refetch.
                    // A simple way is to remount ReviewList by changing a key, or passing a refresh trigger.
                    // Let's use a key approach in the render below.
                    window.location.reload(); // Simple refresh for now
                  }}
                />
              </div>
            )}

            <div className="bg-white rounded-3xl border border-[rgba(44,24,16,0.05)] shadow-sm p-4 sm:p-6">
              <ReviewList restaurantId={restaurant.restaurantId} />
            </div>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-5 sm:gap-3 sm:mb-6">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[36px] border ${selectedCategory === category
                    ? 'bg-[#E85D04] text-white border-[#E85D04] shadow-md shadow-[#E85D04]/20'
                    : 'bg-white text-[#5C3D2E] border-[rgba(44,24,16,0.1)] hover:border-[#E85D04]/50'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Food Type Filter */}
            <div className="flex flex-wrap gap-2 mb-8 sm:gap-3 sm:mb-10">
              <button
                onClick={() => setFoodFilter('veg')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[40px] border-2 ${foodFilter === 'veg'
                  ? 'bg-green-50 border-green-500 text-green-700 shadow-sm'
                  : 'bg-white border-[rgba(44,24,16,0.05)] text-[#5C3D2E] hover:border-green-200'
                  }`}
              >
                <img
                  src="https://res.cloudinary.com/dovlhkyrr/image/upload/v1758009402/veg_g9mrsg.png"
                  alt="Veg"
                  className="w-5 h-6 sm:w-6 sm:h-7 object-contain"
                />
                Veg Food
              </button>

              <button
                onClick={() => setFoodFilter('non-veg')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[40px] border-2 ${foodFilter === 'non-veg'
                  ? 'bg-red-50 border-red-500 text-red-700 shadow-sm'
                  : 'bg-white border-[rgba(44,24,16,0.05)] text-[#5C3D2E] hover:border-red-200'
                  }`}
              >
                <img
                  src="https://res.cloudinary.com/dovlhkyrr/image/upload/v1758009402/non-veg_ucnnbj.png"
                  alt="Non-Veg"
                  className="w-5 h-6 sm:w-6 sm:h-7 object-contain"
                />
                Non-Veg Food
              </button>

              {(foodFilter === 'veg' || foodFilter === 'non-veg') && (
                <button
                  onClick={() => setFoodFilter('all')}
                  className="px-4 py-2 bg-gradient-to-r from-[#E85D04] to-[#F48C06] text-white rounded-xl text-xs sm:text-sm font-bold hover:scale-105 transition-transform min-h-[40px] shadow-sm"
                >
                  Show All
                </button>
              )}
            </div>

            {/* Menu Items */}
            {filteredMenu.length === 0 ? (
              <div className="px-4 py-12 text-center bg-white rounded-3xl border border-[rgba(44,24,16,0.05)]">
                <p className="text-[#5C3D2E] font-medium sm:text-lg">No items found matching your criteria.</p>
              </div>
            ) : (
              <div className="space-y-8 sm:space-y-12">
                {filteredMenu.map((category) => (
                  <div key={category.category}>
                    <h2 className="pb-3 mb-4 text-2xl font-extrabold text-[#2C1810] border-b-2 border-[rgba(44,24,16,0.05)] sm:text-3xl sm:mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {category.category}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      {category.items.map((item) => {
                        const isFavorite = user?.favoriteDishes?.some(
                          fav => fav.dishId === item._id && fav.restaurantId === restaurant.restaurantId
                        );

                        return (
                          <div key={item.name} className="relative p-4 sm:p-5 transition-all bg-white border border-[rgba(44,24,16,0.05)] shadow-sm rounded-3xl hover:shadow-[0_15px_30px_rgba(232,93,4,0.1)] hover:-translate-y-1 hover:border-[#E85D04]/30 group">
                            {/* Favorite Button */}
                            <button
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (!user) {
                                  navigate('/login');
                                  return;
                                }
                                const result = await toggleFavoriteDish(item, restaurant.restaurantId, restaurant.name);
                                if (result.success) {
                                  // Optional: Show toast
                                }
                              }}
                              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2.5 rounded-full bg-white/90 backdrop-blur-sm border border-[rgba(44,24,16,0.05)] shadow-sm hover:bg-[#FFF3E8] hover:border-[#E85D04]/30 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 min-w-[40px] min-h-[40px] flex items-center justify-center"
                              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                            >
                              <Heart
                                className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${isFavorite ? 'text-red-500 fill-current' : 'text-[#A07850] hover:text-red-500'}`}
                              />
                            </button>

                            <div className="flex flex-col gap-4 sm:flex-row">
                              <div className="flex-1 min-w-0 flex flex-col">
                                <div className="flex items-start gap-2.5 mb-2">
                                  {/* Updated Veg/Non-Veg Image */}
                                  <img
                                    src={
                                      item.isVeg
                                        ? "https://res.cloudinary.com/dovlhkyrr/image/upload/v1758012359/veg_food_q3f5f0.png"
                                        : "https://res.cloudinary.com/dovlhkyrr/image/upload/v1758012359/non-veg_food_czrcmx.png"
                                    }
                                    alt={item.isVeg ? "Veg" : "Non-Veg"}
                                    className="flex-shrink-0 w-5 h-5 mt-0.5 object-contain"
                                  />

                                  <div className="flex-1 min-w-0 pr-10 sm:pr-0">
                                    <h3 className="mb-1 text-lg font-extrabold leading-snug text-[#2C1810]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                      {item.name}
                                    </h3>
                                    {item.isPopular && (
                                      <span className="inline-block mb-2 px-2.5 py-0.5 bg-[#FFF3E8] border border-[#E85D04]/20 text-[#E85D04] font-bold text-[10px] rounded-full tracking-wide uppercase">
                                        Must Try
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <p className="mb-3 text-sm font-medium leading-relaxed text-[#5C3D2E] line-clamp-2 flex-grow">{item.description}</p>

                                <p className="text-xl font-extrabold text-[#E85D04]">₹{item.price}</p>

                                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[rgba(44,24,16,0.05)]">
                                  {getItemQuantity(item) > 0 ? (
                                    <div className="flex items-center overflow-hidden text-white bg-gradient-to-r from-[#E85D04] to-[#F48C06] rounded-xl shadow-md">
                                      <button
                                        onClick={() => {
                                          const newQty = (item.qty || 1) - 1
                                          if (newQty <= 0) {
                                            // Handled in context to remove
                                          }
                                        }}
                                        className="hover:bg-black/10 active:bg-black/20 transition-colors w-10 h-10 flex items-center justify-center">
                                        <Minus className="w-4 h-4" />
                                      </button>
                                      <span className="px-2 font-bold min-w-[32px] text-center">{getItemQuantity(item)}</span>
                                      <button
                                        onClick={() => handleAddToCart(item, category.category)}
                                        className="hover:bg-black/10 active:bg-black/20 transition-colors w-10 h-10 flex items-center justify-center"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleAddToCart(item, category.category)}
                                      className="bg-[#FFF3E8] hover:bg-[#E85D04] text-[#E85D04] hover:text-white border border-[#E85D04]/20 hover:border-[#E85D04] px-5 sm:px-6 min-h-[40px] rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200 text-sm sm:text-base w-full sm:w-auto"
                                    >
                                      <Plus className="w-4 h-4" />
                                      Add
                                    </button>
                                  )}
                                </div>
                              </div>

                              {item.url && (
                                <div className="flex-shrink-0 w-full sm:w-32 sm:h-32 md:w-36 md:h-36">
                                  <img
                                    src={item.url}
                                    alt={item.name}
                                    className="object-cover w-full h-40 sm:h-full rounded-2xl bg-[#FFF3E8]"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Menu;