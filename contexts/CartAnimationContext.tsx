'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface CartAnimationState {
  isVisible: boolean;
  productName?: string;
}

interface CartAnimationContextType {
  animationState: CartAnimationState;
  triggerCartAnimation: (productName?: string) => void;
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
    productName: undefined
  });

  const triggerCartAnimation = useCallback((productName?: string) => {
    setAnimationState({
      isVisible: true,
      productName
    });
  }, []);

  const hideCartAnimation = useCallback(() => {
    setAnimationState({
      isVisible: false,
      productName: undefined
    });
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

export default CartAnimationProvider;