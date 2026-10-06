import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function ProtectedRoute({ role }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/ingresar" replace state={{ from: location }} />;
  }
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <Outlet />;
}

export default ProtectedRoute;