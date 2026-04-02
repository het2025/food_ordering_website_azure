import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../api/adminApi';
import {
  UsersIcon,
  BuildingStorefrontIcon,
  ShoppingCartIcon,
  CurrencyRupeeIcon,
  ArrowTrendingUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const StatCard = ({ title, value, icon: Icon, color, link }) => (
  <Link to={link} className="block">
    <div className="p-3 transition bg-white rounded-lg shadow sm:p-4 md:p-6 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0 pr-2">
          <p className="mb-1 text-xs text-gray-600 truncate sm:text-sm">{title}</p>
          <p className="text-lg font-bold text-gray-800 truncate sm:text-2xl md:text-3xl">{value}</p>
        </div>
        <div className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${color}`}>
          <Icon className="w-5 h-5 text-white sm:w-7 sm:h-7 md:w-8 md:h-8" />
        </div>
      </div>
    </div>
  </Link>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, activityRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getActivity(15)
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      if (activityRes.data.success) {
        setActivity(activityRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please refresh the page.');
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

  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 mt-2 text-white bg-red-600 rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <div className="p-4 text-white rounded-lg sm:p-6 bg-gradient-to-r from-primary to-secondary">
        <h1 className="mb-1 text-lg font-bold sm:mb-2 sm:text-2xl md:text-3xl">Welcome Back, Admin! 👋</h1>
        <p className="text-xs text-white sm:text-sm md:text-base text-opacity-90">
          Here's what's happening with your platform today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats?.overview?.totalUsers || 0}
          icon={UsersIcon}
          color="bg-blue-500"
          link="/users"
        />
        <StatCard
          title="Active Restaurants"
          value={stats?.overview?.totalRestaurants || 0}
          icon={BuildingStorefrontIcon}
          color="bg-green-500"
          link="/restaurants"
        />
        <StatCard
          title="Total Orders"
          value={stats?.overview?.totalOrders || 0}
          icon={ShoppingCartIcon}
          color="bg-purple-500"
          link="/orders"
        />
        {/* <StatCard
          title="Total Revenue"
          value={`₹${stats?.overview?.totalRevenue ? Number(stats.overview.totalRevenue).toFixed(2) : '0.00'}`}
          icon={CurrencyRupeeIcon}
          color="bg-yellow-500"
          link="/orders"
        /> */}
      </div>

      {/* Pending Approvals Alert */}
      {stats?.overview?.newRegisteredRestaurants > 0 && (
        <div className="p-4 border-l-4 border-yellow-400 bg-yellow-50">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>{stats.overview.newRegisteredRestaurants}</strong> restaurant(s) waiting for approval.{' '}
                <Link to="/restaurants/pending" className="font-medium underline hover:text-yellow-800">
                  Review now →
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="overflow-hidden bg-white rounded-lg shadow">
        <div className="p-4 border-b sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
            <Link to="/orders" className="text-sm font-medium text-primary hover:text-opacity-80">
              View All →
            </Link>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="divide-y divide-gray-200 sm:hidden">
          {stats?.recentOrders?.slice(0, 10).map((order) => (
            <div key={order.id} className="p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{order.orderNumber}</span>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                  order.status === 'Preparing' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>{order.status}</span>
              </div>
              <p className="text-sm text-gray-600">{order.restaurantName}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{order.customerName}</span>
                <span className="text-sm font-medium text-gray-900">₹{order.total}</span>
              </div>
              <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Restaurant</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats?.recentOrders?.slice(0, 10).map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {order.restaurantName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {order.customerName}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                    ₹{order.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        order.status === 'Preparing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                      }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b sm:p-6">
          <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
        </div>
        <div className="p-4 sm:p-6">
          <div className="flow-root">
            <ul className="-mb-8">
              {activity.slice(0, 10).map((item, index) => (
                <li key={index}>
                  <div className="relative pb-8">
                    {index !== activity.slice(0, 10).length - 1 && (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary ring-8 ring-white">
                          <ClockIcon className="w-5 h-5 text-white" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex flex-col sm:flex-row sm:justify-between sm:space-x-4 gap-1">
                        <div>
                          <p className="text-sm text-gray-800">{item.description}</p>
                        </div>
                        <div className="text-xs text-gray-500 sm:text-sm whitespace-nowrap">
                          <time>{new Date(item.timestamp).toLocaleString()}</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
