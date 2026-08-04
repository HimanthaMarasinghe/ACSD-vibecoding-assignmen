import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { user, loading } = useContext(AuthContext);

  // 1. Wait until AuthContext finishes checking the session/cookie
  if (loading) {
    return(
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
        </div>
    );
  }

  // 2. Redirect to /login if there is no user
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. User is authenticated -> Render the requested page
  return <Outlet />;
}