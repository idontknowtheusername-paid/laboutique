"use client";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from 'next/navigation';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { AuthService, UserProfile } from "@/lib/services";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { withRetry, getErrorType, getErrorMessage } from "@/lib/utils/retry";
import { showAuthErrorToast } from "@/components/ui/enhanced-toast";

export interface UserStats {
  totalOrders: number;
  totalSpent: number;
  wishlistItems: number;
  cartItems: number;
  reviewsCount: number;
}

export interface AuthError {
  type: "network" | "auth" | "validation" | "server" | "unknown";
  message: string;
  retryable: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  userStats: UserStats | null;
  loading: boolean;
  statsLoading: boolean;
  error: AuthError | null;
  signUp: (
    email: string,
    password: string,
    userData?: any
  ) => Promise<{ success: boolean; error?: string }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
  refreshUserStats: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
  retry: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [lastOperation, setLastOperation] = useState<
    (() => Promise<void>) | null
  >(null);

  // Helper function to create auth error
  const createAuthError = useCallback((error: any): AuthError => {
    const type = getErrorType(error);
    const message = getErrorMessage(error, type);
    const retryable = type === "network" || type === "server";

    return { type, message, retryable };
  }, []);

  // Helper function to handle auth errors
  const handleAuthError = useCallback(
    (error: any, showToast = true) => {
      const authError = createAuthError(error);
      setError(authError);

      if (showToast) {
        showAuthErrorToast(authError.message);
      }

      // Auto logout on auth errors
      if (authError.type === "auth") {
        console.log('Auth error detected, clearing state:', authError.message);
        setUser(null);
        setSession(null);
        setProfile(null);
        setUserStats(null);
        
        // Clear localStorage to prevent stale data
        if (typeof window !== 'undefined') {
          try {
            const authKeys = Object.keys(localStorage).filter(key => 
              key.startsWith('sb-') || key.includes('auth')
            );
            authKeys.forEach(key => localStorage.removeItem(key));
          } catch (error) {
            console.warn('Error clearing localStorage:', error);
          }
        }
      }

      return authError;
    },
    [createAuthError]
  );

  // Load user stats
  const loadUserStats = useCallback(async (userId: string) => {
    if (!userId) return;

    setStatsLoading(true);
    try {
      const result = await withRetry(() => AuthService.getUserStats(userId), {
        maxRetries: 2,
        retryCondition: (error) => getErrorType(error) === "network",
      });

      if (result.success && result.data?.success) {
        setUserStats(result.data.data);
      } else if (result.error) {
        console.warn("Failed to load user stats:", result.error.message);
      }
    } catch (error) {
      console.warn("Error loading user stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Refresh session with retry logic
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) throw error;

      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);

        // Refresh profile and stats
        if (data.session.user) {
          await Promise.all([
            refreshProfile(),
            loadUserStats(data.session.user.id),
          ]);
        }
      }
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  }, [handleAuthError, loadUserStats]);

  useEffect(() => {
    // Récupérer la session initiale
    const getInitialSession = async () => {
      setLastOperation(() => getInitialSession);

      try {
        // Fast-fail if Supabase not configured to avoid infinite loading
        if (!isSupabaseConfigured()) {
          console.warn('Supabase is not configured. Skipping auth session check.');
          setUser(null);
          setSession(null);
          setProfile(null);
          setUserStats(null);
          setLoading(false);
          return;
        }

        // First, try to get session from in-memory or sessionStorage cache to avoid flicker
        if (typeof window !== 'undefined') {
          const cached = window.sessionStorage.getItem('sb-session');
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (parsed?.access_token && parsed?.user) {
                setUser(parsed.user);
                setSession(parsed);
              }
            } catch {}
          }
        }

        // Then, try to get session from localStorage (supabase)
        const { data: { session: localSession } } = await supabase.auth.getSession();
        
        if (localSession) {
          console.log('Session found in localStorage:', localSession.user.email);
          setUser(localSession.user);
          setSession(localSession);
          try {
            if (typeof window !== 'undefined') {
              window.sessionStorage.setItem('sb-session', JSON.stringify(localSession));
            }
          } catch {}
          
          // Get profile
          try {
            const profileResult = await AuthService.getProfile(localSession.user.id);
            if (profileResult.success && profileResult.data) {
              setProfile(profileResult.data);
            }
            
            // Load user stats
            await loadUserStats(localSession.user.id);
          } catch (profileError) {
            console.warn('Error loading profile after session restore:', profileError);
          }
        } else {
          console.log('No session found in localStorage');
          // Try the service method as fallback
          const result = await withRetry(() => AuthService.getCurrentUser(), {
            maxRetries: 3,
            retryCondition: (error) => getErrorType(error) === "network",
          });

          if (result.success && result.data?.success && result.data.data) {
            const { user, session, profile } = result.data.data;
            console.log('Session restored via service:', user?.email);
            setUser(user);
            setSession(session);
            setProfile(profile ?? null);

            // Load user stats if user is authenticated
            if (user) {
              await loadUserStats(user.id);
            }
          } else if (result.error) {
            console.warn('Failed to restore session via service:', result.error);
            handleAuthError(result.error, false);
          }
        }
      } catch (error) {
        console.error('Error during initial session check:', error);
        handleAuthError(error, false);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email || 'no user');
      setSession(session);
      setUser(session?.user ?? null);
      try {
        if (typeof window !== 'undefined') {
          if (session) window.sessionStorage.setItem('sb-session', JSON.stringify(session));
          else window.sessionStorage.removeItem('sb-session');
        }
      } catch {}

      if (session?.user) {
        // Récupérer le profil utilisateur et les stats
        try {
          const [profileResponse] = await Promise.allSettled([
            AuthService.getProfile(session.user.id),
            loadUserStats(session.user.id),
          ]);

          if (
            profileResponse.status === "fulfilled" &&
            profileResponse.value.success
          ) {
            setProfile(profileResponse.value.data);
          }
        } catch (error) {
          console.warn("Error loading user data on auth change:", error);
        }
      } else {
        setProfile(null);
        setUserStats(null);
      }

      // Clear error on successful auth change
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setError(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData?: any) => {
    setLastOperation(() => async () => {
      await signUp(email, password, userData);
    });

    try {
      setLoading(true);
      setError(null);

      const result = await withRetry(
        () =>
          AuthService.signUp({
            email,
            password,
            ...userData,
          }),
        {
          maxRetries: 2,
          retryCondition: (error) => getErrorType(error) === "network",
        }
      );

      if (result.success && result.data?.success && result.data.data) {
        const { user, session, profile } = result.data.data;
        setUser(user);
        setSession(session);
        setProfile(profile ?? null);

        // Load user stats for new user
        if (user) {
          await loadUserStats(user.id);
        }

        return { success: true };
      } else {
        const error =
          result.error ||
          new Error(result.data?.error || "Erreur lors de l'inscription");
        const authError = handleAuthError(error);
        return { success: false, error: authError.message };
      }
    } catch (error) {
      const authError = handleAuthError(error);
      return { success: false, error: authError.message };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLastOperation(() => async () => {
      await signIn(email, password);
    });

    try {
      setLoading(true);
      setError(null);

      const result = await withRetry(
        () => AuthService.signIn({ email, password }),
        {
          maxRetries: 2,
          retryCondition: (error) => getErrorType(error) === "network",
        }
      );

      if (result.success && result.data?.success && result.data.data) {
        const { user, session, profile } = result.data.data;
        setUser(user);
        setSession(session);
        setProfile(profile ?? null);

        // Load user stats
        if (user) {
          await loadUserStats(user.id);
        }

        return { success: true };
      } else {
        const error =
          result.error ||
          new Error(result.data?.error || "Erreur lors de la connexion");
        const authError = handleAuthError(error);
        return { success: false, error: authError.message };
      }
    } catch (error) {
      const authError = handleAuthError(error);
      return { success: false, error: authError.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);

      await AuthService.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setUserStats(null);
    } catch (error) {
      console.error("Error signing out:", error);
      // Don't show error toast for sign out failures, just clear state
      setUser(null);
      setSession(null);
      setProfile(null);
      setUserStats(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: any) => {
    if (!user?.id) {
      const error = new Error("Utilisateur non connecté");
      const authError = handleAuthError(error);
      return { success: false, error: authError.message };
    }

    try {
      setError(null);

      const result = await withRetry(
        () => AuthService.updateProfile(user.id, data),
        {
          maxRetries: 2,
          retryCondition: (error) => getErrorType(error) === "network",
        }
      );

      if (result.success && result.data?.success && result.data.data) {
        setProfile(result.data.data);
        queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
        return { success: true };
      } else {
        const error =
          result.error ||
          new Error(result.data?.error || "Erreur lors de la mise à jour");
        const authError = handleAuthError(error);
        return { success: false, error: authError.message };
      }
    } catch (error) {
      const authError = handleAuthError(error);
      return { success: false, error: authError.message };
    }
  };

  const refreshProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      const result = await withRetry(() => AuthService.getProfile(user.id), {
        maxRetries: 2,
        retryCondition: (error) => getErrorType(error) === "network",
      });

      if (result.success && result.data?.success && result.data.data) {
        setProfile(result.data.data);
      } else if (result.error) {
        console.warn("Failed to refresh profile:", result.error.message);
      }
    } catch (error) {
      console.warn("Error refreshing profile:", error);
    }
  }, [user?.id]);

  const refreshUserStats = useCallback(async () => {
    if (!user?.id) return;
    await loadUserStats(user.id);
  }, [user?.id, loadUserStats]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retry = useCallback(async () => {
    if (lastOperation) {
      await lastOperation();
    }
  }, [lastOperation]);

  // Auto refresh session every 50 minutes (tokens expire after 1 hour)
  useEffect(() => {
    if (!session) return;

    const refreshInterval = setInterval(async () => {
      try {
        await refreshSession();
      } catch (error) {
        console.warn("Auto session refresh failed:", error);
      }
    }, 50 * 60 * 1000); // 50 minutes

    return () => clearInterval(refreshInterval);
  }, [session, refreshSession]);

  // Déconnexion automatique après 1h d'inactivité (mouvements, clics, touches)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const resetTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        signOut();
        router.replace('/auth/login?timeout=1');
      }, 60 * 60 * 1000); // 1h
    };
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimeout));
    resetTimeout();
    return () => {
      clearTimeout(timeoutId);
      events.forEach(e => window.removeEventListener(e, resetTimeout));
    };
  }, [signOut, router]);

  const value: AuthContextType = {
    user,
    profile,
    session,
    userStats,
    loading,
    statsLoading,
    error,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
    refreshUserStats,
    refreshSession,
    clearError,
    retry,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
