'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { CategoriesService, Category } from '@/lib/services';
import Image from 'next/image';

// Images haute qualité pour les catégories
const getCategoryImage = (slug: string): string => {
  const imageMap: Record<string, string> = {
    'electronique': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop&crop=center',
    'mode-beaute': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&crop=center',
    'maison-jardin': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center',
    'sport-loisirs': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center',
    'telephones-accessoires': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop&crop=center',
    'ordinateurs-tablettes': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop&crop=center',
    'audio-video': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&crop=center',
    'gaming-vr': 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=300&fit=crop&crop=center',
    'vetements-homme': 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=400&h=300&fit=crop&crop=center',
    'vetements-femme': 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=300&fit=crop&crop=center',
    'vetements-enfant': 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&h=300&fit=crop&crop=center',
    'chaussures': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop&crop=center',
    'sacs-maroquinerie': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop&crop=center',
    'montres-bijoux': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop&crop=center',
    'cosmetiques-soins': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop&crop=center',
    'mobilier': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center',
    'electromenager': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center',
    'luminaires': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=center',
    'cuisine-salle-bain': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center',
    'jardinage-outils': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop&crop=center',
    'fitness-musculation': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center',
    'sports-exterieur': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop&crop=center',
    'jeux-jouets': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center',
    'instruments-musique': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop&crop=center',
    'livre-papeterie': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop&crop=center',
    'sante-bien-etre': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center',
    'bebe-enfant': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=300&fit=crop&crop=center',
    'automobile-moto': 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=300&fit=crop&crop=center',
    'outils-bricolage': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop&crop=center',
    'voyage-bagages': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop&crop=center',
    'animaux-accessoires': 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop&crop=center'
  };
  
  return imageMap[slug] || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=300&fit=crop&crop=center';
};

export default function CarouselCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  // Auto-scroll function
  const autoScroll = () => {
    if (!scrollRef.current || !isAutoScrolling) return;

    const container = scrollRef.current;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;

    // Si on est à la fin, revenir au début
    if (container.scrollLeft >= scrollWidth - clientWidth - 10) {
      container.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      // Sinon, défiler de 200px
      container.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

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

  // Auto-scroll effect
  useEffect(() => {
    if (!isAutoScrolling || categories.length === 0) return;

    const interval = setInterval(autoScroll, 3000);
    return () => clearInterval(interval);
  }, [isAutoScrolling, categories.length]);

  // Pause auto-scroll on mouse enter, resume on mouse leave
  const handleMouseEnter = () => setIsAutoScrolling(false);
  const handleMouseLeave = () => setIsAutoScrolling(true);

  if (loading) {
    return (
      <section className="py-4 bg-white">
        <div className="container">
          
          <div className="flex gap-4 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex-shrink-0 animate-pulse">
                <div className="w-36 h-24 bg-gray-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4 bg-white">
      {/* Carousel Container - Single Line */}
        <div 
          ref={scrollRef}
          className="overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <div className="flex gap-4 pb-4">
            {categories.map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`}>
                <div className="group relative h-32 w-48 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-xl">
                  {/* Image de fond */}
                  <Image
                    src={category.image_url || getCategoryImage(category.slug)}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="192px"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Contenu */}
                  <div className="absolute inset-0 flex flex-col justify-end p-3">
                    <h3 className="text-white font-semibold text-sm leading-tight drop-shadow-lg mb-1">
                      {category.name}
                    </h3>
                    <p className="text-white/90 text-xs font-medium">
                      {category.product_count || 0} produits
                    </p>
                  </div>

                  {/* Effet hover premium */}
                  <div className="absolute inset-0 bg-jomionstore-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Border hover */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-jomionstore-primary/50 rounded-xl transition-colors duration-300" />
                </div>
              </Link>
            ))}
          </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}