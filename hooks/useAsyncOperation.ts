import { useState, useCallback, useRef, useEffect } from 'react';
import { handleWithRetry } from '@/lib/utils/error-handler';
import type { ErrorHandlerOptions } from '@/lib/utils/error-handler';

interface AsyncOperationState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  success: boolean;
  retryCount: number;
  errorType: string;
}

interface UseAsyncOperationOptions extends ErrorHandlerOptions {
  immediate?: boolean;
  resetOnDepsChange?: boolean;
}

interface UseAsyncOperationResult<T> extends AsyncOperationState<T> {
  execute: (...args: any[]) => Promise<void>;
  retry: () => Promise<void>;
  reset: () => void;
  refresh: () => Promise<void>;
}

export function useAsyncOperation<T, Args extends any[] = []>(
  operation: (...args: Args) => Promise<T>,
  deps: React.DependencyList = [],
  options: UseAsyncOperationOptions = {}
): UseAsyncOperationResult<T> {
  const {
    immediate = false,
    resetOnDepsChange = true,
    ...errorHandlerOptions
  } = options;

  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
    retryCount: 0,
    errorType: 'none',
  });

  const lastArgsRef = useRef<Args | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async (...args: Args) => {
    if (!mountedRef.current) return;

    lastArgsRef.current = args;
    
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const result = await handleWithRetry(
        () => operation(...args),
        {
          ...errorHandlerOptions,
          showToast: errorHandlerOptions.showToast ?? true,
        }
      );

      if (!mountedRef.current) return;

      setState({
        data: result.data,
        loading: false,
        error: result.error,
        success: result.success,
        retryCount: result.retryCount,
        errorType: result.errorType,
      });
    } catch (error) {
      if (!mountedRef.current) return;

      const err = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({
        ...prev,
        loading: false,
        error: err,
        success: false,
        errorType: 'unknown',
      }));
    }
  }, [operation, ...deps]);

  const retry = useCallback(async () => {
    if (lastArgsRef.current) {
      await execute(...lastArgsRef.current);
    }
  }, [execute]);

  const refresh = useCallback(async () => {
    if (lastArgsRef.current) {
      await execute(...lastArgsRef.current);
    }
  }, [execute]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
      retryCount: 0,
      errorType: 'none',
    });
    lastArgsRef.current = null;
  }, []);

  // Reset state when dependencies change
  useEffect(() => {
    if (resetOnDepsChange) {
      reset();
    }
  }, deps);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate && deps.length === 0) {
      execute([] as any);
    }
  }, [immediate, execute]);

  return {
    ...state,
    execute,
    retry,
    reset,
    refresh,
  };
}

// Specialized hook for data fetching
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList = [],
  options: UseAsyncOperationOptions = {}
) {
  return useAsyncOperation(fetcher, deps, {
    immediate: true,
    ...options,
  });
}

// Hook for managing multiple async operations
export function useAsyncOperations() {
  const [operations, setOperations] = useState<Map<string, AsyncOperationState<any>>>(new Map());

  const register = useCallback(<T>(
    key: string,
    operation: () => Promise<T>,
    options: ErrorHandlerOptions = {}
  ) => {
    const execute = async () => {
      setOperations(prev => new Map(prev.set(key, {
        data: null,
        loading: true,
        error: null,
        success: false,
        retryCount: 0,
        errorType: 'none',
      })));

      try {
        const result = await handleWithRetry(operation, options);
        
        setOperations(prev => new Map(prev.set(key, {
          data: result.data,
          loading: false,
          error: result.error,
          success: result.success,
          retryCount: result.retryCount,
          errorType: result.errorType,
        })));
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setOperations(prev => new Map(prev.set(key, {
          data: null,
          loading: false,
          error: err,
          success: false,
          retryCount: 0,
          errorType: 'unknown',
        })));
      }
    };

    return execute;
  }, []);

  const get = useCallback((key: string) => {
    return operations.get(key) || {
      data: null,
      loading: false,
      error: null,
      success: false,
      retryCount: 0,
      errorType: 'none',
    };
  }, [operations]);

  const remove = useCallback((key: string) => {
    setOperations(prev => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setOperations(new Map());
  }, []);

  const isAnyLoading = Array.from(operations.values()).some(op => op.loading);
  const hasAnyError = Array.from(operations.values()).some(op => op.error);

  return {
    register,
    get,
    remove,
    clear,
    isAnyLoading,
    hasAnyError,
    operations: Object.fromEntries(operations),
  };
}

// Hook for managing loading states with automatic cleanup
export function useLoadingState(initialLoading = false) {
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const startLoading = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, []);

  const setLoadingWithTimeout = useCallback((timeout: number) => {
    startLoading();
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      stopLoading();
    }, timeout);
  }, [startLoading, stopLoading]);

  const setErrorState = useCallback((error: Error) => {
    setError(error);
    setLoading(false);
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    loading,
    error,
    startLoading,
    stopLoading,
    setLoadingWithTimeout,
    setErrorState,
    reset,
  };
}