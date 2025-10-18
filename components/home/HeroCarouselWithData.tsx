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

  // Force use fallback banners for now to test
  const testBanners = [
    {
      id: 'test-1',
      title: 'Découvrez JomionStore',
      subtitle: 'Le centre commercial digital du Bénin',
      description: 'Des milliers de produits authentiques, une livraison rapide et un service client exceptionnel.',
      cta_text: 'Découvrir maintenant',
      cta_link: '/products',
      image_url: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=1200',
      gradient: 'from-jomionstore-primary to-orange-600',
      type: 'promotional' as const,
      priority: 1,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'test-2',
      title: 'Électronique Premium',
      subtitle: 'Les dernières technologies à votre portée',
      description: 'Smartphones, laptops, TV intelligentes et bien plus encore avec garantie officielle.',
      cta_text: 'Voir la collection',
      cta_link: '/category/electronique',
      image_url: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=1200',
      gradient: 'from-jomionstore-secondary to-orange-600',
      type: 'category' as const,
      priority: 2,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'test-3',
      title: 'Mode & Style',
      subtitle: 'Express your unique style',
      description: 'Découvrez les dernières tendances mode pour homme, femme et enfant.',
      cta_text: 'Shopping mode',
      cta_link: '/category/mode-beaute',
      image_url: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1200',
      gradient: 'from-purple-600 to-pink-600',
      type: 'category' as const,
      priority: 3,
      is_active: true,
      created_at: new Date().toISOString()
    }
  ];

  return (
    <HeroCarouselImproved
      banners={testBanners}
      autoRotate={autoRotate}
      showControls={showControls}
      showIndicators={showIndicators}
      showProgress={showProgress}
      className={className}
    />
  );
};

export default HeroCarouselWithData;