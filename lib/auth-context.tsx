'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthSession, UserRole } from './types';
import { MOCK_USERS } from './mock-data';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      // First, try to get session from localStorage (mock backend)
      const sessionStr = localStorage.getItem('auth_session');
      if (sessionStr) {
        const session: AuthSession = JSON.parse(sessionStr);
        const now = new Date().getTime();
        const expiresAt = new Date(session.expiresAt).getTime();

        if (now < expiresAt) {
          setUser(session.user);
        } else {
          // Session expired
          localStorage.removeItem('auth_session');
          setUser(null);
        }
      }

      // TODO: Replace with actual backend call
      // const response = await fetch('/api/auth/check', {
      //   method: 'GET',
      //   credentials: 'include',
      // });
      // if (response.ok) {
      //   const session = await response.json();
      //   setUser(session.user);
      // }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      // TODO: Replace with actual backend call
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   credentials: 'include',
      //   body: JSON.stringify({ email, password }),
      // });
      //
      // if (!response.ok) {
      //   throw new Error('Login failed');
      // }
      //
      // const session = await response.json();
      // setUser(session.user);

      // Mock implementation - replace with backend
      const mockResponse = await mockLogin(email, password);
      localStorage.setItem('auth_session', JSON.stringify(mockResponse));
      setUser(mockResponse.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, username: string, password: string, role: UserRole) => {
    try {
      setIsLoading(true);

      // TODO: Replace with actual backend call
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   credentials: 'include',
      //   body: JSON.stringify({ email, username, password, role }),
      // });
      //
      // if (!response.ok) {
      //   throw new Error('Registration failed');
      // }
      //
      // const session = await response.json();
      // setUser(session.user);

      // Mock implementation - replace with backend
      const mockResponse = await mockRegister(email, username, password, role);
      localStorage.setItem('auth_session', JSON.stringify(mockResponse));
      setUser(mockResponse.user);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // TODO: Replace with actual backend call
    // fetch('/api/auth/logout', {
    //   method: 'POST',
    //   credentials: 'include',
    // });

    localStorage.removeItem('auth_session');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        role: user?.role || null,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Mock implementation for testing - replace with actual backend
async function mockLogin(email: string, password: string): Promise<AuthSession> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock password validation
  const mockPasswords: Record<string, string> = {
    'admin@example.com': 'admin123',
    'user@example.com': 'user123',
    'sarah@example.com': 'user123',
  };

  if (!mockPasswords[email] || mockPasswords[email] !== password) {
    throw new Error('Invalid credentials');
  }

  const user = MOCK_USERS.find(u => u.email === email);
  if (!user) {
    throw new Error('User not found');
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  return {
    user,
    token: 'mock-token-' + Date.now(),
    expiresAt,
  };
}

async function mockRegister(
  email: string,
  name: string,
  password: string,
  role: UserRole
): Promise<AuthSession> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Check if user already exists
  if (MOCK_USERS.some(u => u.email === email)) {
    throw new Error('Email already registered');
  }

  const newUser: User = {
    id: 'user-' + Date.now(),
    email,
    name,
    role,
    createdAt: new Date(),
  };

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  return {
    user: newUser,
    token: 'mock-token-' + Date.now(),
    expiresAt,
  };
}
