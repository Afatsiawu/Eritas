'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

export type User = {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL?: string;
  onboarded?: boolean;
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  loginWithGoogle: (userData: User) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Initialize with the user from localStorage if exists
  useEffect(() => {
    const savedUser = localStorage.getItem('studio_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const loginWithGoogle = (userData: User) => {
    setUser(userData);
    localStorage.setItem('studio_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('studio_user');
  };

  return (
    <UserContext.Provider value={{ user, setUser, loginWithGoogle, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
