'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

export type User = {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL?: string;
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

  // Initialize with the mock user on first load for a seamless experience
  useEffect(() => {
    const defaultUser: User = {
      uid: 'mock-user-id',
      displayName: 'Eritas User',
      email: 'user@eritas.app',
      photoURL: 'https://images.unsplash.com/photo-1639149888905-fb39731f2e6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8dXNlciUyMGF2YXRhcnxlbnwwfHx8fDE3NjI2MzIyNTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    };
    setUser(defaultUser);
  }, []);

  const loginWithGoogle = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
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
