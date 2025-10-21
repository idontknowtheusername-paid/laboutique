'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, Star, Clock, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';

interface HeroBanner {
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

interface HeroCarouselImprovedProps {
  banners?: HeroBanner[];
  autoRotate?: boolean;
  showControls?: boolean;
  showIndicators?: boolean;
  showProgress?: boolean;
  className?: string;
}

const HeroCarouselImproved: React.FC<HeroCarouselImprovedProps> = ({
  banners = [],
  autoRotate = true,
  showControls = true,
  showIndicators = true,
  showProgress = true,
  className = ''
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoRotate);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Fallback banners if none provided
  const fallbackBanners: HeroBanner[] = [
    {
      id: 'fallback-1',
      title: 'Découvrez JomionStore',
      subtitle: 'Le centre commercial digital du Bénin',
      description: 'Des milliers de produits authentiques, une livraison rapide et un service client exceptionnel.',
      cta_text: 'Découvrir maintenant',
      cta_link: '/products',
      image_url: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=1200',
      gradient: 'from-jomionstore-primary to-orange-600',
      type: 'promotional',
      priority: 1,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'fallback-2',
      title: 'Électronique Premium',
      subtitle: 'Les dernières technologies à votre portée',
      description: 'Smartphones, laptops, TV intelligentes et bien plus encore avec garantie officielle.',
      cta_text: 'Voir la collection',
      cta_link: '/category/electronique',
      image_url: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=1200',
      gradient: 'from-jomionstore-secondary to-orange-600',
      type: 'category',
      priority: 2,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'fallback-3',
      title: 'Mode & Style',
      subtitle: 'Express your unique style',
      description: 'Découvrez les dernières tendances mode pour homme, femme et enfant.',
      cta_text: 'Shopping mode',
      cta_link: '/category/mode-beaute',
      image_url: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1200',
      gradient: 'from-purple-600 to-pink-600',
      type: 'category',
      priority: 3,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'fallback-4',
      title: 'Livraison Gratuite',
      subtitle: 'À Cotonou et environs',
      description: 'Commandez maintenant et recevez gratuitement vos produits sous 24h.',
      cta_text: 'En savoir plus',
      cta_link: '/delivery-info',
      image_url: 'https://images.pexels.com/photos/4393021/pexels-photo-4393021.jpeg?auto=compress&cs=tinysrgb&w=1200',
      gradient: 'from-green-600 to-teal-600',
      type: 'service',
      priority: 4,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'fallback-5',
      title: 'Paiement Sécurisé',
      subtitle: 'Vos transactions sont protégées',
      description: 'Cartes bancaires, Mobile Money, virement. Toutes vos données sont chiffrées et sécurisées.',
      cta_text: 'Découvrir',
      cta_link: '/payment-info',
      image_url: 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=1200',
      gradient: 'from-orange-600 to-indigo-600',
      type: 'service',
      priority: 5,
      is_active: true,
      created_at: new Date().toISOString()
    }
  ];

  // Utiliser les bannières de fallback si on a moins de 2 bannières (pour avoir un carousel)
  const displayBanners = banners.length >= 2 ? banners : fallbackBanners;
  
  // Debug temporaire
  console.log('HeroCarouselImproved - banners.length:', banners.length);
  console.log('HeroCarouselImproved - displayBanners.length:', displayBanners.length);
  console.log('HeroCarouselImproved - currentSlide:', currentSlide);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % displayBanners.length);
  }, [displayBanners.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlaying(prev => !prev);
  }, []);

  // Intersection Observer for performance
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (carouselRef.current) {
      observer.observe(carouselRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-play effect
  useEffect(() => {
    if (!isAutoPlaying || !isVisible || displayBanners.length <= 1) return;

    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, isVisible, nextSlide, displayBanners.length]);

  // Set loading to false immediately if banners are provided
  useEffect(() => {
    if (banners.length > 0) {
      setIsLoading(false);
    } else {
      // Only try to load from API if no banners provided
      const fetchBanners = async () => {
        try {
          setIsLoading(true);
          const response = await fetch('/api/hero-banners?limit=5');
          const data = await response.json();
          
          if (data.success && data.data) {
            // Banners are passed as props, so we don't need to set them here
            // This is just for loading state management
          }
        } catch (error) {
          console.error('Error fetching hero banners:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchBanners();
    }
  }, [banners.length]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'offer':
        return <Tag className="w-4 h-4" />;
      case 'new':
        return <Star className="w-4 h-4" />;
      case 'service':
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'offer':
        return <Badge variant="destructive" className="bg-red-500">Offre Spéciale</Badge>;
      case 'new':
        return <Badge variant="default" className="bg-green-500">Nouveau</Badge>;
      case 'service':
        return <Badge variant="secondary" className="bg-orange-500">Service</Badge>;
      case 'category':
        return <Badge variant="outline" className="border-white text-white">Catégorie</Badge>;
      default:
        return <Badge variant="outline" className="border-white text-white">Promotion</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className={`relative h-[400px] lg:h-[500px] overflow-hidden rounded-xl shadow-2xl bg-gray-200 animate-pulse ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-jomionstore-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des bannières...</p>
          </div>
        </div>
      </div>
    );
  }

  if (displayBanners.length === 0) {
    return (
      <div className={`relative h-[400px] lg:h-[500px] overflow-hidden rounded-xl shadow-2xl bg-gray-100 ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Aucune bannière disponible</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={carouselRef} 
      className={`relative h-[400px] lg:h-[500px] overflow-hidden rounded-xl shadow-2xl group ${className}`}
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Slides */}
      <div className="relative h-full">
        {displayBanners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
              index === currentSlide ? 'translate-x-0' : 
              index < currentSlide ? '-translate-x-full' : 'translate-x-full'
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <Image
                src={banner.image_url}
                alt={banner.title}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="100vw"
                quality={90}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
            </div>
            
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient} opacity-90`} />
            
            {/* Content */}
            <div className="relative h-full flex items-center">
              <div className="container">
                <div className="max-w-2xl text-white">
                  {/* Type Badge */}
                  <div className="mb-3 animate-fade-in">
                    {getTypeBadge(banner.type)}
                  </div>
                  
                  {/* Title */}
                  <h2 className="text-4xl lg:text-5xl font-bold mb-3 animate-fade-in">
                    {banner.title}
                  </h2>
                  
                  {/* Subtitle */}
                  {banner.subtitle && (
                    <h3 className="text-lg lg:text-xl font-light mb-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                      {banner.subtitle}
                    </h3>
                  )}
                  
                  {/* Description */}
                  {banner.description && (
                    <p className="text-base lg:text-lg mb-4 opacity-90 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                      {banner.description}
                    </p>
                  )}
                  
                  {/* CTA Button */}
                  <Link href={banner.cta_link}>
                    <Button 
                      size="lg" 
                      className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-6 py-3 text-base animate-fade-in hover-lift"
                      style={{ animationDelay: '0.6s' }}
                    >
                      {banner.cta_text}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Controls - DISABLED */}
      {/* Flèches de défilement supprimées - Auto-défilement uniquement */}

      {/* Play/Pause Button */}
      {displayBanners.length > 1 && (
        <button
          onClick={toggleAutoPlay}
          className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-300"
          aria-label={isAutoPlaying ? 'Pause' : 'Play'}
        >
          {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      )}

      {/* Slide Indicators */}
      {showIndicators && displayBanners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {displayBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Aller au slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {showProgress && displayBanners.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div
            className="h-full bg-white transition-all duration-100"
            style={{
              width: `${((currentSlide + 1) / displayBanners.length) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default HeroCarouselImproved;