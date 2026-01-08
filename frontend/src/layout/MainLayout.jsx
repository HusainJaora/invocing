import { useNavigate, useLocation, Outlet } from 'react-router-dom';
// import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';


export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  // const { user, logout } = useContext(AuthContext);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    // Clear all auth data from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('user');
    
    // Navigate to login page
    navigate('/login', { replace: true });
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        {/* Fixed Sidebar - Always visible, doesn't unmount on navigation */}
        <Sidebar
          onNavigate={handleNavigation}
          onLogout={handleLogout}
          currentUser={user}
          currentPath={location.pathname}
        />

        {/* Main Content Area - Scrollable, Only this part changes on navigation */}
        <div className="flex-1 overflow-y-auto">
          {/* Outlet renders the current route's component */}
          <Outlet />
        </div>
      </div>
    </div>
  );
}