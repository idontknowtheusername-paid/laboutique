'use client';

import { useState, useEffect, useCallback } from 'react';

export interface HeroBanner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  cta_text: string;
  cta_link: string;
  image_url: string;
  gradient: string;
  type: 'promotional' | 'category' | 'service' | 'offer' | 'new';
  priority: number;
  is_active: boolean;
  created_at: string;
}

interface UseHeroBannersReturn {
  banners: HeroBanner[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useHeroBanners = (type?: string, limit: number = 5): UseHeroBannersReturn => {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBanners = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (type) params.append('type', type);
      params.append('limit', limit.toString());

      const response = await fetch(`/api/hero-banners?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch hero banners');
      }

      if (data.success && data.data) {
        setBanners(data.data);
      } else {
        setBanners([]);
      }
    } catch (err) {
      console.error('Error fetching hero banners:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setBanners([]);
    } finally {
      setIsLoading(false);
    }
  }, [type, limit]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  return {
    banners,
    isLoading,
    error,
    refetch: fetchBanners
  };
};