import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../api/axiosInstance';
import Header from '../components/Header';
import {
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  XMarkIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const ActiveDelivery = () => {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otp, setOtp] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    fetchCurrentOrder();
  }, []);

  useEffect(() => {
    // Check if browser supports geolocation
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      console.error('Geolocation is not supported by this browser');
      return;
    }

    let watchId = null;

    const startTracking = () => {
      setLocationError(null);
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;

          console.log('Location update:', { latitude, longitude, accuracy });

          try {
            // Send location to backend via API
            await ordersAPI.updateLocation(latitude, longitude);
          } catch (error) {
            console.error('Failed to send location update:', error);
          }
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setLocationError('Location permission denied. Tracking is disabled.');
              console.error('Location permission denied by user');
              break;
            case error.POSITION_UNAVAILABLE:
              setLocationError('Location information is unavailable');
              console.error('Location information is unavailable');
              break;
            case error.TIMEOUT:
              setLocationError('Location request timed out');
              console.error('Location request timed out');
              break;
            default:
              setLocationError('Unknown geolocation error');
              console.error('Unknown geolocation error:', error);
          }
        },
        {
          enableHighAccuracy: true,   // use GPS if available
          maximumAge: 10000,          // accept cached position up to 10 seconds old
          timeout: 15000              // wait up to 15 seconds for position
        }
      );
    };

    // Only track if there is an active order
    if (order && (order.status === 'accepted' || order.status === 'picked_up' || order.status === 'in_transit')) {
      startTracking();
    }

    // Cleanup: stop watching when component unmounts or order ends
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        console.log('Geolocation tracking stopped');
      }
    };
  }, [order]);

  const fetchCurrentOrder = async () => {
    try {
      const response = await ordersAPI.getCurrent();
      if (response.data.success) {
        setOrder(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching current order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePickup = async () => {
    if (!confirm('Confirm that you have picked up the order from the restaurant?')) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await ordersAPI.pickup(order._id);
      if (response.data.success) {
        alert('Order picked up! Now heading to customer.');
        await handleStartTransit();
      }
    } catch (error) {
      console.error('Error picking up order:', error);
      alert('Failed to confirm pickup');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartTransit = async () => {
    try {
      const response = await ordersAPI.startTransit(order._id);
      if (response.data.success) {
        fetchCurrentOrder();
      }
    } catch (error) {
      console.error('Error starting transit:', error);
    }
  };

  // Open OTP modal when clicking Complete Delivery
  const openOtpModal = () => {
    setOtp('');
    setOtpError('');
    setShowOtpModal(true);
  };

  // Handle OTP submission from modal
  const handleComplete = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError('Please enter the 6-digit delivery OTP');
      return;
    }

    try {
      setActionLoading(true);
      setOtpError('');
      const response = await ordersAPI.complete(order._id, otp);
      if (response.data.success) {
        setShowOtpModal(false);
        alert(`Order delivered successfully! You earned ₹${response.data.data.earnings}`);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error completing delivery:', error);
      const errorMsg = error.response?.data?.message || 'Failed to complete delivery';
      if (errorMsg.toLowerCase().includes('otp') || errorMsg.toLowerCase().includes('invalid')) {
        setOtpError('Invalid OTP. Please check with the customer.');
      } else {
        setOtpError(errorMsg);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'accepted':
        return {
          text: 'Head to Restaurant',
          color: 'bg-blue-100 text-blue-800',
          action: 'pickup'
        };
      case 'picked_up':
      case 'in_transit':
        return {
          text: 'Out for Delivery',
          color: 'bg-purple-100 text-purple-800',
          action: 'complete'
        };
      default:
        return {
          text: status,
          color: 'bg-gray-100 text-gray-800',
          action: null
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 rounded-full border-b-2 animate-spin border-primary"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="px-4 py-4 pb-safe-nav mx-auto max-w-7xl sm:px-6 sm:pt-8 lg:px-8">
          <div className="p-8 text-center bg-white rounded-xl shadow sm:p-12">
            <TruckIcon className="mx-auto mb-4 w-12 h-12 text-gray-400 sm:w-16 sm:h-16" />
            <h3 className="mb-2 text-lg font-semibold text-gray-800 sm:text-xl">No Active Delivery</h3>
            <p className="mb-6 text-sm text-gray-600 sm:text-base">You don't have any active delivery at the moment</p>
            <button
              onClick={() => navigate('/orders/available')}
              className="px-6 py-3 min-h-[48px] text-white rounded-xl transition bg-primary hover:bg-opacity-90 active:scale-95"
            >
              View Available Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="px-4 py-4 pb-safe-nav mx-auto max-w-4xl sm:px-6 sm:pt-8 lg:px-8">
        {/* Tracking Indicator */}
        {(order.status === 'accepted' || order.status === 'picked_up' || order.status === 'in_transit') && !locationError && (
          <div className="mb-4 text-xs font-medium text-green-700 bg-green-50 p-3 rounded-lg flex items-center justify-center shadow-sm text-center">
            <span>📍 Live location tracking is active</span>
          </div>
        )}
        
        {locationError && (
          <div className="mb-4 text-xs font-medium text-red-700 bg-red-50 p-3 rounded-lg flex items-center justify-center shadow-sm text-center">
            <span>⚠️ {locationError}</span>
          </div>
        )}

        <div className="p-4 mb-4 bg-white rounded-xl shadow sm:p-6 sm:mb-6">
          <div className="flex flex-wrap justify-between items-start gap-2">
            <div>
              <h1 className="mb-1 text-xl font-bold text-gray-800 sm:text-2xl sm:mb-2">Active Delivery</h1>
              <p className="text-sm text-gray-600">Order #{order.orderNumber}</p>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold sm:px-4 sm:py-2 sm:text-sm ${statusInfo.color}`}>
              {statusInfo.text}
            </span>
          </div>
        </div>

        {/* Restaurant Details */}
        <div className="p-4 mb-4 bg-white rounded-xl shadow sm:p-6 sm:mb-6">
          <div className="flex items-center mb-3 sm:mb-4">
            <div className="flex flex-shrink-0 justify-center items-center w-10 h-10 bg-green-100 rounded-full sm:w-12 sm:h-12">
              <MapPinIcon className="w-5 h-5 text-green-600 sm:w-6 sm:h-6" />
            </div>
            <div className="ml-3 sm:ml-4">
              <h3 className="text-base font-semibold text-gray-800 sm:text-lg">Pickup Location</h3>
              <p className="text-xs text-gray-600 sm:text-sm">{order.restaurantName}</p>
            </div>
          </div>
          <p className="text-sm text-gray-700">{order.restaurantLocation?.address}</p>
        </div>

        {/* Customer Details */}
        <div className="p-4 mb-4 bg-white rounded-xl shadow sm:p-6 sm:mb-6">
          <div className="flex items-center mb-3 sm:mb-4">
            <div className="flex flex-shrink-0 justify-center items-center w-10 h-10 bg-red-100 rounded-full sm:w-12 sm:h-12">
              <MapPinIcon className="w-5 h-5 text-red-600 sm:w-6 sm:h-6" />
            </div>
            <div className="flex-1 ml-3 sm:ml-4">
              <h3 className="text-base font-semibold text-gray-800 sm:text-lg">Delivery Location</h3>
              <p className="text-xs text-gray-600 sm:text-sm">{order.customerName}</p>
            </div>
            <a
              href={`tel:${order.customerPhone}`}
              className="p-2.5 bg-blue-100 rounded-full transition hover:bg-blue-200 active:scale-95"
              aria-label="Call customer"
            >
              <PhoneIcon className="w-5 h-5 text-blue-600" />
            </a>
          </div>
          <p className="text-sm text-gray-700">
            {order.deliveryAddress?.street}, {order.deliveryAddress?.area}, {order.deliveryAddress?.city}
          </p>
        </div>

        {/* Order Details */}
        <div className="p-4 mb-4 bg-white rounded-xl shadow sm:p-6 sm:mb-6">
          <h3 className="mb-3 text-base font-semibold text-gray-800 sm:mb-4 sm:text-lg">Order Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Order Amount</span>
              <span className="font-semibold text-gray-800">₹{order.orderAmount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="font-semibold text-green-600">₹{order.deliveryFee}</span>
            </div>
            {order.distance && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Distance</span>
                <span className="font-semibold text-gray-800">{order.distance} km</span>
              </div>
            )}
            <div className="flex justify-between pt-3 text-sm border-t">
              <span className="text-gray-600">Payment</span>
              <span className="font-semibold text-gray-800">
                {order.paymentMethod === 'online' ? 'Paid Online' : 'Cash on Delivery'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-white rounded-xl shadow sm:p-6">
          {statusInfo.action === 'pickup' && (
            <button
              onClick={handlePickup}
              disabled={actionLoading}
              className="py-3.5 w-full font-semibold text-white bg-green-600 rounded-xl transition hover:bg-green-700 active:scale-95 disabled:opacity-50 sm:py-3"
            >
              {actionLoading ? 'Processing...' : 'Confirm Pickup from Restaurant'}
            </button>
          )}

          {statusInfo.action === 'complete' && (
            <button
              onClick={openOtpModal}
              disabled={actionLoading}
              className="flex justify-center items-center py-3.5 w-full font-semibold text-white rounded-xl transition bg-primary hover:bg-opacity-90 active:scale-95 disabled:opacity-50 sm:py-3"
            >
              <CheckCircleIcon className="mr-2 w-6 h-6" />
              Complete Delivery
            </button>
          )}
        </div>

        {/* Timer */}
        {order.acceptedAt && (
          <div className="mt-4 text-center sm:mt-6">
            <div className="inline-flex items-center text-gray-600">
              <ClockIcon className="mr-2 w-5 h-5" />
              <span className="text-sm">
                Started {new Date(order.acceptedAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b sm:p-6">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-bold text-gray-800 sm:text-xl">Enter Delivery OTP</h3>
              </div>
              <button
                onClick={() => setShowOtpModal(false)}
                className="p-2 rounded-full transition hover:bg-gray-100"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6">
              <p className="mb-4 text-sm text-center text-gray-600 sm:text-base">
                Ask the customer for the 6-digit OTP to confirm delivery
              </p>

              {/* OTP Input */}
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                enterKeyHint="done"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setOtpError('');
                }}
                placeholder="• • • • • •"
                maxLength={6}
                className={`px-4 py-4 w-full text-3xl tracking-[0.4em] text-center rounded-xl border-2 outline-none transition ${
                  otpError
                    ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                    : 'border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary'
                }`}
                autoFocus
              />

              {/* Error Message */}
              {otpError && (
                <p className="mt-3 text-sm font-medium text-center text-red-500">
                  {otpError}
                </p>
              )}

              {/* Submit Button */}
              <button
                onClick={handleComplete}
                disabled={actionLoading || otp.length !== 6}
                className="flex justify-center items-center py-3.5 mt-6 w-full font-semibold text-white rounded-xl transition bg-primary hover:bg-opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircleIcon className="mr-2 w-6 h-6" />
                {actionLoading ? 'Verifying...' : 'Confirm Delivery'}
              </button>

              <p className="mt-4 text-xs text-center text-gray-500">
                OTP ensures secure delivery confirmation
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveDelivery;
