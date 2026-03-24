'use client';

import React, { createContext, useContext, useState } from 'react';

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: string;
}

interface AuthContextType {
  user: null;
  profile: Profile | null;
  loading: boolean;
  authModalOpen: boolean;
  authModalView: 'sign-in' | 'sign-up';
  openAuthModal: (view?: 'sign-in' | 'sign-up') => void;
  closeAuthModal: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: false,
  authModalOpen: false,
  authModalView: 'sign-in',
  openAuthModal: () => {},
  closeAuthModal: () => {},
  signOut: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'sign-in' | 'sign-up'>('sign-in');

  const openAuthModal = (view: 'sign-in' | 'sign-up' = 'sign-in') => {
    setAuthModalView(view);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => setAuthModalOpen(false);
  const signOut = () => {};

  return (
    <AuthContext.Provider value={{
      user: null,
      profile: null,
      loading: false,
      authModalOpen,
      authModalView,
      openAuthModal,
      closeAuthModal,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};