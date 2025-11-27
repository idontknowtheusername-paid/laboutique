'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';

interface ProductImageSwiperProps {
  images: string[];
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  interval?: number; // Intervalle entre les images en ms (défaut: 1000ms)
}

/**
 * Composant d'image produit avec défilement automatique au survol
 * Affiche les images du produit en boucle quand l'utilisateur survole
 */
const ProductImageSwiper: React.FC<ProductImageSwiperProps> = ({
  images,
  alt,
  className = '',
  sizes = '180px',
  priority = false,
  quality = 85,
  interval = 1000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Images valides (filtrer les vides)
  const validImages = images?.filter(img => img && img.trim() !== '') || [];
  const hasMultipleImages = validImages.length > 1;

  // Fonction pour passer à l'image suivante
  const nextImage = useCallback(() => {
    if (validImages.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  }, [validImages.length]);

  // Démarrer/arrêter le défilement automatique au survol
  useEffect(() => {
    if (isHovering && hasMultipleImages) {
      // Démarrer le défilement
      intervalRef.current = setInterval(nextImage, interval);
    } else {
      // Arrêter le défilement et revenir à la première image
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setCurrentIndex(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovering, hasMultipleImages, nextImage, interval]);

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  // Image actuelle ou placeholder
  const currentImage = validImages[currentIndex] || '/images/placeholder-product.jpg';

  return (
    <div
      className={`relative w-full h-full ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Image
        src={currentImage}
        alt={alt}
        fill
        className="object-cover transition-opacity duration-300"
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        priority={priority}
        quality={quality}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = '/images/placeholder-product.jpg';
        }}
      />

      {/* Indicateurs de pagination (petits points) - visibles seulement au survol */}
      {hasMultipleImages && isHovering && (
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5 z-10">
          {validImages.map((_, index) => (
            <div
              key={index}
              className={`w-1 h-1 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-white scale-125'
                  : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}

      {/* Indicateur visuel qu'il y a plusieurs images (icône en haut à droite) */}
      {hasMultipleImages && !isHovering && (
        <div className="absolute top-1 right-1 bg-black/40 text-white text-[8px] px-1 py-0.5 rounded flex items-center gap-0.5">
          <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
          </svg>
          {validImages.length}
        </div>
      )}
    </div>
  );
};

export default ProductImageSwiper;
