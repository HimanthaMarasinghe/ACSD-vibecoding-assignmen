import { useNavigate, useLocation } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';

const PaymentFailed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const errorMessage = location.state?.message || 'Payment declined by the bank. Please check your card details and try again.';

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12 mt-8">
        <div className="flex justify-center mb-6">
          <XCircle className="w-20 h-20 text-red-500" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Payment Failed</h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          {errorMessage}
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => navigate('/payment')}
            className="inline-flex justify-center items-center px-8 py-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-green-600 hover:bg-green-700"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="inline-flex justify-center items-center px-8 py-4 border border-gray-300 rounded-xl shadow-sm text-base font-bold text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Shop
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
