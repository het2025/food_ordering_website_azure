import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDelivery } from '../context/DeliveryContext';
import { profileAPI } from '../api/axiosInstance';
import Header from '../components/Header';
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  TruckIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
  const navigate = useNavigate();
  const { deliveryBoy, updateDeliveryBoy } = useDelivery();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: deliveryBoy?.name || '',
    phone: deliveryBoy?.phone || '',
    vehicleType: deliveryBoy?.vehicleType || 'bike',
    vehicleNumber: deliveryBoy?.vehicleNumber || '',
    bankDetails: {
      accountNumber: deliveryBoy?.bankDetails?.accountNumber || '',
      accountName: deliveryBoy?.bankDetails?.accountName || '',
      ifscCode: deliveryBoy?.bankDetails?.ifscCode || ''
    }
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    if (name.startsWith('bankDetails.')) {
      const field = name.split('.')[1];
      
      // Strict Validations
      if (field === 'accountNumber') {
        value = value.replace(/\D/g, '').slice(0, 18);
      } else if (field === 'accountName') {
        value = value.replace(/[^A-Za-z\s]/g, '').toUpperCase();
      } else if (field === 'ifscCode') {
        value = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 11);
      }

      setFormData(prev => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [field]: value
        }
      }));
      return;
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await profileAPI.update(formData);
      if (response.data.success) {
        updateDeliveryBoy(response.data.data);
        setEditing(false);
        alert('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="px-4 py-4 pb-safe-nav mx-auto max-w-4xl sm:px-6 sm:pt-8 lg:px-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">Profile</h1>
          <p className="mt-0.5 text-sm text-gray-600 sm:mt-1">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <div className="overflow-hidden bg-white rounded-xl shadow">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-primary to-secondary sm:p-6">
            <div className="flex flex-col items-center text-center sm:flex-row sm:text-left">
              <div className="flex flex-shrink-0 justify-center items-center w-16 h-16 bg-white rounded-full shadow sm:w-20 sm:h-20">
                <UserCircleIcon className="w-12 h-12 text-primary sm:w-16 sm:h-16" />
              </div>
              <div className="mt-3 text-white sm:mt-0 sm:ml-6">
                <h2 className="text-xl font-bold sm:text-2xl">{deliveryBoy?.name}</h2>
                <p className="mt-0.5 text-sm text-white/80">
                  {deliveryBoy?.completedOrders || 0} deliveries completed
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {editing ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base rounded-xl border border-gray-300 outline-none transition focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    inputMode="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base rounded-xl border border-gray-300 outline-none transition focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    autoComplete="tel"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">Vehicle Type</label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base rounded-xl border border-gray-300 outline-none transition focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="bike">Bike</option>
                    <option value="scooter">Scooter</option>
                    <option value="bicycle">Bicycle</option>
                    <option value="car">Car</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">Vehicle Number</label>
                  <input
                    type="text"
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base rounded-xl border border-gray-300 outline-none transition focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    autoCapitalize="characters"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                </div>

                {/* Bank Details Input Section */}
                <div className="pt-4 mt-2 border-t">
                  <h3 className="mb-3 text-lg font-bold text-gray-800">Bank Account (For Payouts)</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block mb-1.5 text-sm font-medium text-gray-700">Account Name (As per Bank)</label>
                      <input
                        type="text"
                        name="bankDetails.accountName"
                        value={formData.bankDetails.accountName}
                        onChange={handleChange}
                        placeholder="Ex: John Doe"
                        className="w-full px-4 py-3 text-base rounded-xl border border-gray-300 outline-none transition focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block mb-1.5 text-sm font-medium text-gray-700">Account Number</label>
                      <input
                        type="text"
                        name="bankDetails.accountNumber"
                        value={formData.bankDetails.accountNumber}
                        onChange={handleChange}
                        placeholder="Ex: 50100XXXXXXXX"
                        className="w-full px-4 py-3 text-base rounded-xl border border-gray-300 outline-none transition focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block mb-1.5 text-sm font-medium text-gray-700">IFSC Code</label>
                      <input
                        type="text"
                        name="bankDetails.ifscCode"
                        value={formData.bankDetails.ifscCode}
                        onChange={handleChange}
                        placeholder="Ex: HDFC0001234"
                        className="w-full px-4 py-3 text-base rounded-xl border border-gray-300 outline-none transition focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="flex-1 min-h-[48px] font-semibold text-gray-700 rounded-xl border border-gray-300 hover:bg-gray-50 active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 min-h-[48px] font-semibold text-white rounded-xl bg-primary hover:bg-opacity-90 active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex items-center py-3.5 border-b">
                  <EnvelopeIcon className="flex-shrink-0 mr-3 w-5 h-5 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Email</p>
                    <p className="mt-0.5 text-sm font-medium text-gray-900 truncate">{deliveryBoy?.email}</p>
                  </div>
                </div>

                <div className="flex items-center py-3.5 border-b">
                  <PhoneIcon className="flex-shrink-0 mr-3 w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Phone</p>
                    <p className="mt-0.5 text-sm font-medium text-gray-900">{deliveryBoy?.phone}</p>
                  </div>
                </div>

                <div className="flex items-center py-3.5 border-b">
                  <TruckIcon className="flex-shrink-0 mr-3 w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Vehicle</p>
                    <p className="mt-0.5 text-sm font-medium text-gray-900 capitalize">
                      {deliveryBoy?.vehicleType} — {deliveryBoy?.vehicleNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-center py-3.5">
                  <IdentificationIcon className="flex-shrink-0 mr-3 w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Driving License</p>
                    <p className="mt-0.5 text-sm font-medium text-gray-900">{deliveryBoy?.drivingLicense}</p>
                  </div>
                </div>
                {/* Bank Details Display */}
                <div className="mt-6 mb-4">
                  <h3 className="mb-2 text-sm font-bold text-gray-800 uppercase tracking-wide">Bank Details</h3>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    {deliveryBoy?.bankDetails?.accountNumber ? (
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Account Name</span>
                          <span className="font-semibold text-gray-900">{deliveryBoy.bankDetails.accountName}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Account No</span>
                          <span className="font-bold text-gray-900 tracking-widest">
                            •••• {String(deliveryBoy.bankDetails.accountNumber).slice(-4)}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                          <span className="text-xs text-gray-500 uppercase tracking-wide">IFSC</span>
                          <span className="font-semibold text-gray-900 tracking-wider text-sm">{deliveryBoy.bankDetails.ifscCode}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <p className="text-sm font-medium text-red-500">No bank account added.</p>
                        <p className="text-xs text-gray-500 mt-1">Please edit your profile to add bank details for receiving payouts.</p>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setEditing(true)}
                  className="w-full mt-5 min-h-[48px] font-semibold text-white rounded-xl transition bg-primary hover:bg-opacity-90 active:scale-[0.98]"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
