'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Lock, LogIn } from 'lucide-react';
import Link from 'next/link';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: 'customer' | 'vendor' | 'admin';
  fallback?: React.ReactNode;
  redirectTo?: string;
  showFallback?: boolean;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireRole,
  fallback,
  redirectTo,
  showFallback = true
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (loading) return;

    // If authentication is required but user is not authenticated
    if (requireAuth && !user) {
      if (redirectTo) {
        const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(pathname)}`;
        router.push(redirectUrl);
      } else {
        setShouldRedirect(true);
      }
      return;
    }

    // If specific role is required but user doesn't have it
    if (requireRole && profile && profile.role !== requireRole) {
      setShouldRedirect(true);
      return;
    }

    // If we reach here, user has access
    setShouldRedirect(false);
  }, [user, profile, loading, requireAuth, requireRole, redirectTo, pathname, router]);

  // Show loading state while checking authentication
  if (loading) {
    return fallback || <ProtectedRouteLoading />;
  }

  // Show unauthorized state if user doesn't have access
  if (shouldRedirect && showFallback) {
    return fallback || (
      <ProtectedRouteUnauthorized 
        requireAuth={requireAuth}
        requireRole={requireRole}
        currentRole={profile?.role}
        redirectPath={pathname}
      />
    );
  }

  // If we should redirect but not show fallback, return null
  if (shouldRedirect && !showFallback) {
    return null;
  }

  // User has access, render children
  return <>{children}</>;
}

function ProtectedRouteLoading() {
  return (
    <div className="min-h-screen bg-beshop-background flex items-center justify-center">
      <div className="container max-w-md">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="h-6 w-32" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface ProtectedRouteUnauthorizedProps {
  requireAuth: boolean;
  requireRole?: string;
  currentRole?: string;
  redirectPath: string;
}

function ProtectedRouteUnauthorized({
  requireAuth,
  requireRole,
  currentRole,
  redirectPath
}: ProtectedRouteUnauthorizedProps) {
  const getMessage = () => {
    if (!requireAuth) {
      return {
        title: 'Accès refusé',
        description: 'Vous n\'avez pas l\'autorisation d\'accéder à cette page.',
        icon: <Lock className="w-8 h-8 text-red-600" />
      };
    }

    if (requireRole && currentRole && currentRole !== requireRole) {
      return {
        title: 'Permissions insuffisantes',
        description: `Cette page nécessite le rôle "${requireRole}" mais vous avez le rôle "${currentRole}".`,
        icon: <Lock className="w-8 h-8 text-orange-600" />
      };
    }

    return {
      title: 'Connexion requise',
      description: 'Vous devez être connecté pour accéder à cette page.',
      icon: <LogIn className="w-8 h-8 text-blue-600" />
    };
  };

  const { title, description, icon } = getMessage();
  const loginUrl = `/auth/login?redirect=${encodeURIComponent(redirectPath)}`;

  return (
    <div className="min-h-screen bg-beshop-background flex items-center justify-center">
      <div className="container max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                {icon}
              </div>
              <p className="text-center text-gray-600">{description}</p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {requireAuth && !currentRole ? (
                  'Connectez-vous pour continuer.'
                ) : requireRole && currentRole !== requireRole ? (
                  'Contactez un administrateur si vous pensez que c\'est une erreur.'
                ) : (
                  'Vérifiez vos permissions d\'accès.'
                )}
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {requireAuth && !currentRole && (
                <Button asChild className="w-full bg-beshop-primary hover:bg-blue-700">
                  <Link href={loginUrl}>Se connecter</Link>
                </Button>
              )}
              
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Retour à l'accueil</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Higher-order component for protecting pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Hook for checking authentication status in components
export function useAuthGuard(options: {
  requireAuth?: boolean;
  requireRole?: 'customer' | 'vendor' | 'admin';
} = {}) {
  const { user, profile, loading } = useAuth();
  const { requireAuth = true, requireRole } = options;

  const isAuthenticated = !!user;
  const hasRequiredRole = !requireRole || (profile?.role === requireRole);
  const hasAccess = (!requireAuth || isAuthenticated) && hasRequiredRole;

  return {
    isAuthenticated,
    hasRequiredRole,
    hasAccess,
    loading,
    user,
    profile
  };
}