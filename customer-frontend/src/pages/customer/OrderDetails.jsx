import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    MapPin,
    Clock,
    Package,
    Truck,
    CheckCircle,
    XCircle,
    Loader,
    Store,
    Phone,
    CreditCard
} from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

// --- 🍑 WARM PEACH THEME (With Clean White Cards) ---
// bgMain: '#FFF3E8'
// borderOrange: '#E85D04'
// accentAmber: '#F48C06'
// textDark: '#2C1810'
// textMuted: '#5C3D2E'

import { API_BASE_URL } from '../../api/axiosInstance';

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                setOrder(data.data);
            } else {
                setError(data.message || 'Failed to fetch order details');
            }
        } catch (err) {
            console.error('Error fetching order details:', err);
            setError('Failed to load order details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Delivered': return <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />;
            case 'Out for Delivery': return <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />;
            case 'Preparing': return <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-[#E85D04]" />;
            case 'Cancelled': return <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />;
            default: return <Package className="w-5 h-5 sm:w-6 sm:h-6 text-[#5C3D2E]" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-green-100 text-green-800 border-green-200';
            case 'Out for Delivery': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Preparing': return 'bg-[#FFF3E8] text-[#E85D04] border-[#E85D04]/30';
            case 'Confirmed': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-[rgba(44,24,16,0.05)] text-[#2C1810] border-[rgba(44,24,16,0.1)]';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FFF3E8] font-['Inter',_sans-serif]">
                <Header />
                <div className="flex justify-center items-center pt-20 pb-16 min-h-[80vh]">
                    <div className="text-center">
                        <Loader className="mx-auto mb-4 w-12 h-12 text-[#E85D04] animate-spin" />
                        <p className="text-[#5C3D2E] font-medium">Loading order details...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-[#FFF3E8] font-['Inter',_sans-serif]">
                <Header />
                <div className="pt-24 pb-16 px-4">
                    <div className="max-w-xl mx-auto text-center bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgba(44,24,16,0.04)] border border-[rgba(44,24,16,0.05)]">
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 font-bold rounded-xl inline-block shadow-sm">
                            {error || 'Order not found'}
                        </div>
                        <button
                            onClick={() => navigate('/orders')}
                            className="block mx-auto px-8 py-3 bg-gradient-to-r from-[#E85D04] to-[#F48C06] text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform"
                        >
                            Back to Orders
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

            <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center mb-4 sm:mb-6 text-[#5C3D2E] font-bold hover:text-[#E85D04] transition-colors text-sm sm:text-base"
                    >
                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                        Back to Orders
                    </button>

                    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(44,24,16,0.04)] border border-[rgba(44,24,16,0.05)] overflow-hidden">
                        {/* Status Header */}
                        <div className="p-5 sm:p-6 lg:p-8 border-b border-[rgba(44,24,16,0.05)] bg-[rgba(44,24,16,0.02)]">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-4">
                                <div className="min-w-0 flex-1">
                                    <h1 className="text-xl sm:text-2xl font-extrabold text-[#2C1810] mb-1.5 break-words" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                        Order #{order.orderId || order._id?.slice(-8).toUpperCase()}
                                    </h1>
                                    <p className="text-[#5C3D2E] font-medium text-xs sm:text-sm">
                                        Placed on {new Date(order.createdAt).toLocaleString('en-IN', {
                                            dateStyle: 'long',
                                            timeStyle: 'short'
                                        })}
                                    </p>
                                </div>

                                <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full font-bold text-sm sm:text-base flex-shrink-0 border shadow-sm ${getStatusColor(order.status)}`}>
                                    {getStatusIcon(order.status)}
                                    <span>{order.status}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                            {/* Left Column - Order Items */}
                            <div className="md:col-span-2 space-y-6 sm:space-y-8">
                                <div>
                                    <h2 className="text-lg sm:text-xl font-extrabold text-[#2C1810] mb-4 flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                        <Package className="w-5 h-5 text-[#E85D04]" />
                                        Order Items
                                    </h2>
                                    <div className="space-y-3 sm:space-y-4">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center gap-3 p-4 bg-[#FFF3E8]/50 border border-[rgba(44,24,16,0.05)] rounded-2xl">
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold text-[#2C1810] text-sm sm:text-base truncate mb-1">{item.name}</p>
                                                    <p className="text-xs sm:text-sm font-semibold text-[#5C3D2E]">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="font-extrabold text-[#E85D04] text-sm sm:text-base flex-shrink-0">₹{item.price * item.quantity}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Delivery Info */}
                                <div>
                                    <h2 className="text-lg sm:text-xl font-extrabold text-[#2C1810] mb-4 flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                        <MapPin className="w-5 h-5 text-[#E85D04]" />
                                        Delivery Details
                                    </h2>
                                    <div className="bg-[#FFF3E8]/50 border border-[rgba(44,24,16,0.05)] rounded-2xl p-4 sm:p-5">
                                        <p className="font-bold text-[#2C1810] mb-1.5 text-sm sm:text-base">Delivery Address</p>
                                        <p className="text-[#5C3D2E] font-medium text-sm mb-0.5">{order.deliveryAddress?.street}</p>
                                        <p className="text-[#5C3D2E] font-medium text-sm">
                                            {order.deliveryAddress?.city}, {order.deliveryAddress?.state} {order.deliveryAddress?.zipCode}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Payment & Summary */}
                            <div className="space-y-6 sm:space-y-8">
                                {/* Restaurant Info */}
                                <div>
                                    <h2 className="text-lg sm:text-xl font-extrabold text-[#2C1810] mb-4 flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                        <Store className="w-5 h-5 text-[#E85D04]" />
                                        Restaurant
                                    </h2>
                                    <div className="bg-[#FFF3E8]/50 border border-[rgba(44,24,16,0.05)] rounded-2xl p-4 sm:p-5">
                                        <p className="font-bold text-[#2C1810] mb-2 text-sm sm:text-base">{order.restaurantName}</p>
                                        <button
                                            onClick={() => navigate(`/restaurant/${order.restaurant}`)}
                                            className="text-[#E85D04] text-sm font-extrabold hover:text-[#C1440E] transition-colors"
                                        >
                                            View Restaurant
                                        </button>
                                    </div>
                                </div>

                                {/* Payment Breakdown */}
                                <div>
                                    <h2 className="text-lg sm:text-xl font-extrabold text-[#2C1810] mb-4 flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                        <CreditCard className="w-5 h-5 text-[#E85D04]" />
                                        Payment Summary
                                    </h2>
                                    <div className="bg-[#FFF3E8]/50 border border-[rgba(44,24,16,0.05)] rounded-2xl p-4 sm:p-6 space-y-3 sm:space-y-4">
                                        <div className="flex justify-between font-medium text-[#5C3D2E] text-sm sm:text-base">
                                            <span>Subtotal</span>
                                            <span className="font-bold text-[#2C1810]">₹{order.totalAmount}</span>
                                        </div>
                                        <div className="flex justify-between font-medium text-[#5C3D2E] text-sm sm:text-base">
                                            <span>Delivery Fee</span>
                                            <span className="font-bold text-[#2C1810]">₹{order.deliveryFee || 0}</span>
                                        </div>
                                        <div className="flex justify-between font-medium text-[#5C3D2E] text-sm sm:text-base">
                                            <span>Tax</span>
                                            <span className="font-bold text-[#2C1810]">₹{order.tax || 0}</span>
                                        </div>
                                        {order.discount > 0 && (
                                            <div className="flex justify-between font-bold text-green-600 text-sm sm:text-base">
                                                <span>Discount</span>
                                                <span>-₹{order.discount}</span>
                                            </div>
                                        )}

                                        <div className="h-px bg-[rgba(44,24,16,0.1)] my-3"></div>

                                        <div className="flex justify-between text-lg sm:text-xl font-extrabold text-[#2C1810]">
                                            <span>Total</span>
                                            <span className="text-[#E85D04]">₹{order.total}</span>
                                        </div>
                                        <div className="pt-2 text-xs font-bold text-center text-[#5C3D2E]/60">
                                            Payment Method: {order.paymentMethod?.toUpperCase()}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="space-y-3 sm:space-y-4">
                                    {/* Track Order - Active orders */}
                                    {!['Cancelled', 'Delivered', 'OutForDelivery'].includes(order.status) && (
                                        <button
                                            onClick={() => navigate(`/track-order/${order._id}`)}
                                            className="w-full flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-[#E85D04] text-white rounded-xl font-bold hover:bg-[#C1440E] transition-colors shadow-lg shadow-[#E85D04]/20 text-sm sm:text-base"
                                        >
                                            <Truck className="w-5 h-5" />
                                            Track Order
                                        </button>
                                    )}

                                    {/* Cancel Order */}
                                    {['Preparing', 'Confirmed', 'Pending', 'Accepted'].includes(order.status) && (
                                        <button
                                            onClick={() => {
                                                alert('Please go to the "My Orders" list to cancel this order.');
                                            }}
                                            className="w-full flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-100 transition-colors text-sm sm:text-base"
                                        >
                                            <XCircle className="w-5 h-5" />
                                            Cancel Order
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default OrderDetails;