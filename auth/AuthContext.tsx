
import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect } from 'react';
import { User } from '../types';
import { users } from './users';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = 'auth-user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Failed to parse user from session storage', error);
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
      } else {
        window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to update session storage', error);
    }
  }, [user]);

  const login = async (username: string, password: string): Promise<boolean> => {
    const foundUser = users.find(u => u.username === username && u.password === password);
    if (foundUser) {
      // Don't store the password in the state
      const { password: _, ...userToStore } = foundUser;
      setUser(userToStore);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};