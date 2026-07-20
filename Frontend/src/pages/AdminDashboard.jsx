import { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Package, Clock, CheckCircle } from 'lucide-react';
import api from '../services/api';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (err) {
      setError('Failed to load orders.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Package className="w-8 h-8 mr-3 text-green-600" />
          Admin Dashboard
        </h1>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
          <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {orders.length} Total
          </span>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <Package className="w-12 h-12 text-gray-300 mb-3" />
            <p>No orders have been placed yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-gray-400" />
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                      <div className="text-sm text-gray-500">{order.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      Rs. {Number(order.total_amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'Success' 
                          ? 'bg-green-100 text-green-800' 
                          : order.status === 'Failed' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
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

export default AdminDashboard;
