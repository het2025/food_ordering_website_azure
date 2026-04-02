import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  BarChart3,
  Users,
  ShoppingCart,
  Download,
  TrendingUp,
  TrendingDown,
  X,
  Edit,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Search,
  Plus,
  Bell
} from 'lucide-react';

import {
  getDashboardStats,
  getRestaurantOwnerOrders,
  getCurrentRestaurantOwner
} from '../../api/restaurantOwnerApi';
import { io } from 'socket.io-client';
import RestaurantAnalyticsTab from './RestaurantAnalyticsTab';

function RestaurantOwnerDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showNewOrder, setShowNewOrder] = useState(false);

  const [ordersData, setOrdersData] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newOrderNotification, setNewOrderNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const notificationTimeoutRef = useRef(null);

  // Play notification sound using Web Audio API
  const playNotificationSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const playTone = (freq, startTime, duration) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      const now = audioCtx.currentTime;
      playTone(880, now, 0.15);
      playTone(1100, now + 0.15, 0.15);
      playTone(1320, now + 0.3, 0.25);
    } catch (e) { /* silent */ }
  }, []);

  const showOrderNotification = useCallback((msg = '🔔 New order received!') => {
    setNewOrderNotification(true);
    setNotificationMessage(msg);
    playNotificationSound();
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('QuickBite - New Order!', { body: msg, icon: '/quickbite_logo.svg' });
    }
    if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    notificationTimeoutRef.current = setTimeout(() => {
      setNewOrderNotification(false);
      setNotificationMessage('');
    }, 8000);
  }, [playNotificationSound]);

  const [newOrderForm, setNewOrderForm] = useState({
    customerName: '',
    dish: '',
    quantity: 1,
    specialInstructions: ''
  });
  // Request browser notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Load data
  useEffect(() => {
    const fetchDashboardData = async (isSilent = false) => {
      try {
        if (!isSilent) {
          setLoading(true);
          setError('');
        }

        const [statsRes, ordersRes] = await Promise.all([
          getDashboardStats().catch(() => ({ success: false })),
          getRestaurantOwnerOrders().catch(() => ({ success: false }))
        ]);

        if (statsRes.success && statsRes.data) {
          setDashboardStats(statsRes.data);
        }

        if (ordersRes.success) {
          const orders = ordersRes.data?.orders || (Array.isArray(ordersRes.data) ? ordersRes.data : []);
          setOrdersData(orders);
        }
      } catch (err) {
        if (!isSilent) {
          console.error('Dashboard data load error:', err);
          setError(err.message || 'Failed to load dashboard data');
        }
      } finally {
        if (!isSilent) setLoading(false);
      }
    };

    let socket = null;

    const setupSocket = async () => {
      try {
        const profileRes = await getCurrentRestaurantOwner();
        if (profileRes.success && profileRes.data && profileRes.data.restaurantId) {
          const restaurantId = profileRes.data.restaurantId;
            
            if (!import.meta.env.VITE_SOCKET_URL) {
              console.error('VITE_SOCKET_URL is not defined');
              return;
            }

            socket = io(import.meta.env.VITE_SOCKET_URL, {
              withCredentials: true,
              transports: ['websocket', 'polling'],
              reconnection: true,
              reconnectionAttempts: 5,
              reconnectionDelay: 1000,
            });

            socket.on('connect', () => {
              socket.emit('join_restaurant', restaurantId);
            });

            socket.on('connect_error', (err) => {
              console.error('Socket connection error:', err.message);
          });
          socket.on('new_order', (newOrder) => {
            showOrderNotification('🔔 New order just placed!');
            fetchDashboardData(true);
          });
        }
      } catch (err) {
        console.error('Socket setup error:', err);
      }
    };

    // Initial load and socket connect
    fetchDashboardData();
    setupSocket();

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  // Map orders for UI, always deducting ₹30 for delivery
  const mapOrder = (order) => {
    const id = order.orderNumber || order.orderId || `#${(order._id || '').toString().slice(-6) || 'ORDER'}`;
    // ✅ FIXED: Handle undefined/null customer name robustly
    let customer = "Customer";
    if (order.customerName && order.customerName !== 'undefined') {
      customer = order.customerName;
    } else if (order.user?.name) {
      customer = order.user.name;
    } else if (order.customer?.name) {
      customer = order.customer.name;
    }
    const itemsText = Array.isArray(order.items)
      ? order.items.map((item) => {
        const qty = item.quantity || item.qty || 1;
        const name = item.name || item.title || item.itemName || 'Item';
        return `${qty}x ${name}`;
      }).join(', ')
      : '—';
    const status = order.status || order.orderStatus || order.deliveryStatus || 'Pending';
    const created = order.createdAt || order.placedAt || order.created_on || null;
    let time = '';
    if (created) {
      time = new Date(created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    // Deduct delivery charge from every order
    const deliveryCharge = 30;
    const rawTotal = Number(order.totalAmount) || Number(order.total) || Number(order.finalAmount) || Number(order.amount) || 0;
    const netAmount = Math.max(rawTotal - deliveryCharge, 0);
    return {
      backendId: order._id?.toString() || '',
      id,
      customer,
      itemsText,
      status,
      time,
      createdAt: created,
      numericTotal: netAmount // <== always use this!
    };
  };

  // Group orders by day
  const groupOrdersByDay = (orders) => {
    const grouped = {};
    orders.forEach(order => {
      const orderDate = order.createdAt;
      if (!orderDate) return;
      const date = new Date(orderDate);
      const dateKey = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          fullDate: date,
          orders: [],
          totalOrders: 0,
          totalRevenue: 0
        };
      }
      grouped[dateKey].orders.push(order);
      grouped[dateKey].totalOrders += 1;
      grouped[dateKey].totalRevenue += order.numericTotal || 0; // <== uses net!
    });
    return Object.values(grouped).sort((a, b) => b.fullDate - a.fullDate);
  };

  // Use mapped orders everywhere for display and calculation
  const mappedOrders = ordersData.map(mapOrder);

  // Stats
  const totalOrders = mappedOrders.length;

  // Pending: Only truly pending orders (Pending, Placed, Accepted, Preparing)
  const pendingOrders = mappedOrders.filter(o => {
    const status = (o.status || '').toLowerCase();
    return status === 'pending' || status === 'placed' || status === 'accepted' || status === 'preparing';
  }).length;

  // Completed: Ready, Delivered, Completed, OutForDelivery
  const completedOrders = mappedOrders.filter(o => {
    const status = (o.status || '').toLowerCase();
    return status === 'delivered' || status === 'completed' || status === 'outfordelivery' || status === 'ready';
  }).length;

  const totalRevenue = mappedOrders.reduce((sum, order) => sum + (order.numericTotal || 0), 0); // <== uses net!
  const totalCustomers = (() => {
    const uniqueCustomers = new Set();
    ordersData.forEach(order => {
      const customerId =
        order.customer?._id?.toString() ||
        order.customer?.toString() ||
        order.customerPhone ||
        order.customerName ||
        order.user?.email ||
        order.user?._id?.toString() ||
        null;
      if (customerId && customerId.trim() !== '') {
        uniqueCustomers.add(customerId);
      }
    });
    return uniqueCustomers.size;
  })();
  const stats = [
    { label: "Total Orders", value: String(totalOrders), icon: ShoppingCart, change: 0 },
    { label: 'Total Customers', value: String(totalCustomers), icon: Users, change: 0 },
    { label: 'Completed Orders', value: String(completedOrders), icon: CheckCircle, change: 0 },
    {
      label: 'Total Revenue', value: totalRevenue > 0
        ? `₹${totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
        : '₹0', icon: BarChart3, change: 0
    }
  ];
  const ordersByDay = groupOrdersByDay(mappedOrders);

  // Order status helpers
  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered' || s === 'completed') return 'bg-green-100 text-green-800';
    if (s === 'pending' || s === 'placed') return 'bg-yellow-100 text-yellow-800';
    if (s === 'processing' || s === 'preparing') return 'bg-blue-100 text-blue-800';
    if (s === 'cancelled' || s === 'rejected') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };
  const getStatusIcon = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered' || s === 'completed') return CheckCircle;
    if (s === 'pending' || s === 'placed') return Clock;
    if (s === 'cancelled' || s === 'rejected') return AlertCircle;
    return Clock;
  };

  // Order form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOrderForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleNewOrderSubmit = (e) => {
    e.preventDefault();
    setShowNewOrder(false);
    setNewOrderForm({ customerName: '', dish: '', quantity: 1, specialInstructions: '' });
  };

  // Tabs
  const OverviewTab = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;
          return (
            <div key={stat.label} className="p-3 sm:p-4 bg-white border border-gray-100 shadow-sm rounded-xl">
              <div className="flex flex-col h-full">
                <div className="flex justify-end mb-2">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-orange-50">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                  </div>
                </div>
                <div className="flex flex-col justify-end flex-grow">
                  <p className="mb-1 text-xs sm:text-sm text-gray-600 leading-tight">{stat.label}</p>
                  <h3 className="text-lg sm:text-2xl font-bold leading-none truncate">{stat.value}</h3>
                </div>
                {stat.change !== 0 && (
                  <div className={`flex items-center mt-2 text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? (
                      <TrendingUp size={14} className="mr-1" />
                    ) : (
                      <TrendingDown size={14} className="mr-1" />
                    )}
                    {isPositive ? '+' : ''}
                    {stat.change}%
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Orders Per Day */}
      <div className="p-3 sm:p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h2 className="text-base sm:text-lg font-semibold">Orders</h2>
          <button onClick={() => setActiveTab('orders')} className="text-xs sm:text-sm text-orange-600 hover:text-orange-700">
            View All
          </button>
        </div>
        <div className="space-y-4">
          {ordersByDay.length === 0 && (
            <p className="py-8 text-sm text-center text-gray-500">
              No orders yet
            </p>
          )}
          {ordersByDay.slice(0, 7).map((dayData, idx) => {
            const isToday = new Date(dayData.fullDate).toDateString() === new Date().toDateString();
            return (
              <div key={idx} className={`p-3 sm:p-4 rounded-lg border transition-all ${isToday ? 'bg-orange-50 border-orange-300' : 'border-gray-200 hover:bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base text-gray-800">{isToday ? '📅 Today' : dayData.date}</h3>
                    <p className="text-xs text-gray-600">{dayData.totalOrders} {dayData.totalOrders === 1 ? 'order' : 'orders'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base sm:text-lg font-bold text-orange-600">
                      ₹{dayData.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                </div>
                <div className="pt-2 sm:pt-3 space-y-1.5 sm:space-y-2 border-t border-gray-200">
                  {dayData.orders.slice(0, 3).map((order, orderIdx) => {
                    const StatusIcon = getStatusIcon(order.status);
                    return (
                      <div key={orderIdx} className="flex items-center justify-between text-sm gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <StatusIcon size={14} className={`flex-shrink-0 ${
                            order.status.toLowerCase() === 'pending'
                              ? 'text-yellow-600'
                              : order.status.toLowerCase() === 'completed' || order.status.toLowerCase() === 'delivered'
                                ? 'text-green-600'
                                : 'text-blue-600'
                          }`} />
                          <span className="text-gray-700 truncate max-w-[80px] sm:max-w-none">{order.id}</span>
                          <span className="text-gray-500 hidden sm:inline">•</span>
                          <span className="text-gray-600 truncate hidden sm:block max-w-[120px] md:max-w-none">{order.customer}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className={`px-1.5 py-0.5 text-xs rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                          <span className="font-medium text-gray-700 text-xs sm:text-sm">
                            ₹{order.numericTotal.toFixed(0)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {dayData.orders.length > 3 && (
                    <button onClick={() => setActiveTab('orders')} className="w-full pt-2 text-xs text-orange-600 hover:text-orange-700">
                      +{dayData.orders.length - 3} more orders
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {ordersByDay.length > 7 && (
          <div className="mt-4 text-center">
            <button onClick={() => setActiveTab('orders')} className="px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700">
              View older orders →
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Orders table uses `mappedOrders`
  const OrdersTab = () => (
    <div className="bg-white border border-gray-100 shadow-sm rounded-xl">
      <div className="flex flex-col items-start justify-between gap-4 p-4 sm:p-5 border-b border-gray-200 sm:flex-row sm:items-center">
        <h2 className="text-lg font-semibold">All Orders ({totalOrders})</h2>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden divide-y divide-gray-100">
        {mappedOrders.length === 0 && (
          <p className="py-8 text-sm text-center text-gray-500">No orders found</p>
        )}
        {mappedOrders.map((order) => {
          const StatusIcon = getStatusIcon(order.status);
          return (
            <div key={order.backendId} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">{order.id}</p>
                  <p className="text-xs text-gray-500">{order.time}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)} flex items-center gap-1 flex-shrink-0`}>
                  <StatusIcon size={11} />
                  {order.status}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Users size={14} className="text-gray-400 flex-shrink-0" />
                <span className="truncate">{order.customer}</span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2">{order.itemsText}</p>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">₹{order.numericTotal.toFixed(2)}</span>
                <div className="flex items-center gap-2">
                  <button className="p-2.5 text-blue-600 rounded-lg hover:bg-blue-50 active:bg-blue-100"><Eye size={16} /></button>
                  <button className="p-2.5 text-orange-600 rounded-lg hover:bg-orange-50 active:bg-orange-100"><Edit size={16} /></button>
                  <button className="p-2.5 text-red-600 rounded-lg hover:bg-red-50 active:bg-red-100"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Order ID
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Customer
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Items
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Total
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mappedOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-sm text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            )}
            {mappedOrders.map((order) => {
              const StatusIcon = getStatusIcon(order.status);
              return (
                <tr key={order.backendId} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{order.id}</div>
                    <div className="text-xs text-gray-500">{order.time}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-400" />
                      {order.customer}
                    </div>
                  </td>
                  <td className="max-w-xs px-4 py-3 truncate">{order.itemsText}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)} flex items-center gap-1 w-fit`}>
                      <StatusIcon size={12} />
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">
                      ₹{order.numericTotal.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-blue-600 rounded-lg hover:bg-blue-50">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-orange-600 rounded-lg hover:bg-orange-50">
                        <Edit size={16} />
                      </button>
                      <button className="p-2 text-red-600 rounded-lg hover:bg-red-50">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between p-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Showing {mappedOrders.length} of {totalOrders} orders
        </p>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'orders':
        return <OrdersTab />;
      case 'analytics':
        return <RestaurantAnalyticsTab />;
      default:
        return <OverviewTab />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-orange-500 rounded-full animate-spin border-t-transparent" />
      </div>
    );
  }
  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-8 bg-gray-50 relative">
      {/* New Order Notification Banner */}
      {newOrderNotification && (
        <div className="fixed top-4 right-4 z-[9999] animate-bounce">
          <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl shadow-2xl border border-orange-300">
            <Bell className="w-6 h-6" />
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
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-3 mb-5 sm:mb-8 md:flex-row md:items-center">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 shadow-lg bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex-shrink-0">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
              QB - Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              Welcome back! Here's what's happening today
            </p>
          </div>
        </div>
      </div>
      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 mb-4 text-sm text-red-700 rounded-lg bg-red-50">
          {error}
        </div>
      )}
      {/* Tab Buttons */}
      <div className="flex gap-1 p-1 mb-5 sm:mb-8 bg-white shadow-sm rounded-xl">
        {['overview', 'orders', 'analytics'].map((tab) => (
          <button
            key={tab}
            className={`flex-1 px-2 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab
              ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
              : 'text-gray-600 hover:text-gray-900'
              }`}
            onClick={() => setActiveTab(tab)}
          >
            <span className="capitalize">{tab}</span>
          </button>
        ))}
      </div>
      {/* Tab Contents */}
      {renderTabContent()}
      {/* New Order Modal */}
      {showNewOrder && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/40"
          onClick={() => setShowNewOrder(false)}
        >
          <div
            className="w-full sm:max-w-md p-5 sm:p-6 bg-white shadow-xl rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Create New Order</h2>
              <button onClick={() => setShowNewOrder(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleNewOrderSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Customer Name
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={newOrderForm.customerName}
                  onChange={handleInputChange}
                  placeholder="Enter customer name"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Dish
                </label>
                <input
                  type="text"
                  name="dish"
                  value={newOrderForm.dish}
                  onChange={handleInputChange}
                  placeholder="Enter dish name"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={newOrderForm.quantity}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Special Instructions
                </label>
                <textarea
                  name="specialInstructions"
                  value={newOrderForm.specialInstructions}
                  onChange={handleInputChange}
                  placeholder="Any special instructions..."
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  className="flex-1 sm:flex-none px-4 py-2.5 text-sm text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300"
                  onClick={() => setShowNewOrder(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-4 py-2.5 text-sm text-white bg-orange-600 rounded-lg hover:bg-orange-700"
                >
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RestaurantOwnerDashboardPage;
