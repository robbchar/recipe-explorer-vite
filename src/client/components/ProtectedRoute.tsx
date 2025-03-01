import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // TODO: Replace with actual auth check
  const isAuthenticated = localStorage.getItem('token') !== null;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute; 