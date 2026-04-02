import React, { useState, useEffect } from 'react';
import { restaurantsAPI } from '../api/adminApi';
import { MagnifyingGlassIcon, TrashIcon, SparklesIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    fetchRestaurants();
  }, [currentPage, search, statusFilter]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await restaurantsAPI.getAll(currentPage, 20, search, statusFilter);
      if (response.data.success) {
        setRestaurants(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (restaurantId, newStatus) => {
    if (!confirm(`Change restaurant status to "${newStatus}"?`)) return;
    try {
      const response = await restaurantsAPI.updateStatus(restaurantId, newStatus);
      if (response.data.success) fetchRestaurants();
    } catch (error) {
      console.error('Error updating restaurant status:', error);
      alert('Failed to update restaurant status');
    }
  };

  const handleDelete = async (restaurantId, restaurantName) => {
    if (!confirm(`Are you sure you want to delete "${restaurantName}"? This action cannot be undone.`)) return;
    try {
      const response = await restaurantsAPI.delete(restaurantId);
      if (response.data.success) {
        alert('Restaurant deleted successfully');
        fetchRestaurants();
      }
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      alert('Failed to delete restaurant');
    }
  };

  const handleView = async (restaurant) => {
    try {
      const response = await restaurantsAPI.getById(restaurant._id);
      if (response.data.success) {
        setSelectedRestaurant(response.data.data);
      } else {
        setSelectedRestaurant(restaurant);
      }
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
      setSelectedRestaurant(restaurant);
    }
    setIsViewModalOpen(true);
  };

  const statusSelectClass = (status) =>
    `text-xs font-semibold rounded-full border-0 outline-none cursor-pointer py-1.5 px-3 touch-manipulation min-h-[32px] ${
      status === 'active' ? 'bg-green-100 text-green-800' :
      status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
      'bg-red-100 text-red-800'
    }`;

  const exportToCSV = () => {
    if (restaurants.length === 0) return;
    const headers = ['Name', 'Phone', 'Email', 'Status', 'Address'];
    const csvData = restaurants.map(rest => [
      `"${rest.name || ''}"`,
      `"${rest.phone || ''}"`,
      `"${rest.email || ''}"`,
      rest.status || 'inactive',
      `"${rest.address?.street ? `${rest.address.street}, ${rest.address.city}` : ''}"`
    ]);
    const csvContent = [headers.join(","), ...csvData.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "restaurants.csv";
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">Restaurant Management</h2>
          <p className="mt-1 text-xs text-gray-600 sm:text-base">
            {pagination.oldRestaurants || 0} approved · {pagination.newRestaurants || 0} newly registered
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportToCSV} className="px-4 py-2 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700">Export CSV</button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-3 sm:p-4 bg-white rounded-lg shadow">
        <div className="flex flex-col gap-2.5 sm:grid sm:grid-cols-2 sm:gap-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute w-4 h-4 sm:w-5 sm:h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search restaurants..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full py-3 pl-9 sm:pl-10 pr-4 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-3 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white touch-manipulation"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Restaurants List */}
      <div className="overflow-hidden bg-white rounded-lg shadow">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary"></div>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">No restaurants found</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="sm:hidden divide-y divide-gray-200">
              {restaurants.map((restaurant) => (
                <div key={restaurant._id} className="p-4">
                  {/* Row 1: Avatar + Name + Status */}
                  <div className="flex items-start gap-3">
                    {restaurant.image ? (
                      <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="flex-shrink-0 object-cover w-11 h-11 rounded-full mt-0.5"
                      />
                    ) : (
                      <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 text-base font-semibold text-white rounded-full bg-primary mt-0.5">
                        {restaurant.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-semibold text-gray-900 break-words leading-tight">{restaurant.name}</span>
                            {restaurant.isNew && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800 flex-shrink-0">
                                <SparklesIcon className="w-3 h-3 mr-0.5" /> NEW
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            ⭐ {restaurant.rating || 'N/A'} &nbsp;·&nbsp; {restaurant.location?.area || restaurant.location?.city || 'N/A'}
                          </p>
                        </div>
                        <select
                          value={restaurant.status}
                          onChange={(e) => handleStatusChange(restaurant._id, e.target.value)}
                          className={statusSelectClass(restaurant.status)}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleView(restaurant)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg bg-blue-50 active:bg-blue-100 touch-manipulation"
                    >
                      <EyeIcon className="w-4 h-4" /> View
                    </button>
                    <button
                      onClick={() => handleDelete(restaurant._id, restaurant.name)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-medium text-red-600 border border-red-200 rounded-lg bg-red-50 active:bg-red-100 touch-manipulation"
                    >
                      <TrashIcon className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Restaurant</th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Rating</th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {restaurants.map((restaurant) => (
                    <tr key={restaurant._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {restaurant.image ? (
                            <img src={restaurant.image} alt={restaurant.name} className="object-cover w-10 h-10 rounded-full" />
                          ) : (
                            <div className="flex items-center justify-center w-10 h-10 font-semibold text-white rounded-full bg-primary">
                              {restaurant.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex items-center ml-4">
                            <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
                            {restaurant.isNew && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">
                                <SparklesIcon className="w-3 h-3 mr-1" /> NEW
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {restaurant.location?.area || restaurant.location?.city || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        ⭐ {restaurant.rating || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={restaurant.status}
                          onChange={(e) => handleStatusChange(restaurant._id, e.target.value)}
                          className={statusSelectClass(restaurant.status)}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleView(restaurant)}
                            className="inline-flex items-center text-blue-600 hover:text-blue-800"
                          >
                            <EyeIcon className="w-4 h-4 mr-1" /> View
                          </button>
                          <button
                            onClick={() => handleDelete(restaurant._id, restaurant.name)}
                            className="inline-flex items-center text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="w-4 h-4 mr-1" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t bg-gray-50">
                <p className="text-xs sm:text-sm text-gray-600 text-center order-2 sm:order-1">
                  Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalRestaurants} total)
                </p>
                <div className="flex gap-2 order-1 sm:order-2 w-full sm:w-auto">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-medium border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 active:bg-gray-200 touch-manipulation"
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage >= pagination.totalPages}
                    className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-medium border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 active:bg-gray-200 touch-manipulation"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {/* View Restaurant Modal */}
      {isViewModalOpen && selectedRestaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Restaurant Details</h3>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                {selectedRestaurant.image ? (
                  <img src={selectedRestaurant.image} alt={selectedRestaurant.name} className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center w-20 h-20 text-2xl font-semibold text-white rounded-full bg-primary">
                    {selectedRestaurant.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="text-2xl font-bold text-gray-900">{selectedRestaurant.name}</h4>
                  <p className="text-sm text-gray-500">
                    ID: {selectedRestaurant._id}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-sm font-medium text-gray-500 mb-1">Cuisines</h5>
                  <p className="text-base text-gray-900">{(selectedRestaurant.cuisines || selectedRestaurant.cuisine)?.join(', ') || 'N/A'}</p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-500 mb-1">Status</h5>
                  <span className={statusSelectClass(selectedRestaurant.status) + " inline-block mt-1"}>
                    {selectedRestaurant.status}
                  </span>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-500 mb-1">Rating</h5>
                  <p className="text-base text-gray-900">⭐ {selectedRestaurant.rating !== undefined ? selectedRestaurant.rating : 'N/A'}</p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-500 mb-1">Location</h5>
                  <p className="text-base text-gray-900">
                    {selectedRestaurant.location?.address || 'N/A'}<br/>
                    {selectedRestaurant.location?.area ? `${selectedRestaurant.location.area}, ` : ''}
                    {selectedRestaurant.location?.city || ''}
                  </p>
                </div>
                
                {/* Extra Details */}
                <div className="col-span-1 md:col-span-2 pt-4 border-t mt-2">
                  <h5 className="text-sm font-semibold text-gray-900 mb-3">Owner & Operational Details</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="bg-gray-50 p-3 rounded border border-gray-200">
                       <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner Details</span>
                       <p className="text-sm text-gray-900 mt-1">
                         {selectedRestaurant.ownerDetails ? (
                           <>
                             {selectedRestaurant.ownerDetails.name}<br/>
                             {selectedRestaurant.ownerDetails.email}<br/>
                             {selectedRestaurant.ownerDetails.phone}
                           </>
                         ) : 'N/A'}
                       </p>
                     </div>
                     <div className="bg-gray-50 p-3 rounded border border-gray-200">
                       <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Session Activity</span>
                       <p className="text-sm text-gray-900 mt-1">
                         Last Login: {selectedRestaurant.ownerDetails?.lastLogin ? new Date(selectedRestaurant.ownerDetails.lastLogin).toLocaleString() : 'N/A'}<br/>
                         Last Logout: {selectedRestaurant.ownerDetails?.lastLogout ? new Date(selectedRestaurant.ownerDetails.lastLogout).toLocaleString() : 'N/A'}
                       </p>
                     </div>
                     <div className="bg-gray-50 p-3 rounded border border-gray-200">
                       <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Operational</span>
                       <p className="text-sm text-gray-900 mt-1">
                         Average Prep Time: {selectedRestaurant.averagePreparationTime ? `${selectedRestaurant.averagePreparationTime} mins` : 'N/A'}
                       </p>
                     </div>
                     <div className="bg-gray-50 p-3 rounded border border-gray-200">
                       <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bank Details</span>
                       <p className="text-sm text-gray-900 mt-1">
                         {selectedRestaurant.bankAccount ? (
                           <>
                             {selectedRestaurant.bankAccount.bankName}<br/>
                             A/C: {selectedRestaurant.bankAccount.accountNumber}<br/>
                             IFSC: {selectedRestaurant.bankAccount.ifscCode}
                           </>
                         ) : 'Not Provided'}
                       </p>
                     </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Restaurants;
