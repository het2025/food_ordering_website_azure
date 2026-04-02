import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI } from '../api/adminApi';
import { MagnifyingGlassIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/outline';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll(currentPage, 20, search);

      if (response.data.success) {
        setUsers(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) {
      return;
    }

    try {
      const response = await usersAPI.updateStatus(userId, !currentStatus);
      if (response.data.success) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await usersAPI.delete(userId);
      if (response.data.success) {
        alert('User deleted successfully');
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    if (users.length === 0) return;
    const headers = ['Name', 'Email', 'Phone', 'Status', 'Joined Date'];
    const csvData = users.map(user => [
      `"${user.name || ''}"`,
      `"${user.email || ''}"`,
      `"${user.phone || 'N/A'}"`,
      user.isActive ? 'Active' : 'Inactive',
      `"${new Date(user.createdAt).toLocaleDateString()}"`
    ]);
    const csvContent = [headers.join(","), ...csvData.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "users.csv";
    link.click();
    URL.revokeObjectURL(url);
  };


  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">User Management</h2>
          <p className="mt-1 text-xs text-gray-600 sm:text-base">Manage all registered users</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportToCSV} className="px-4 py-2 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700">Export CSV</button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 bg-white rounded-lg shadow sm:p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 sm:w-5 sm:h-5 left-3 top-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={handleSearchChange}
            className="w-full py-3 pr-4 text-sm border border-gray-300 rounded-lg outline-none pl-9 sm:pl-10 focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden bg-white rounded-lg shadow">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="divide-y divide-gray-200 sm:hidden">
              {users.map((user) => (
                <div key={user._id} className="p-4">
                  {/* Top row: avatar + info + status badge */}
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center flex-shrink-0 text-sm font-semibold text-white rounded-full w-10 h-10 bg-primary mt-0.5">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                        <button
                          onClick={() => handleStatusToggle(user._id, user.isActive)}
                          className={`flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full touch-manipulation active:opacity-75 whitespace-nowrap ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 mt-1.5 break-all">{user.email}</p>
                      {user.phone && <p className="text-xs text-gray-500 mt-0.5">{user.phone}</p>}
                    </div>
                  </div>

                  {/* Action Row */}
                  <div className="grid grid-cols-2 gap-2 pt-3 mt-3 border-t border-gray-100">
                    <Link
                      to={`/users/${user._id}`}
                      className="inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-primary border border-primary/30 rounded-lg bg-primary/5 active:bg-primary/10 touch-manipulation"
                    >
                      <EyeIcon className="w-4 h-4" /> View Details
                    </Link>
                    <button
                      onClick={() => handleDelete(user._id, user.name)}
                      className="inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-red-600 border border-red-200 rounded-lg bg-red-50 active:bg-red-100 touch-manipulation"
                    >
                      <TrashIcon className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 font-semibold text-white rounded-full bg-primary">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{user.phone || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleStatusToggle(user._id, user.isActive)}
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            user.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 space-x-2 text-sm font-medium whitespace-nowrap">
                        <Link to={`/users/${user._id}`} className="inline-flex items-center text-primary hover:text-opacity-80">
                          <EyeIcon className="w-4 h-4 mr-1" /> View
                        </Link>
                        <button
                          onClick={() => handleDelete(user._id, user.name)}
                          className="inline-flex items-center text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="w-4 h-4 mr-1" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col items-center justify-between gap-3 px-4 py-4 border-t sm:flex-row sm:px-6 bg-gray-50">
                <div className="order-2 text-xs text-center text-gray-600 sm:text-sm sm:order-1">
                  Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalUsers} users)
                </div>
                <div className="flex order-1 w-full gap-2 sm:w-auto sm:order-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={!pagination.hasPrev}
                    className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-medium border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 active:bg-gray-200 touch-manipulation"
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={!pagination.hasNext}
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
    </div>
  );
};

export default Users;
