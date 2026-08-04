// src/components/AdminRoute.jsx
import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function AdminRoute() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
        </div>
    )
  }

  // 1. If not logged in -> redirect to /login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. If logged in but NOT an admin -> redirect to home page
  if (user.appRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // 3. User is an admin -> render the admin page
  return <Outlet />;
}