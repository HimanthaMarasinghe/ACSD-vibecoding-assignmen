import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  useEffect(() => {
    if (!order) {
      navigate('/');
    }
  }, [order, navigate]);

  if (!order) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-green-600 px-6 py-10 sm:px-10 sm:py-16 text-center text-white">
          <CheckCircle className="mx-auto h-16 w-16 text-green-200 mb-4" />
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Order Confirmed!</h1>
          <p className="mt-2 text-lg text-green-100">
            Thank you for your purchase, {order.customer_name}.
          </p>
        </div>
        
        <div className="px-6 py-8 sm:px-10">
          <div className="flex justify-between items-center border-b border-gray-200 pb-6 mb-6">
            <div>
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="text-sm font-medium text-gray-900 break-all">{order.id}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Date</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
            <ul className="divide-y divide-gray-200 border-t border-b border-gray-200">
              {order.items.map((item) => (
                <li key={item.id} className="py-4 flex justify-between">
                  <div className="flex items-center">
                    <img src={item.image_url} alt={item.name} className="h-12 w-12 rounded object-cover mr-4" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-900">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                </li>
              ))}
            </ul>
            <div className="flex justify-between pt-4 mt-4">
              <p className="text-base font-medium text-gray-900">Total</p>
              <p className="text-xl font-bold text-green-600">Rs. {Number(order.total_amount).toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Shipping Details</h3>
            <p className="text-sm text-gray-600">{order.customer_name}</p>
            <p className="text-sm text-gray-600">{order.email}</p>
            <p className="text-sm text-gray-600">{order.phone}</p>
            <p className="text-sm text-gray-600 mt-2">{order.address}</p>
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-full shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
