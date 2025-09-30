'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types pour le cache
interface CacheConfig {
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  retry?: number;
}

interface PaginatedData<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Hook principal pour le cache
export function useCache() {
  const queryClient = useQueryClient();

  // Invalider le cache
  const invalidateCache = useCallback((queryKey: string[]) => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient]);

  // Nettoyer le cache
  const clearCache = useCallback(() => {
    queryClient.clear();
  }, [queryClient]);

  // Précharger des données
  const prefetchData = useCallback(async <T>(
    queryKey: string[],
    queryFn: () => Promise<T>,
    config?: CacheConfig
  ) => {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn,
      ...config
    });
  }, [queryClient]);

  return {
    invalidateCache,
    clearCache,
    prefetchData
  };
}

// Hook pour les données avec cache
export function useCachedData<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  config?: CacheConfig
) {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey,
    queryFn,
    staleTime: config?.staleTime || 5 * 60 * 1000, // 5 minutes par défaut
    gcTime: config?.cacheTime || 10 * 60 * 1000, // 10 minutes par défaut
    refetchOnWindowFocus: config?.refetchOnWindowFocus ?? true,
    refetchOnMount: config?.refetchOnMount ?? true,
    retry: config?.retry ?? 3
  });

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  };
}

// Hook pour les données paginées avec cache
export function useCachedPaginatedData<T>(
  queryKey: string[],
  queryFn: (page: number, limit: number) => Promise<PaginatedData<T>>,
  page: number = 1,
  limit: number = 20,
  config?: CacheConfig
) {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: [...queryKey, page, limit],
    queryFn: () => queryFn(page, limit),
    staleTime: config?.staleTime || 2 * 60 * 1000, // 2 minutes pour les données paginées
    gcTime: config?.cacheTime || 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: config?.refetchOnWindowFocus ?? false,
    refetchOnMount: config?.refetchOnMount ?? true,
    retry: config?.retry ?? 2
  });

  return {
    data: data?.data || [],
    total: data?.total || 0,
    page: data?.page || page,
    limit: data?.limit || limit,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  };
}

// Hook pour les mutations avec cache
export function useCachedMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  invalidateKeys?: string[][],
  config?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
  }
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      // Invalider les caches spécifiés
      if (invalidateKeys) {
        invalidateKeys.forEach(key => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
      config?.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      config?.onError?.(error, variables);
    }
  });

  return mutation;
}

// Hook pour le cache local (localStorage)
export function useLocalCache<T>(
  key: string,
  initialValue: T,
  ttl?: number // Time to live en millisecondes
) {
  const getCachedValue = useCallback((): T | null => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      
      // Vérifier le TTL
      if (ttl && parsed.timestamp && Date.now() - parsed.timestamp > ttl) {
        localStorage.removeItem(key);
        return null;
      }

      return parsed.value;
    } catch {
      return null;
    }
  }, [key, ttl]);

  const setCachedValue = useCallback((value: T) => {
    try {
      const item = {
        value,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch {
      // Ignore storage errors
    }
  }, [key]);

  const removeCachedValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore storage errors
    }
  }, [key]);

  const [value, setValue] = useState<T>(() => {
    const cached = getCachedValue();
    return cached !== null ? cached : initialValue;
  });

  const updateValue = useCallback((newValue: T) => {
    setValue(newValue);
    setCachedValue(newValue);
  }, [setCachedValue]);

  return {
    value,
    updateValue,
    removeValue: removeCachedValue,
    isCached: getCachedValue() !== null
  };
}

// Hook pour le cache avec debounce
export function useDebouncedCache<T>(
  key: string,
  value: T,
  delay: number = 500
) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  const { updateValue } = useLocalCache(key, value);

  useEffect(() => {
    updateValue(debouncedValue);
  }, [debouncedValue, updateValue]);

  return debouncedValue;
}

// Hook pour le debounce simple
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Configuration des clés de cache
export const CACHE_KEYS = {
  ORDERS: ['orders'],
  PRODUCTS: ['products'],
  USERS: ['users'],
  ANALYTICS: ['analytics'],
  DASHBOARD: ['dashboard'],
  COUPONS: ['coupons'],
  RETURNS: ['returns'],
  BACKUP: ['backup']
} as const;