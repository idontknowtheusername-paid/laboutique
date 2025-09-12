'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast';
import { useHydration } from '@/hooks/useHydration';

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image?: string;
  vendor?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (productId: string, productName: string, price: number, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const isHydrated = useHydration();
  const { addToast } = useToast();

  // Load cart from localStorage on mount (client-side only)
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('beshop-cart');
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
        }
      }
    }
  }, [isHydrated]);

  // Save cart to localStorage whenever it changes (client-side only)
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      localStorage.setItem('beshop-cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isHydrated]);

  const addToCart = (productId: string, productName: string, price: number, quantity: number = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.productId === productId);

      if (existingItem) {
        // Update quantity if item already exists
        if (isHydrated) {
          addToast({
            type: 'success',
            title: 'Quantité mise à jour',
            description: `${productName} (${quantity} ajouté${quantity > 1 ? 's' : ''})`
          });
        }
        return prevItems.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        if (isHydrated) {
          addToast({
            type: 'success',
            title: 'Produit ajouté au panier',
            description: `${productName} (${quantity})`
          });
        }
        const newItem: CartItem = {
          id: `cart-${Date.now()}-${Math.random()}`,
          productId,
          productName,
          price,
          quantity
        };
        return [...prevItems, newItem];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const value: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};