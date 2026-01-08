import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/Layout/DashboardLayout';

// Pages
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Categories from './pages/Categories/Categories';
import Products from './pages/Products/Products';
import ProductForm from './pages/Products/ProductForm';
import AdminReviews from './pages/Reviews/AdminReviews';


const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="bg-white p-8 rounded-lg shadow-md text-center">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Unauthorized</h1>
      <p className="text-gray-600">You don't have permission to access this page.</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes - Seller & Admin */}
          <Route element={<ProtectedRoute allowedRoles={['seller', 'admin']} />}>
            <Route
              path="/dashboard"
              element={
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              }
            />
            <Route
              path="/dashboard/products"
              element={
                <DashboardLayout>
                  <Products />
                </DashboardLayout>
              }
            />
            <Route
              path="/dashboard/products/add"
              element={
                <DashboardLayout>
                  <ProductForm />
                </DashboardLayout>
              }
            />
            <Route
              path="/dashboard/products/edit/:id"
              element={
                <DashboardLayout>
                  <ProductForm />
                </DashboardLayout>
              }
            />
          </Route>

          {/* Admin Only Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route
              path="/dashboard/categories"
              element={
                <DashboardLayout>
                  <Categories />
                </DashboardLayout>
              }
            />
          </Route>

          {/* ADD THIS NEW ROUTE ⬇️ */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}></Route>
          <Route
            path="/dashboard/reviews"
            element={
              <DashboardLayout>
                <AdminReviews />
              </DashboardLayout>
            }
          />

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
