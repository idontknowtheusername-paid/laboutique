'use client';

import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { showCartToast } from '@/components/ui/enhanced-toast';

interface QuickAddToCartProps {
  productId: string;
  productName: string;
  price: number;
  onAddToCart?: (productId: string, quantity: number) => void;
  className?: string;
}

const QuickAddToCart: React.FC<QuickAddToCartProps> = ({
  productId,
  productName,
  price,
  onAddToCart,
  className = ''
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    setIsAnimating(true);
    
    // Use the cart context
    addToCart(productId, productName, price, quantity);
    
    // Show success toast
    showCartToast(productName, quantity);

    // Call the optional callback for backward compatibility
    if (onAddToCart) {
      onAddToCart(productId, quantity);
    }
    
    setIsAdded(true);
    
    // Reset animation after 2 seconds
    setTimeout(() => {
      setIsAdded(false);
      setIsAnimating(false);
    }, 2000);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Quick Add Button - Mobile First */}
      <div className="flex items-center space-x-2">
        {/* Quantity Selector - Hidden on mobile, visible on tablet+ */}
        <div className="hidden md:flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
          <Button
            size="sm"
            variant="ghost"
            className="w-6 h-6 p-0 hover:bg-gray-200"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
          >
            <Minus className="w-3 h-3" />
          </Button>
          <span className="text-sm font-medium min-w-[2rem] text-center">
            {quantity}
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="w-6 h-6 p-0 hover:bg-gray-200"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= 10}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>

        {/* Main Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={isAdded}
          className={`
            flex-1 md:flex-none bg-beshop-primary hover:bg-blue-700 
            text-white font-medium transition-all duration-300
            ${isAdded ? 'bg-green-500 hover:bg-green-600' : ''}
            ${isAnimating ? 'scale-105' : 'scale-100'}
            h-8 md:h-10 px-3 md:px-4
          `}
        >
          {isAdded ? (
            <>
              <Check className="w-3 h-3 md:w-4 md:h-4 mr-2" />
              <span className="text-xs md:text-sm">Ajouté !</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 mr-2" />
              <span className="text-xs md:text-sm">
                <span className="md:hidden">+</span>
                <span className="hidden md:inline">Ajouter</span>
              </span>
            </>
          )}
        </Button>
      </div>

      {/* Success Animation */}
      {isAdded && (
        <div className="absolute -top-2 -right-2 z-10">
          <Badge className="bg-green-500 text-white animate-bounce">
            +{quantity}
          </Badge>
        </div>
      )}

      {/* Mobile Quantity Swipe Hint */}

    </div>
  );
};

export default QuickAddToCart;
