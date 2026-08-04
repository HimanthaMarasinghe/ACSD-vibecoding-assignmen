import { createContext, useState, useEffect } from 'react';
import { authApi } from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify session on initial mount by calling the backend
    const checkAuthSession = async () => {
      try {
        // The backend reads the HttpOnly cookie automatically
        const res = await authApi.getMe();
        if (res.user) {
          setUser(res.user);
        }
      } catch (error) {
        // Cookie missing, expired, or invalid
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthSession();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authApi.login({ email, password });
      setUser(res.user);
      return { success: true, data: res };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, error: message };
    }
  };

  const signUp = async (email, password, name) => {
    try {
      const res = await authApi.signUp({ email, password, name });
      if (res.user) {
        setUser(res.user);
      }
      return { success: true, data: res };
    } catch (error) {
      console.error('SignUp error:', error);
      const message = error.response?.data?.message || 'Registration failed.';
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore logout API errors
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};