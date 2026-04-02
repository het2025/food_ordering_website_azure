import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  ClipboardList, CheckCircle, Clock, XCircle, IndianRupee, X,
  MapPin, User, Phone, Package, Bell
} from 'lucide-react';
import { io } from 'socket.io-client';
import {
  getRestaurantOwnerOrders,
  updateRestaurantOwnerOrderStatus,
  getRestaurantOwnerOrderById,
  getCurrentRestaurantOwner
} from '../../api/restaurantOwnerApi';

function RestaurantOwnerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendError, setBackendError] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [newOrderNotification, setNewOrderNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const notificationTimeoutRef = useRef(null);

  // Play notification sound using Web Audio API (no external files needed)
  const playNotificationSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      // Play a pleasant two-tone chime
      const playTone = (freq, startTime, duration) => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };
      const now = audioCtx.currentTime;
      playTone(880, now, 0.15);       // A5
      playTone(1100, now + 0.15, 0.15); // C#6
      playTone(1320, now + 0.3, 0.25);  // E6
    } catch (e) {
      // Silently fail if audio is not available
    }
  }, []);

  const showOrderNotification = useCallback((message = '🔔 New order received!') => {
    setNewOrderNotification(true);
    setNotificationMessage(message);
    playNotificationSound();
    // Also try browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('QuickBite - New Order!', { body: message, icon: '/quickbite_logo.svg' });
    }
    if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    notificationTimeoutRef.current = setTimeout(() => {
      setNewOrderNotification(false);
      setNotificationMessage('');
    }, 8000);
  }, [playNotificationSound]);

  // ✅ FIXED: Added 'OutForDelivery' and 'Delivered' for display purposes
  const allowedStatuses = [
    'Pending', 'Accepted', 'Preparing', 'Ready', 'OutForDelivery', 'Delivered', 'Cancelled'
  ];

  // ✅ FIXED: Removed 'OutForDelivery' from timeline
  const statusTimeline = [
    { key: 'Pending', label: 'Order Placed', icon: ClipboardList },
    { key: 'Accepted', label: 'Accepted', icon: CheckCircle },
    { key: 'Preparing', label: 'Preparing', icon: Clock },
    { key: 'Ready', label: 'Ready (Final)', icon: Package }
  ];

  // UPDATED: always subtract ₹30 from all total calculations
  const mapOrderFromBackend = (order) => {
    const id = order.orderNumber || order.orderId || order._id || order.id || "Unknown";
    // ✅ FIXED: Handle undefined/null customer name robustly
    let customer = "Customer";
    if (order.customerName && order.customerName !== 'undefined') {
      customer = order.customerName;
    } else if (order.user?.name) {
      customer = order.user.name;
    } else if (order.customer?.name) {
      customer = order.customer.name;
    }
    let itemsText = '—';
    if (Array.isArray(order.items) && order.items.length > 0) {
      itemsText = order.items
        .map((item) => {
          const qty = item.quantity || item.qty || 1;
          const name = item.name || item.title || item.itemName || 'Item';
          return `${qty}x ${name}`;
        })
        .join(', ');
    }
    const status = order.status || order.orderStatus || order.deliveryStatus || 'Pending';
    const created = order.createdAt || order.placedAt || order.created_on || null;
    let time = '';
    if (created) {
      time = new Date(created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    // YOUR ACTUAL REVENUE = Dish Price + Taxes
    // If backend provides explicit breakdown, use it. Otherwise fallback to Total - Delivery.
    let netAmount;
    if (order.subtotal !== undefined && order.taxes !== undefined) {
      netAmount = Number(order.subtotal) + Number(order.taxes);
    } else {
      const deliveryCharge = order.deliveryFee !== undefined ? Number(order.deliveryFee) : 30;
      const rawTotal = Number(order.totalAmount) || Number(order.total) || 0;
      netAmount = Math.max(rawTotal - deliveryCharge, 0);
    }

    return {
      backendId: order._id?.toString() || '',
      id,
      customer,
      items: itemsText,
      status,
      time,
      netAmount // 👈 use ONLY this everywhere below!
    };
  };

  // Only use netAmount for all calculations and displays!
  const computeSummary = (mappedOrders) => {
    const totalOrders = mappedOrders.length;
    const completed = mappedOrders.filter((o) =>
      ['OutForDelivery', 'Delivered'].includes(o.status)
    ).length;
    const cancelled = mappedOrders.filter(
      (o) => o.status === 'Cancelled'
    ).length;
    const pending = totalOrders - completed - cancelled;
    return { totalOrders, pending, completed, cancelled };
  };

  // Revenue sum, using ONLY netAmount!
  const computeTodayRevenue = (mappedOrders) => {
    return mappedOrders.reduce(
      (sum, o) => sum + (o.netAmount || 0), 0
    );
  };


  // Request browser notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    let isFirstLoad = true;
    let socket = null;

    const loadOrders = async () => {
      try {
        if (isFirstLoad) setLoading(true);
        setBackendError('');
        const res = await getRestaurantOwnerOrders();
        if (!res.success) throw new Error(res.message || 'Failed to load orders');
        const data = res.data?.orders || res.data || [];
        const ordersArray = Array.isArray(data) ? data : [];
        const mapped = ordersArray.map(mapOrderFromBackend);

        // New order notification check
        if (!isFirstLoad && orders.length > 0 && mapped.length > orders.length) {
          const newCount = mapped.length - orders.length;
          showOrderNotification(`🔔 ${newCount} new order${newCount > 1 ? 's' : ''} received!`);
        }
        setOrders(mapped);
        isFirstLoad = false;
      } catch (err) {
        setBackendError(err.message || 'Failed to load restaurant owner orders');
      } finally {
        setLoading(false);
      }
    };

    const setupSocket = async () => {
      try {
        // Get current owner to find restaurant ID
        // Note: Ideally, getRestaurantOwnerOrders should return restaurantId or we fetch it separately
        // For now, we'll try to get it from the profile or assume the backend handles the join if we send the token
        // But the backend expects 'join_restaurant' with restaurantId.
        // Let's fetch the profile or orders first to get the ID.

        // Actually, let's just connect. The backend needs restaurantId.
        // We can get it from the first order if available, or fetch profile.
        // Let's fetch profile to be safe.
        const profileRes = await getCurrentRestaurantOwner();
        if (profileRes.success && profileRes.data && profileRes.data.restaurantId) {
          const restaurantId = profileRes.data.restaurantId;
        if (!socket) {
          // Attempt to connect using VITE_SOCKET_URL, fallback to derivation from VITE_API_BASE_URL, or hardcoded render URL
          let socketUrl = import.meta.env.VITE_SOCKET_URL;
          if (!socketUrl) {
            const apiBase = import.meta.env.VITE_API_BASE_URL || '';
            if (apiBase.includes('http')) {
              socketUrl = apiBase.replace('/api', '');
            } else {
              socketUrl = import.meta.env.MODE === 'production' 
                ? 'https://restaurant-backend-1mkh.onrender.com'
                : 'http://localhost:5004';
            }
          }

          socket = io(socketUrl, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
          }); // Connect to Restaurant Backend
          
          socket.on('connect', () => {
            console.log('🔌 Connected to Restaurant Backend Socket');
            socket.emit('join_restaurant', restaurantId);
          });

          socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err.message);
          });

          socket.on('new_order', (newOrder) => {
            console.log('🔔 New Order Received via Socket:', newOrder);
            showOrderNotification('🔔 New order just placed!');
            loadOrders(); // Refresh orders immediately
          });

          // Listen to status updates from other sources/devices
          socket.on('order_status_updated', (update) => {
            console.log('🔔 Order Status Updated via Socket:', update);
            setOrders((prev) =>
              prev.map((o) => {
                if (o.backendId === update.orderId || o.id === update.originalOrderId) {
                  return { ...o, status: update.status };
                }
                return o;
              })
            );
          });
          }
        }
      } catch (err) {
        console.error('Socket setup error:', err);
      }
    };

    loadOrders();
    setupSocket();

    // Polling fallback (increased to 60s)
    const intervalId = setInterval(loadOrders, 60000);

    return () => {
      clearInterval(intervalId);
      if (socket) socket.disconnect();
    };
  }, []);

  const handleStatusChange = async (orderBackendId, newStatus) => {
    try {
      setUpdatingOrderId(orderBackendId);
      setBackendError('');
      const res = await updateRestaurantOwnerOrderStatus(orderBackendId, newStatus);
      if (!res || !res.success) {
        throw new Error(res?.message || 'Failed to update order status');
      }
      setOrders((prev) =>
        prev.map((o) => {
          if (o.backendId === orderBackendId) {
            return { ...o, status: newStatus };
          }
          return o;
        })
      );
    } catch (err) {
      setBackendError(err.message || 'Failed to update order status');
      setTimeout(() => { window.location.reload(); }, 1500);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleViewDetails = async (orderBackendId) => {
    try {
      setLoadingDetails(true);
      setShowDetailsModal(true);
      setSelectedOrderDetails(null);
      const res = await getRestaurantOwnerOrderById(orderBackendId);
      if (!res.success) throw new Error(res.message || 'Failed to load order details');
      setSelectedOrderDetails(res.data);
    } catch (err) {
      setBackendError(err.message || 'Failed to load order details');
      setShowDetailsModal(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  const summaryCounts = computeSummary(orders);
  const todayRevenue = computeTodayRevenue(orders);

  const summary = [
    { label: 'Total Orders', value: summaryCounts.totalOrders, icon: <ClipboardList className="text-blue-600" /> },
    { label: 'Pending', value: summaryCounts.pending, icon: <Clock className="text-yellow-500" /> },
    { label: 'Completed', value: summaryCounts.completed, icon: <CheckCircle className="text-green-600" /> },
    { label: 'Cancelled', value: summaryCounts.cancelled, icon: <XCircle className="text-red-500" /> }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 rounded-full border-4 border-orange-500 animate-spin border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 relative">
      {/* New Order Notification Banner */}
      {newOrderNotification && (
        <div className="fixed top-4 right-4 z-[9999] animate-bounce">
          <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl shadow-2xl border border-orange-300">
            <Bell className="w-6 h-6 animate-[wiggle_0.5s_ease-in-out_infinite]" />
            <div>
              <p className="font-bold text-sm">{notificationMessage || 'New Order!'}</p>
              <p className="text-xs opacity-90">Check your orders now</p>
            </div>
            <button
              onClick={() => { setNewOrderNotification(false); setNotificationMessage(''); }}
              className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <h1 className="mb-6 text-3xl font-bold text-gray-800">
        📦 Restaurant Owner Order Management
      </h1>

      {backendError && (
        <div className="px-4 py-2 mb-4 text-sm text-red-700 bg-red-50 rounded-lg">
          {backendError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((card, idx) => (
          <div
            key={idx}
            className="flex items-center p-5 space-x-4 bg-white rounded-xl shadow-md"
          >
            <div className="text-3xl">{card.icon}</div>
            <div>
              <div className="text-xl font-bold">{card.value}</div>
              <div className="text-sm text-gray-500">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Live Orders Table - always use netAmount */}
      <div className="p-6 bg-white rounded-xl shadow-md">
        <h2 id="tour-order-status-filter" className="mb-4 text-xl font-semibold text-gray-800">
          Orders
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="text-gray-600 border-b">
                <th className="px-4 py-2">Order ID</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Items</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Time</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => (
                <tr key={order.backendId + idx} className="border-t">
                  <td className="px-4 py-2 font-medium">{order.id}</td>
                  <td className="px-4 py-2">{order.customer}</td>
                  <td className="px-4 py-2">{order.items}</td>
                  <td className="px-4 py-2">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order.backendId, e.target.value)
                      }
                      disabled={
                        updatingOrderId === order.backendId ||
                        order.status === 'Ready' ||
                        order.status === 'OutForDelivery' ||
                        order.status === 'Delivered' ||
                        order.status === 'Cancelled'
                      }
                      className={`text-xs md:text-sm font-semibold border rounded-lg px-2 py-1 ${order.status === 'Ready'
                        ? 'text-green-600 border-green-300 bg-green-50 cursor-not-allowed'
                        : order.status === 'Delivered'
                          ? 'text-emerald-700 border-emerald-300 bg-emerald-50 cursor-not-allowed'
                          : order.status === 'OutForDelivery'
                            ? 'text-blue-600 border-blue-300 bg-blue-50 cursor-not-allowed'
                            : order.status === 'Cancelled'
                              ? 'text-red-500 border-red-300 bg-red-50 cursor-not-allowed'
                              : 'text-yellow-600 border-yellow-300 bg-yellow-50'
                        }`}
                    >
                      {allowedStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status === 'Ready' ? 'Ready (Final)' : status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 text-gray-500">
                    {order.time || '-'}
                  </td>
                  <td className="px-4 py-2 font-medium">
                    ₹{order.netAmount.toFixed(2)} {/* <== always shows net of delivery */}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleViewDetails(order.backendId)}
                      className="px-3 py-1 text-sm text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 disabled:opacity-50"
                      disabled={loadingDetails}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                    No orders found for this restaurant.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default RestaurantOwnerOrdersPage;
