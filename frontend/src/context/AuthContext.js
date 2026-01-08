// import { createContext, useState, useEffect, useRef } from 'react';
// import axiosInstance from '../api/axios';
// import ENDPOINTS from '../api/endpoint';

// export const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const refreshTimerRef = useRef(null);

//   useEffect(() => {
//     console.log('AuthProvider mounted, checking auth status...');
//     checkAuthStatus();

//     // Cleanup timer on unmount
//     return () => {
//       if (refreshTimerRef.current) {
//         clearTimeout(refreshTimerRef.current);
//       }
//     };
//   }, []);

//   useEffect(() => {
//     console.log('Auth state changed:', isAuthenticated, user);
    
//     // Start proactive refresh timer when authenticated
//     if (isAuthenticated) {
//       startRefreshTimer();
//     } else {
//       // Clear timer when logged out
//       if (refreshTimerRef.current) {
//         clearTimeout(refreshTimerRef.current);
//       }
//     }
//   }, [isAuthenticated, user]);

//   const startRefreshTimer = () => {
//     // Clear existing timer
//     if (refreshTimerRef.current) {
//       clearTimeout(refreshTimerRef.current);
//     }

//     // Refresh token after 14 minutes (1 minute before expiry)
//     // Access token expires in 15 minutes
//     refreshTimerRef.current = setTimeout(() => {
//       console.log('Proactively refreshing access token...');
//       refreshAccessToken();
//     }, 14 * 60 * 1000); // 14 minutes
//   };
 
  

//   const refreshAccessToken = async () => {
//     try {
//       await axiosInstance.post(ENDPOINTS.AUTH.REFRESH_TOKEN);
//       console.log('Access token refreshed successfully');
      
//       // Restart the timer for next refresh
//       startRefreshTimer();
//     } catch (error) {
//       console.error('Failed to refresh token:', error);
      
//       // If refresh fails, log out the user
//       setUser(null);
//       setIsAuthenticated(false);
//     }
//   };

//   const checkAuthStatus = async () => {
//     console.log('Checking auth status at:', ENDPOINTS.AUTH.STATUS);
//     try {
//       const response = await axiosInstance.get(ENDPOINTS.AUTH.STATUS);
//       console.log('Auth status response:', response.data);
//       setUser({
//         username: response.data.username,
//         is_admin: response.data.is_admin,
//         email: response.data.email
//       });
//       setIsAuthenticated(true);
//     } catch (error) {
//       console.log('Auth status check failed:', error.message);
//       setUser(null);
//       setIsAuthenticated(false);
//     } finally {
//       setIsLoading(false);
//       console.log('Auth check complete. isAuthenticated:', isAuthenticated);
//     }
//   };

//   const login = async (email, password) => {
//     console.log('Attempting login...');
//     try {
//       const response = await axiosInstance.post(ENDPOINTS.AUTH.LOGIN, {
//         email,
//         password,
//       });

//       console.log('Login successful:', response.data);
//       setUser({
//         username: response.data.username,
//         is_admin: response.data.is_admin,
//         email: response.data.email
//       });
//       setIsAuthenticated(true);

//       return { success: true, data: response.data };
//     } catch (error) {
//       console.error('Login failed:', error);
//       const message = error.response?.data?.error || 'Login failed';
//       return { success: false, error: message };
//     }
//   };

//   const logout = async () => {
//     console.log('Logging out...');
    
//     // Clear refresh timer
//     if (refreshTimerRef.current) {
//       clearTimeout(refreshTimerRef.current);
//     }
    
//     try {
//       await axiosInstance.post(ENDPOINTS.AUTH.LOGOUT);
//     } catch (error) {
//       console.error('Logout error:', error);
//     } finally {
//       setUser(null);
//       setIsAuthenticated(false);
//     }
//   };

//   const value = {
//     user,
//     isAuthenticated,
//     isLoading,
//     login,
//     logout,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };