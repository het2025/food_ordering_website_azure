import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, Building2, Plus, Lock, AlertTriangle, Trash2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'; // Restaurant Backend

const PayoutsPage = () => {
    const [activeTab, setActiveTab] = useState('overview'); // overview | bank-details
    const [stats, setStats] = useState(null);
    const [banks, setBanks] = useState([]);
    const [payoutHistory, setPayoutHistory] = useState([]); // ✅ NEW
    const [loading, setLoading] = useState(true);

    // Modal States
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [showAddBankModal, setShowAddBankModal] = useState(false);
    const [showPayoutModal, setShowPayoutModal] = useState(false); // ✅ NEW
    const [payoutAmount, setPayoutAmount] = useState(0); // ✅ NEW

    // Form State
    const [formData, setFormData] = useState({
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: ''
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('restaurantOwnerToken');
            const headers = { Authorization: `Bearer ${token}` };

            if (activeTab === 'overview') {
                const res = await axios.get(`${API_BASE_URL}/dashboard/payouts-stats`, { headers });
                if (res.data.success) setStats(res.data.data);

                // ✅ Also fetch history when on overview
                const historyRes = await axios.get(`${API_BASE_URL}/dashboard/payout-history`, { headers });
                if (historyRes.data.success) setPayoutHistory(historyRes.data.data);
            } else {
                const res = await axios.get(`${API_BASE_URL}/profile/bank-account`, { headers });
                if (res.data.success) setBanks(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddBankClick = () => {
        if (banks.length > 0) {
            setShowWarningModal(true);
        } else {
            setShowAddBankModal(true);
        }
    };

    const handleConfirmWarning = () => {
        setShowWarningModal(false);
        setShowAddBankModal(true);
    };

    const handleAddBankSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('restaurantOwnerToken');
            await axios.post(
                `${API_BASE_URL}/profile/bank-account`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert('Bank account added! Waiting for approval.');
            setShowAddBankModal(false);
            setFormData({ accountHolderName: '', accountNumber: '', ifscCode: '', bankName: '' });
            fetchData(); // Refresh list
        } catch (err) {
            alert('Failed to add bank account: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteBank = async (bankId) => {
        if (!confirm('Are you sure you want to delete this bank account?')) return;

        try {
            const token = localStorage.getItem('restaurantOwnerToken');
            await axios.delete(
                `${API_BASE_URL}/profile/bank-account/${bankId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert('Bank account deleted successfully');
            fetchData(); // Refresh list
        } catch (err) {
            alert('Failed to delete bank account: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleCollectPayout = async () => {
        if (!stats || stats.pendingPayout <= 0) {
            alert('No pending payout available');
            return;
        }

        try {
            const token = localStorage.getItem('restaurantOwnerToken');
            const res = await axios.post(
                `${API_BASE_URL}/payouts/request`,
                {
                    amount: stats.pendingPayout,
                    orderCount: stats.orderCount
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                setPayoutAmount(stats.pendingPayout);
                setShowPayoutModal(true);
                // Refresh data
                setTimeout(() => {
                    setShowPayoutModal(false);
                    fetchData();
                }, 3000);
            }
        } catch (err) {
            alert('Failed to collect payout: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 pb-24 md:pb-8">
            <h1 className="mb-5 text-xl md:text-2xl font-bold">Payouts &amp; Bank Details</h1>

            {/* Tabs */}
            <div className="flex mb-5 border-b overflow-x-auto">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-2 px-3 sm:px-4 text-sm font-medium whitespace-nowrap flex-shrink-0 ${activeTab === 'overview' ? 'border-b-2 border-red-600 font-bold text-red-600' : 'text-gray-500'}`}
                >
                    Overview
                </button>
                <button
                    id="tour-bank-details-tab"
                    onClick={() => setActiveTab('bank-details')}
                    className={`pb-2 px-3 sm:px-4 text-sm font-medium whitespace-nowrap flex-shrink-0 ${activeTab === 'bank-details' ? 'border-b-2 border-red-600 font-bold text-red-600' : 'text-gray-500'}`}
                >
                    Bank Details
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    {activeTab === 'overview' && stats && (
                        <div className="space-y-4">
                            {/* Pending Payout Card */}
                            <div className="w-full p-5 bg-white rounded-xl shadow-sm border border-gray-100">
                                <h2 className="mb-1 text-sm text-gray-500">Total Pending Payout</h2>
                                <div className="text-3xl md:text-4xl font-bold text-green-600">
                                    ₹{(stats.pendingPayout || 0).toLocaleString()}
                                </div>

                                <div className="pt-4 mt-4 text-sm text-gray-500 border-t space-y-2">
                                    <div className="flex justify-between">
                                        <span>Dish Price Earnings:</span>
                                        <span className="font-semibold text-gray-800">₹{(stats.breakdown?.dishPrice || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tax Collected:</span>
                                        <span className="font-semibold text-gray-800">₹{(stats.breakdown?.taxes || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 font-bold text-black border-t">
                                        <span>Total:</span>
                                        <span>₹{((stats.breakdown?.dishPrice || 0) + (stats.breakdown?.taxes || 0)).toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Collect Payout Button */}
                                <button
                                    onClick={handleCollectPayout}
                                    disabled={!stats.pendingPayout || stats.pendingPayout <= 0}
                                    className={`mt-5 w-full py-3 rounded-xl text-sm font-semibold text-white transition ${stats.pendingPayout > 0
                                        ? 'bg-green-600 hover:bg-green-700 active:bg-green-800'
                                        : 'bg-gray-300 cursor-not-allowed'
                                        }`}
                                >
                                    {stats.pendingPayout > 0 ? 'Collect Payout' : 'No Pending Payout'}
                                </button>
                            </div>

                            {/* Payout History */}
                            <div className="p-5 bg-white rounded-xl shadow-sm border border-gray-100">
                                <h2 className="mb-4 text-base font-semibold">Payout History</h2>
                                {payoutHistory.length === 0 ? (
                                    <p className="italic text-sm text-gray-500">No payout history yet.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {payoutHistory.map((payout) => (
                                            <div key={payout._id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 gap-3">
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-sm text-green-700">₹{payout.amount.toLocaleString()}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {new Date(payout.transactionDate).toLocaleString('en-IN', {
                                                            dateStyle: 'medium',
                                                            timeStyle: 'short'
                                                        })}
                                                    </p>
                                                </div>
                                                <span className="px-2.5 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full flex-shrink-0">
                                                    {payout.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'bank-details' && (
                        <div>
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                                <h2 className="text-base font-semibold">Your Linked Accounts</h2>
                                <button
                                    id="tour-add-bank-btn"
                                    onClick={handleAddBankClick}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
                                >
                                    <Plus size={16} /> Add New Bank
                                </button>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {banks.map((bank) => (
                                    <div key={bank._id} className="relative p-4 border rounded-xl bg-white shadow-sm">
                                        <div className="absolute top-4 right-4">
                                            {bank.status === 'Approved' ? <Lock size={16} className="text-gray-400" /> : <span className="px-2 py-1 text-xs font-bold text-yellow-600 bg-yellow-100 rounded">PENDING</span>}
                                        </div>
                                        <div className="flex items-center gap-3 mb-3 pr-10">
                                            <Building2 size={18} className="text-gray-600 flex-shrink-0" />
                                            <h3 className="font-bold text-sm truncate">{bank.bankName}</h3>
                                        </div>
                                        <div className="space-y-1.5 text-sm text-gray-500">
                                            <p>Holder: <span className="font-medium text-gray-900">{bank.accountHolderName}</span></p>
                                            <p>Account: <span className="font-medium text-gray-900">•••• {bank.accountNumber.slice(-4)}</span></p>
                                            <p>IFSC: <span className="font-medium text-gray-900">{bank.ifscCode}</span></p>
                                        </div>

                                        {bank.status === 'Approved' && (
                                            <button
                                                onClick={() => handleDeleteBank(bank._id)}
                                                className="flex items-center justify-center w-full gap-2 px-3 py-2 mt-4 text-sm text-red-600 transition rounded-lg bg-red-50 hover:bg-red-100"
                                            >
                                                <Trash2 size={15} />
                                                Delete Account
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {banks.length === 0 && <p className="italic text-sm text-gray-500 col-span-full">No bank accounts added yet.</p>}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Warning Modal */}
            {showWarningModal && (
                <div
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
                    onClick={() => setShowWarningModal(false)}
                >
                    <div
                        className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-xl p-5 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 mb-4 text-yellow-600">
                            <AlertTriangle size={26} className="flex-shrink-0" />
                            <h2 className="text-base font-bold">Important Notice</h2>
                        </div>
                        <p className="mb-5 text-sm leading-relaxed text-gray-700">
                            You may add new bank details; however, you must email the company with your
                            <span className="font-bold"> existing (old) bank account details</span> for
                            verification. This allows us to cross-check the information and confirm your
                            identity before approving the new bank account. Until both the old and new bank
                            details are approved, payouts may be temporarily paused.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowWarningModal(false)}
                                className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmWarning}
                                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                            >
                                I Understand
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Bank Modal */}
            {showAddBankModal && (
                <div
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
                    onClick={() => setShowAddBankModal(false)}
                >
                    <div
                        className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-xl p-5 max-h-[92vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="mb-4 text-base font-bold">Add Bank Details</h2>
                        <form onSubmit={handleAddBankSubmit} className="space-y-4">
                            <div>
                                <label className="block mb-1 text-sm font-medium">Bank Name</label>
                                <input
                                    type="text" required
                                    className="w-full p-3 text-sm border border-gray-300 rounded-lg"
                                    value={formData.bankName}
                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium">Account Holder Name</label>
                                <input
                                    type="text" required
                                    className="w-full p-3 text-sm border border-gray-300 rounded-lg"
                                    value={formData.accountHolderName}
                                    onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium">Account Number</label>
                                <input
                                    type="text" required
                                    maxLength="18"
                                    inputMode="numeric"
                                    className="w-full p-3 text-sm border border-gray-300 rounded-lg"
                                    value={formData.accountNumber}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        setFormData({ ...formData, accountNumber: val });
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium">IFSC Code</label>
                                <input
                                    type="text" required
                                    maxLength="11"
                                    className="w-full p-3 text-sm uppercase border border-gray-300 rounded-lg"
                                    value={formData.ifscCode}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                                        setFormData({ ...formData, ifscCode: val });
                                    }}
                                />
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowAddBankModal(false)}
                                    className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                                >
                                    Save Details
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Payout Confirmation Modal */}
            {showPayoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-sm p-6 text-center bg-white rounded-2xl shadow-xl">
                        <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 bg-green-100 rounded-full">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h2 className="mb-2 text-xl font-bold text-gray-800">Payout Requested!</h2>
                        <p className="mb-3 text-sm text-gray-500">You have successfully requested:</p>
                        <div className="mb-4 text-3xl font-bold text-green-600">
                            ₹{payoutAmount.toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-400">This amount will be transferred to your bank account after Admin approval.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PayoutsPage;
