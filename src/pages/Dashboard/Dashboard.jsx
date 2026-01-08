import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../config/api';
import {
  FiPackage,
  FiShoppingCart,
  FiDollarSign,
  FiTrendingUp,
  FiUsers,
  FiStar,
  FiAlertCircle,
  FiCheckCircle,
  FiBarChart2,
  FiGrid,
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  const { user, isAdmin, isSeller } = useAuth();
  const [stats, setStats] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch product stats
      const productStatsPromise = API.get('/products/admin/stats');
      
      // Fetch category stats (admin only)
      const categoryStatsPromise = isAdmin 
        ? API.get('/categories/admin/stats') 
        : Promise.resolve({ data: {} });
      
      // Fetch recent products
      const recentProductsPromise = API.get('/products/my/products', {
        params: { limit: 5, includeInactive: 'true' }
      });

      const [productRes, categoryRes, recentRes] = await Promise.all([
        productStatsPromise,
        categoryStatsPromise,
        recentProductsPromise,
      ]);

      setStats(productRes.data.stats);
      setCategoryStats(productRes.data.categoryStats || []);
      setRecentProducts(recentRes.data.products || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: FiPackage,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: '+12%',
      changeType: 'increase',
    },
    {
      title: 'Active Products',
      value: stats?.activeProducts || 0,
      icon: FiCheckCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      change: '+8%',
      changeType: 'increase',
    },
    {
      title: 'Average Price',
      value: `$${stats?.averagePrice?.toFixed(2) || 0}`,
      icon: FiDollarSign,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      change: '+5%',
      changeType: 'increase',
    },
    {
      title: 'Total Stock',
      value: stats?.totalStock || 0,
      icon: FiShoppingCart,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      change: '-3%',
      changeType: 'decrease',
    },
    {
      title: 'Total Sold',
      value: stats?.totalSold || 0,
      icon: FiTrendingUp,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      change: '+15%',
      changeType: 'increase',
    },
    {
      title: 'Low Stock Items',
      value: recentProducts.filter(p => p.stock < 10).length,
      icon: FiAlertCircle,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      change: 'Alert',
      changeType: 'warning',
    },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-4xl font-bold">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-blue-100 mt-2 text-lg">
          Here's what's happening with your store today
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
                    {stat.title}
                  </p>
                  <p className="text-4xl font-bold text-gray-900 mt-3">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-3">
                    <span
                      className={`text-sm font-semibold ${
                        stat.changeType === 'increase'
                          ? 'text-green-600'
                          : stat.changeType === 'decrease'
                          ? 'text-red-600'
                          : 'text-orange-600'
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">vs last month</span>
                  </div>
                </div>
                <div
                  className={`${stat.bgColor} p-4 rounded-2xl shadow-md`}
                >
                  <Icon size={32} className={stat.textColor} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution - Bar Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <FiBarChart2 className="mr-2 text-blue-600" />
            Products by Category
          </h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={categoryStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Price Distribution - Pie Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <FiDollarSign className="mr-2 text-green-600" />
            Average Price by Category
          </h2>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={categoryStats}
                dataKey="averagePrice"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => 
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={{ stroke: '#666', strokeWidth: 1 }}
              >
                {categoryStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => `$${value.toFixed(2)}`}
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Products Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <FiPackage className="mr-2 text-purple-600" />
            Recent Products
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={product.thumbnail || product.images[0]?.url}
                        alt={product.name}
                        className="h-12 w-12 rounded-lg object-cover shadow-sm"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {product.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {product.category?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">
                      ${product.price}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full ${
                        product.stock > 10
                          ? 'bg-green-100 text-green-800'
                          : product.stock > 0
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full ${
                        product.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Statistics Table */}
      {categoryStats.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <FiGrid className="mr-2 text-indigo-600" />
              Category Statistics
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Avg Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categoryStats.map((category, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <div className="text-sm font-semibold text-gray-900">
                          {category.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {category.count}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-600">
                        ${category.averagePrice?.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2" style={{ width: '100px' }}>
                          <div
                            className="bg-linear-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                            style={{ width: `${Math.min((category.count / stats?.totalProducts) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-semibold text-gray-600">
                          {((category.count / stats?.totalProducts) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
