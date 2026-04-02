import React, { useState, useEffect } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  X,
  Search,
  CheckCircle,
  AlertCircle,
  Star,
  Package,
  Filter
} from 'lucide-react'
import {
  getAdditives,
  createAdditive,
  updateAdditive,
  deleteAdditive
} from '../../api/restaurantOwnerApi'

function AdditivesPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedAdditive, setSelectedAdditive] = useState(null)
  const [additives, setAdditives] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [newAdditive, setNewAdditive] = useState({
    name: '',
    category: '',
    price: '',
    description: ''
  })

  useEffect(() => {
    const loadAdditives = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await getAdditives()
        const data = Array.isArray(res.data) ? res.data : []
        setAdditives(data)
      } catch (err) {
        console.error('Error loading additives:', err)
        setError(err.message || 'Failed to load additives')
      } finally {
        setLoading(false)
      }
    }

    loadAdditives()
  }, [])

  const categories = [
    'All',
    ...new Set(additives.map((a) => a.category).filter(Boolean))
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewAdditive((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddAdditive = async (e) => {
    e.preventDefault()

    if (!newAdditive.name || !newAdditive.category || !newAdditive.price) {
      setError('Please fill name, category and price')
      return
    }

    try {
      setSaving(true)
      setError('')

      const payload = {
        name: newAdditive.name,
        category: newAdditive.category,
        price: Number(newAdditive.price),
        description: newAdditive.description,
        isAvailable: true
      }

      const res = await createAdditive(payload)
      setAdditives((prev) => [res.data, ...prev])
      setShowAddModal(false)
      setNewAdditive({ name: '', category: '', price: '', description: '' })
    } catch (err) {
      console.error('Error adding additive:', err)
      setError(err.message || 'Failed to add additive')
    } finally {
      setSaving(false)
    }
  }

  const handleEditAdditive = async (e) => {
    e.preventDefault()

    const formData = new FormData(e.target)
    const name = formData.get('name')
    const category = formData.get('category')
    const price = formData.get('price')
    const status = formData.get('status')
    const description = formData.get('description')

    if (!name || !category || !price) {
      setError('Please fill name, category and price')
      return
    }

    try {
      setSaving(true)
      setError('')

      const payload = {
        name,
        category,
        price: Number(price),
        description,
        isAvailable: status === 'active'
      }

      const res = await updateAdditive(selectedAdditive._id, payload)
      setAdditives((prev) =>
        prev.map((a) => (a._id === selectedAdditive._id ? res.data : a))
      )
      setShowEditModal(false)
      setSelectedAdditive(null)
    } catch (err) {
      console.error('Error updating additive:', err)
      setError(err.message || 'Failed to update additive')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAdditive = async () => {
    try {
      setSaving(true)
      setError('')

      await deleteAdditive(selectedAdditive._id)
      setAdditives((prev) => prev.filter((a) => a._id !== selectedAdditive._id))
      setShowDeleteModal(false)
      setSelectedAdditive(null)
    } catch (err) {
      console.error('Error deleting additive:', err)
      setError(err.message || 'Failed to delete additive')
    } finally {
      setSaving(false)
    }
  }

  const filteredAdditives = additives.filter((additive) => {
    const matchesSearch =
      additive.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      additive.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      selectedCategory === 'All' || additive.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalAdditives = additives.length
  const activeAdditives = additives.filter((a) => a.isAvailable).length
  const uniqueCategories = new Set(
    additives.map((a) => a.category).filter(Boolean)
  ).size

  const additivesStats = [
    { label: 'Total Additives', value: String(totalAdditives), icon: Package },
    { label: 'Active Additives', value: String(activeAdditives), icon: Star },
    { label: 'Categories', value: String(uniqueCategories), icon: Filter },
    {
      label: 'Inactive',
      value: String(totalAdditives - activeAdditives),
      icon: Plus
    }
  ]

  const renderStatusBadge = (isAvailable) => {
    const status = isAvailable ? 'active' : 'inactive'
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      inactive: { color: 'bg-red-100 text-red-800', icon: AlertCircle }
    }

    const Icon = statusConfig[status]?.icon || AlertCircle

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${
          statusConfig[status]?.color || 'bg-gray-100 text-gray-800'
        }`}
      >
        <Icon size={12} />
        {status}
      </span>
    )
  }

  const OverviewTab = () => (
    <div className="space-y-5">
      {/* Stats Grid — 2 cols on mobile, 4 on large */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {additivesStats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="p-4 bg-white border border-gray-100 shadow-sm rounded-xl"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-xs leading-tight text-gray-500">{stat.label}</p>
                  <h3 className="mt-1 text-2xl font-bold">{stat.value}</h3>
                </div>
                <div className="flex-shrink-0 p-2 rounded-lg bg-orange-50">
                  <Icon className="w-4 h-4 text-orange-600" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Additives */}
      <div className="p-4 bg-white border border-gray-100 shadow-sm rounded-xl">
        <h2 className="mb-4 text-base font-semibold">Recent Additives</h2>
        <div className="space-y-3">
          {additives.slice(0, 5).map((additive) => (
            <div
              key={additive._id}
              className="flex items-center justify-between gap-2 p-3 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center min-w-0 gap-3">
                <div className="flex items-center justify-center flex-shrink-0 text-white rounded-full w-9 h-9 bg-gradient-to-r from-orange-500 to-red-600">
                  <Package size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{additive.name}</p>
                  <p className="text-xs text-gray-500 truncate">{additive.category}</p>
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-sm font-medium">₹{additive.price.toFixed(2)}</p>
                {renderStatusBadge(additive.isAvailable)}
              </div>
            </div>
          ))}
          {additives.length === 0 && (
            <p className="py-4 text-sm text-center text-gray-500">
              No additives yet. Click "Add Additive" to create one.
            </p>
          )}
        </div>
      </div>
    </div>
  )

  const ListTab = () => (
    <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-xl">
      {/* Header controls */}
      <div className="flex flex-col gap-3 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">All Additives</h2>
          <button
            className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-2 rounded-lg text-sm hover:opacity-90"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={15} />
            Add
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search additives..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pr-3 text-sm border border-gray-300 rounded-lg pl-9"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2 py-2 border border-gray-300 rounded-lg text-sm flex-shrink-0 max-w-[110px]"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="px-4 py-2 mx-4 mt-3 text-sm text-red-700 rounded-lg bg-red-50">
          {error}
        </div>
      )}

      {/* Mobile card list */}
      <div className="divide-y divide-gray-100 sm:hidden">
        {filteredAdditives.map((additive) => (
          <div key={additive._id} className="flex items-start justify-between gap-3 p-4">
            <div className="flex items-start min-w-0 gap-3">
              <div className="w-9 h-9 flex-shrink-0 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-white mt-0.5">
                <Package size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">{additive.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{additive.category}</p>
                {additive.description && (
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{additive.description}</p>
                )}
                <div className="mt-1.5">{renderStatusBadge(additive.isAvailable)}</div>
              </div>
            </div>
            <div className="flex flex-col items-end flex-shrink-0 gap-2">
              <p className="text-sm font-semibold">₹{additive.price.toFixed(2)}</p>
              <div className="flex items-center gap-1.5">
                <button
                  className="p-1.5 text-orange-600 hover:bg-orange-50 rounded"
                  onClick={() => {
                    setSelectedAdditive(additive)
                    setShowEditModal(true)
                  }}
                >
                  <Edit size={15} />
                </button>
                <button
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                  onClick={() => {
                    setSelectedAdditive(additive)
                    setShowDeleteModal(true)
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredAdditives.length === 0 && (
          <p className="py-8 text-sm text-center text-gray-500">No additives found.</p>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Additive</th>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Category</th>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Price</th>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Description</th>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAdditives.map((additive) => (
              <tr key={additive._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center flex-shrink-0 text-white rounded-full w-9 h-9 bg-gradient-to-r from-orange-500 to-red-600">
                      <Package size={15} />
                    </div>
                    <p className="text-sm font-medium">{additive.name}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">{additive.category}</td>
                <td className="px-4 py-3 text-sm">₹{additive.price.toFixed(2)}</td>
                <td className="px-4 py-3">{renderStatusBadge(additive.isAvailable)}</td>
                <td className="max-w-xs px-4 py-3 text-sm truncate">{additive.description || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      className="p-1.5 text-orange-600 hover:bg-orange-50 rounded"
                      onClick={() => {
                        setSelectedAdditive(additive)
                        setShowEditModal(true)
                      }}
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      onClick={() => {
                        setSelectedAdditive(additive)
                        setShowDeleteModal(true)
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredAdditives.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-sm text-center text-gray-500">
                  No additives found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Showing {filteredAdditives.length} of {additives.length} additives
        </p>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-orange-500 rounded-full border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 pb-24 bg-gray-50 md:p-6 md:pb-8">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 shadow-lg bg-gradient-to-r from-orange-500 to-red-600 md:w-12 md:h-12 rounded-xl">
          <Package className="w-5 h-5 text-white md:w-6 md:h-6" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold leading-tight text-gray-800 md:text-2xl">
            Additives Management
          </h1>
          <p className="hidden text-sm text-gray-500 sm:block">
            Manage your menu additives and ingredients
          </p>
        </div>
      </div>

      {/* TAB BUTTONS */}
      <div className="flex gap-1 p-1 mb-5 bg-white shadow-sm rounded-xl">
        {['overview', 'list'].map((tab) => (
          <button
            key={tab}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            <span className="capitalize flex items-center justify-center gap-1.5">
              {tab === 'overview' && <Package size={15} />}
              {tab === 'list' && <Star size={15} />}
              {tab}
            </span>
          </button>
        ))}
      </div>

      {/* TAB CONTENTS */}
      {activeTab === 'overview' ? <OverviewTab /> : <ListTab />}

      {/* ADD MODAL */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 bg-black/40 sm:items-center sm:p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl p-5 w-full sm:max-w-md shadow-xl max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold">Add New Additive</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAdditive} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Additive Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={newAdditive.name}
                  onChange={handleInputChange}
                  placeholder="Enter additive name"
                  className="w-full p-3 text-sm border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={newAdditive.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Dairy, Meat, Vegetables"
                  className="w-full p-3 text-sm border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Price (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={newAdditive.price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                  className="w-full p-3 text-sm border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={newAdditive.description}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                  rows="3"
                  className="w-full p-3 text-sm border border-gray-300 rounded-lg"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                  onClick={() => setShowAddModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? 'Adding...' : 'Add Additive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedAdditive && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 bg-black/40 sm:items-center sm:p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl p-5 w-full sm:max-w-md shadow-xl max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold">Edit Additive</h2>
              <button onClick={() => setShowEditModal(false)} className="p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditAdditive} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={selectedAdditive.name}
                  className="w-full p-3 text-sm border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  name="category"
                  defaultValue={selectedAdditive.category}
                  className="w-full p-3 text-sm border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  defaultValue={selectedAdditive.price}
                  className="w-full p-3 text-sm border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  defaultValue={selectedAdditive.isAvailable ? 'active' : 'inactive'}
                  className="w-full p-3 text-sm border border-gray-300 rounded-lg"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  defaultValue={selectedAdditive.description}
                  rows="3"
                  className="w-full p-3 text-sm border border-gray-300 rounded-lg"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                  onClick={() => setShowEditModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedAdditive && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 bg-black/40 sm:items-center sm:p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="w-full p-5 bg-white shadow-xl rounded-t-2xl sm:rounded-2xl sm:max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-red-600">Delete Additive</h2>
              <button onClick={() => setShowDeleteModal(false)} className="p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="mb-5 text-sm text-gray-600">
              Are you sure you want to delete{' '}
              <strong>{selectedAdditive.name}</strong>? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                onClick={() => setShowDeleteModal(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                onClick={handleDeleteAdditive}
                disabled={saving}
              >
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdditivesPage
