'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface CartAnimationState {
  isVisible: boolean;
  productName?: string;
  productImage?: string;
}

interface CartAnimationContextType {
  animationState: CartAnimationState;
  triggerCartAnimation: (productName?: string, productImage?: string, startElement?: HTMLElement) => void;
  hideCartAnimation: () => void;
}

const CartAnimationContext = createContext<CartAnimationContextType | undefined>(undefined);

export const useCartAnimation = () => {
  const context = useContext(CartAnimationContext);
  if (!context) {
    throw new Error('useCartAnimation must be used within a CartAnimationProvider');
  }
  return context;
};

export const CartAnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [animationState, setAnimationState] = useState<CartAnimationState>({
    isVisible: false,
    productName: undefined,
    productImage: undefined
  });

  const triggerCartAnimation = useCallback((productName?: string, productImage?: string, startElement?: HTMLElement) => {
    setAnimationState({
      isVisible: true,
      productName,
      productImage
    });
  }, []);

  const hideCartAnimation = useCallback(() => {
    setAnimationState(prev => ({
      ...prev,
      isVisible: false
    }));
  }, []);

  return (
    <CartAnimationContext.Provider value={{
      animationState,
      triggerCartAnimation,
      hideCartAnimation
    }}>
      {children}
    </CartAnimationContext.Provider>
  );
};