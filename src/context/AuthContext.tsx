import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser } from '../types';
import { apiAuth, removeStoredToken } from '../services/api';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('dukaanos_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  const isAuthenticated = !!user;

  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
    };
    window.addEventListener('dukaanos:session-expired', handleExpired);
    return () => window.removeEventListener('dukaanos:session-expired', handleExpired);
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // 1. Try real server authentication with JWT
      const data = await apiAuth.login(email, pass);
      const authUser: AuthUser = {
        id: data.user_id,
        name: data.name,
        email: data.email,
        role: data.role,
        token: data.access_token,
      };
      setUser(authUser);
      localStorage.setItem('dukaanos_admin_user', JSON.stringify(authUser));
      return { success: true };
    } catch (err: any) {
      // If error from backend response (e.g. 401 incorrect password, 429 rate limited)
      if (err.status) {
        return {
          success: false,
          error: err.message || 'Invalid credentials or access denied.',
        };
      }

      // 2. Offline fallback (Development only - disabled in production)
      if (import.meta.env.PROD) {
        return {
          success: false,
          error: err.message || 'Authentication failed. Please verify credentials.',
        };
      }

      const cleanIdentifier = email.trim().toLowerCase();
      if ((cleanIdentifier === '127294' || cleanIdentifier === 'abdulhadipanhwar71@gmail.com' || cleanIdentifier === 'admin@dukaanos.pk' || cleanIdentifier === 'owner@dukaanos.pk') && pass === 'admin123') {
        const authUser: AuthUser = {
          id: 'user-admin',
          name: 'AbdulHadi (Owner)',
          email: 'abdulhadipanhwar71@gmail.com',
          role: 'owner',
        };
        setUser(authUser);
        localStorage.setItem('dukaanos_admin_user', JSON.stringify(authUser));
        return { success: true };
      }

      if (cleanIdentifier === 'cashier@dukaanos.pk' && pass === 'cashier123') {
        const authUser: AuthUser = {
          id: 'user-cashier',
          name: 'Ahmed Ali (Shift Incharge)',
          email: 'cashier@dukaanos.pk',
          role: 'cashier',
        };
        setUser(authUser);
        localStorage.setItem('dukaanos_admin_user', JSON.stringify(authUser));
        return { success: true };
      }

      return {
        success: false,
        error: err.message || 'Invalid administrator credentials. Please check password.',
      };
    }
  };

  const logout = () => {
    setUser(null);
    removeStoredToken();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
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
