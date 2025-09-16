'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { ErrorState } from '@/components/ui/error-state';
import { 
  ProductSkeleton, 
  ProfileSkeleton, 
  CartSkeleton 
} from '@/components/ui/loading-skeleton';
import { 
  showSuccessToast, 
  showErrorToast, 
  showRetryToast,
  showNetworkErrorToast,
  showAuthErrorToast,
  showLoadingToast,
  dismissToast
} from '@/components/ui/enhanced-toast';
import { useAsyncOperation, useLoadingState } from '@/hooks/useAsyncOperation';
import { handleWithRetry } from '@/lib/utils/error-handler';

// Example component that throws errors for testing
const ErrorThrowingComponent: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('This is a test error from ErrorThrowingComponent');
  }
  return <div className="p-4 bg-green-100 rounded">Component rendered successfully!</div>;
};

// Example async operation that can fail
const mockAsyncOperation = async (shouldFail: boolean, delay = 1000): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, delay));
  
  if (shouldFail) {
    const errorTypes = [
      { message: 'Network error', status: 500 },
      { message: 'Unauthorized', status: 401 },
      { message: 'Validation failed', status: 400 },
      { message: 'fetch failed', code: 'NETWORK_ERROR' },
    ];
    
    const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)];
    const error = new Error(randomError.message) as any;
    if (randomError.status) error.status = randomError.status;
    if (randomError.code) error.code = randomError.code;
    
    throw error;
  }
  
  return 'Operation completed successfully!';
};

export const ErrorHandlingExample: React.FC = () => {
  const [shouldThrowError, setShouldThrowError] = useState(false);
  const [showSkeletons, setShowSkeletons] = useState(false);
  const [errorStateType, setErrorStateType] = useState<'network' | 'empty' | 'auth' | 'validation'>('network');
  
  const { loading, startLoading, stopLoading, setLoadingWithTimeout } = useLoadingState();
  
  const {
    data,
    loading: asyncLoading,
    error: asyncError,
    execute: executeAsync,
    retry: retryAsync,
    reset: resetAsync,
  } = useAsyncOperation(
    (shouldFail: boolean) => mockAsyncOperation(shouldFail),
    [],
    {
      maxRetries: 3,
      showToast: true,
    }
  );

  const handleToastExamples = () => {
    showSuccessToast('Opération réussie!', {
      description: 'Votre action a été effectuée avec succès.',
      action: {
        label: 'Voir',
        onClick: () => console.log('Action clicked'),
      },
    });

    setTimeout(() => {
      showErrorToast('Erreur de test', {
        description: 'Ceci est un exemple d\'erreur.',
      });
    }, 1000);

    setTimeout(() => {
      showRetryToast('Échec de l\'opération', () => {
        console.log('Retry clicked');
      }, 2);
    }, 2000);

    setTimeout(() => {
      showNetworkErrorToast(() => {
        console.log('Network retry clicked');
      });
    }, 3000);

    setTimeout(() => {
      showAuthErrorToast('Session expirée');
    }, 4000);
  };

  const handleLoadingExample = () => {
    const toastId = showLoadingToast('Chargement en cours...');
    
    setTimeout(() => {
      dismissToast(String(toastId));
      showSuccessToast('Chargement terminé!');
    }, 3000);
  };

  const handleRetryExample = async () => {
    const result = await handleWithRetry(
      () => mockAsyncOperation(Math.random() > 0.5, 500),
      {
        maxRetries: 3,
        showToast: true,
        onRetry: (error, count) => {
          console.log(`Retry attempt ${count}:`, error.message);
        },
      }
    );

    if (result.success) {
      showSuccessToast('Opération réussie après retry!');
    }
  };

  return (
    <div className="space-y-8 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Error Handling Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Error Boundary Example */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Error Boundary</h3>
            <div className="flex gap-2">
              <Button
                onClick={() => setShouldThrowError(!shouldThrowError)}
                variant={shouldThrowError ? "destructive" : "default"}
              >
                {shouldThrowError ? 'Fix Component' : 'Break Component'}
              </Button>
            </div>
            
            <ErrorBoundary
              maxRetries={3}
              showErrorDetails={true}
              onError={(error, errorInfo) => {
                console.log('Error caught by boundary:', error, errorInfo);
              }}
            >
              <ErrorThrowingComponent shouldThrow={shouldThrowError} />
            </ErrorBoundary>
          </div>

          {/* Loading Skeletons Example */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Loading Skeletons</h3>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowSkeletons(!showSkeletons)}
                variant={showSkeletons ? "secondary" : "default"}
              >
                {showSkeletons ? 'Hide Skeletons' : 'Show Skeletons'}
              </Button>
              <Button
                onClick={() => setLoadingWithTimeout(3000)}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Test Loading State'}
              </Button>
            </div>
            
            {(showSkeletons || loading) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Product Skeleton</h4>
                  <ProductSkeleton count={2} />
                </div>
                <div>
                  <h4 className="font-medium mb-2">Profile Skeleton</h4>
                  <ProfileSkeleton />
                </div>
                <div>
                  <h4 className="font-medium mb-2">Cart Skeleton</h4>
                  <CartSkeleton itemCount={2} />
                </div>
              </div>
            )}
          </div>

          {/* Error States Example */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Error States</h3>
            <div className="flex gap-2">
              <Button
                onClick={() => setErrorStateType('network')}
                variant={errorStateType === 'network' ? 'default' : 'outline'}
                size="sm"
              >
                Network
              </Button>
              <Button
                onClick={() => setErrorStateType('auth')}
                variant={errorStateType === 'auth' ? 'default' : 'outline'}
                size="sm"
              >
                Auth
              </Button>
              <Button
                onClick={() => setErrorStateType('validation')}
                variant={errorStateType === 'validation' ? 'default' : 'outline'}
                size="sm"
              >
                Validation
              </Button>
              <Button
                onClick={() => setErrorStateType('empty')}
                variant={errorStateType === 'empty' ? 'default' : 'outline'}
                size="sm"
              >
                Empty
              </Button>
            </div>
            
            <ErrorState
              type={errorStateType}
              onRetry={() => console.log('Retry clicked')}
              showNavigation={true}
              retryCount={1}
              maxRetries={3}
            />
          </div>

          {/* Toast Examples */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Enhanced Toasts</h3>
            <div className="flex gap-2">
              <Button onClick={handleToastExamples}>
                Show Toast Examples
              </Button>
              <Button onClick={handleLoadingExample}>
                Loading Toast
              </Button>
            </div>
          </div>

          {/* Async Operations Example */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Async Operations with Retry</h3>
            <div className="flex gap-2">
              <Button
                onClick={() => executeAsync(false)}
                disabled={asyncLoading}
              >
                {asyncLoading ? 'Loading...' : 'Success Operation'}
              </Button>
              <Button
                onClick={() => executeAsync(true)}
                disabled={asyncLoading}
                variant="destructive"
              >
                {asyncLoading ? 'Loading...' : 'Failing Operation'}
              </Button>
              <Button
                onClick={retryAsync}
                disabled={asyncLoading || !asyncError}
                variant="outline"
              >
                Retry
              </Button>
              <Button
                onClick={resetAsync}
                disabled={asyncLoading}
                variant="outline"
              >
                Reset
              </Button>
              <Button onClick={handleRetryExample}>
                Manual Retry Example
              </Button>
            </div>
            
            {asyncLoading && <div className="text-blue-600">Loading...</div>}
            {asyncError && (
              <div className="text-red-600">
                Error: {asyncError.message}
              </div>
            )}
            {data && (
              <div className="text-green-600">
                Success: {data}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};