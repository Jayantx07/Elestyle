import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import { setApiToken } from '../lib/tokenManager';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  profileImage: string;
  isEmailVerified?: boolean;
  addresses?: any[];
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => Promise<void>;
  updateUser: (userData: User) => void;
  refreshProfile: () => Promise<void>;
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
            setApiToken(data.accessToken);
          }
        }
      } catch (error) {
        console.log('No valid session found');
        setApiToken(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    initializeAuth();
    const handleUnauthorized = () => {
      setApiToken(null);
      setUser(null);
      setAccessToken(null);
    };
    
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => { 
      isMounted = false; 
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = (userData: User, token: string) => {
    setUser(userData);
    setAccessToken(token);
    setApiToken(token);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      setUser(null);
      setAccessToken(null);
      setApiToken(null);
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const refreshProfile = async () => {
    if (!accessToken) return;
    try {
      const data = await authService.getMe(accessToken);
      if (data.success && data.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to refresh profile', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, logout, updateUser, refreshProfile }}>
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
