import { useState, useEffect, useRef, useContext } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { productApi } from '../api';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import AddProductModal from '../components/AddProductModal';
import { AuthContext } from '../context/AuthContext';

const categories = ['All', 'Tea', 'Spices', 'Handicrafts', 'Apparel'];
const ITEMS_PER_PAGE = 8; // Fits 4-column, 2-column, and 1-column layouts evenly

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {user} = useContext(AuthContext); // Assuming you have AuthContext for user info

  // 1. New Pagination State
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalItems: 0,
    currentPage: 1,
  });

  const debounceTimer = useRef(null);

  // 2. Trigger fetch whenever search, category, OR page changes
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setLoading(true);

    debounceTimer.current = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(debounceTimer.current);
  }, [search, selectedCategory, page]);

  // 3. Reset to page 1 on new search or category selection
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const handleProductAdded = () => {
    fetchProducts();
  };

  const fetchProducts = async () => {
    try {
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
      };
      if (search) params.search = search;
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;

      const response = await productApi.getProducts(params);

      // Handle paginated object response { products: [...], pagination: {...} }
      if (response && response.products) {
        setProducts(response.products);
        setPagination(response.pagination);
      } else if (Array.isArray(response)) {
        // Fallback safety if API ever returns an array directly
        setProducts(response);
        setPagination({ totalPages: 1, totalItems: response.length, currentPage: 1 });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl mb-4">
          Authentic Sri Lankan <span className="text-green-600">Treasures</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Discover the finest Ceylon tea, exotic spices, beautiful handicrafts, and traditional apparel directly from the island of gems.
        </p>
      </div>

      {user && user.appRole === 'admin' && (
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 shadow-sm transition-colors"
          >
            + Add New Product
          </button>

          <AddProductModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onProductAdded={handleProductAdded}
          />
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
        <div className="w-full md:w-1/2 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm shadow-sm transition-shadow"
            placeholder="Search products..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid & Pagination */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onViewDetails={setSelectedProduct} />
            ))}
          </div>

          {/* 4. Pagination Footer Controls */}
          {pagination.totalPages > 1 && (
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 pt-6 gap-4">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{((page - 1) * ITEMS_PER_PAGE) + 1}</span> to{' '}
                <span className="font-semibold">
                  {Math.min(page * ITEMS_PER_PAGE, pagination.totalItems)}
                </span>{' '}
                of <span className="font-semibold">{pagination.totalItems}</span> products
              </p>

              <div className="inline-flex items-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>

                {/* Page Number Buttons */}
                <div className="hidden sm:flex items-center space-x-1">
                  {Array.from({ length: pagination.totalPages }, (_, index) => {
                    const pageNum = index + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-9 h-9 text-sm font-medium rounded-lg transition-colors ${
                          page === pageNum
                            ? 'bg-green-600 text-white font-bold shadow-sm'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages))}
                  disabled={page >= pagination.totalPages}
                  className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
        </div>
      )}

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
};

export default Home;