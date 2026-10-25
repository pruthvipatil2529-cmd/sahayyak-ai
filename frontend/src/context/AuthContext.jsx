import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';
import { useAccessibility } from './AccessibilityContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('sahayyak_token') || null);
  const [loading, setLoading] = useState(true);
  const { setLanguage, setTextSize } = useAccessibility();

  // Load user on mount if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const userData = await authAPI.getMe();
        setUser(userData);
        if (userData.preferred_language) {
          setLanguage(userData.preferred_language);
        }
        if (userData.text_size) {
          setTextSize(userData.text_size);
        }
      } catch (err) {
        console.warn('Failed to load authenticated user profile:', err.message);
        localStorage.removeItem('sahayyak_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    localStorage.setItem('sahayyak_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    if (res.user.preferred_language) {
      setLanguage(res.user.preferred_language);
    }
    if (res.user.text_size) {
      setTextSize(res.user.text_size);
    }
    return res.user;
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    localStorage.setItem('sahayyak_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('sahayyak_token');
    setToken(null);
    setUser(null);
  };

  const updateUserProfile = async (updates) => {
    const updated = await authAPI.updateMe(updates);
    setUser(updated);
    if (updated.preferred_language) setLanguage(updated.preferred_language);
    if (updated.text_size) setTextSize(updated.text_size);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: !!user?.is_admin,
        loading,
        login,
        register,
        logout,
        updateUserProfile,
      }}
    >
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
