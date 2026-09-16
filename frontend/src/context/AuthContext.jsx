import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Verify active session on app initialization using stored JWT
  useEffect(() => {
    let isMounted = true;
    const verifySession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }
      try {
        const response = await authService.getCurrentUser();
        if (response?.data && isMounted) {
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    verifySession();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    const userData = response.data;
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  };

  const register = async (data) => {
    const response = await authService.register(data);
    const userData = response.data;
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  };

  const registerSupplier = async (data) => {
    const response = await authService.registerSupplier(data);
    const userData = response.data;
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Ignore logout errors
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, registerSupplier, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
