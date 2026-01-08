import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome,
  FiPackage,
  FiGrid,
  FiStar,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiShoppingBag,
  FiUsers,
  FiBarChart2,
} from 'react-icons/fi';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isAdmin, isSeller } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      navigate('/login');
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const menuItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: FiHome, 
      roles: ['admin', 'seller'] 
    },
    { 
      path: '/dashboard/products', 
      label: 'Products', 
      icon: FiPackage, 
      roles: ['admin', 'seller'] 
    },
    { 
      path: '/dashboard/categories', 
      label: 'Categories', 
      icon: FiGrid, 
      roles: ['admin'] 
    },
    { 
      path: '/dashboard/reviews', 
      label: 'Reviews', 
      icon: FiStar, 
      roles: ['admin', 'seller'] 
    },
    { 
      path: '/dashboard/orders', 
      label: 'Orders', 
      icon: FiShoppingBag, 
      roles: ['admin', 'seller'] 
    },
    { 
      path: '/dashboard/users', 
      label: 'Users', 
      icon: FiUsers, 
      roles: ['admin'] 
    },
    { 
      path: '/dashboard/analytics', 
      label: 'Analytics', 
      icon: FiBarChart2, 
      roles: ['admin', 'seller'] 
    },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Overlay - ONLY shows on mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform duration-300 ease-in-out bg-white shadow-xl w-64 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ShopAura
              </h1>
              <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
            </div>
            {/* Close button - ONLY on mobile */}
            <button
              onClick={closeSidebar}
              className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors p-1 hover:bg-gray-100 rounded-lg"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-100 bg-linear-to-rrom-blue-50 to-purple-50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-linear-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-600 capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={closeSidebar}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Settings & Logout */}
          <div className="p-4 border-t border-gray-100 space-y-2">
            <Link
              to="/dashboard/settings"
              onClick={closeSidebar}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <FiSettings size={20} />
              <span className="font-medium">Settings</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 w-full transition-colors"
            >
              <FiLogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64 transition-all duration-300">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-20 border-b border-gray-100">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Hamburger Menu Button - ONLY on mobile */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors hover:bg-gray-100 p-2 rounded-lg focus:outline-none"
            >
              <FiMenu size={28} />
            </button>

            {/* Logo for mobile when sidebar is closed */}
            <div className="lg:hidden">
              <h1 className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ShopAura
              </h1>
            </div>

            {/* Right side - User info */}
            <div className="flex items-center space-x-4 ml-auto">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-linear-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;