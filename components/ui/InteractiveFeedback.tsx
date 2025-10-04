'use client';

import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Eye, Star } from 'lucide-react';

interface InteractiveFeedbackProps {
  children: React.ReactNode;
  action: 'wishlist' | 'cart' | 'view' | 'rating';
  onAction: () => void;
  disabled?: boolean;
  className?: string;
  productName?: string;
}

const InteractiveFeedback: React.FC<InteractiveFeedbackProps> = ({
  children,
  action,
  onAction,
  disabled = false,
  className = '',
  productName
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    
    setIsAnimating(true);
    setShowFeedback(true);
    
    // Action spécifique selon le type
    if (action === 'cart') {
      // Animation du panier style Amazon
    } else {
      // Feedback normal pour les autres actions
      setShowFeedback(true);
      setTimeout(() => {
        setShowFeedback(false);
      }, 2000);
    }
    
    onAction();
    
    // Reset animation after 600ms
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };

  const getActionIcon = () => {
    switch (action) {
      case 'wishlist': return <Heart className="w-4 h-4" />;
      case 'cart': return <ShoppingCart className="w-4 h-4" />;
      case 'view': return <Eye className="w-4 h-4" />;
      case 'rating': return <Star className="w-4 h-4" />;
      default: return null;
    }
  };

  const getActionMessage = () => {
    switch (action) {
      case 'wishlist': return 'Ajouté aux favoris !';
      case 'cart': return 'Ajouté au panier !';
      case 'view': return 'Ouverture...';
      case 'rating': return 'Note enregistrée !';
      default: return 'Action effectuée !';
    }
  };

  return (
    <div className="relative">
      <div
        onClick={handleClick}
        className={`cursor-pointer transition-all duration-300 ${
          isAnimating ? 'scale-110' : 'hover:scale-105'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        {children}
      </div>
      
      {/* Feedback Animation - Seulement pour les actions non-cart */}
      {showFeedback && action !== 'cart' && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg animate-bounce">
            <div className="flex items-center space-x-1">
              {getActionIcon()}
              <span>{getActionMessage()}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Ripple Effect */}
      {isAnimating && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-blue-500 opacity-20 rounded-full animate-ping"></div>
        </div>
      )}
    </div>
  );
};

export default InteractiveFeedback;