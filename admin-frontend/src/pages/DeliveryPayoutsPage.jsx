import React, { useState, useEffect } from 'react';
import { deliveryPayoutsAPI } from '../api/adminApi';

const DeliveryPayoutsPage = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const response = await deliveryPayoutsAPI.getAll();
      if (response.data.success) {
        setPayouts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching delivery payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (payouts.length === 0) return;
    const headers = ['Date', 'Delivery User', 'Email', 'Phone', 'Amount (Rs)', 'Status', 'Transaction ID'];
    const csvData = payouts.map(p => [
      `"${new Date(p.paidAt).toLocaleString()}"`,
      `"${p.deliveryUser?.name || 'N/A'}"`,
      `"${p.deliveryUser?.email || 'N/A'}"`,
      `"${p.deliveryUser?.phone || 'N/A'}"`,
      p.amount,
      p.status,
      p._id
    ]);
    const csvContent = [headers.join(","), ...csvData.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "delivery_payouts.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">Delivery Payouts</h2>
          <p className="mt-1 text-xs text-gray-600 sm:text-base">View all payouts sent to delivery personnel</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportToCSV} className="px-4 py-2 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700">Export CSV</button>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="overflow-hidden bg-white rounded-lg shadow">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary"></div>
          </div>
        ) : payouts.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">No delivery payouts found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Date</th>
                  <th scope="col" className="px-6 py-3">Delivery Partner</th>
                  <th scope="col" className="px-6 py-3">Amount</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr key={payout._id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(payout.paidAt).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{payout.deliveryUser?.name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{payout.deliveryUser?.email}</div>
                      <div className="text-xs text-gray-400">{payout.deliveryUser?.phone}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">₹{payout.amount?.toFixed(2) || payout.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        payout.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        payout.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {payout.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryPayoutsPage;
