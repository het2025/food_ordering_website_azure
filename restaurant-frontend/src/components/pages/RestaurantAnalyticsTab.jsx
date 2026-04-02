import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    Star,
    Clock,
    MessageCircle
} from 'lucide-react';
import {
    getMenuPerformance,
    getRevenueByCategory,
    getOrderFrequency,
    getCustomerFeedback
} from '../../api/restaurantOwnerApi';

// Loading Spinner
const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>
);

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color = 'orange', subtitle }) => (
    <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">
        <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-500 truncate">{title}</p>
                <p className={`text-xl sm:text-2xl font-bold text-${color}-600`}>{value}</p>
                {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
            </div>
            <div className={`p-2 sm:p-3 bg-${color}-100 rounded-lg flex-shrink-0`}>
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${color}-500`} />
            </div>
        </div>
    </div>
);

// Bar Chart Component (Simple CSS-based)
const SimpleBarChart = ({ data, label, valueKey = 'orders', maxValue }) => {
    if (!data || data.length === 0) return <p className="text-gray-500">No data available</p>;

    const max = maxValue || Math.max(...data.map(d => d[valueKey])) || 1;

    return (
        <div className="space-y-2">
            {data.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 sm:gap-3">
                    <div className="w-20 sm:w-28 text-xs sm:text-sm text-gray-600 truncate flex-shrink-0">{item.name || item.day || item.category}</div>
                    <div className="flex-1 h-5 sm:h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-500"
                            style={{ width: `${(item[valueKey] / max) * 100}%` }}
                        />
                    </div>
                    <div className="w-8 sm:w-12 text-xs sm:text-sm font-medium text-gray-700 text-right flex-shrink-0">{item[valueKey]}</div>
                </div>
            ))}
        </div>
    );
};

// Rating Stars Component
const RatingStars = ({ rating }) => (
    <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
            <Star
                key={star}
                className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
            />
        ))}
    </div>
);

const RestaurantAnalyticsTab = () => {
    const [loading, setLoading] = useState(true);
    const [menuPerformance, setMenuPerformance] = useState(null);
    const [revenueByCategory, setRevenueByCategory] = useState([]);
    const [orderFrequency, setOrderFrequency] = useState(null);
    const [customerFeedback, setCustomerFeedback] = useState(null);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const [menuRes, categoryRes, frequencyRes, feedbackRes] = await Promise.all([
                getMenuPerformance(),
                getRevenueByCategory(),
                getOrderFrequency(),
                getCustomerFeedback()
            ]);

            if (menuRes.success) setMenuPerformance(menuRes.data);
            if (categoryRes.success) setRevenueByCategory(categoryRes.data || []);
            if (frequencyRes.success) setOrderFrequency(frequencyRes.data);
            if (feedbackRes.success) setCustomerFeedback(feedbackRes.data);
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                    Analytics Overview
                </h2>
                <button
                    onClick={loadAnalytics}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition"
                >
                    Refresh
                </button>
            </div>

            {/* Menu Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Top Items */}
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-100">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        Top Selling Items
                    </h3>
                    {menuPerformance?.topItems?.length > 0 ? (
                        <SimpleBarChart data={menuPerformance.topItems} valueKey="orderCount" />
                    ) : (
                        <p className="text-gray-500 text-sm">No order data yet</p>
                    )}
                </div>

                {/* Bottom Items */}
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-100">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-red-500 rotate-180" />
                        Least Selling Items
                    </h3>
                    {menuPerformance?.bottomItems?.length > 0 ? (
                        <SimpleBarChart data={menuPerformance.bottomItems} valueKey="orderCount" />
                    ) : (
                        <p className="text-gray-500 text-sm">No order data yet</p>
                    )}
                </div>
            </div>

            {/* Revenue by Category */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    Revenue by Category
                </h3>
                {revenueByCategory.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                        {revenueByCategory.map((cat, idx) => (
                            <div key={idx} className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
                                <p className="text-xs sm:text-sm text-gray-500 truncate">{cat.category}</p>
                                <p className="text-sm sm:text-lg font-bold text-gray-800 break-all">₹{cat.revenue?.toLocaleString()}</p>
                                <p className="text-xs text-gray-400">{cat.orders} orders</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">No category data yet</p>
                )}
            </div>

            {/* Order Frequency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Daily */}
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-100">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-purple-500" />
                        Orders by Day
                    </h3>
                    {orderFrequency?.daily && (
                        <SimpleBarChart data={orderFrequency.daily} valueKey="orders" />
                    )}
                </div>

                {/* Recent Trend */}
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-100">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        Last 7 Days Trend
                    </h3>
                    {orderFrequency?.recentTrend?.length > 0 ? (
                        <div className="space-y-2">
                            {orderFrequency.recentTrend.map((day, idx) => (
                                <div key={idx} className="flex items-center justify-between gap-2 py-2 border-b border-gray-50">
                                    <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">{day.date}</span>
                                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                                        <span className="text-xs sm:text-sm font-medium text-orange-600">{day.orders} orders</span>
                                        <span className="text-xs sm:text-sm text-gray-500">₹{day.revenue?.toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">No recent orders</p>
                    )}
                </div>
            </div>

            {/* Customer Feedback */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-yellow-500" />
                    Customer Feedback
                </h3>

                {customerFeedback ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {/* Average Rating */}
                        <div className="text-center py-3 sm:py-4">
                            <p className="text-3xl sm:text-4xl font-bold text-yellow-500">{customerFeedback.averageRating}</p>
                            <div className="flex justify-center my-2">
                                <RatingStars rating={Math.round(parseFloat(customerFeedback.averageRating))} />
                            </div>
                            <p className="text-sm text-gray-500">{customerFeedback.totalReviews} reviews</p>
                        </div>

                        {/* Rating Distribution */}
                        <div className="space-y-2">
                            {customerFeedback.distribution?.map(item => (
                                <div key={item.rating} className="flex items-center gap-2">
                                    <span className="w-8 text-sm text-gray-600">{item.rating}★</span>
                                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-yellow-400 rounded-full"
                                            style={{ width: `${customerFeedback.totalReviews > 0 ? (item.count / customerFeedback.totalReviews) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <span className="w-8 text-sm text-gray-500 text-right">{item.count}</span>
                                </div>
                            ))}
                        </div>

                        {/* Recent Reviews */}
                        <div className="max-h-48 overflow-y-auto overscroll-contain space-y-3">
                            {customerFeedback.recentReviews?.length > 0 ? (
                                customerFeedback.recentReviews.slice(0, 3).map((review, idx) => (
                                    <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-1">
                                            <RatingStars rating={review.rating} />
                                            <span className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 line-clamp-2">{review.review}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">No reviews yet</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">No feedback data yet</p>
                )}
            </div>
        </div>
    );
};

export default RestaurantAnalyticsTab;
