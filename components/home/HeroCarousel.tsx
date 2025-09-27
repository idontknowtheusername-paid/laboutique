'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

const slides = [
  {
    id: 1,
    title: 'Découvrez JomiaStore',
    subtitle: 'La nouvelle expérience shopping premium du Bénin',
    description: 'Des milliers de produits authentiques, une livraison rapide et un service client exceptionnel.',
    cta: 'Découvrir maintenant',
    link: '/products',
    image: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=1200',
    gradient: 'from-jomiastore-primary to-blue-600',
  },
  {
    id: 2,
    title: 'Électronique Premium',
    subtitle: 'Les dernières technologies à votre portée',
    description: 'Smartphones, laptops, TV intelligentes et bien plus encore avec garantie officielle.',
    cta: 'Voir la collection',
    link: '/category/electronique',
    image: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=1200',
    gradient: 'from-jomiastore-secondary to-orange-600',
  },
  {
    id: 3,
    title: 'Mode & Style',
    subtitle: 'Express your unique style',
    description: 'Découvrez les dernières tendances mode pour homme, femme et enfant.',
    cta: 'Shopping mode',
    link: '/category/mode',
    image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1200',
    gradient: 'from-purple-600 to-pink-600',
  },
  {
    id: 4,
    title: 'Livraison Gratuite',
    subtitle: 'À Cotonou et environs',
    description: 'Commandez maintenant et recevez gratuitement vos produits sous 24h.',
    cta: 'En savoir plus',
    link: '/delivery-info',
    image: 'https://images.pexels.com/photos/4393021/pexels-photo-4393021.jpeg?auto=compress&cs=tinysrgb&w=1200',
    gradient: 'from-green-600 to-teal-600',
  },
  {
    id: 5,
    title: 'Paiement Sécurisé',
    subtitle: 'Vos transactions sont protégées',
    description: 'Cartes bancaires, Mobile Money, virement. Toutes vos données sont chiffrées et sécurisées.',
    cta: 'Découvrir',
    link: '/payment-info',
    image: 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=1200',
    gradient: 'from-blue-600 to-indigo-600',
  },
  {
    id: 6,
    title: 'Offres Exclusives',
    subtitle: 'Promotions réservées aux membres',
    description: 'Rejoignez notre communauté et bénéficiez de réductions exclusives et d\'offres spéciales.',
    cta: 'Rejoindre',
    link: '/register',
    image: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=1200',
    gradient: 'from-purple-600 to-pink-600',
  },
  {
    id: 7,
    title: 'Support 24/7',
    subtitle: 'Assistance client disponible',
    description: 'Notre équipe est là pour vous aider 24h/24, 7j/7. Chat, email ou téléphone.',
    cta: 'Nous contacter',
    link: '/contact',
    image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200',
    gradient: 'from-orange-600 to-red-600',
  },
];

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
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

  useEffect(() => {
    if (!isAutoPlaying || !isVisible) return;

    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, isVisible, nextSlide]);

  return (
    <div ref={carouselRef} className="relative h-[500px] lg:h-[600px] overflow-hidden rounded-xl shadow-2xl">
      {/* Slides */}
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
              index === currentSlide ? 'translate-x-0' : 
              index < currentSlide ? '-translate-x-full' : 'translate-x-full'
            }`}
          >
            {/* Background Image - Optimized with Next.js Image */}
            <div className="absolute inset-0">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                priority={index <= 1} // Priority for first 2 images
                sizes="100vw"
                quality={85}
              />
            </div>
            
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-90`} />
            
            {/* Content */}
            <div className="relative h-full flex items-center">
              <div className="container">
                <div className="max-w-2xl text-white">
                  <h2 className="text-5xl lg:text-7xl font-bold mb-4 animate-fade-in">
                    {slide.title}
                  </h2>
                  <h3 className="text-xl lg:text-2xl font-light mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    {slide.subtitle}
                  </h3>
                  <p className="text-lg mb-8 opacity-90 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    {slide.description}
                  </p>
                  <Link href={slide.link}>
                    <Button 
                      size="lg" 
                      className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 py-4 text-lg animate-fade-in hover-lift"
                      style={{ animationDelay: '0.6s' }}
                    >
                      {slide.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows intentionally removed per request */}

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white scale-125' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div
          className="h-full bg-white transition-all duration-100"
          style={{
            width: `${((currentSlide + 1) / slides.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
};

export default HeroCarousel;