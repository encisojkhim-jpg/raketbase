import { Navigate, Outlet } from 'react-router-dom';

// Route guard for admin-only pages. Mirrors ProtectedRoute, but also checks the
// user's `role` (not active_role — admin is an account type, not a mode toggle).
// This is a UX guard only; the real enforcement is requireAdmin on the backend.
export default function AdminRoute() {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
