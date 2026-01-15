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
    await mockApi();
    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '{}');
    if (!allUsers[email]) {
      throw new Error("User not found. Please sign up first.");
    }
    const userData = { id: email, ...allUsers[email] };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setLoading(false);
  };
  
  const signup = async (email: string, fullName: string) => {
    await mockApi();
    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '{}');
    if (allUsers[email]) {
      throw new Error("An account with this email already exists.");
    }
    const isFirstUser = Object.keys(allUsers).length === 0;
    allUsers[email] = { email, fullName, isAdmin: isFirstUser, walletBalance: 0 };
    localStorage.setItem('allUsers', JSON.stringify(allUsers));
  };
  
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
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
