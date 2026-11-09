import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('recall_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('recall_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    localStorage.removeItem('recall_token');
    localStorage.removeItem('recall_user');
    setToken(null);
    setUser(null);
  }, []);

  const fetchProfile = useCallback(async () => {
    const storedToken = localStorage.getItem('recall_token');
    if (!storedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      localStorage.setItem('recall_user', JSON.stringify(profile));
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    fetchProfile();
    const handleAuthChange = () => fetchProfile();
    window.addEventListener('recall_auth_change', handleAuthChange);
    return () => window.removeEventListener('recall_auth_change', handleAuthChange);
  }, [fetchProfile]);

  const login = async (data: { email: string; password: string }) => {
    const res = await authService.login(data);
    localStorage.setItem('recall_token', res.token);
    localStorage.setItem('recall_user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (data: { name: string; email: string; password: string }) => {
    const res = await authService.register(data);
    localStorage.setItem('recall_token', res.token);
    localStorage.setItem('recall_user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
  };

  const updateUser = (updated: User) => {
    setUser(updated);
    localStorage.setItem('recall_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

