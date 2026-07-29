import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

export default function AdminRouteGuard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    // Redirect to login page if not authenticated or not an admin
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
