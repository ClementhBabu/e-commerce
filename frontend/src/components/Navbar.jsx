import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { count } = useCart();
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e) {
      if (!e.target.closest('#userDropdown')) setDropdownOpen(false);
      if (!e.target.closest('#mobileMenu') && !e.target.closest('#mobileMenuBtn')) setMobileMenuOpen(false);
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/?search=${encodeURIComponent(search.trim())}`);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/logout');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 shrink-0">
            <i className="fas fa-store text-2xl text-indigo-600"></i>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">ShopHub</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <i className="fas fa-search absolute left-4 top-3 text-gray-400 text-sm"></i>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
          </form>

          <div className="flex items-center space-x-4">
            <Link to="/" className="hidden md:flex items-center space-x-1 text-gray-600 hover:text-indigo-600 transition-colors">
              <i className="fas fa-home"></i><span className="text-sm font-medium">Home</span>
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/cart" className="relative flex items-center space-x-1 text-gray-600 hover:text-indigo-600 transition-colors">
                  <i className="fas fa-shopping-cart text-lg"></i>
                  {count > 0 && (
                    <span className="absolute -top-2 -right-3 bg-indigo-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {count}
                    </span>
                  )}
                </Link>

                <div id="userDropdown" className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
                  >
                    <i className="fas fa-user-circle text-xl"></i>
                    <span className="text-sm font-medium hidden md:inline">{user?.username}</span>
                    <i className="fas fa-chevron-down text-xs"></i>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 animate-fade-in-up">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800">{user?.username}</p>
                        {user?.email && <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>}
                      </div>
                      <Link to="/cart" onClick={() => setDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <i className="fas fa-shopping-cart mr-3 text-gray-400 w-4"></i>My Cart
                      </Link>
                      <Link to="/address" onClick={() => setDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <i className="fas fa-map-marker-alt mr-3 text-gray-400 w-4"></i>Addresses
                      </Link>
                      <hr className="my-1" />
                      <button onClick={handleLogout} className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <i className="fas fa-sign-out-alt mr-3 w-4"></i>Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-indigo-600 px-3 py-2 transition-colors">Sign In</Link>
                <Link to="/register" className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors">Sign Up</Link>
              </div>
            )}

            <button id="mobileMenuBtn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-gray-600">
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div id="mobileMenu" className="md:hidden pb-4 border-t border-gray-100 pt-3 animate-slide-up">
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative">
                <i className="fas fa-search absolute left-4 top-3 text-gray-400 text-sm"></i>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </form>
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700">Home</Link>
            {isAuthenticated ? (
              <>
                <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700">Cart ({count})</Link>
                <Link to="/address" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700">Addresses</Link>
                <button onClick={handleLogout} className="block py-2 text-red-600 w-full text-left">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700">Sign In</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-indigo-600 font-medium">Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
