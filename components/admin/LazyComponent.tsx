'use client';

import React, { Suspense, lazy, ComponentType } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface LazyComponentProps {
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  onError?: (error: Error) => void;
}

// Composant de chargement par défaut
const DefaultFallback = () => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-jomionstore-primary" />
        <span className="ml-2 text-gray-600">Chargement...</span>
      </div>
    </CardContent>
  </Card>
);

// Composant d'erreur par défaut
const DefaultErrorFallback = ({ error }: { error: Error }) => (
  <Card>
    <CardContent className="p-6">
      <div className="text-center text-red-600">
        <p className="font-medium">Erreur de chargement</p>
        <p className="text-sm text-gray-500 mt-1">{error.message}</p>
      </div>
    </CardContent>
  </Card>
);

// Hook pour créer des composants lazy
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: LazyComponentProps = {}
) {
  const LazyComponent = lazy(importFunc);
  
  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={options.fallback || <DefaultFallback />}>
        <ErrorBoundary
          fallback={options.errorFallback}
          onError={options.onError}
        >
          <LazyComponent {...props} />
        </ErrorBoundary>
      </Suspense>
    );
  };
}

// Error Boundary pour gérer les erreurs de chargement
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { hasError: boolean; error?: Error }
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorFallback error={this.state.error!} />;
    }

    return this.props.children;
  }
}

// Composants lazy prédéfinis pour l'admin
export const LazyAnalytics = createLazyComponent(() => import('@/app/admin/analytics/page'));
export const LazyBackup = createLazyComponent(() => import('@/app/admin/backup/page'));
export const LazyCoupons = createLazyComponent(() => import('@/app/admin/coupons/page'));
export const LazyReturns = createLazyComponent(() => import('@/app/admin/returns/page'));

// Hook pour le lazy loading conditionnel
export function useLazyLoad(condition: boolean, importFunc: () => Promise<any>) {
  const [Component, setComponent] = React.useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (condition && !Component && !loading) {
      setLoading(true);
      importFunc()
        .then((module) => {
          setComponent(() => module.default);
          setError(null);
        })
        .catch((err) => {
          setError(err);
          console.error('Lazy load error:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [condition, Component, loading, importFunc]);

  return { Component, loading, error };
}