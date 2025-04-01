import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
} from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserLoggedIn = () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          setCurrentUser(user);
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    };

    checkUserLoggedIn();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('CustomerId');
    setCurrentUser(null);
  };

  const isAdmin = useMemo(() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      // Parse the JWT token payload
      const payload = JSON.parse(atob(token.split('.')[1]));

      // Check if the role claim exists and is "Admin"
      return (
        payload[
          'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
        ] === 'Admin' || currentUser?.role === 'Admin'
      );
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }, [currentUser]);

  const value = {
    currentUser,
    isAdmin,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
