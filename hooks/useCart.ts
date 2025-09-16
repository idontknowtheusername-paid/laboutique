'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { CartItem, Product } from '@/types/database';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from './useAuth';

type CartItemWithProduct = CartItem & { products: Product };

interface CartContextType {
  cartItems: CartItemWithProduct[] | null;
  loading: boolean;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    // Return a default implementation for when context is not available
    const [cartItems, setCartItems] = useState<CartItemWithProduct[] | null>(null);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
      if (user && isSupabaseConfigured()) {
        fetchCartItems();
      } else {
        setCartItems([]);
      }
    }, [user]);

    const fetchCartItems = async () => {
      if (!user || !isSupabaseConfigured()) {
        setCartItems([]);
        return;
      }
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('cart_items')
          .select(`
            *,
            products (
              name,
              price,
              images,
              slug
            )
          `);

        if (!error) {
          setCartItems(data || []);
        } else {
          setCartItems([]);
        }
      } catch (error) {
        console.warn('Failed to fetch cart items:', error);
        setCartItems([]);
      }
      setLoading(false);
    };

    const addToCart = async (productId: string, quantity: number) => {
      if (!user || !isSupabaseConfigured()) return;

      try {
        const { error } = await (supabase as any)
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity,
          } as any);

        if (!error) {
          await fetchCartItems();
        }
      } catch (error) {
        console.warn('Failed to add to cart:', error);
      }
    };

    const updateQuantity = async (itemId: string, quantity: number) => {
      if (!isSupabaseConfigured()) return;

      try {
        const { error } = await (supabase as any)
          .from('cart_items')
          .update({ quantity })
          .eq('id', itemId);

        if (!error) {
          await fetchCartItems();
        }
      } catch (error) {
        console.warn('Failed to update quantity:', error);
      }
    };

    const removeFromCart = async (itemId: string) => {
      if (!isSupabaseConfigured()) return;

      try {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId);

        if (!error) {
          await fetchCartItems();
        }
      } catch (error) {
        console.warn('Failed to remove from cart:', error);
      }
    };

    const clearCart = async () => {
      if (!user || !isSupabaseConfigured()) return;

      try {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);

        if (!error) {
          setCartItems([]);
        }
      } catch (error) {
        console.warn('Failed to clear cart:', error);
      }
    };

    const getCartTotal = () => {
      if (!cartItems) return 0;
      
      return cartItems.reduce((total, item) => {
        const product = item.products;
        return total + (product?.price || 0) * item.quantity;
      }, 0);
    };

    return {
      cartItems,
      loading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getCartTotal,
    };
  }
  return context;
};

export default CartContext;