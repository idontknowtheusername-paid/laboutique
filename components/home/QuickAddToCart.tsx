'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Check, AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { showCartToast } from '@/components/ui/enhanced-toast';

interface QuickAddToCartProps {
  productId: string;
  productName: string;
  price: number;
  productImage?: string;
  onAddToCart?: (productId: string, quantity: number) => void;
  className?: string;
  disabled?: boolean;
  maxQuantity?: number;
  showQuantitySelector?: boolean;
}

const QuickAddToCart: React.FC<QuickAddToCartProps> = ({
  productId,
  productName,
  price,
  productImage,
  onAddToCart,
  className = '',
  disabled = false,
  maxQuantity = 10,
  showQuantitySelector = true
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { addToCart, loading, error, retryLastOperation } = useCart();

  // Check if there's an error for this specific product
  const hasProductError = error?.itemId === productId;
  const showError = hasProductError || localError;

  // Reset error when product changes
  useEffect(() => {
    setLocalError(null);
  }, [productId]);

  // Reset success state when cart error occurs
  useEffect(() => {
    if (hasProductError) {
      setIsAdded(false);
      setIsAnimating(false);
    }
  }, [hasProductError]);

  const handleAddToCart = async () => {
    if (isLoading || disabled) return;

    setIsLoading(true);
    setLocalError(null);
    setIsAnimating(true);

    try {
      await addToCart(productId, productName, price, quantity, productImage);

      // Call the optional callback for backward compatibility
      if (onAddToCart) {
        onAddToCart(productId, quantity);
      }

      setIsAdded(true);

      // Reset success state after 2 seconds
      setTimeout(() => {
        setIsAdded(false);
        setIsAnimating(false);
      }, 2000);

    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Erreur lors de l\'ajout');
      setIsAnimating(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async () => {
    if (hasProductError && error?.retryable) {
      await retryLastOperation();
    } else if (localError) {
      await handleAddToCart();
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
      setLocalError(null); // Clear error when quantity changes
    }
  };

  const isButtonDisabled = disabled || isLoading || loading;
  const showLoadingState = isLoading || (loading && !isAdded);

  const getButtonContent = () => {
    if (showError) {
      return (
        <>
          <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-2" />
          <span className="text-xs md:text-sm">Erreur</span>
        </>
      );
    }

    if (showLoadingState) {
      return (
        <>
          <div className="w-3 h-3 md:w-4 md:h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
          <span className="text-xs md:text-sm">Ajout...</span>
        </>
      );
    }

    if (isAdded) {
      return (
        <>
          <Check className="w-3 h-3 md:w-4 md:h-4 mr-2" />
          <span className="text-xs md:text-sm">Ajouté !</span>
        </>
      );
    }

    if (disabled) {
      return <span className="text-xs md:text-sm">Indisponible</span>;
    }

    return (
      <>
        <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 mr-2" />
        <span className="text-xs md:text-sm">
          <span className="md:hidden">+</span>
          <span className="hidden md:inline">Ajouter</span>
        </span>
      </>
    );
  };

  const getButtonClassName = () => {
    let baseClass = `
      flex-1 md:flex-none font-medium transition-all duration-300
      h-8 md:h-10 px-3 md:px-4
      ${isAnimating ? 'scale-105' : 'scale-100'}
    `;

    if (showError) {
      return `${baseClass} bg-red-500 hover:bg-red-600 text-white`;
    }

    if (isAdded) {
      return `${baseClass} bg-green-500 hover:bg-green-600 text-white`;
    }

    if (isButtonDisabled) {
      return `${baseClass} bg-gray-400 hover:bg-gray-400 cursor-not-allowed text-white`;
    }

    return `${baseClass} bg-jomionstore-primary hover:bg-orange-700 text-white`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Quick Add Button - Mobile First */}
      <div className="flex items-center space-x-2">
        {/* Quantity Selector - Hidden on mobile, visible on tablet+ */}
        {showQuantitySelector && (
          <div className="hidden md:flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <Button
              size="sm"
              variant="ghost"
              className="w-6 h-6 p-0 hover:bg-gray-200 disabled:opacity-50"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || isButtonDisabled}
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="text-sm font-medium min-w-[2rem] text-center">
              {quantity}
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="w-6 h-6 p-0 hover:bg-gray-200 disabled:opacity-50"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= maxQuantity || isButtonDisabled}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* Main Add to Cart Button */}
        <Button
          onClick={showError ? handleRetry : handleAddToCart}
          disabled={isButtonDisabled && !showError}
          className={getButtonClassName()}
        >
          {getButtonContent()}
        </Button>

        {/* Retry Button for errors */}
        {showError && (error?.retryable || localError) && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleRetry}
            className="w-8 h-8 p-0"
            disabled={isLoading}
          >
            <RotateCcw className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Success Animation */}
      {isAdded && (
        <div className="absolute -top-2 -right-2 z-10">
          <Badge className="bg-green-500 text-white animate-bounce">
            +{quantity}
          </Badge>
        </div>
      )}

      {/* Error Message */}
      {showError && (
        <div className="absolute top-full left-0 right-0 mt-1 z-20">
          <div className="bg-red-50 border border-red-200 rounded-md p-2">
            <p className="text-xs text-red-600 text-center">
              {hasProductError ? error?.message : localError}
            </p>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {showLoadingState && (
        <div className="absolute inset-0 bg-white bg-opacity-50 rounded-md flex items-center justify-center">
          <div className="w-4 h-4 animate-spin rounded-full border-2 border-jomionstore-primary border-t-transparent" />
        </div>
      )}
    </div>
  );
};

export default QuickAddToCart;

