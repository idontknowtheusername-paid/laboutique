'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoriesService, Category } from '@/lib/services';
import Image from 'next/image';

// Configuration des groupes thématiques
const CATEGORY_GROUPS = {
  'tech': { icon: '💻', color: 'from-orange-500 to-red-600' },
  'mode': { icon: '👗', color: 'from-pink-500 to-rose-600' },
  'maison': { icon: '🏠', color: 'from-green-500 to-teal-600' },
  'sport': { icon: '⚽', color: 'from-orange-500 to-red-600' },
  'lifestyle': { icon: '🌟', color: 'from-emerald-500 to-teal-600' },
  'automotive': { icon: '🚗', color: 'from-gray-600 to-slate-700' }
};

// Mapping des catégories vers les groupes
const CATEGORY_TO_GROUP: Record<string, keyof typeof CATEGORY_GROUPS> = {
  'electronique': 'tech', 'telephones-accessoires': 'tech', 'ordinateurs-tablettes': 'tech', 'audio-video': 'tech', 'gaming-vr': 'tech',
  'mode-beaute': 'mode', 'vetements-homme': 'mode', 'vetements-femme': 'mode', 'vetements-enfant': 'mode', 'chaussures': 'mode', 'sacs-maroquinerie': 'mode', 'montres-bijoux': 'mode', 'cosmetiques-soins': 'mode',
  'maison-jardin': 'maison', 'mobilier': 'maison', 'electromenager': 'maison', 'luminaires': 'maison', 'cuisine-salle-bain': 'maison', 'jardinage-outils': 'maison',
  'sport-loisirs': 'sport', 'fitness-musculation': 'sport', 'sports-exterieur': 'sport', 'jeux-jouets': 'sport', 'instruments-musique': 'sport',
  'sante-bien-etre': 'lifestyle', 'bebe-enfant': 'lifestyle', 'livre-papeterie': 'lifestyle', 'voyage-bagages': 'lifestyle', 'animaux-accessoires': 'lifestyle',
  'automobile-moto': 'automotive', 'outils-bricolage': 'automotive'
};

// Images par défaut pour les catégories
const getDefaultImage = (slug: string): string => {
  const imageMap: Record<string, string> = {
    'electronique': 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400',
    'maison-jardin': 'https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg?auto=compress&cs=tinysrgb&w=400',
    'mode-beaute': 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400',
    'sport-loisirs': 'https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=400',
    'telephones-accessoires': 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400',
    'ordinateurs-tablettes': 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=400',
    'audio-video': 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400',
    'gaming-vr': 'https://images.pexels.com/photos/1267350/pexels-photo-1267350.jpeg?auto=compress&cs=tinysrgb&w=400',
    'vetements-homme': 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400',
    'vetements-femme': 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400',
    'vetements-enfant': 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400',
    'chaussures': 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400',
    'sacs-maroquinerie': 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400',
    'montres-bijoux': 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=400',
    'cosmetiques-soins': 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=400',
    'mobilier': 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
    'electromenager': 'https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg?auto=compress&cs=tinysrgb&w=400',
    'luminaires': 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
    'cuisine-salle-bain': 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
    'jardinage-outils': 'https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg?auto=compress&cs=tinysrgb&w=400',
    'fitness-musculation': 'https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=400',
    'sports-exterieur': 'https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=400',
    'jeux-jouets': 'https://images.pexels.com/photos/1267350/pexels-photo-1267350.jpeg?auto=compress&cs=tinysrgb&w=400',
    'instruments-musique': 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400',
    'livre-papeterie': 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400',
    'sante-bien-etre': 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=400',
    'bebe-enfant': 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400',
    'automobile-moto': 'https://images.pexels.com/photos/919073/pexels-photo-919073.jpeg?auto=compress&cs=tinysrgb&w=400',
    'outils-bricolage': 'https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg?auto=compress&cs=tinysrgb&w=400',
    'voyage-bagages': 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400',
    'animaux-accessoires': 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400'
  };
  
  return imageMap[slug] || 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=400';
};

export default function CarouselCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const response = await CategoriesService.getWithProductCount();
        
        if (response.success && response.data) {
          const mainCategories = response.data
            .filter(cat => !cat.parent_id)
            .sort((a, b) => (b.product_count || 0) - (a.product_count || 0));
            
          setCategories(mainCategories);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Utilisation directe des catégories sans filtrage
  const filteredCategories = categories;

  // Configuration responsive SIMPLIFIÉE - 2 lignes horizontales
  const getItemsPerSlide = () => {
    if (typeof window === 'undefined') return 8;
    if (window.innerWidth < 640) return 4; // Mobile: 2x2
    if (window.innerWidth < 768) return 6; // Small tablet: 3x2
    if (window.innerWidth < 1024) return 8; // Tablet: 4x2
    if (window.innerWidth < 1280) return 10; // Desktop: 5x2
    return 12; // Large desktop: 6x2
  };

  const [itemsPerSlide, setItemsPerSlide] = useState(8);

  // Gestion du responsive
  useEffect(() => {
    const handleResize = () => {
      setItemsPerSlide(getItemsPerSlide());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalSlides = Math.ceil(filteredCategories.length / itemsPerSlide);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + totalSlides) % totalSlides);
  };


  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  // Auto-play logic
  useEffect(() => {
    if (isAutoPlaying && !isHovered && totalSlides > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % totalSlides);
      }, 4000);
    } else if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, isHovered, totalSlides]);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          
          <div className="flex justify-center gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="w-20 h-20 bg-gray-200 rounded-full mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            🛍️ Parcourir par Catégorie
          </h2>
        </div>



        {/* Carousel Container */}
        <div className="relative max-w-7xl mx-auto">
          {/* Navigation Arrows */}
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg hover:bg-gray-50"
            disabled={totalSlides <= 1}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg hover:bg-gray-50"
            disabled={totalSlides <= 1}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>

          {/* Carousel - VERSION SIMPLIFIÉE */}
          <div
            className="overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentSlide * 100}%)`
              }}
            >
              {Array.from({ length: totalSlides }, (_, slideIndex) => {
                const startIndex = slideIndex * itemsPerSlide;
                const endIndex = startIndex + itemsPerSlide;
                const slideCategories = filteredCategories.slice(startIndex, endIndex);
                
                return (
                  <div key={slideIndex} className="w-full flex-shrink-0 px-4">
                    {/* Grille responsive - 2 lignes horizontales */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                      {slideCategories.map((category) => {
                        const group = CATEGORY_TO_GROUP[category.slug];
                        const groupConfig = group ? CATEGORY_GROUPS[group] : null;
                        
                        return (
                          <Link key={category.id} href={`/category/${category.slug}`}>
                            <div className="group flex flex-col items-center cursor-pointer">
                              {/* Circular Card - SIMPLE */}
                              <div className="relative w-20 h-20 mb-3 group-hover:scale-110 transition-transform duration-300">
                                {/* Image de fond */}
                                <div className="absolute inset-0 rounded-full overflow-hidden">
                                  <Image
                                    src={category.image_url || getDefaultImage(category.slug)}
                                    alt={category.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                
                                {/* Gradient Overlay */}
                                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${groupConfig?.color || 'from-gray-500 to-gray-700'} opacity-80 group-hover:opacity-70 transition-opacity`} />
                                
                                {/* Icon au centre */}
                                <div className="absolute inset-0 flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform duration-300">
                                  {groupConfig?.icon || '📁'}
                                </div>
                              </div>
                              
                              {/* Nom de la catégorie */}
                              <h3 className="text-sm font-medium text-gray-900 group-hover:text-jomionstore-primary transition-colors text-center leading-tight">
                                {category.name}
                              </h3>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link href="/categories">
            <Button size="lg" className="bg-jomionstore-primary hover:bg-orange-700 text-white px-8 py-4 text-lg">
              Voir toutes les catégories ({categories.length})
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}