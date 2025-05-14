import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in on page load
    const storedAdmin = localStorage.getItem('admin');
    const storedToken = localStorage.getItem('token');
    
    if (storedAdmin && storedToken) {
      setAdmin(JSON.parse(storedAdmin));
    }
    
    setLoading(false);
  }, []);

  const login = (adminData, token) => {
    localStorage.setItem('admin', JSON.stringify(adminData));
    localStorage.setItem('token', token);
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem('admin');
    localStorage.removeItem('token');
    setAdmin(null);
  };

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const value = {
    admin,
    loading,
    login,
    logout,
    getToken,
    isAuthenticated: !!admin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};