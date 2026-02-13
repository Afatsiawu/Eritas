'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { deleteUser as deleteUserAction } from '@/lib/mock-api';

const mockApi = (delay = 500) => new Promise(resolve => setTimeout(resolve, delay));

interface User {
  id: string;
  fullName: string;
  email: string;
  isAdmin: boolean;
  walletBalance: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, fullName: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'password123' }), // Adjust as needed
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Login failed");
      }
      const result = await response.json();
      const userData = { ...result.user, isAdmin: result.user.role === 'admin' };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, fullName: string) => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name: fullName, password: 'password123', role: 'admin' }),
    });
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || "Signup failed");
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  const deleteAccount = async () => {
    if (!user) return;
    await deleteUserAction({ userId: user.email });
    logout();
  };


  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
