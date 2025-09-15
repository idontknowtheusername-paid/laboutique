'use client';

import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  productId: string;
  productName: string;
  price: number;
  productSlug?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'button';
  className?: string;
  showText?: boolean;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  productId,
  productName,
  price,
  productSlug = '',
  size = 'md',
  variant = 'icon',
  className,
  showText = false
}) => {
  const { user } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist, loading } = useWishlist();
  const { addToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const inWishlist = isInWishlist(productId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      addToast({
        type: 'error',
        title: 'Connexion requise',
        description: 'Vous devez être connecté pour gérer votre liste de souhaits'
      });
      return;
    }

    setIsProcessing(true);

    try {
      if (inWishlist) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId, productName, price, productSlug);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return variant === 'icon' ? 'w-6 h-6' : 'h-8 px-2 text-xs';
      case 'lg':
        return variant === 'icon' ? 'w-10 h-10' : 'h-12 px-6 text-base';
      default:
        return variant === 'icon' ? 'w-8 h-8' : 'h-10 px-4 text-sm';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3';
      case 'lg':
        return 'w-5 h-5';
      default:
        return 'w-4 h-4';
    }
  };

  const isLoading = loading || isProcessing;

  if (variant === 'icon') {
    return (
      <Button
        size="icon"
        variant="secondary"
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          getSizeClasses(),
          'bg-white/90 hover:bg-white shadow-sm transition-all duration-200',
          inWishlist && 'text-red-500 hover:text-red-600',
          !inWishlist && 'text-gray-600 hover:text-red-500',
          isLoading && 'opacity-50 cursor-not-allowed',
          className
        )}
        title={inWishlist ? 'Retirer de la wishlist' : 'Ajouter à la wishlist'}
      >
        <Heart
          className={cn(
            getIconSize(),
            'transition-all duration-200',
            inWishlist && 'fill-current',
            isLoading && 'animate-pulse'
          )}
        />
      </Button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      variant={inWishlist ? 'default' : 'outline'}
      className={cn(
        getSizeClasses(),
        inWishlist && 'bg-red-500 hover:bg-red-600 text-white border-red-500',
        !inWishlist && 'border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-500',
        isLoading && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <Heart
        className={cn(
          getIconSize(),
          'mr-2 transition-all duration-200',
          inWishlist && 'fill-current',
          isLoading && 'animate-pulse'
        )}
      />
      {showText && (
        <span>
          {isLoading
            ? 'Chargement...'
            : inWishlist
            ? 'Dans la wishlist'
            : 'Ajouter à la wishlist'
          }
        </span>
      )}
    </Button>
  );
};

export default WishlistButton;