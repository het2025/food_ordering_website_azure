import React, { useState, useEffect } from 'react';
import { payoutsAPI } from '../api/adminApi';
import { Check, X, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
const PayoutRequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await payoutsAPI.getAllRequests();
            if (res.data.success) {
                setRequests(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching payout requests:', err);
            toast.error('Failed to load payout requests');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        if (!confirm(`Are you sure you want to mark this payout as ${status}?`)) return;

        try {
            await payoutsAPI.updateStatus(id, status);
            toast.success(`Payout ${status} successfully`);
            fetchRequests(); // Refresh list
        } catch (err) {
            console.error('Error updating status:', err);
            toast.error('Failed to update status');
        }
    };

    const exportToCSV = () => {
        const headers = ['Restaurant Name', 'Owner Name', 'Owner Phone', 'Order Count', 'Amount (Rs)', 'Date', 'Status'];
        const csvRows = requests.map(req => [
            `"${req.restaurantId?.name || 'Unknown'}"`,
            `"${req.restaurantId?.owner?.name || 'N/A'}"`,
            `"${req.restaurantId?.owner?.phone || 'N/A'}"`,
            req.orderCount || 0,
            req.amount,
            `"${new Date(req.createdAt).toLocaleDateString()}"`,
            `"${req.status}"`
        ]);
        const csvContent = [headers.join(','), ...csvRows.map(e => e.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'payout_requests.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-xl sm:text-2xl font-bold">Payout Requests</h1>
                <div className="flex gap-2">
                    <button 
                        onClick={exportToCSV}
                        className="px-4 py-2 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                    >
                        Export CSV
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : requests.length === 0 ? (
                <div className="text-gray-500 text-center py-10">
                    No payout requests found.
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="p-4 font-medium text-gray-500 text-sm">Restaurant</th>
                                <th className="p-4 font-medium text-gray-500 text-sm">Owner Info</th>
                                <th className="p-4 font-medium text-gray-500 text-sm">Order Count</th>
                                <th className="p-4 font-medium text-gray-500 text-sm">Amount</th>
                                <th className="p-4 font-medium text-gray-500 text-sm">Date</th>
                                <th className="p-4 font-medium text-gray-500 text-sm">Status</th>
                                <th className="p-4 font-medium text-gray-500 text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => (
                                <tr key={req._id} className="border-b hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="font-semibold">{req.restaurantId?.name || 'Unknown'}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm">
                                            <div>{req.restaurantId?.owner?.name || 'N/A'}</div>
                                            <div className="text-gray-500">{req.restaurantId?.owner?.phone || 'N/A'}</div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm">{req.orderCount || 0}</td>
                                    <td className="p-4 font-semibold text-green-600">₹{req.amount}</td>
                                    <td className="p-4 text-sm text-gray-500">
                                        {new Date(req.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                            req.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                            req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {req.status === 'Pending' && (
                                            <div className="flex gap-2">
                                                <button onClick={() => handleStatusUpdate(req._id, 'Completed')} className="text-green-600 hover:text-green-800" title="Approve">
                                                    <Check size={20} />
                                                </button>
                                                <button onClick={() => handleStatusUpdate(req._id, 'Failed')} className="text-red-600 hover:text-red-800" title="Reject">
                                                    <X size={20} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PayoutRequestsPage;
