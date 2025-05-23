import { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';
import { login as authLogin, signup as authSignup } from '../api/portfolioApiService.ts';

type User = {
  id: string;
  email: string;
  accountType: 'user' | 'serviceProvider';
  token: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, accountType: 'user' | 'serviceProvider') => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const isAuthenticated = !!user;

  const login = async (email: string, password: string) => {
    try {
      const userData = await authLogin(email, password);
      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, accountType: 'user' | 'serviceProvider') => {
    try {
      const userData = await authSignup(email, password, accountType);
      setUser(userData);
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
      <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout }}>
        {children}
      </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
};