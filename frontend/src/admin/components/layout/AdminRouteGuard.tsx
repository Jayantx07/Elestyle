import { Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function AdminRouteGuard() {
  // TODO: Replace with actual authentication context/hook once backend is ready
  const [isAuthenticated] = useState(true);
  const [isLoading] = useState(false);

  useEffect(() => {
    // Simulate auth check
    // setIsAuthenticated(checkAuthStatus());
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
