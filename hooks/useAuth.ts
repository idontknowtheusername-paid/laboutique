'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, signIn, signUp, signOut as supabaseSignOut, isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Return a default implementation for when context is not available
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      // Get initial session
      const getInitialSession = async () => {
        if (isSupabaseConfigured()) {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
          } catch (error) {
            console.warn('Supabase not configured properly:', error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      };

      getInitialSession();

      // Listen for auth changes only if Supabase is configured
      let subscription: any = null;
      if (isSupabaseConfigured()) {
        try {
          const { data } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              setUser(session?.user ?? null);
              setLoading(false);
            }
          );
          subscription = data.subscription;
        } catch (error) {
          console.warn('Auth state change listener failed:', error);
        }
      }

      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    }, []);

    const handleSignIn = async (email: string, password: string) => {
      if (!isSupabaseConfigured()) {
        return { error: { message: 'Supabase not configured' } };
      }
      return await signIn(email, password);
    };

    const handleSignUp = async (email: string, password: string) => {
      if (!isSupabaseConfigured()) {
        return { error: { message: 'Supabase not configured' } };
      }
      return await signUp(email, password);
    };

    const handleSignOut = async () => {
      if (!isSupabaseConfigured()) {
        return;
      }
      await supabaseSignOut();
    };

    return {
      user,
      loading,
      signIn: handleSignIn,
      signUp: handleSignUp,
      signOut: handleSignOut,
    };
  }
  return context;
};

export default AuthContext;