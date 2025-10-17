'use client';

import React from 'react';
import HeroCarouselImproved from './HeroCarouselImproved';
import { useHeroBanners } from '@/hooks/useHeroBanners';

interface HeroCarouselWithDataProps {
  type?: 'promotional' | 'category' | 'service' | 'offer' | 'new';
  limit?: number;
  autoRotate?: boolean;
  showControls?: boolean;
  showIndicators?: boolean;
  showProgress?: boolean;
  className?: string;
}

const HeroCarouselWithData: React.FC<HeroCarouselWithDataProps> = ({
  type,
  limit = 5,
  autoRotate = true,
  showControls = true,
  showIndicators = true,
  showProgress = true,
  className = ''
}) => {
  const { banners, isLoading, error } = useHeroBanners(type, limit);

  // Debug logs
  console.log('HeroCarouselWithData - banners:', banners);
  console.log('HeroCarouselWithData - isLoading:', isLoading);
  console.log('HeroCarouselWithData - error:', error);

  return (
    <HeroCarouselImproved
      banners={banners}
      autoRotate={autoRotate}
      showControls={showControls}
      showIndicators={showIndicators}
      showProgress={showProgress}
      className={className}
    />
  );
};

export default HeroCarouselWithData;