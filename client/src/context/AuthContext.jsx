import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [salon, setSalon] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nx_salon_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      loadCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadCurrentUser = async () => {
    try {
      const data = await fetchApi('/auth/me');
      setUser(data.user);
      setSalon(data.salon);
    } catch (err) {
      console.error('Failed to load user:', err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (loginId, password) => {
    const data = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ loginId, password })
    });

    localStorage.setItem('nx_salon_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setSalon(data.salon);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('nx_salon_token');
    setToken(null);
    setUser(null);
    setSalon(null);
  };

  const quickSwitchRole = async (newRole) => {
    if (user) {
      setUser({ ...user, role: newRole });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      salon,
      token,
      loading,
      login,
      logout,
      quickSwitchRole,
      refreshUser: loadCurrentUser,
      setSalon
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
