'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { AuthService, UserProfile } from '@/lib/services';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: any) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer la session initiale
    const getInitialSession = async () => {
      try {
        const response = await AuthService.getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data.user);
          setSession(response.data.session);
          setProfile(response.data.profile);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Récupérer le profil utilisateur
          const profileResponse = await AuthService.getProfile(session.user.id);
          if (profileResponse.success) {
            setProfile(profileResponse.data);
          }
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      setLoading(true);
      const response = await AuthService.signUp({
        email,
        password,
        ...userData
      });

      if (response.success && response.data) {
        setUser(response.data.user);
        setSession(response.data.session);
        setProfile(response.data.profile);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Erreur lors de l\'inscription' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de l\'inscription' 
      };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await AuthService.signIn({ email, password });

      if (response.success && response.data) {
        setUser(response.data.user);
        setSession(response.data.session);
        setProfile(response.data.profile);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Erreur lors de la connexion' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la connexion' 
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await AuthService.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: any) => {
    if (!user?.id) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    try {
      const response = await AuthService.updateProfile(user.id, data);
      
      if (response.success && response.data) {
        setProfile(response.data);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Erreur lors de la mise à jour' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour' 
      };
    }
  };

  const refreshProfile = async () => {
    if (!user?.id) return;

    try {
      const response = await AuthService.getProfile(user.id);
      if (response.success && response.data) {
        setProfile(response.data);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};