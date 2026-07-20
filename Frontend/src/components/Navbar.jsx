import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Settings } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { cartItems, setIsCartOpen } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);

  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="fixed top-0 w-full bg-white shadow-sm z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-green-700">CeylonCart</Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/admin" className="text-gray-500 hover:text-gray-900 flex items-center">
                  <Settings className="w-5 h-5 mr-1" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
                <button onClick={logout} className="text-gray-500 hover:text-gray-900 flex items-center">
                  <LogOut className="w-5 h-5 mr-1" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="text-gray-500 hover:text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-1" />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-500 hover:text-green-700 transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-green-600 rounded-full">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
