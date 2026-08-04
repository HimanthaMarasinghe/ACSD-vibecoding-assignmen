import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShoppingCart, 
  User, 
  LogOut, 
  LogIn, 
  LayoutDashboard, 
  Store 
} from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { cartItems, setIsCartOpen, clearCart } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const handleLogout = async () => {
    await logout();   // 1. Clear session / cookies
    clearCart();      // 2. Clear cart items
  };

  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Check if current page is inside the admin section
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Brand Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-extrabold text-green-700 tracking-tight hover:text-green-800 transition-colors">
              Ceylon<span className="text-gray-900">Cart</span>
            </Link>
          </div>

          {/* Navigation Links & User Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {user ? (
              <>
                {/* 1. Profile Badge (Non-clickable chip) */}
                <div 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-50 text-green-800 border border-green-200/80 cursor-default select-none shadow-xs"
                  title={`Logged in as ${user.user_metadata?.name || 'User'}`}
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <User className="w-3.5 h-3.5 text-green-700" />
                  <span className="max-w-[110px] sm:max-w-[160px] truncate font-medium">
                    {user.user_metadata?.name || 'Account'}
                  </span>
                </div>

                {/* 2. Admin Contextual Link */}
                {user.appRole === 'admin' && (
                  isAdminRoute ? (
                    <Link 
                      to="/" 
                      className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-green-700 hover:bg-green-50 px-3 py-2 rounded-xl transition-all"
                    >
                      <Store className="w-4 h-4 mr-1.5 text-green-600" />
                      <span className="hidden sm:inline">Storefront</span>
                    </Link>
                  ) : (
                    <Link 
                      to="/admin" 
                      className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-green-700 hover:bg-green-50 px-3 py-2 rounded-xl transition-all"
                    >
                      <LayoutDashboard className="w-4 h-4 mr-1.5 text-green-600" />
                      <span className="hidden sm:inline">Dashboard</span>
                    </Link>
                  )
                )}

                {/* 3. Logout Button */}
                <button 
                  onClick={handleLogout} 
                  className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              /* 4. Login Link */
              <Link 
                to="/login" 
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-green-700 hover:bg-green-50 px-3 py-2 rounded-xl transition-all"
              >
                <LogIn className="w-4 h-4 mr-1.5 text-green-600" />
                <span>Login</span>
              </Link>
            )}

            {/* 5. Shopping Cart Toggle */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-all"
              aria-label="View Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[20px] h-[20px] px-1 text-xs font-bold text-white bg-green-600 rounded-full border-2 border-white shadow-xs">
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