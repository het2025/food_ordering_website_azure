import React, { useState, useEffect } from 'react';
import { deliveryUsersAPI } from '../api/adminApi';
import { TruckIcon } from '@heroicons/react/24/outline';

const DeliveryUsers = () => {
  const [deliveryUsers, setDeliveryUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveryUsers();
  }, []);

  const fetchDeliveryUsers = async () => {
    try {
      setLoading(true);
      const response = await deliveryUsersAPI.getAll();        

      if (response.data.success) {
        setDeliveryUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching delivery users:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (deliveryUsers.length === 0) return;
    const headers = ['Name', 'Email', 'Phone', 'Vehicle Type', 'Vehicle Number', 'License Number', 'Completed Orders', 'Total Earnings', 'Status'];      
    const csvData = deliveryUsers.map(user => [
      `"${user.name || ''}"`,
      `"${user.email || ''}"`,
      `"${user.phone || 'N/A'}"`,
      `"${user.vehicleType || 'N/A'}"`,
      `"${user.vehicleNumber || 'N/A'}"`,
      `"${user.drivingLicense || 'N/A'}"`,
      user.completedOrders || 0,
      user.totalEarnings || 0,
      user.isActive ? 'Active' : 'Inactive'
    ]);
    const csvContent = [headers.join(","), ...csvData.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); 
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "delivery_users.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 sm:text-2xl flex items-center gap-2">
            <TruckIcon className="w-8 h-8 text-primary" /> Delivery Users
          </h2>
          <p className="mt-1 text-xs text-gray-600 sm:text-base">Manage delivery personnel information and their earnings.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportToCSV} className="px-4 py-2 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700">Export CSV</button>
        </div>
      </div>

      {/* Delivery Users Table */}
      <div className="overflow-hidden bg-white rounded-lg shadow">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary"></div>
          </div>
        ) : deliveryUsers.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">No delivery users found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Driver Info</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Vehicle Details</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Driving License</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Completed Orders</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Total Earnings</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {deliveryUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 font-bold text-white rounded-full bg-primary/80">       
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                            <span className={`inline-flex px-2 py-0.5 text-[10px] items-center rounded-sm font-medium ${user.isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {user.isOnline ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-900">{user.phone}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-900 uppercase font-medium">{user.vehicleNumber}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.vehicleType}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-gray-700">{user.drivingLicense}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
                          {user.completedOrders || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600">
                        ₹{parseFloat(user.totalEarnings || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
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

export default DeliveryUsers;