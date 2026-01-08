import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const accessToken = localStorage.getItem('accessToken');
  
  // Check if token is expired
  const tokenExpiry = localStorage.getItem('tokenExpiry');
  const isExpired = !tokenExpiry || Date.now() > parseInt(tokenExpiry);
  
  if (!accessToken || isExpired) {
    return <Navigate to="/login" replace />;
  }
  
  
  return children;
};

export default ProtectedRoute;