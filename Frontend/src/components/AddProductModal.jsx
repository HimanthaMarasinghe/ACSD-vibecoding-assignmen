import { useState } from 'react';
import { X, PlusCircle, Loader2 } from 'lucide-react';
import { productApi } from '../api';

const CATEGORIES = ['Tea', 'Spices', 'Handicrafts', 'Apparel'];

const AddProductModal = ({ isOpen, onClose, onProductAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Tea',
    price: '',
    stock: '',
    image_url: '',
    source: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.price) {
      setError('Product name and price are required.');
      return;
    }

    try {
      setLoading(true);
      await productApi.createProduct(formData);
      onProductAdded(); // Callback to refresh product list
      onClose(); // Close modal on success
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <PlusCircle className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 py-4 overflow-y-auto flex-1 pr-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
              {error}
            </div>
          )}

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Dilmah Premium Ceylon Tea"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm transition-all outline-none"
            />
          </div>

          {/* Category & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm transition-all outline-none bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (LKR) *</label>
              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                required
                value={formData.price}
                onChange={handleChange}
                placeholder="1500"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm transition-all outline-none"
              />
            </div>
          </div>

          {/* Stock & Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
              <input
                type="number"
                name="stock"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                placeholder="50"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier / Source</label>
              <input
                type="text"
                name="source"
                value={formData.source}
                onChange={handleChange}
                placeholder="e.g. Barefoot Ceylon"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm transition-all outline-none"
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm transition-all outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="Write a brief product description..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm transition-all outline-none resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Saving...' : 'Add Product'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default AddProductModal;