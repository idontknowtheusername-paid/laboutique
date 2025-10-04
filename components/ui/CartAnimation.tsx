'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Check } from 'lucide-react';

interface CartAnimationProps {
  isVisible: boolean;
  onComplete?: () => void;
  productName?: string;
}

const CartAnimation: React.FC<CartAnimationProps> = ({
  isVisible,
  onComplete,
  productName
}) => {
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'adding' | 'success'>('idle');

  useEffect(() => {
    if (isVisible) {
      setAnimationPhase('adding');
      
      // Phase d'ajout (1.5s)
      const addingTimer = setTimeout(() => {
        setAnimationPhase('success');
      }, 1500);

      // Phase de succès (1s)
      const successTimer = setTimeout(() => {
        setAnimationPhase('idle');
        onComplete?.();
      }, 2500);

      return () => {
        clearTimeout(addingTimer);
        clearTimeout(successTimer);
      };
    }
  }, [isVisible, onComplete]);

  if (!isVisible && animationPhase === 'idle') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
        <div className="flex items-center space-x-3">
          {/* Icône animée */}
          <div className="relative">
            {animationPhase === 'adding' && (
              <div className="absolute inset-0">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {animationPhase === 'success' && (
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                <Check className="w-5 h-5 text-white" />
              </div>
            )}
            {animationPhase === 'idle' && (
              <ShoppingCart className="w-8 h-8 text-gray-600" />
            )}
          </div>

          {/* Message */}
          <div className="flex-1">
            {animationPhase === 'adding' && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900">
                  Ajout en cours...
                </p>
                {productName && (
                  <p className="text-xs text-gray-500 truncate">
                    {productName}
                  </p>
                )}
              </div>
            )}
            {animationPhase === 'success' && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-600">
                  Ajouté au panier !
                </p>
                {productName && (
                  <p className="text-xs text-gray-500 truncate">
                    {productName}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Barre de progression */}
        {animationPhase === 'adding' && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div className="bg-blue-500 h-1 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartAnimation;