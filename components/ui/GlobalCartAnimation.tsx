'use client';

import React from 'react';
import { useCartAnimation } from '@/contexts/CartAnimationContext';
import CartAnimation from '@/components/ui/CartAnimation';

const GlobalCartAnimation: React.FC = () => {
  const { animationState, hideCartAnimation } = useCartAnimation();

  return (
    <CartAnimation
      isVisible={animationState.isVisible}
      onComplete={hideCartAnimation}
      productName={animationState.productName}
    />
  );
};

export default GlobalCartAnimation;