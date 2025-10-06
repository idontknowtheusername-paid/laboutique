'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';

interface AmazonCartAnimationProps {
  isVisible: boolean;
  onComplete?: () => void;
  productImage?: string;
  productName?: string;
  startPosition?: { x: number; y: number };
  cartPosition?: { x: number; y: number };
}

const AmazonCartAnimation: React.FC<AmazonCartAnimationProps> = ({
  isVisible,
  onComplete,
  productImage,
  productName,
  startPosition = { x: 0, y: 0 },
  cartPosition = { x: typeof window !== 'undefined' ? window.innerWidth - 80 : 1200, y: 20 }
}) => {
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'flying' | 'success'>('idle');
  const [flyingImage, setFlyingImage] = useState<{ x: number; y: number; scale: number; opacity: number }>({
    x: startPosition.x,
    y: startPosition.y,
    scale: 1,
    opacity: 1
  });
  const animationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && productImage) {
      setAnimationPhase('flying');
      
      // Animation de vol de l'image du produit vers le panier
      const startTime = Date.now();
      const duration = 800; // 800ms pour l'animation de vol
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Courbe d'animation (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        // Position interpolée
        const currentX = startPosition.x + (cartPosition.x - startPosition.x) * easeOut;
        const currentY = startPosition.y + (cartPosition.y - startPosition.y) * easeOut;
        
        // Effet de "rebond" vers la fin
        const bounce = progress > 0.7 ? Math.sin((progress - 0.7) * 10) * 0.1 : 0;
        
        // Scale et opacity
        const scale = 1 - (progress * 0.3); // Réduit légèrement
        const opacity = 1 - (progress * 0.2); // Légèrement transparent
        
        setFlyingImage({
          x: currentX,
          y: currentY + bounce * 20,
          scale,
          opacity
        });
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Animation terminée
          setAnimationPhase('success');
          
          // Animation de succès du panier
          setTimeout(() => {
            setAnimationPhase('idle');
            onComplete?.();
          }, 300);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [isVisible, productImage, startPosition, cartPosition, onComplete]);

  if (!isVisible && animationPhase === 'idle') {
    return null;
  }

  return (
    <>
      {/* Image volante */}
      {animationPhase === 'flying' && productImage && (
        <div
          ref={animationRef}
          className="fixed z-50 pointer-events-none"
          style={{
            left: flyingImage.x,
            top: flyingImage.y,
            transform: `scale(${flyingImage.scale})`,
            opacity: flyingImage.opacity,
            transition: 'none'
          }}
        >
          <div className="w-12 h-12 rounded-lg overflow-hidden shadow-lg border-2 border-white">
            <Image
              src={productImage || '/placeholder-product.jpg'}
              alt={productName || 'Produit'}
              width={48}
              height={48}
              className="w-full h-full object-cover"
              quality={85}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
          </div>
        </div>
      )}

      {/* Animation de succès du panier */}
      {animationPhase === 'success' && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: cartPosition.x - 20,
            top: cartPosition.y - 20
          }}
        >
          <div className="bg-green-500 text-white rounded-full p-2 shadow-lg animate-ping">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>
      )}

      {/* Notification de succès */}
      {animationPhase === 'success' && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                <span className="text-green-500 text-xs">✓</span>
              </div>
              <span className="text-sm font-medium">
                {productName ? `${productName} ajouté !` : 'Ajouté au panier !'}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AmazonCartAnimation;