'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { CartService, CartItem, CartSummary } from '@/lib/services';
import { useToast } from '@/components/ui/toast';
import { useHydration } from '@/hooks';

interface CartContextType {
  cartItems: CartItem[];
  cartSummary: CartSummary | null;
  loading: boolean;
  addToCart: (productId: string, productName: string, price: number, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
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
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const isHydrated = useHydration();
  const { addToast } = useToast();

  // Charger le panier quand l'utilisateur est connecté
  useEffect(() => {
    if (user?.id && isHydrated) {
      refreshCart();
    } else if (!user && isHydrated) {
      // Charger depuis localStorage pour les utilisateurs non connectés
      loadLocalCart();
    }
  }, [user, isHydrated]);

  const loadLocalCart = () => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('beshop-cart');
      if (savedCart) {
        try {
          const localItems = JSON.parse(savedCart);
          setCartItems(localItems);
          calculateLocalSummary(localItems);
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
        }
      }
    }
  };

  const saveLocalCart = (items: CartItem[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('beshop-cart', JSON.stringify(items));
    }
  };

  const calculateLocalSummary = (items: CartItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
    const taxAmount = subtotal * 0.18;
    const shippingAmount = subtotal > 50000 ? 0 : 2000;
    const totalAmount = subtotal + taxAmount + shippingAmount;
    const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

    setCartSummary({
      items,
      subtotal,
      tax_amount: taxAmount,
      shipping_amount: shippingAmount,
      discount_amount: 0,
      total_amount: totalAmount,
      items_count: itemsCount,
      currency: 'XOF'
    });
  };

  const refreshCart = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await CartService.getCartSummary(user.id);
      if (response.success && response.data) {
        setCartItems(response.data.items);
        setCartSummary(response.data);
      }
    } catch (error) {
      console.error('Error refreshing cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, productName: string, price: number, quantity: number = 1) => {
    if (user?.id) {
      // Utilisateur connecté - utiliser le service
      setLoading(true);
      try {
        const response = await CartService.addItem(user.id, { product_id: productId, quantity });
        if (response.success) {
          await refreshCart();
          if (isHydrated) {
            addToast({
              type: 'success',
              title: 'Produit ajouté au panier',
              description: `${productName} (${quantity})`
            });
          }
        } else {
          throw new Error(response.error || 'Erreur lors de l\'ajout au panier');
        }
      } catch (error) {
        if (isHydrated) {
          addToast({
            type: 'error',
            title: 'Erreur',
            description: error instanceof Error ? error.message : 'Erreur lors de l\'ajout au panier'
          });
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Utilisateur non connecté - utiliser localStorage
      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.product_id === productId);
        let newItems;

        if (existingItem) {
          newItems = prevItems.map(item =>
            item.product_id === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          const newItem: CartItem = {
            id: `cart-${Date.now()}-${Math.random()}`,
            user_id: '',
            product_id: productId,
            quantity,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            product: {
              id: productId,
              name: productName,
              slug: '',
              price,
              images: [],
              status: 'active',
              quantity: 999,
              track_quantity: false
            }
          };
          newItems = [...prevItems, newItem];
        }

        saveLocalCart(newItems);
        calculateLocalSummary(newItems);

        if (isHydrated) {
          addToast({
            type: 'success',
            title: 'Produit ajouté au panier',
            description: `${productName} (${quantity})`
          });
        }

        return newItems;
      });
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (user?.id) {
      setLoading(true);
      try {
        const response = await CartService.removeItem(user.id, itemId);
        if (response.success) {
          await refreshCart();
        }
      } catch (error) {
        console.error('Error removing from cart:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setCartItems(prevItems => {
        const newItems = prevItems.filter(item => item.id !== itemId);
        saveLocalCart(newItems);
        calculateLocalSummary(newItems);
        return newItems;
      });
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (user?.id) {
      setLoading(true);
      try {
        const response = await CartService.updateItem(user.id, { id: itemId, quantity });
        if (response.success) {
          await refreshCart();
        }
      } catch (error) {
        console.error('Error updating quantity:', error);
      } finally {
        setLoading(false);
      }
    } else {
      if (quantity <= 0) {
        removeFromCart(itemId);
        return;
      }

      setCartItems(prevItems => {
        const newItems = prevItems.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        );
        saveLocalCart(newItems);
        calculateLocalSummary(newItems);
        return newItems;
      });
    }
  };

  const clearCart = async () => {
    if (user?.id) {
      setLoading(true);
      try {
        await CartService.clearCart(user.id);
        setCartItems([]);
        setCartSummary(null);
      } catch (error) {
        console.error('Error clearing cart:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setCartItems([]);
      setCartSummary(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('beshop-cart');
      }
    }
  };

  const getCartTotal = () => {
    return cartSummary?.total_amount || 0;
  };

  const getCartItemsCount = () => {
    return cartSummary?.items_count || 0;
  };

  const value: CartContextType = {
    cartItems,
    cartSummary,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
    getCartTotal,
    getCartItemsCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};