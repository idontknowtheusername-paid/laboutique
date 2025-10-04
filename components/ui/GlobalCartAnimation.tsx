'use client';

import React from 'react';
import { useCartAnimation } from '@/contexts/CartAnimationContext';
import AmazonCartAnimation from './AmazonCartAnimation';

const GlobalCartAnimation: React.FC = () => {
  const { animationState, hideCartAnimation } = useCartAnimation();

  const handleAnimationComplete = () => {
    hideCartAnimation();
  };

  return (
    <AmazonCartAnimation
      isVisible={animationState.isVisible}
      onComplete={handleAnimationComplete}
      productImage={animationState.productImage}
      productName={animationState.productName}
    />
  );
};

export default GlobalCartAnimation;