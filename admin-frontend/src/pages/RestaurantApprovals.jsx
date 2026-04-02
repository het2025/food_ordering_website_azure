import React, { useState, useEffect } from 'react';
import { restaurantsAPI } from '../api/adminApi';
import { CheckCircleIcon, XCircleIcon, EyeIcon } from '@heroicons/react/24/outline';
import { io } from 'socket.io-client';

const RestaurantApprovals = () => {
  const [pendingRestaurants, setPendingRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  useEffect(() => {
    fetchPendingRestaurants();

    const socketUrl = import.meta.env.VITE_SOCKET_URL || `http://${window.location.hostname}:5004`;
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'], // Better for Azure App Service
      withCredentials: true
    });

    socket.on('connect', () => {
      console.log('🔌 Connected to Restaurant Backend Socket');
    });

    socket.on('restaurant_registered', (data) => {
      console.log('🔔 New restaurant registration received:', data);
      fetchPendingRestaurants();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedRestaurant) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedRestaurant]);

  const fetchPendingRestaurants = async () => {
    try {
      setLoading(true);
      const response = await restaurantsAPI.getPending();
      if (response.data.success) {
        setPendingRestaurants(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching pending restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (restaurantId, restaurantName) => {
    if (!confirm(`Approve "${restaurantName}"?`)) return;
    try {
      setActionLoading(restaurantId);
      const response = await restaurantsAPI.approve(restaurantId);
      if (response.data.success) {
        alert('Restaurant approved successfully!');
        fetchPendingRestaurants();
      }
    } catch (error) {
      console.error('Error approving restaurant:', error);
      alert('Failed to approve restaurant');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (restaurantId, restaurantName) => {
    const reason = prompt(`Reject "${restaurantName}"?\n\nPlease provide a reason:`);
    if (!reason) return;
    try {
      setActionLoading(restaurantId);
      const response = await restaurantsAPI.reject(restaurantId, reason);
      if (response.data.success) {
        alert('Restaurant rejected');
        fetchPendingRestaurants();
      }
    } catch (error) {
      console.error('Error rejecting restaurant:', error);
      alert('Failed to reject restaurant');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Restaurant Approvals</h2>
        <p className="mt-1 text-sm sm:text-base text-gray-600">
          {pendingRestaurants.length} restaurant(s) waiting for approval
        </p>
      </div>

      {/* Pending Restaurants */}
      {pendingRestaurants.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-white rounded-lg shadow">
          <CheckCircleIcon className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-green-500" />
          <h3 className="mb-2 text-lg sm:text-xl font-semibold text-gray-800">All Caught Up!</h3>
          <p className="text-sm sm:text-base text-gray-600">No restaurants pending approval at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {pendingRestaurants.map((restaurant) => (
            <div key={restaurant._id} className="overflow-hidden bg-white rounded-lg shadow-lg">
              <div className="p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {restaurant.image ? (
                      <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="object-cover w-14 h-14 sm:w-20 sm:h-20 rounded-lg"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 text-lg sm:text-2xl font-bold text-white rounded-lg bg-primary">
                        {restaurant.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-xl font-bold text-gray-800 truncate">{restaurant.name}</h3>
                    <p className="mt-1 text-xs sm:text-sm text-gray-600 line-clamp-2">{restaurant.description}</p>

                    <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-3">
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Owner</p>
                        <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">{restaurant.ownerName || 'N/A'}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Contact</p>
                        <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">{restaurant.contact?.phone || restaurant.phone || 'N/A'}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                          {restaurant.location?.area}, {restaurant.location?.city}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Cuisine</p>
                        <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                          {restaurant.cuisine?.join(', ') || restaurant.cuisines?.join(', ') || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {restaurant.registeredAt && (
                      <p className="mt-2 text-xs text-gray-500">
                        Registered: {new Date(restaurant.registeredAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-3 gap-2 px-4 sm:px-6 py-3 sm:py-4 border-t bg-gray-50">
                <button
                  onClick={() => setSelectedRestaurant(restaurant)}
                  className="flex items-center justify-center py-2.5 text-xs sm:text-sm text-white transition bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 touch-manipulation"
                >
                  <EyeIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span>Details</span>
                </button>
                <button
                  onClick={() => handleReject(restaurant._id, restaurant.name)}
                  disabled={actionLoading === restaurant._id}
                  className="flex items-center justify-center py-2.5 text-xs sm:text-sm text-white transition bg-red-600 rounded-lg hover:bg-red-700 active:bg-red-800 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => handleApprove(restaurant._id, restaurant.name)}
                  disabled={actionLoading === restaurant._id}
                  className="flex items-center justify-center py-2.5 text-xs sm:text-sm text-white transition bg-green-600 rounded-lg hover:bg-green-700 active:bg-green-800 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span>{actionLoading === restaurant._id ? '...' : 'Approve'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal — bottom sheet on mobile, centered on sm+ */}
      {selectedRestaurant && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black bg-opacity-50"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedRestaurant(null); }}
        >
          <div className="w-full sm:max-w-3xl sm:mx-4 bg-white rounded-t-2xl sm:rounded-xl shadow-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col">

            {/* Drag handle — mobile only */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
              <div className="w-10 h-1.5 bg-gray-300 rounded-full"></div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b flex-shrink-0">
              <div className="min-w-0 mr-3">
                <h3 className="text-base sm:text-xl font-bold text-gray-800 truncate">Restaurant Details</h3>
                <p className="text-xs text-gray-500 truncate">{selectedRestaurant.name}</p>
              </div>
              <button
                onClick={() => setSelectedRestaurant(null)}
                className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full touch-manipulation"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto overscroll-contain flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">

              {/* Image + Core Info */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="w-full sm:w-1/3 flex-shrink-0">
                  {selectedRestaurant.image ? (
                    <img
                      src={selectedRestaurant.image}
                      alt={selectedRestaurant.name}
                      className="w-full h-44 sm:h-48 object-cover rounded-lg shadow-md"
                    />
                  ) : (
                    <div className="w-full h-44 sm:h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <h4 className="text-lg sm:text-2xl font-bold text-gray-900 break-words">{selectedRestaurant.name}</h4>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-3">{selectedRestaurant.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 p-2.5 rounded-lg min-w-0">
                      <span className="text-xs font-semibold text-gray-500 uppercase block">Owner</span>
                      <p className="text-sm font-medium text-gray-900 truncate">{selectedRestaurant.ownerName || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-2.5 rounded-lg min-w-0">
                      <span className="text-xs font-semibold text-gray-500 uppercase block">Contact</span>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {selectedRestaurant.contact?.phone || selectedRestaurant.phone || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-2.5 rounded-lg min-w-0 col-span-2 sm:col-span-1">
                      <span className="text-xs font-semibold text-gray-500 uppercase block">Email</span>
                      <p className="text-sm font-medium text-gray-900 break-all">
                        {selectedRestaurant.contact?.email || selectedRestaurant.email || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-2.5 rounded-lg min-w-0">
                      <span className="text-xs font-semibold text-gray-500 uppercase block">GST</span>
                      <p className="text-sm font-medium text-gray-900 truncate">{selectedRestaurant.gstNumber || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <hr />

              {/* Location & Operations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-gray-800 mb-2">Location</h4>
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-1.5 text-sm">
                    <p className="break-words"><span className="font-medium">Address:</span> {selectedRestaurant.location?.address}</p>
                    <p><span className="font-medium">Area:</span> {selectedRestaurant.location?.area}</p>
                    <p><span className="font-medium">City:</span> {selectedRestaurant.location?.city}, {selectedRestaurant.location?.state}</p>
                    <p><span className="font-medium">Pincode:</span> {selectedRestaurant.location?.pincode}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-gray-800 mb-2">Operations</h4>
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-1.5 text-sm">
                    <p className="break-words"><span className="font-medium">Cuisines:</span> {selectedRestaurant.cuisine?.join(', ') || 'N/A'}</p>
                    <p><span className="font-medium">Price Range:</span> {selectedRestaurant.priceRange}</p>
                    <p><span className="font-medium">Delivery Time:</span> {selectedRestaurant.deliveryTime} mins</p>
                    <p><span className="font-medium">Registered:</span> {new Date(selectedRestaurant.registeredAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t flex-shrink-0 pb-safe">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSelectedRestaurant(null)}
                  className="py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 touch-manipulation"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleReject(selectedRestaurant._id, selectedRestaurant.name);
                    setSelectedRestaurant(null);
                  }}
                  className="py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 active:bg-red-800 touch-manipulation"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    handleApprove(selectedRestaurant._id, selectedRestaurant.name);
                    setSelectedRestaurant(null);
                  }}
                  className="py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 active:bg-green-800 touch-manipulation"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantApprovals;
