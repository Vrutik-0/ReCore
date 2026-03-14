import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import AppLayout from './components/Layout/AppLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/Products/ProductList';
import Categories from './pages/Products/Categories';
import ReorderRules from './pages/Products/ReorderRules';
import Receipts from './pages/Operations/Receipts';
import Deliveries from './pages/Operations/Deliveries';
import Transfers from './pages/Operations/Transfers';
import Adjustments from './pages/Operations/Adjustments';
import MoveHistory from './pages/Operations/MoveHistory';
import Warehouses from './pages/Settings/Warehouses';
import Profile from './pages/Profile';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

      {/* Protected routes */}
      <Route path="/" element={<ProtectedRoute><AppProvider><AppLayout /></AppProvider></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<ProductList />} />
        <Route path="products/categories" element={<Categories />} />
        <Route path="products/reorder-rules" element={<ReorderRules />} />
        <Route path="operations/receipts" element={<Receipts />} />
        <Route path="operations/deliveries" element={<Deliveries />} />
        <Route path="operations/transfers" element={<Transfers />} />
        <Route path="operations/adjustments" element={<Adjustments />} />
        <Route path="operations/move-history" element={<MoveHistory />} />
        <Route path="settings/warehouses" element={<Warehouses />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
