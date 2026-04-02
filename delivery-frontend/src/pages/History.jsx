import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../api/axiosInstance';
import Header from '../components/Header';
import { CheckCircleIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';

const History = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchHistory();
  }, [currentPage]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getHistory(currentPage);
      if (response.data.success) {
        setOrders(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="px-4 py-4 pb-safe-nav mx-auto max-w-7xl sm:px-6 sm:pt-8 lg:px-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">Delivery History</h1>
          <p className="mt-0.5 text-sm text-gray-600 sm:mt-1">
            {pagination.totalOrders || 0} completed deliveries
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 rounded-full border-b-2 animate-spin border-primary"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl shadow sm:p-12">
            <CheckCircleIcon className="mx-auto mb-4 w-12 h-12 text-gray-400 sm:w-16 sm:h-16" />
            <h3 className="mb-2 text-lg font-semibold text-gray-800 sm:text-xl">No History Yet</h3>
            <p className="text-sm text-gray-600 sm:text-base">Your completed deliveries will appear here</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards — visible only on screens narrower than md (768px) */}
            <div className="space-y-3 md:hidden">
              {orders.map((order) => (
                <div key={order._id} className="p-4 bg-white rounded-xl shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="min-w-0 mr-2">
                      <p className="text-sm font-bold text-gray-800">#{order.orderNumber}</p>
                      <p className="text-xs text-gray-600 mt-0.5 truncate">{order.restaurantName}</p>
                    </div>
                    <div className="flex flex-shrink-0 items-center text-green-600 font-semibold text-sm">
                      <CurrencyRupeeIcon className="w-4 h-4" />
                      {order.deliveryFee}
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600 font-medium truncate max-w-[55%]">{order.customerName}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0">{new Date(order.deliveredAt).toLocaleDateString('en-IN')}</span>
                    </div>
                    <div className="mt-0.5 text-right text-xs text-gray-500">
                      {order.actualDeliveryTime ? `${order.actualDeliveryTime} min delivery` : 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table — shown on md (768px) and wider */}
            <div className="hidden overflow-x-auto bg-white rounded-xl shadow md:block">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Order</th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Restaurant</th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Earnings</th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Time Taken</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                        #{order.orderNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {order.restaurantName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {order.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm font-semibold text-green-600">
                          <CurrencyRupeeIcon className="w-4 h-4" />
                          {order.deliveryFee}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {new Date(order.deliveredAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {order.actualDeliveryTime ? `${order.actualDeliveryTime} min` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-between items-center mt-4 sm:mt-6">
                <p className="text-xs text-gray-600 sm:text-sm">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 min-h-[44px] text-sm font-medium rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 sm:px-5"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage >= pagination.totalPages}
                    className="px-4 min-h-[44px] text-sm font-medium rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 sm:px-5"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default History;
