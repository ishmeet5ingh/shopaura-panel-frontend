import { useState, useEffect } from 'react';
import API from '../../config/api';

const CategoryForm = ({ category, onSuccess, onCancel, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent: '',
    image: { url: '' },
    icon: '',
    order: 0,
    isFeatured: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        parent: category.parent?._id || '',
        image: { url: category.image?.url || '' },
        icon: category.icon || '',
        order: category.order || 0,
        isFeatured: category.isFeatured || false,
      });
    }
  }, [category]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }
    
    if (formData.name.length > 100) {
      newErrors.name = 'Category name cannot exceed 100 characters';
    }
    
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'imageUrl') {
      setFormData((prev) => ({
        ...prev,
        image: { url: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        parent: formData.parent || null,
      };

      if (category) {
        await API.put(`/categories/${category._id}`, submitData);
        alert('Category updated successfully');
      } else {
        await API.post('/categories', submitData);
        alert('Category created successfully');
      }
      onSuccess();
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const mainCategories = categories.filter((cat) => cat.level === 0);

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Category Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className={`w-full px-4 py-3 border ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
          placeholder="Enter category name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className={`w-full px-4 py-3 border ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
          placeholder="Enter category description"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Parent Category
        </label>
        <select
          name="parent"
          value={formData.parent}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="">Main Category (No Parent)</option>
          {mainCategories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Image URL
        </label>
        <input
          type="url"
          name="imageUrl"
          value={formData.image.url}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="https://example.com/image.jpg"
        />
        {formData.image.url && (
          <div className="mt-3">
            <img
              src={formData.image.url}
              alt="Preview"
              className="h-20 w-20 object-cover rounded-lg border-2 border-gray-200"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Icon (CSS Class)
          </label>
          <input
            type="text"
            name="icon"
            value={formData.icon}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="fas fa-shopping-bag"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Display Order
          </label>
          <input
            type="number"
            name="order"
            value={formData.order}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="flex items-center bg-gray-50 rounded-lg p-4">
        <input
          type="checkbox"
          name="isFeatured"
          checked={formData.isFeatured}
          onChange={handleChange}
          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label className="ml-3 block text-sm font-semibold text-gray-700">
          Mark as Featured Category
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            category ? 'Update Category' : 'Create Category'
          )}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
