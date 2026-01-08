import React, { useState, useEffect } from 'react';
import { 
  Star, 
  ThumbsUp, 
  MessageSquare, 
  Search, 
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Trash2,
  Reply,
  User,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  AlertCircle,
  TrendingUp,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../config/api';

const AdminReviews = () => {
  const { user, isAuthenticated, loading: authLoading, isAdmin, isSeller } = useAuth();
  const navigate = useNavigate();

  // State Management
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    status: 'pending',
    rating: '',
    sort: 'newest',
    search: ''
  });

  // Modal States
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Check authentication and permissions
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        showNotification('Please login to access this page', 'error');
        navigate('/login');
        return;
      }

      if (!isAdmin && !isSeller) {
        showNotification('You do not have permission to access this page', 'error');
        navigate('/');
        return;
      }
    }
  }, [isAuthenticated, authLoading, isAdmin, isSeller, navigate]);

  // Fetch reviews on component mount and filter changes
  useEffect(() => {
    if (isAuthenticated && (isAdmin || isSeller)) {
      fetchReviews();
      fetchStats();
    }
  }, [currentPage, filters, isAuthenticated, isAdmin, isSeller]);

  // Fetch Reviews
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        )
      });

      const { data } = await API.get(`/reviews/admin/all?${params}`);

      if (data.success) {
        setReviews(data.reviews);
        setTotalPages(data.totalPages);
        setTotalReviews(data.total);
      } else {
        console.error('API Error:', data.message);
        showNotification(data.message || 'Failed to fetch reviews', 'error');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);

      if (error.response?.status === 401) {
        showNotification('Session expired. Please login again', 'error');
        navigate('/login');
      } else {
        showNotification('Failed to fetch reviews', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch Statistics
  const fetchStats = async () => {
    try {
      const { data } = await API.get('/reviews/admin/all');

      if (data.success && data.stats) {
        const statusMap = { pending: 0, approved: 0, rejected: 0 };
        data.stats.forEach(stat => {
          statusMap[stat._id] = stat.count;
        });

        setStats({
          pending: statusMap.pending,
          approved: statusMap.approved,
          rejected: statusMap.rejected,
          total: statusMap.pending + statusMap.approved + statusMap.rejected
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Handle Review Approval
  const handleApprove = async (reviewId) => {
    setActionLoading(true);
    try {
      const { data } = await API.patch(`/reviews/${reviewId}/status`, {
        status: 'approved'
      });

      if (data.success) {
        showNotification('Review approved successfully!', 'success');
        fetchReviews();
        fetchStats();
      } else {
        showNotification(data.message || 'Failed to approve review', 'error');
      }
    } catch (error) {
      console.error('Error approving review:', error);
      showNotification('Failed to approve review', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Review Rejection
  const handleReject = async (reviewId) => {
    if (!window.confirm('Are you sure you want to reject this review?')) return;

    setActionLoading(true);
    try {
      const { data } = await API.patch(`/reviews/${reviewId}/status`, {
        status: 'rejected'
      });

      if (data.success) {
        showNotification('Review rejected', 'success');
        fetchReviews();
        fetchStats();
      } else {
        showNotification(data.message || 'Failed to reject review', 'error');
      }
    } catch (error) {
      console.error('Error rejecting review:', error);
      showNotification('Failed to reject review', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Review Deletion
  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;

    setActionLoading(true);
    try {
      const { data } = await API.delete(`/reviews/${reviewId}`);

      if (data.success) {
        showNotification('Review deleted successfully', 'success');
        fetchReviews();
        fetchStats();
      } else {
        showNotification(data.message || 'Failed to delete review', 'error');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      showNotification('Failed to delete review', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Add Response
  const handleAddResponse = async () => {
    if (!responseText.trim()) {
      showNotification('Please enter a response', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const { data } = await API.post(`/reviews/${selectedReview._id}/response`, {
        message: responseText
      });

      if (data.success) {
        showNotification('Response added successfully!', 'success');
        setShowResponseModal(false);
        setResponseText('');
        fetchReviews();
      } else {
        showNotification(data.message || 'Failed to add response', 'error');
      }
    } catch (error) {
      console.error('Error adding response:', error);
      showNotification('Failed to add response', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Notification Function
  const showNotification = (message, type) => {
    const notification = document.createElement('div');
    notification.className = `fixed top-5 right-5 px-6 py-4 rounded-lg shadow-lg text-white z-50 transition-all duration-300 transform translate-x-full ${
      type === 'success' ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 10);

    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  // Render Star Rating
  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  // Format Date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated || (!isAdmin && !isSeller)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">Review Management</h1>
        </div>
        <p className="text-gray-600">Moderate and manage customer reviews</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Pending Card */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div className="p-6 flex items-center gap-4 relative">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Pending Reviews</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.pending}</h3>
              <div className="flex items-center gap-1 mt-2 text-xs font-medium text-yellow-600">
                <AlertCircle size={12} />
                <span>Needs Action</span>
              </div>
            </div>
          </div>
          <div className="h-1 bg-linear-to-r from-yellow-400 to-orange-500"></div>
        </div>

        {/* Approved Card */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div className="p-6 flex items-center gap-4 relative">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Approved</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.approved}</h3>
              <div className="flex items-center gap-1 mt-2 text-xs font-medium text-green-600">
                <TrendingUp size={12} />
                <span>Published</span>
              </div>
            </div>
          </div>
          <div className="h-1 bg-linear-to-r from-green-400 to-emerald-500"></div>
        </div>

        {/* Rejected Card */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div className="p-6 flex items-center gap-4 relative">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-red-400 to-rose-500 flex items-center justify-center shadow-lg">
              <XCircle className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Rejected</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.rejected}</h3>
              <div className="flex items-center gap-1 mt-2 text-xs font-medium text-red-600">
                <span>Moderated</span>
              </div>
            </div>
          </div>
          <div className="h-1 bg-linear-to-r from-red-400 to-rose-500"></div>
        </div>

        {/* Total Card */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div className="p-6 flex items-center gap-4 relative">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Reviews</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</h3>
              <div className="flex items-center gap-1 mt-2 text-xs font-medium text-blue-600">
                <span>All Time</span>
              </div>
            </div>
          </div>
          <div className="h-1 bg-linear-to-r from-blue-400 to-indigo-500"></div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-5 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product name, user, or review content..."
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all duration-200"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => {
              setFilters({ ...filters, status: e.target.value });
              setCurrentPage(1);
            }}
            className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer font-medium text-gray-700 hover:border-gray-300 transition-all duration-200"
          >
            <option value="">All Status</option>
            <option value="pending">⏳ Pending</option>
            <option value="approved">✅ Approved</option>
            <option value="rejected">❌ Rejected</option>
          </select>

          {/* Rating Filter */}
          <select
            value={filters.rating}
            onChange={(e) => {
              setFilters({ ...filters, rating: e.target.value });
              setCurrentPage(1);
            }}
            className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer font-medium text-gray-700 hover:border-gray-300 transition-all duration-200"
          >
            <option value="">All Ratings</option>
            <option value="5">⭐ 5 Stars</option>
            <option value="4">⭐ 4 Stars</option>
            <option value="3">⭐ 3 Stars</option>
            <option value="2">⭐ 2 Stars</option>
            <option value="1">⭐ 1 Star</option>
          </select>

          {/* Sort Filter */}
          <select
            value={filters.sort}
            onChange={(e) => {
              setFilters({ ...filters, sort: e.target.value });
              setCurrentPage(1);
            }}
            className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer font-medium text-gray-700 hover:border-gray-300 transition-all duration-200"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rating_high">Highest Rating</option>
            <option value="rating_low">Lowest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-xl shadow-md p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <MessageSquare size={64} className="mb-4 opacity-30" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-600">
              {filters.status === 'pending' 
                ? 'No pending reviews at the moment' 
                : 'No reviews match your current filters'}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {reviews.map((review) => (
              <div 
                key={review._id} 
                className="border-2 border-gray-200 rounded-xl p-6 hover:border-indigo-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                {/* Review Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0">
                      {review.user?.avatar ? (
                        <img src={review.user.avatar} alt={review.user.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User size={24} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {review.user?.name || 'Anonymous User'}
                      </h4>
                      <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {review.verified && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-linear-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-xs font-semibold">
                        <CheckCircle size={14} />
                        Verified Purchase
                      </span>
                    )}
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      review.status === 'pending' 
                        ? 'bg-linear-to-r from-yellow-100 to-orange-100 text-yellow-800 animate-pulse' 
                        : review.status === 'approved'
                        ? 'bg-linear-to-r from-green-100 to-emerald-100 text-green-800'
                        : 'bg-linear-to-r from-red-100 to-rose-100 text-red-800'
                    }`}>
                      {review.status}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-4 border border-gray-200">
                  <img 
                    src={review.product?.thumbnail || '/placeholder.png'} 
                    alt={review.product?.name}
                    className="w-20 h-20 rounded-lg object-cover border-2 border-white shadow-md"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{review.product?.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(review.rating)}
                      <span className="font-bold text-gray-900">{review.rating}.0</span>
                    </div>
                  </div>
                </div>

                {/* Review Content */}
                <div className="mb-4">
                  {review.title && (
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{review.title}</h4>
                  )}
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>

                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-3 mt-4 flex-wrap">
                      {review.images.slice(0, 3).map((image, index) => (
                        <img
                          key={index}
                          src={image.url}
                          alt={`Review ${index + 1}`}
                          className="w-24 h-24 rounded-lg object-cover cursor-pointer border-2 border-gray-200 hover:border-indigo-500 transition-all duration-200 hover:scale-105"
                          onClick={() => window.open(image.url, '_blank')}
                        />
                      ))}
                      {review.images.length > 3 && (
                        <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 text-gray-600 font-semibold text-sm">
                          +{review.images.length - 3} more
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 py-3 border-t border-b border-gray-200 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <ThumbsUp size={16} />
                    <span className="text-sm font-medium">{review.helpfulCount} found helpful</span>
                  </div>
                </div>

                {/* Seller Response */}
                {review.response && (
                  <div className="bg-linear-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border-l-4 border-indigo-500 mb-4">
                    <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
                      <Reply size={16} className="text-indigo-600" />
                      <strong>Seller Response</strong>
                      <span className="ml-auto text-gray-500 font-normal">
                        {formatDate(review.response.respondedAt)}
                      </span>
                    </div>
                    <p className="text-gray-700">{review.response.message}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => {
                      setSelectedReview(review);
                      setShowDetailModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-indigo-500 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-500 hover:text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <Eye size={16} />
                    View Details
                  </button>

                  {!review.response && (
                    <button 
                      onClick={() => {
                        setSelectedReview(review);
                        setShowResponseModal(true);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-cyan-500 text-cyan-600 rounded-lg font-semibold hover:bg-cyan-500 hover:text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <Reply size={16} />
                      Add Response
                    </button>
                  )}

                  {review.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleApprove(review._id)}
                        disabled={actionLoading}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-rrom-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>
                      <button 
                        onClick={() => handleReject(review._id)}
                        disabled={actionLoading}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-rrom-red-500 to-rose-500 text-white rounded-lg font-semibold hover:from-red-600 hover:to-rose-600 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </>
                  )}

                  {review.status === 'approved' && (
                    <button 
                      onClick={() => handleReject(review._id)}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-red-500 text-red-600 rounded-lg font-semibold hover:bg-red-500 hover:text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60"
                    >
                      <XCircle size={16} />
                      Unpublish
                    </button>
                  )}

                  {review.status === 'rejected' && (
                    <button 
                      onClick={() => handleApprove(review._id)}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-green-500 text-green-600 rounded-lg font-semibold hover:bg-green-500 hover:text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60"
                    >
                      <CheckCircle size={16} />
                      Approve
                    </button>
                  )}

                  <button 
                    onClick={() => handleDelete(review._id)}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-400 text-gray-600 rounded-lg font-semibold hover:bg-gray-600 hover:text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination - SAME AS BEFORE */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-md p-6 mt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700"
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg font-bold transition-all duration-200 ${
                      currentPage === pageNum
                        ? 'bg-linear-to-brrom-indigo-500 to-purple-600 text-white shadow-lg'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-indigo-500 hover:text-indigo-600'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700"
            >
              Next
              <ChevronRight size={20} />
            </button>
          </div>

          <p className="text-center text-sm text-gray-600 mt-4">
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalReviews)} of {totalReviews} reviews
          </p>
        </div>
      )}

      {/* Detail Modal - SAME AS BEFORE */}
      {showDetailModal && selectedReview && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailModal(false)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b bg-linear-to-r from-indigo-50 to-purple-50">
              <h2 className="text-2xl font-bold text-gray-900">Review Details</h2>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="w-10 h-10 rounded-xl bg-white hover:bg-red-500 text-gray-600 hover:text-white transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="mb-6 pb-6 border-b">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Customer Information</h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <strong className="text-gray-600 min-w-35">Name:</strong>
                    <span className="text-gray-900 font-medium">{selectedReview.user?.name || 'Anonymous'}</span>
                  </div>
                  <div className="flex gap-3">
                    <strong className="text-gray-600 min-w-35">Email:</strong>
                    <span className="text-gray-900">{selectedReview.user?.email || 'N/A'}</span>
                  </div>
                  <div className="flex gap-3">
                    <strong className="text-gray-600 min-w-35">Verified Purchase:</strong>
                    <span className={`font-semibold ${selectedReview.verified ? 'text-green-600' : 'text-gray-600'}`}>
                      {selectedReview.verified ? 'Yes ✓' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-6 pb-6 border-b">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Product</h3>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <img 
                    src={selectedReview.product?.thumbnail || '/placeholder.png'} 
                    alt={selectedReview.product?.name}
                    className="w-24 h-24 rounded-lg object-cover border-2 border-white shadow-md"
                  />
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{selectedReview.product?.name}</p>
                    <p className="text-indigo-600 font-bold text-xl">${selectedReview.product?.price}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6 pb-6 border-b">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Review</h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <strong className="text-gray-600 min-w-35">Rating:</strong>
                    <div className="flex items-center gap-2">
                      {renderStars(selectedReview.rating)}
                      <span className="font-bold text-gray-900">{selectedReview.rating}.0</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <strong className="text-gray-600 min-w-35">Title:</strong>
                    <span className="text-gray-900 font-medium">{selectedReview.title || 'No title'}</span>
                  </div>
                  <div className="flex gap-3">
                    <strong className="text-gray-600 min-w-35">Comment:</strong>
                    <p className="text-gray-700 flex-1">{selectedReview.comment}</p>
                  </div>
                  <div className="flex gap-3">
                    <strong className="text-gray-600 min-w-35">Status:</strong>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      selectedReview.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : selectedReview.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedReview.status}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <strong className="text-gray-600 min-w-35">Helpful Count:</strong>
                    <span className="text-gray-900 font-medium">{selectedReview.helpfulCount}</span>
                  </div>
                  <div className="flex gap-3">
                    <strong className="text-gray-600 min-w-35">Submitted:</strong>
                    <span className="text-gray-900">{formatDate(selectedReview.createdAt)}</span>
                  </div>
                </div>
              </div>

              {selectedReview.images && selectedReview.images.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Review Images</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedReview.images.map((image, index) => (
                      <img
                        key={index}
                        src={image.url}
                        alt={`Review ${index + 1}`}
                        className="w-full h-32 rounded-lg object-cover cursor-pointer border-2 border-gray-200 hover:border-indigo-500 transition-all duration-200 hover:scale-105"
                        onClick={() => window.open(image.url, '_blank')}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedReview && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowResponseModal(false)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b bg-linear-to-rrom-indigo-50 to-purple-50">
              <h2 className="text-2xl font-bold text-gray-900">Add Response</h2>
              <button 
                onClick={() => setShowResponseModal(false)}
                className="w-10 h-10 rounded-xl bg-white hover:bg-red-500 text-gray-600 hover:text-white transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-linear-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border-l-4 border-indigo-500 mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">Responding to:</p>
                <p className="text-gray-600 italic">{selectedReview.comment}</p>
              </div>

              <textarea
                placeholder="Write your response..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                maxLength={1000}
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 resize-none transition-all duration-200"
              />
              <p className="text-right text-sm text-gray-500 mt-2">{responseText.length}/1000</p>
            </div>

            <div className="flex gap-3 p-6 border-t bg-gray-50">
              <button 
                onClick={() => setShowResponseModal(false)}
                disabled={actionLoading}
                className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddResponse}
                disabled={actionLoading || !responseText.trim()}
                className="flex-1 px-6 py-3 bg-linear-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {actionLoading ? 'Sending...' : 'Send Response'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminReviews;