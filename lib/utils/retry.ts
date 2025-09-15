export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryCondition?: (error: any) => boolean;
  onRetry?: (error: any, retryCount: number) => void;
}

export interface RetryResult<T> {
  data: T | null;
  error: Error | null;
  success: boolean;
  retryCount: number;
}

export class RetryError extends Error {
  public readonly originalError: Error;
  public readonly retryCount: number;

  constructor(originalError: Error, retryCount: number) {
    super(`Failed after ${retryCount} retries: ${originalError.message}`);
    this.name = 'RetryError';
    this.originalError = originalError;
    this.retryCount = retryCount;
  }
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    retryCondition = (error) => isRetryableError(error),
    onRetry,
  } = options;

  let lastError: Error;
  let retryCount = 0;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();
      return {
        data: result,
        error: null,
        success: true,
        retryCount: attempt,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      retryCount = attempt;

      // Don't retry on the last attempt or if error is not retryable
      if (attempt === maxRetries || !retryCondition(lastError)) {
        break;
      }

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(lastError, attempt + 1);
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelay * Math.pow(backoffMultiplier, attempt),
        maxDelay
      );

      // Add jitter to prevent thundering herd
      const jitteredDelay = delay + Math.random() * 1000;

      await sleep(jitteredDelay);
    }
  }

  return {
    data: null,
    error: new RetryError(lastError!, retryCount),
    success: false,
    retryCount,
  };
}

export function isRetryableError(error: any): boolean {
  // Network errors
  if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('fetch')) {
    return true;
  }

  // HTTP status codes that are retryable
  if (error?.status) {
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return retryableStatuses.includes(error.status);
  }

  // Supabase specific errors
  if (error?.message) {
    const retryableMessages = [
      'network error',
      'timeout',
      'connection refused',
      'temporary failure',
      'service unavailable',
    ];
    
    const message = error.message.toLowerCase();
    return retryableMessages.some(msg => message.includes(msg));
  }

  return false;
}

export function isAuthError(error: any): boolean {
  if (error?.status) {
    return error.status === 401 || error.status === 403;
  }

  if (error?.message) {
    const authMessages = [
      'unauthorized',
      'forbidden',
      'invalid token',
      'token expired',
      'authentication required',
    ];
    
    const message = error.message.toLowerCase();
    return authMessages.some(msg => message.includes(msg));
  }

  return false;
}

export function isValidationError(error: any): boolean {
  if (error?.status) {
    return error.status === 400 || error.status === 422;
  }

  if (error?.message) {
    const validationMessages = [
      'validation error',
      'invalid input',
      'bad request',
      'missing required',
    ];
    
    const message = error.message.toLowerCase();
    return validationMessages.some(msg => message.includes(msg));
  }

  return false;
}

export function getErrorType(error: any): 'network' | 'auth' | 'validation' | 'server' | 'unknown' {
  if (isAuthError(error)) return 'auth';
  if (isValidationError(error)) return 'validation';
  if (isRetryableError(error)) return 'network';
  if (error?.status >= 500) return 'server';
  return 'unknown';
}

export function getErrorMessage(error: any, type?: string): string {
  const errorType = type || getErrorType(error);
  
  switch (errorType) {
    case 'network':
      return 'Problème de connexion. Vérifiez votre connexion internet.';
    case 'auth':
      return 'Erreur d\'authentification. Veuillez vous reconnecter.';
    case 'validation':
      return 'Données invalides. Vérifiez les informations saisies.';
    case 'server':
      return 'Erreur du serveur. Veuillez réessayer plus tard.';
    default:
      return error?.message || 'Une erreur inattendue est survenue.';
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Hook for using retry functionality in React components
export function useRetry() {
  const [isRetrying, setIsRetrying] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);

  const executeWithRetry = React.useCallback(async <T>(
    operation: () => Promise<T>,
    options?: RetryOptions
  ): Promise<RetryResult<T>> => {
    setIsRetrying(true);
    setRetryCount(0);

    const result = await withRetry(operation, {
      ...options,
      onRetry: (error, count) => {
        setRetryCount(count);
        options?.onRetry?.(error, count);
      },
    });

    setIsRetrying(false);
    return result;
  }, []);

  const reset = React.useCallback(() => {
    setIsRetrying(false);
    setRetryCount(0);
  }, []);

  return {
    executeWithRetry,
    isRetrying,
    retryCount,
    reset,
  };
}

import React from 'react';