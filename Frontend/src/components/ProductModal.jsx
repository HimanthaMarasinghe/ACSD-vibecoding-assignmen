import { X, ShoppingCart, Star } from 'lucide-react';
import { useContext, useState, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import api from '../services/api';

const ProductModal = ({ product, onClose }) => {
  const { addToCart } = useContext(CartContext);
  const [localProduct, setLocalProduct] = useState(product);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLocalProduct(product);
  }, [product]);

  if (!localProduct) return null;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !comment || !reviewerName) return;
    
    setSubmitting(true);
    try {
      const response = await api.post(`/products/${localProduct.id}/reviews`, {
        rating,
        comment,
        reviewer_name: reviewerName
      });
      
      const newReview = response.data;
      setLocalProduct(prev => ({
        ...prev,
        reviews: [...(prev.reviews || []), newReview]
      }));
      
      setComment('');
      setReviewerName('');
      setRating(5);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (count) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < count ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl relative flex flex-col md:flex-row my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-900 transition-colors z-10 sticky"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="w-full md:w-1/2 relative min-h-[300px] md:min-h-full">
          <img
            src={localProduct.image_url}
            alt={localProduct.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
          <div className="mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-green-600">
              {localProduct.category}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{localProduct.name}</h2>
          <p className="text-3xl font-extrabold text-gray-900 mb-4">
            Rs. {Number(localProduct.price).toFixed(2)}
          </p>
          <div className="prose prose-sm text-gray-600 mb-6">
            <p>{localProduct.description}</p>
          </div>
          
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Reviews</h3>
            <div className="max-h-40 overflow-y-auto mb-4 space-y-4 pr-2">
              {(!localProduct.reviews || localProduct.reviews.length === 0) ? (
                <p className="text-sm text-gray-500">No reviews yet. Be the first to review!</p>
              ) : (
                localProduct.reviews.map((review, idx) => (
                  <div key={review.id || idx} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">{review.reviewer_name}</span>
                      <div className="flex">{renderStars(review.rating)}</div>
                    </div>
                    <p className="text-sm text-gray-600">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
            
            <form onSubmit={handleReviewSubmit} className="bg-gray-50 p-4 rounded-xl">
              <h4 className="text-sm font-semibold mb-3">Write a Review</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                />
                <select 
                  value={rating} 
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                >
                  <option value={5}>5 Stars - Excellent</option>
                  <option value={4}>4 Stars - Good</option>
                  <option value={3}>3 Stars - Average</option>
                  <option value={2}>2 Stars - Poor</option>
                  <option value={1}>1 Star - Terrible</option>
                </select>
                <textarea
                  placeholder="Your Comment"
                  required
                  rows="2"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                ></textarea>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gray-900 text-white py-2 rounded text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-auto pt-6 border-t border-gray-100">
            <button
              onClick={() => {
                addToCart(localProduct);
                onClose();
              }}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
