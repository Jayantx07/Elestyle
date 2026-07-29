import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => Promise<void>;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const initializeAuth = async () => {
      try {
        const data = await authService.refreshToken();
        if (data.success) {
          if (isMounted) {
            setUser(data.user);
            setAccessToken(data.accessToken);
          }
        }
      } catch (error) {
        console.log('No valid session found');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    initializeAuth();
    return () => { isMounted = false; };
  }, []);

  const login = (userData: User, token: string) => {
    setUser(userData);
    setAccessToken(token);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
