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
  Coffee,
  Filter
} from 'lucide-react'
import {
  getExtras,
  createExtra,
  updateExtra,
  deleteExtra
} from '../../api/restaurantOwnerApi'

function ExtrasPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedExtra, setSelectedExtra] = useState(null)
  const [extras, setExtras] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [newExtra, setNewExtra] = useState({
    name: '',
    category: '',
    price: '',
    description: ''
  })

  useEffect(() => {
    const loadExtras = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await getExtras()
        const data = Array.isArray(res.data) ? res.data : []
        setExtras(data)
      } catch (err) {
        console.error('Error loading extras:', err)
        setError(err.message || 'Failed to load extras')
      } finally {
        setLoading(false)
      }
    }

    loadExtras()
  }, [])

  const categories = [
    'All',
    ...new Set(extras.map((e) => e.category).filter(Boolean))
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewExtra((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddExtra = async (e) => {
    e.preventDefault()

    if (!newExtra.name || !newExtra.category || !newExtra.price) {
      setError('Please fill name, category and price')
      return
    }

    try {
      setSaving(true)
      setError('')

      const payload = {
        name: newExtra.name,
        category: newExtra.category,
        price: Number(newExtra.price),
        description: newExtra.description,
        isAvailable: true
      }

      const res = await createExtra(payload)
      setExtras((prev) => [res.data, ...prev])
      setShowAddModal(false)
      setNewExtra({ name: '', category: '', price: '', description: '' })
    } catch (err) {
      console.error('Error adding extra:', err)
      setError(err.message || 'Failed to add extra')
    } finally {
      setSaving(false)
    }
  }

  const handleEditExtra = async (e) => {
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

      const res = await updateExtra(selectedExtra._id, payload)
      setExtras((prev) =>
        prev.map((e) => (e._id === selectedExtra._id ? res.data : e))
      )
      setShowEditModal(false)
      setSelectedExtra(null)
    } catch (err) {
      console.error('Error updating extra:', err)
      setError(err.message || 'Failed to update extra')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteExtra = async () => {
    try {
      setSaving(true)
      setError('')

      await deleteExtra(selectedExtra._id)
      setExtras((prev) => prev.filter((e) => e._id !== selectedExtra._id))
      setShowDeleteModal(false)
      setSelectedExtra(null)
    } catch (err) {
      console.error('Error deleting extra:', err)
      setError(err.message || 'Failed to delete extra')
    } finally {
      setSaving(false)
    }
  }

  const filteredExtras = extras.filter((extra) => {
    const matchesSearch =
      extra.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      extra.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      selectedCategory === 'All' || extra.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalExtras = extras.length
  const activeExtras = extras.filter((e) => e.isAvailable).length
  const uniqueCategories = new Set(
    extras.map((e) => e.category).filter(Boolean)
  ).size

  const extrasStats = [
    { label: 'Total Extras', value: String(totalExtras), icon: Coffee },
    { label: 'Active Extras', value: String(activeExtras), icon: Star },
    { label: 'Categories', value: String(uniqueCategories), icon: Filter },
    {
      label: 'Inactive',
      value: String(totalExtras - activeExtras),
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {extrasStats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex justify-between items-start">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 leading-tight">{stat.label}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                </div>
                <div className="p-2 rounded-lg bg-orange-50 flex-shrink-0">
                  <Icon className="w-4 h-4 text-orange-600" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Extras */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-base font-semibold mb-4">Recent Extras</h2>
        <div className="space-y-3">
          {extras.slice(0, 5).map((extra) => (
            <div
              key={extra._id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg gap-2"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 flex-shrink-0 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-white">
                  <Coffee size={14} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{extra.name}</p>
                  <p className="text-xs text-gray-500 truncate">{extra.category}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-medium text-sm">₹{extra.price.toFixed(2)}</p>
                {renderStatusBadge(extra.isAvailable)}
              </div>
            </div>
          ))}
          {extras.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No extras yet. Click "Add Extra" to create one.
            </p>
          )}
        </div>
      </div>
    </div>
  )

  const ListTab = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header controls */}
      <div className="p-4 border-b border-gray-200 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">All Extras</h2>
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search extras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-full"
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
        <div className="mx-4 mt-3 px-4 py-2 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Mobile card list */}
      <div className="sm:hidden divide-y divide-gray-100">
        {filteredExtras.map((extra) => (
          <div key={extra._id} className="p-4 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-9 h-9 flex-shrink-0 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-white mt-0.5">
                <Coffee size={14} />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm">{extra.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{extra.category}</p>
                {extra.description && (
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{extra.description}</p>
                )}
                <div className="mt-1.5">{renderStatusBadge(extra.isAvailable)}</div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <p className="font-semibold text-sm">₹{extra.price.toFixed(2)}</p>
              <div className="flex items-center gap-1.5">
                <button
                  className="p-1.5 text-orange-600 hover:bg-orange-50 rounded"
                  onClick={() => {
                    setSelectedExtra(extra)
                    setShowEditModal(true)
                  }}
                >
                  <Edit size={15} />
                </button>
                <button
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                  onClick={() => {
                    setSelectedExtra(extra)
                    setShowDeleteModal(true)
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredExtras.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-500">No extras found.</p>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Extra</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredExtras.map((extra) => (
              <tr key={extra._id} className="hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 flex-shrink-0 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-white">
                      <Coffee size={15} />
                    </div>
                    <p className="font-medium text-sm">{extra.name}</p>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm">{extra.category}</td>
                <td className="py-3 px-4 text-sm">₹{extra.price.toFixed(2)}</td>
                <td className="py-3 px-4">{renderStatusBadge(extra.isAvailable)}</td>
                <td className="py-3 px-4 text-sm max-w-xs truncate">{extra.description || '—'}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      className="p-1.5 text-orange-600 hover:bg-orange-50 rounded"
                      onClick={() => {
                        setSelectedExtra(extra)
                        setShowEditModal(true)
                      }}
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      onClick={() => {
                        setSelectedExtra(extra)
                        setShowDeleteModal(true)
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredExtras.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 px-4 text-center text-sm text-gray-500">
                  No extras found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Showing {filteredExtras.length} of {extras.length} extras
        </p>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 pb-24 md:pb-8">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-r from-orange-500 to-red-600 w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-xl flex items-center justify-center shadow-lg">
          <Coffee className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight">
            Extras Management
          </h1>
          <p className="text-sm text-gray-500 hidden sm:block">
            Manage your menu extras and additional items
          </p>
        </div>
      </div>

      {/* TAB BUTTONS */}
      <div className="flex gap-1 bg-white rounded-xl p-1 mb-5 shadow-sm">
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
              {tab === 'overview' && <Coffee size={15} />}
              {tab === 'list' && <Star size={15} />}
              {tab}
            </span>
          </button>
        ))}
      </div>

      {activeTab === 'overview' ? <OverviewTab /> : <ListTab />}

      {/* ADD MODAL */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl p-5 w-full sm:max-w-md shadow-xl max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold">Add New Extra</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExtra} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Extra Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={newExtra.name}
                  onChange={handleInputChange}
                  placeholder="Enter extra name"
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={newExtra.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Sides, Beverages, Desserts"
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={newExtra.price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={newExtra.description}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

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
                  {saving ? 'Adding...' : 'Add Extra'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedExtra && (
        <div
          className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl p-5 w-full sm:max-w-md shadow-xl max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold">Edit Extra</h2>
              <button onClick={() => setShowEditModal(false)} className="p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditExtra} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={selectedExtra.name}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  name="category"
                  defaultValue={selectedExtra.category}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  defaultValue={selectedExtra.price}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  defaultValue={selectedExtra.isAvailable ? 'active' : 'inactive'}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  defaultValue={selectedExtra.description}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm"
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
      {showDeleteModal && selectedExtra && (
        <div
          className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl p-5 w-full sm:max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-bold text-red-600">Delete Extra</h2>
              <button onClick={() => setShowDeleteModal(false)} className="p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to delete{' '}
              <strong>{selectedExtra.name}</strong>? This action cannot be undone.
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
                onClick={handleDeleteExtra}
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

export default ExtrasPage
