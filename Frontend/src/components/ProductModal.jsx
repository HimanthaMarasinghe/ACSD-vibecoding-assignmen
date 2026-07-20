import { X, ShoppingCart } from 'lucide-react';
import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

const ProductModal = ({ product, onClose }) => {
  const { addToCart } = useContext(CartContext);

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-900 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="w-full md:w-1/2 relative min-h-[250px] md:min-h-[400px]">
          <img
            src={product.image_url}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
          <div className="mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-green-600">
              {product.category}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>
          <p className="text-3xl font-extrabold text-gray-900 mb-6">
            ${Number(product.price).toFixed(2)}
          </p>
          <div className="prose prose-sm text-gray-600 mb-8 flex-grow">
            <p>{product.description}</p>
          </div>
          <div className="mt-auto pt-6 border-t border-gray-100">
            <button
              onClick={() => {
                addToCart(product);
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
