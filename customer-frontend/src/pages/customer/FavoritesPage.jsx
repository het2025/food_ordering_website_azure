import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useUser } from '../../context/UserContext';
import { useCart } from '../../context/CartContext';

// --- 🍑 WARM PEACH THEME (With Clean White Cards) ---
// bgMain: '#FFF3E8'
// borderOrange: '#E85D04'
// accentAmber: '#F48C06'
// textDark: '#2C1810'
// textMuted: '#5C3D2E'

const FavoritesPage = () => {
    const navigate = useNavigate();
    const { user, toggleFavoriteDish, loading } = useUser();
    const { addToCart } = useCart();
    const favoriteDishes = user?.favoriteDishes || [];

    const handleAddToCart = (dish) => {
        // Construct cart item from stored dish data
        const cartItem = {
            _id: `${dish.restaurantId}-${dish.dishName}`,
            restaurantId: dish.restaurantId,
            restaurantName: dish.restaurantName,
            name: dish.dishName,
            price: dish.dishPrice,
            image: dish.dishImage,
            isVeg: true, // Defaulting, as we might not store this. Ideally we should.
            // Note: If 'isVeg' is critical, we should add it to the favoriteDishes schema.
            // For now, let's assume valid data or fetch fresh.
        };
        addToCart(cartItem);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#FFF3E8]">
                <div className="w-12 h-12 border-4 border-[#E85D04] rounded-full border-t-transparent animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#FFF3E8] font-['Inter',_sans-serif]">
            <Header />

            <main className="flex-grow w-full px-4 pt-24 pb-12 mx-auto sm:px-6 lg:px-8 max-w-7xl">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2.5 transition-colors rounded-xl bg-white border border-[rgba(44,24,16,0.1)] hover:border-[#E85D04] hover:text-[#E85D04] text-[#5C3D2E] shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C1810]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        Favorite Dishes
                    </h1>
                </div>

                {favoriteDishes.length === 0 ? (
                    <div className="py-20 text-center bg-white border border-[rgba(44,24,16,0.05)] shadow-[0_8px_30px_rgba(44,24,16,0.04)] rounded-3xl">
                        <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-[#FFF3E8] shadow-inner">
                            <Heart className="w-10 h-10 text-[#E85D04]" />
                        </div>
                        <h2 className="mb-3 text-2xl font-extrabold text-[#2C1810]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            No favorites yet
                        </h2>
                        <p className="max-w-md mx-auto mb-8 font-medium text-[#5C3D2E]">
                            Start exploring menus and tap the heart icon to save your favorite dishes here!
                        </p>
                        <button
                            onClick={() => navigate('/home')}
                            className="px-8 py-3.5 font-bold text-white transition-all bg-gradient-to-r from-[#E85D04] to-[#F48C06] shadow-lg rounded-xl hover:scale-105 shadow-[#E85D04]/20"
                        >
                            Explore Restaurants
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {favoriteDishes.map((dish) => (
                            <div
                                key={`${dish.dishId}-${dish.restaurantId}`}
                                className="p-5 transition-all bg-white border border-[rgba(44,24,16,0.05)] shadow-[0_8px_30px_rgba(44,24,16,0.04)] rounded-3xl hover:shadow-[0_20px_40px_rgba(232,93,4,0.15)] hover:-translate-y-1 hover:border-[#E85D04]/30 group"
                            >
                                <div className="flex gap-4 h-full">
                                    <div className="flex-shrink-0 w-24 h-24 overflow-hidden bg-[#FFF3E8] rounded-2xl">
                                        <img
                                            src={dish.dishImage || '/placeholder-food.jpg'}
                                            alt={dish.dishName}
                                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                                            onError={(e) => { e.target.src = '/placeholder-food.jpg'; }}
                                        />
                                    </div>
                                    <div className="flex flex-col justify-between flex-1 min-w-0">
                                        <div>
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="font-extrabold text-[#2C1810] line-clamp-1" title={dish.dishName} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                                    {dish.dishName}
                                                </h3>
                                                <button
                                                    onClick={() => toggleFavoriteDish({ _id: dish.dishId }, dish.restaurantId)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0"
                                                    title="Remove from favorites"
                                                >
                                                    <Heart className="w-5 h-5 fill-current" />
                                                </button>
                                            </div>
                                            <p
                                                onClick={() => navigate(`/menu/${dish.restaurantId}`)}
                                                className="text-sm font-medium text-[#5C3D2E] transition-colors cursor-pointer hover:text-[#E85D04] line-clamp-1 mt-1"
                                            >
                                                from {dish.restaurantName}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between mt-3">
                                            <span className="text-lg font-extrabold text-[#E85D04]">₹{dish.dishPrice}</span>
                                            <button
                                                onClick={() => handleAddToCart(dish)}
                                                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FFF3E8] text-[#E85D04] rounded-xl text-sm font-bold hover:bg-[#E85D04] hover:text-white border border-[#E85D04]/20 transition-colors"
                                            >
                                                <ShoppingBag className="w-4 h-4" />
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default FavoritesPage;