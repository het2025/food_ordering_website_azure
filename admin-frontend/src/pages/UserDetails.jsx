import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersAPI } from '../api/adminApi';
import { ArrowLeftIcon, EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      const response = await usersAPI.getById(id);
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  const { user, orders, stats } = data;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/users')}
        className="inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 rounded-lg touch-manipulation transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4 flex-shrink-0" />
        Back to Users
      </button>

      {/* User Info Card */}
      <div className="p-4 sm:p-6 bg-white rounded-lg shadow">
        {/* Top: Avatar + Name/Contact + Status Badge */}
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 text-xl sm:text-3xl font-bold text-white rounded-full bg-primary">
            {user.name?.charAt(0).toUpperCase()}
          </div>

          {/* Name + Contact + Badge */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-base sm:text-2xl font-bold text-gray-800 break-words leading-snug">{user.name}</h2>
              <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="flex flex-col mt-2 gap-1.5">
              <span className="flex items-start gap-1.5 text-xs sm:text-sm text-gray-600 min-w-0">
                <EnvelopeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
                <span className="break-all leading-snug">{user.email}</span>
              </span>
              {user.phone && (
                <span className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600">
                  <PhoneIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  {user.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t">
          <div className="text-center px-1">
            <p className="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight tabular-nums">
              {stats.totalOrders || 0}
            </p>
            <p className="mt-1 text-xs text-gray-500 leading-tight">Total Orders</p>
          </div>
          <div className="text-center px-1">
            <p className="text-2xl sm:text-3xl font-bold text-green-600 leading-tight tabular-nums">
              {stats.completedOrders || 0}
            </p>
            <p className="mt-1 text-xs text-gray-500 leading-tight">Completed</p>
          </div>
          <div className="text-center px-1">
            <p className="text-lg sm:text-3xl font-bold text-primary leading-tight tabular-nums truncate">
              ₹{stats.totalSpent ? stats.totalSpent.toFixed(0) : '0'}
            </p>
            <p className="mt-1 text-xs text-gray-500 leading-tight">Total Spent</p>
          </div>
        </div>
      </div>

      {/* Addresses */}
      {user.addresses && user.addresses.length > 0 && (
        <div className="p-4 sm:p-6 bg-white rounded-lg shadow">
          <h3 className="mb-3 text-sm sm:text-lg font-semibold text-gray-800">Saved Addresses</h3>
          <div className="space-y-2.5">
            {user.addresses.map((address, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800">{address.label || 'Address'}</p>
                  <p className="mt-0.5 text-xs sm:text-sm text-gray-600 break-words">
                    {address.street}, {address.city}, {address.state} - {address.pincode}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 sm:p-6 border-b">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-800">Order History</h3>
        </div>
        {orders.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">No orders yet</div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="sm:hidden divide-y divide-gray-200">
              {orders.map((order) => (
                <div key={order._id} className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-sm font-medium text-gray-900 truncate flex-1">{order.orderNumber}</span>
                    <span className={`flex-shrink-0 px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>{order.status}</span>
                  </div>
                  <p className="text-xs text-gray-600 truncate mb-2">{order.restaurantName}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                    <span className="text-sm font-semibold text-gray-900">₹{order.total}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Order ID</th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Restaurant</th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{order.orderNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{order.restaurantName}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">₹{order.total}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>{order.status}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserDetails;
