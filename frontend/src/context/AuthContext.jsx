import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { signInAdmin, signOutAdmin } from '../services/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success && response.data.authenticated) {
        setAdmin(response.data.admin);
      } else {
        setAdmin(null);
      }
    } catch (error) {
      console.error('Error verifying auth status on server:', error);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (email, password, rememberMe) => {
    setLoading(true);
    try {
      // 1. Sign in with Firebase Client SDK (or mock fallback)
      const credential = await signInAdmin(email, password);
      const token = await credential.user.getIdToken();
      
      // Save token in localStorage if rememberMe is checked
      if (rememberMe) {
        localStorage.setItem('homi_admin_token', token);
      } else {
        localStorage.removeItem('homi_admin_token');
      }

      // 2. Report token/credentials to Backend Session Server
      const response = await api.post('/auth/login', { token, email, password });
      
      if (response.data.success) {
        setAdmin(response.data.admin);
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Login failed on admin backend server.');
      }
    } catch (error) {
      setLoading(false);
      console.error('AuthContext Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
      await signOutAdmin();
      setAdmin(null);
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password request error:', error);
      throw error;
    }
  };

  const updateAdminProfile = async (formData) => {
    try {
      const response = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        setAdmin(response.data.admin);
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ admin, isAuthenticated: !!admin, loading, login, logout, forgotPassword, updateAdminProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
