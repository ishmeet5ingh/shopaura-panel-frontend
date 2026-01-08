import { useState, useEffect } from 'react';
import API from '../../config/api';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiFilter } from 'react-icons/fi';
import CategoryForm from './CategoryForm';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [stats, setStats] = useState(null);
  const [filterLevel, setFilterLevel] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchStats();
  }, [filterLevel]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const params = { limit: 100 };
      if (filterLevel !== '') {
        params.level = filterLevel;
      }
      
      const response = await API.get('/categories', { params });
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert(error.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await API.get('/categories/admin/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await API.delete(`/categories/${id}`);
      alert('Category deleted successfully');
      fetchCategories();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await API.patch(`/categories/${id}/toggle-status`);
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to toggle category status');
    }
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  const handleSuccess = () => {
    closeModal();
    fetchCategories();
    fetchStats();
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">Manage your product categories</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-linear-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all font-semibold"
        >
          <FiPlus />
          <span>Add Category</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <p className="text-blue-100 text-sm font-semibold">Total Categories</p>
            <p className="text-4xl font-bold mt-2">{stats.total}</p>
          </div>
          <div className="bg-linear-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <p className="text-green-100 text-sm font-semibold">Active</p>
            <p className="text-4xl font-bold mt-2">{stats.active}</p>
          </div>
          <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <p className="text-purple-100 text-sm font-semibold">Main Categories</p>
            <p className="text-4xl font-bold mt-2">{stats.mainCategories}</p>
          </div>
          <div className="bg-linear-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
            <p className="text-pink-100 text-sm font-semibold">Subcategories</p>
            <p className="text-4xl font-bold mt-2">{stats.subcategories}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all"
            >
              <option value="">All Levels</option>
              <option value="0">Main Categories</option>
              <option value="1">Subcategories</option>
              <option value="2">Sub-subcategories</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-linear-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Parent
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.map((category) => (
                <tr key={category._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {category.image?.url && (
                        <img
                          src={category.image.url}
                          alt={category.name}
                          className="h-10 w-10 rounded-full object-cover mr-3 shadow-sm border-2 border-gray-200"
                        />
                      )}
                      <div className="text-sm font-semibold text-gray-900">{category.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 font-mono">{category.slug}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {category.parent?.name || (
                        <span className="text-blue-600 font-semibold">Main Category</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-linear-to-r from-blue-100 to-purple-100 text-blue-800">
                      Level {category.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{category.productCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(category._id)}
                      className={`px-3 py-1 text-xs font-bold rounded-full transition-all transform hover:scale-105 ${
                        category.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {category.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => openEditModal(category)}
                        className="text-blue-600 hover:text-blue-900 transform hover:scale-110 transition-all"
                        title="Edit"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(category._id, category.name)}
                        className="text-red-600 hover:text-red-900 transform hover:scale-110 transition-all"
                        title="Delete"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transform hover:scale-110 transition-all"
              >
                <FiX size={24} />
              </button>
            </div>
            <CategoryForm
              category={editingCategory}
              onSuccess={handleSuccess}
              onCancel={closeModal}
              categories={categories}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
