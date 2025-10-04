'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import AmazonCartAnimation from '@/components/ui/AmazonCartAnimation';

interface AmazonCartAnimationContextType {
  triggerAnimation: (productImage: string, productName: string, startElement?: HTMLElement) => void;
}

const AmazonCartAnimationContext = createContext<AmazonCartAnimationContextType | undefined>(undefined);

export const useAmazonCartAnimation = () => {
  const context = useContext(AmazonCartAnimationContext);
  if (!context) {
    throw new Error('useAmazonCartAnimation must be used within AmazonCartAnimationProvider');
  }
  return context;
};

interface AmazonCartAnimationProviderProps {
  children: React.ReactNode;
}

export const AmazonCartAnimationProvider: React.FC<AmazonCartAnimationProviderProps> = ({ children }) => {
  const [animation, setAnimation] = useState<{
    isVisible: boolean;
    productImage: string;
    productName: string;
    startPosition: { x: number; y: number };
    cartPosition: { x: number; y: number };
  }>({
    isVisible: false,
    productImage: '',
    productName: '',
    startPosition: { x: 0, y: 0 },
    cartPosition: { x: 0, y: 0 }
  });

  const triggerAnimation = useCallback((productImage: string, productName: string, startElement?: HTMLElement) => {
    // Position de l'élément de départ (bouton ou image produit)
    let startPosition = { x: typeof window !== 'undefined' ? window.innerWidth / 2 : 600, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 400 };
    
    if (startElement && typeof window !== 'undefined') {
      const rect = startElement.getBoundingClientRect();
      startPosition = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }

    // Position de l'icône panier (coin supérieur droit)
    const cartPosition = {
      x: typeof window !== 'undefined' ? window.innerWidth - 80 : 1200,
      y: 20
    };

    setAnimation({
      isVisible: true,
      productImage,
      productName,
      startPosition,
      cartPosition
    });
  }, []);

  const handleAnimationComplete = useCallback(() => {
    setAnimation(prev => ({ ...prev, isVisible: false }));
  }, []);

  return (
    <AmazonCartAnimationContext.Provider value={{ triggerAnimation }}>
      {children}
      <AmazonCartAnimation
        isVisible={animation.isVisible}
        onComplete={handleAnimationComplete}
        productImage={animation.productImage}
        productName={animation.productName}
        startPosition={animation.startPosition}
        cartPosition={animation.cartPosition}
      />
    </AmazonCartAnimationContext.Provider>
  );
};