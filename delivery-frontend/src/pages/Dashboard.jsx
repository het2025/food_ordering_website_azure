import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDelivery } from '../context/DeliveryContext';
import { profileAPI } from '../api/axiosInstance';
import Header from '../components/Header';
import {
  TruckIcon,
  CurrencyRupeeIcon,
  CheckCircleIcon,
  StarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const navigate = useNavigate();
  const { deliveryBoy, updateDeliveryBoy } = useDelivery();
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const response = await profileAPI.getEarnings();
      if (response.data.success) {
        setEarnings(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOnline = async () => {
    try {
      const response = await profileAPI.toggleOnline();
      if (response.data.success) {
        updateDeliveryBoy(response.data.data);
      }
    } catch (error) {
      console.error('Error toggling online:', error);
    }
  };

  const handleToggleAvailability = async () => {
    try {
      const response = await profileAPI.toggleAvailability();
      if (response.data.success) {
        updateDeliveryBoy(response.data.data);
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      alert(error.response?.data?.message || 'Failed to update availability');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="px-4 py-4 pb-safe-nav mx-auto max-w-7xl sm:px-6 sm:pt-8 lg:px-8">
        {/* Welcome Section */}
        <div className="p-4 mb-6 text-white bg-gradient-to-r rounded-xl from-primary to-secondary sm:p-6 sm:mb-8">
          <h1 className="mb-1 text-xl font-bold sm:mb-2 sm:text-3xl">
            Welcome, {deliveryBoy?.name}! 👋
          </h1>
          <p className="text-sm text-white/80 sm:text-base">Ready to start delivering?</p>
        </div>

        {/* Status Controls */}
        <div className="grid grid-cols-1 gap-4 mb-6 sm:gap-6 sm:mb-8 md:grid-cols-2">
          <div className="p-4 bg-white rounded-xl shadow sm:p-6">
            <h3 className="mb-3 text-base font-semibold text-gray-800 sm:mb-4 sm:text-lg">Online Status</h3>
            <div className="flex justify-between items-center gap-3">
              <div className="min-w-0">
                <p className="mb-0.5 text-sm text-gray-600 truncate">
                  {deliveryBoy?.isOnline ? 'You are currently online' : 'Currently offline'}
                </p>
                <p className="text-xs text-gray-500">
                  {deliveryBoy?.isOnline ? 'Receiving orders' : 'Go online to receive orders'}
                </p>
              </div>
              <button
                onClick={handleToggleOnline}
                className={`flex-shrink-0 min-w-[100px] min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium transition sm:px-6 ${
                  deliveryBoy?.isOnline
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {deliveryBoy?.isOnline ? 'Go Offline' : 'Go Online'}
              </button>
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl shadow sm:p-6">
            <h3 className="mb-3 text-base font-semibold text-gray-800 sm:mb-4 sm:text-lg">Availability</h3>
            <div className="flex justify-between items-center gap-3">
              <div className="min-w-0">
                <p className="mb-0.5 text-sm text-gray-600 truncate">
                  {deliveryBoy?.isAvailable ? 'Available for orders' : 'Not available'}
                </p>
                <p className="text-xs text-gray-500">
                  {deliveryBoy?.isAvailable ? 'Can accept new orders' : 'Cannot accept new orders'}
                </p>
              </div>
              <button
                onClick={handleToggleAvailability}
                disabled={!deliveryBoy?.isOnline}
                className={`flex-shrink-0 min-w-[100px] min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed sm:px-6 ${
                  deliveryBoy?.isAvailable
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {deliveryBoy?.isAvailable ? 'Unavailable' : 'Available'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid — 2×2 on mobile, 4 columns on large screens */}
        <div className="grid grid-cols-2 gap-3 mb-6 sm:gap-6 sm:mb-8 lg:grid-cols-4">
          <div className="p-3 bg-white rounded-xl shadow sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
              <div className="min-w-0">
                <p className="mb-1 text-xs text-gray-600 sm:text-sm">Total Earnings</p>
                <p className="text-base font-bold text-gray-800 truncate sm:text-3xl">₹{earnings?.totalEarnings || 0}</p>
              </div>
              <div className="self-end p-2 bg-green-100 rounded-full sm:self-auto sm:p-3">
                <CurrencyRupeeIcon className="w-4 h-4 text-green-600 sm:w-8 sm:h-8" />
              </div>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl shadow sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
              <div className="min-w-0">
                <p className="mb-1 text-xs text-gray-600 sm:text-sm">Completed</p>
                <p className="text-base font-bold text-gray-800 truncate sm:text-3xl">{earnings?.completedOrders || 0}</p>
              </div>
              <div className="self-end p-2 bg-blue-100 rounded-full sm:self-auto sm:p-3">
                <CheckCircleIcon className="w-4 h-4 text-blue-600 sm:w-8 sm:h-8" />
              </div>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl shadow sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
              <div className="min-w-0">
                <p className="mb-1 text-xs text-gray-600 sm:text-sm">Avg./Order</p>
                <p className="text-base font-bold text-gray-800 truncate sm:text-3xl">₹{earnings?.averageEarningsPerOrder || 0}</p>
              </div>
              <div className="self-end p-2 bg-purple-100 rounded-full sm:self-auto sm:p-3">
                <TruckIcon className="w-4 h-4 text-purple-600 sm:w-8 sm:h-8" />
              </div>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl shadow sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
              <div className="min-w-0">
                <p className="mb-1 text-xs text-gray-600 sm:text-sm">Rating</p>
                <p className="text-base font-bold text-gray-800 truncate sm:text-3xl">{earnings?.rating || 5.0}</p>
              </div>
              <div className="self-end p-2 bg-yellow-100 rounded-full sm:self-auto sm:p-3">
                <StarIcon className="w-4 h-4 text-yellow-600 sm:w-8 sm:h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-3">
          <button
            onClick={() => navigate('/orders/available')}
            className="p-4 text-left bg-white rounded-xl shadow transition active:scale-95 hover:shadow-lg sm:p-6"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:mb-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <TruckIcon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800 sm:text-lg">Available Orders</h3>
            </div>
            <p className="hidden text-xs text-gray-600 sm:block sm:text-sm">View and accept available delivery orders</p>
          </button>

          <button
            onClick={() => navigate('/orders/active')}
            className="p-4 text-left bg-white rounded-xl shadow transition active:scale-95 hover:shadow-lg sm:p-6"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:mb-4">
              <div className="p-2 bg-green-100 rounded-full">
                <ClockIcon className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800 sm:text-lg">Active Delivery</h3>
            </div>
            <p className="hidden text-xs text-gray-600 sm:block sm:text-sm">Track your current delivery</p>
          </button>

          <button
            onClick={() => navigate('/history')}
            className="col-span-2 p-4 text-left bg-white rounded-xl shadow transition active:scale-95 hover:shadow-lg sm:col-span-1 sm:p-6"
          >
            <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-0 sm:mb-4">
              <div className="p-2 bg-blue-100 rounded-full sm:mb-2">
                <CheckCircleIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800 sm:text-lg">History</h3>
                <p className="text-xs text-gray-600 sm:hidden">View your delivery history</p>
              </div>
            </div>
            <p className="hidden text-xs text-gray-600 sm:block sm:text-sm">View your delivery history</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
