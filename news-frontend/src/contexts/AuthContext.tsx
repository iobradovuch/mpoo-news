import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import apiService from '../services/api';
import type { LoginRequest } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');
    if (token && savedUsername) {
      setIsAuthenticated(true);
      setUsername(savedUsername);
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    const response = await apiService.login(credentials);
    setIsAuthenticated(true);
    setUsername(response.username);
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } finally {
      setIsAuthenticated(false);
      setUsername(null);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
