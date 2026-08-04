import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { user, loading } = useContext(AuthContext);

  // 1. Wait until AuthContext finishes checking the session/cookie
  if (loading) {
    return <div>Loading...</div>; // Or your custom spinner component
  }

  // 2. Redirect to /login if there is no user
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. User is authenticated -> Render the requested page
  return <Outlet />;
}