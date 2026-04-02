import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../api/adminApi';
import {
  BuildingStorefrontIcon,
  ShoppingCartIcon,
  CurrencyRupeeIcon,
  ChevronRightIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const Orders = () => {
  const [restaurantOrders, setRestaurantOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRestaurant, setExpandedRestaurant] = useState(null);
  const [restaurantOrderDetails, setRestaurantOrderDetails] = useState({});
  const [loadingOrders, setLoadingOrders] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurantOrders();
  }, []);

  const fetchRestaurantOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getByRestaurant();

      if (response.data.success) {
        setRestaurantOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching restaurant orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantClick = async (restaurantId, restaurantName) => {
    if (expandedRestaurant === restaurantId) {
      // Collapse if already expanded
      setExpandedRestaurant(null);
      return;
    }

    // Expand and load orders
    setExpandedRestaurant(restaurantId);

    if (!restaurantOrderDetails[restaurantId]) {
      try {
        setLoadingOrders({ ...loadingOrders, [restaurantId]: true });
        const response = await ordersAPI.getRestaurantOrders(restaurantId, 1, 50);

        if (response.data.success) {
          setRestaurantOrderDetails({
            ...restaurantOrderDetails,
            [restaurantId]: response.data.data
          });
        }
      } catch (error) {
        console.error(`Error fetching orders for ${restaurantName}:`, error);
      } finally {
        setLoadingOrders({ ...loadingOrders, [restaurantId]: false });
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Preparing':
      case 'Confirmed':
        return 'bg-yellow-100 text-yellow-800';
      case 'Out for Delivery':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 rounded-full border-b-2 animate-spin border-primary"></div>
      </div>
    );
  }

  const totalOverallOrders = restaurantOrders.reduce((sum, restaurant) => sum + (restaurant.totalOrders || 0), 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Orders by Restaurant</h2>
            <p className="mt-1 text-sm sm:text-base text-gray-600">
              View and manage orders grouped by restaurant ({restaurantOrders.length} restaurants with orders)
            </p>
          </div>
          <div className="bg-primary/10 text-primary px-4 py-3 rounded-lg border border-primary/20 flex flex-col items-center">
            <span className="text-sm font-medium">Total Platform Orders</span>
            <span className="text-2xl font-bold">{totalOverallOrders}</span>
          </div>
        </div>
      </div>

      {/* Restaurant Cards */}
      <div className="space-y-4">
        {restaurantOrders.length === 0 ? (
          <div className="p-8 sm:p-12 text-center bg-white rounded-lg shadow">
            <ShoppingCartIcon className="mx-auto mb-4 w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
            <h3 className="mb-2 text-lg sm:text-xl font-semibold text-gray-800">No Orders Yet</h3>
            <p className="text-sm sm:text-base text-gray-600">Orders will appear here once customers start placing them.</p>
          </div>
        ) : (
          restaurantOrders.map((restaurant) => (
            <div key={restaurant._id} className="overflow-hidden bg-white rounded-lg shadow">
              {/* Restaurant Header */}
              <div
                onClick={() => handleRestaurantClick(restaurant._id, restaurant.restaurantName)}
                className="p-4 sm:p-6 transition cursor-pointer hover:bg-gray-50"
              >
                {/* Top row: icon + name + chevron */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="flex-shrink-0 flex justify-center items-center w-10 h-10 sm:w-12 sm:h-12 font-bold text-white rounded-full bg-primary">
                      <BuildingStorefrontIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="flex-1 ml-3 sm:ml-4 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-gray-800 truncate">
                        {restaurant.restaurantName || 'Unknown Restaurant'}
                      </h3>
                      <p className="mt-0.5 text-xs sm:text-sm text-gray-600 truncate">
                        Last order: {new Date(restaurant.lastOrderDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    {expandedRestaurant === restaurant._id ? (
                      <ChevronDownIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                    ) : (
                      <ChevronRightIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Stats Grid - 2x2 on mobile, 4-col on sm+ */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold text-gray-800">{restaurant.totalOrders}</p>
                    <p className="text-xs text-gray-600">Total Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold text-yellow-600">{restaurant.pendingOrders}</p>
                    <p className="text-xs text-gray-600">Pending</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold text-green-600">{restaurant.completedOrders}</p>
                    <p className="text-xs text-gray-600">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-base sm:text-2xl font-bold text-primary break-all">
                      ₹{(restaurant.totalRevenue || 0).toFixed(0)}
                    </p>
                    <p className="text-xs text-gray-600">Revenue</p>
                  </div>
                </div>
              </div>

              {/* Orders Table (Expanded) */}
              {expandedRestaurant === restaurant._id && (
                <div className="border-t">
                  {loadingOrders[restaurant._id] ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="w-8 h-8 rounded-full border-b-2 animate-spin border-primary"></div>
                    </div>
                  ) : restaurantOrderDetails[restaurant._id]?.length === 0 ? (
                    <div className="py-12 text-center text-gray-500">
                      No orders found for this restaurant
                    </div>
                  ) : (
                    <>
                      {/* Mobile card view */}
                      <div className="sm:hidden divide-y divide-gray-200">
                        {restaurantOrderDetails[restaurant._id]?.map((order) => (
                          <div key={order._id} className="p-4 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">
                                {order.orderNumber || order._id.slice(-8)}
                              </span>
                              <span className={`px-2 text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{order.customerName || 'N/A'}</span>
                              <span className="text-sm font-medium text-gray-900">₹{order.total || order.totalAmount}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">{order.items?.length || 0} items</span>
                              <span className="text-xs text-gray-400">
                                {new Date(order.createdAt || order.orderTime).toLocaleDateString()}
                              </span>
                            </div>
                            <button
                              onClick={() => navigate(`/orders/${order._id}`)}
                              className="inline-block text-xs text-primary font-medium mt-2 py-1"
                            >
                              View Details →
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Desktop table view */}
                      <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Order ID</th>
                              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Customer</th>
                              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Items</th>
                              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Amount</th>
                              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Status</th>
                              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Date</th>
                              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {restaurantOrderDetails[restaurant._id]?.map((order) => (
                              <tr key={order._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                                  {order.orderNumber || order._id.slice(-8)}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                  {order.customerName || 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                  {order.items?.length || 0} items
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                                  ₹{order.total || order.totalAmount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                    {order.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                  {new Date(order.createdAt || order.orderTime).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                  <button
                                    onClick={() => navigate(`/orders/${order._id}`)}
                                    className="text-primary hover:text-opacity-80"
                                  >
                                    View Details
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
