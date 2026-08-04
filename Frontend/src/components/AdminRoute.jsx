// src/components/AdminRoute.jsx
import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function AdminRoute() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
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