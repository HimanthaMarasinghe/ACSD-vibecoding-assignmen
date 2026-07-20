import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import api from '../services/api';

const Payment = () => {
  const { cartItems, cartTotal, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [simulateSuccess, setSimulateSuccess] = useState(true);

  const checkoutData = JSON.parse(sessionStorage.getItem('ceyloncart_checkout_data') || '{}');

  useEffect(() => {
    if (cartItems.length === 0 || !checkoutData.email) {
      navigate('/');
    }
  }, [cartItems, checkoutData, navigate]);

  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (cardData.cardNumber.length < 16 || cardData.expiry.length < 5 || cardData.cvv.length < 3) {
      setError('Please fill in all card details correctly (Mock validation)');
      return;
    }

    setIsProcessing(true);

    // Simulate network delay for payment processing
    setTimeout(async () => {
      if (!simulateSuccess) {
        setIsProcessing(false);
        setError('Payment declined by the bank. Please try again.');
        return;
      }

      try {
        const orderPayload = {
          ...checkoutData,
          total_amount: cartTotal,
          items: cartItems
        };

        const response = await api.post('/orders', orderPayload);
        clearCart();
        sessionStorage.removeItem('ceyloncart_checkout_data');
        navigate('/confirmation', { state: { order: response.data } });
      } catch (err) {
        setIsProcessing(false);
        setError('Failed to save order. ' + (err.response?.data?.message || err.message));
      }
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Payment Details</h1>
          <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
            <Lock className="w-4 h-4 mr-1" />
            Secure Checkout
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl mb-8 flex justify-between items-center border border-gray-100">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total to pay</p>
            <p className="text-2xl font-bold text-gray-900">Rs. {cartTotal.toFixed(2)}</p>
          </div>
          <div className="flex space-x-2 items-center">
            <label className="text-sm font-medium text-gray-700 cursor-pointer flex items-center">
              <input 
                type="checkbox" 
                checked={simulateSuccess}
                onChange={(e) => setSimulateSuccess(e.target.checked)}
                className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              Simulate Success
            </label>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handlePayment} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CreditCard className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                maxLength="16"
                value={cardData.cardNumber}
                onChange={(e) => setCardData({...cardData, cardNumber: e.target.value.replace(/\D/g, '')})}
                placeholder="0000 0000 0000 0000"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
              <input
                type="text"
                placeholder="MM/YY"
                maxLength="5"
                value={cardData.expiry}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, '');
                  if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2, 4);
                  setCardData({...cardData, expiry: val});
                }}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
              <input
                type="text"
                maxLength="4"
                placeholder="123"
                value={cardData.cvv}
                onChange={(e) => setCardData({...cardData, cvv: e.target.value.replace(/\D/g, '')})}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white transition-all ${
              isProcessing ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Payment...
              </span>
            ) : (
              `Pay Rs. ${cartTotal.toFixed(2)}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Payment;
