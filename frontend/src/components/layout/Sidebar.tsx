import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { setSidebarOpen } from '../../store/slices/uiSlice';
import {
  HomeIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UserIcon,
  CogIcon,
  ChartBarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Products', href: '/products', icon: ShoppingBagIcon },
    { name: 'Cart', href: '/cart', icon: ShoppingCartIcon },
  ];

  const authenticatedNavigation = [
    { name: 'Profile', href: '/profile', icon: UserIcon },
    { name: 'Orders', href: '/orders', icon: ShoppingBagIcon },
  ];

  const vendorNavigation = [
    { name: 'Dashboard', href: '/vendor/dashboard', icon: ChartBarIcon },
  ];

  const adminNavigation = [
    { name: 'Admin', href: '/admin/dashboard', icon: CogIcon },
  ];

  const closeSidebar = () => {
    dispatch(setSidebarOpen(false));
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={closeSidebar}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75" />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Nexus Hub</h2>
          <button
            onClick={closeSidebar}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={closeSidebar}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                </li>
              );
            })}

            {isAuthenticated && (
              <>
                {authenticatedNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        onClick={closeSidebar}
                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                          isActive
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <item.icon
                          className={`mr-3 h-5 w-5 flex-shrink-0 ${
                            isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                          }`}
                        />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}

                {user?.role === 'vendor' &&
                  vendorNavigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          onClick={closeSidebar}
                          className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                            isActive
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <item.icon
                            className={`mr-3 h-5 w-5 flex-shrink-0 ${
                              isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                            }`}
                          />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}

                {user?.role === 'admin' &&
                  adminNavigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          onClick={closeSidebar}
                          className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                            isActive
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <item.icon
                            className={`mr-3 h-5 w-5 flex-shrink-0 ${
                              isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                            }`}
                          />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
              </>
            )}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
