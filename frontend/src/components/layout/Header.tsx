import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { setCartOpen, addNotification } from '../../store/slices/uiSlice';
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

const departments = [
  'All Departments',
  'Electronics',
  'Computers',
  'Smart Home',
  'Arts & Crafts',
  'Automotive',
  'Baby',
  'Beauty & Personal Care',
  'Fashion',
  'Health & Household',
  'Home & Kitchen',
  'Industrial & Scientific',
  'Movies & Television',
  'Music, CDs & Vinyl',
  'Office Products',
  'Pet Supplies',
  'Software',
  'Sports & Outdoors',
  'Tools & Home Improvement',
  'Toys & Games',
  'Video Games',
];

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('All Departments');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [deptMenuOpen, setDeptMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const deptMenuRef = useRef<HTMLDivElement>(null);

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const cartItemCount = useSelector((state: RootState) => state.cart.itemCount);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (deptMenuRef.current && !deptMenuRef.current.contains(event.target as Node)) {
        setDeptMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(addNotification({
      type: 'success',
      message: 'Logged out successfully',
      duration: 3000,
    }));
    navigate('/');
    setUserMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}&category=${encodeURIComponent(searchCategory)}`);
      setSearchQuery('');
    }
  };

  const cartOpen = useSelector((state: RootState) => state.ui.cartOpen);

  return (
    <header className="bg-amazon-dark sticky top-0 z-50">
      {/* Top bar with location and language */}
      <div className="bg-amazon-dark text-white text-xs px-4 py-1 flex items-center justify-between">
        <div className="flex items-center">
          <MapPinIcon className="h-4 w-4 mr-1" />
          <span>Deliver to {user ? user.firstName : 'Guest'}</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="cursor-pointer hover:underline">English</span>
          <span className="cursor-pointer hover:underline">Nigeria</span>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-amazon-dark px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center p-2 text-white hover:bg-amazon-dark-hover rounded-md transition-colors"
          >
            <Bars3Icon className="h-6 w-6" />
            <span className="ml-1 text-sm font-medium">All</span>
          </button>

          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-white flex-shrink-0">
            <span className="text-white">nexus</span>
            <span className="text-amazon-yellow">hub</span>
          </Link>

          {/* Delivery location - desktop */}
          <div className="hidden lg:flex flex-col text-white cursor-pointer hover:underline">
            <span className="text-xs">Deliver to</span>
            <span className="text-sm font-bold flex items-center">
              Nigeria
            </span>
          </div>

          {/* Search bar - Amazon style */}
          <div className="flex-1 max-w-3xl flex">
            {/* Department dropdown */}
            <div className="relative" ref={deptMenuRef}>
              <button
                onClick={() => setDeptMenuOpen(!deptMenuOpen)}
                className="bg-amazon-light-2 hover:bg-gray-200 px-3 py-2 rounded-l-md text-sm text-gray-900 flex items-center border-r border-gray-300"
              >
                <span className="hidden sm:inline">{searchCategory}</span>
                <span className="sm:hidden">All</span>
                <ChevronDownIcon className="h-4 w-4 ml-1" />
              </button>
              {/* Departments dropdown */}
              {deptMenuOpen && (
                <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-md shadow-lg py-2 z-50 max-h-96 overflow-y-auto">
                  {departments.map((dept) => (
                    <button
                      key={dept}
                      onClick={() => {
                        setSearchCategory(dept);
                        setDeptMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        dept === searchCategory ? 'bg-gray-100 font-medium' : ''
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search input */}
            <form onSubmit={handleSearch} className="flex-1 flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Nexus Hub"
                className="flex-1 px-4 py-2 text-gray-900 focus:outline-none border-none"
              />
              <button
                type="submit"
                className="bg-amazon-orange hover:bg-orange-400 px-4 py-2 rounded-r-md border border-orange-500"
              >
                <MagnifyingGlassIcon className="h-6 w-6 text-black" />
              </button>
            </form>
          </div>

          {/* Right side - Account, Returns, Cart */}
          <div className="flex items-center space-x-2">
            {/* Language selector - mobile */}
            <button className="hidden md:flex items-center text-white text-sm hover:underline">
              <span className="text-xs">EN</span>
            </button>

            {/* Account & Lists */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    setUserMenuOpen(!userMenuOpen);
                  } else {
                    navigate('/login');
                  }
                }}
                className="text-white p-2 hover:bg-amazon-dark-hover rounded-md transition-colors hidden sm:block"
              >
                <div className="text-xs">Hello, {isAuthenticated ? user?.firstName || 'User' : 'Sign in'}</div>
                <div className="text-sm font-bold flex items-center">
                  Account & Lists
                  <ChevronDownIcon className="h-4 w-4 ml-1" />
                </div>
              </button>

              {/* User dropdown */}
              {isAuthenticated && userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-md shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Your Account
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Your Orders
                  </Link>
                  <Link
                    to="/wishlist"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Your Wish List
                  </Link>
                  {user?.role === 'vendor' && (
                    <Link
                      to="/vendor/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Vendor Dashboard
                    </Link>
                  )}
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <div className="border-t border-gray-200 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Returns & Orders */}
            <Link
              to="/orders"
              className="text-white p-2 hover:bg-amazon-dark-hover rounded-md transition-colors hidden sm:block"
            >
              <div className="text-xs">Returns</div>
              <div className="text-sm font-bold">& Orders</div>
            </Link>

            {/* Cart */}
            <button
              onClick={() => dispatch(setCartOpen(!cartOpen))}
              className="relative p-2 text-white hover:bg-amazon-dark-hover rounded-md transition-colors flex items-end"
            >
              <ShoppingCartIcon className="h-8 w-8" />
              <span className="absolute -top-1 left-5 bg-amazon-yellow text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
              <span className="text-sm font-bold ml-1 hidden sm:inline">Cart</span>
            </button>
          </div>
        </div>
      </div>

      {/* Secondary navigation */}
      <div className="bg-amazon-dark-hover px-4 py-2 flex items-center space-x-4 overflow-x-auto scrollbar-hide">
        <button className="text-white text-sm hover:underline flex items-center">
          <Bars3Icon className="h-5 w-5 mr-1" />
          All
        </button>
        <Link to="/products?category=Electronics" className="text-white text-sm hover:underline whitespace-nowrap">
          Electronics
        </Link>
        <Link to="/products?category=Fashion" className="text-white text-sm hover:underline whitespace-nowrap">
          Fashion
        </Link>
        <Link to="/products?category=Home" className="text-white text-sm hover:underline whitespace-nowrap">
          Home & Kitchen
        </Link>
        <Link to="/products?category=Sports" className="text-white text-sm hover:underline whitespace-nowrap">
          Sports & Outdoors
        </Link>
        <Link to="/products?category=Toys" className="text-white text-sm hover:underline whitespace-nowrap">
          Toys & Games
        </Link>
        <Link to="/products?category=Beauty" className="text-white text-sm hover:underline whitespace-nowrap">
          Beauty & Personal Care
        </Link>
        <Link to="/vendor/register" className="text-white text-sm hover:underline whitespace-nowrap">
          Sell on Nexus Hub
        </Link>
      </div>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl overflow-y-auto">
            <div className="bg-amazon-dark p-4 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Menu</h2>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="py-2">
              {departments.slice(1).map((dept) => (
                <Link
                  key={dept}
                  to={`/products?category=${encodeURIComponent(dept)}`}
                  className="block px-4 py-3 text-gray-900 hover:bg-gray-100 border-b border-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {dept}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
