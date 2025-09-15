
'use client';
import { useQueryClient } from '@tanstack/react-query';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { WishlistService, WishlistItem } from '@/lib/services';
import { useToast } from '@/components/ui/toast';
import { useHydration } from '@/hooks';

interface WishlistError {
  type: 'network' | 'auth' | 'validation' | 'server';
  message: string;
  retryable: boolean;
  productId?: string;
}

interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  syncing: boolean;
  lastSync: Date | null;
  error: WishlistError | null;
  retryCount: number;
}

interface OptimisticUpdate {
  id: string;
  type: 'add' | 'remove';
  data: any;
  timestamp: number;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  loading: boolean;
  syncing: boolean;
  error: WishlistError | null;
  addToWishlist: (productId: string, productName: string, price: number, productSlug?: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  removeById: (itemId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  retryLastOperation: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  getWishlistCount: () => number;
  moveToCart: (itemIds: string[]) => Promise<{ moved: number; errors: string[] }>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [wishlistState, setWishlistState] = useState<WishlistState>({
    items: [],
    loading: false,
    syncing: false,
    lastSync: null,
    error: null,
    retryCount: 0
  });

  const isHydrated = useHydration();
  const { addToast } = useToast();
  const optimisticUpdates = useRef<OptimisticUpdate[]>([]);
  const lastFailedOperation = useRef<(() => Promise<void>) | null>(null);

  // Load wishlist when user logs in
  useEffect(() => {
    if (user?.id && isHydrated) {
      loadWishlist();
    } else if (!user && isHydrated) {
      // Clear wishlist when user logs out
      setWishlistState(prev => ({
        ...prev,
        items: [],
        error: null,
        lastSync: null
      }));
    }
  }, [user, isHydrated]);

  const createError = (type: WishlistError['type'], message: string, retryable: boolean = true, productId?: string): WishlistError => ({
    type,
    message,
    retryable,
    productId
  });

  const updateWishlistState = (updates: Partial<WishlistState>) => {
    setWishlistState(prev => ({ ...prev, ...updates }));
  };

  const executeWithRetry = async (operation: () => Promise<void>, maxRetries: number = 3) => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        await operation();
        updateWishlistState({ retryCount: 0, error: null });
        return;
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          updateWishlistState({ retryCount: attempt + 1 });
        }
      }
    }

    // All retries failed
    throw lastError;
  };

  const addOptimisticUpdate = (type: OptimisticUpdate['type'], data: any): string => {
    const id = `optimistic-${Date.now()}-${Math.random()}`;
    optimisticUpdates.current.push({
      id,
      type,
      data,
      timestamp: Date.now()
    });
    return id;
  };

  const removeOptimisticUpdate = (id: string) => {
    optimisticUpdates.current = optimisticUpdates.current.filter(update => update.id !== id);
  };

  const rollbackOptimisticUpdate = (updateId: string) => {
    const update = optimisticUpdates.current.find(u => u.id === updateId);
    if (!update) return;

    // Rollback the optimistic change
    switch (update.type) {
      case 'add':
        updateWishlistState({
          items: wishlistState.items.filter(item => item.id !== update.data.tempId)
        });
        break;
      case 'remove':
        updateWishlistState({
          items: [...wishlistState.items, update.data.removedItem]
        });
        break;
    }

    removeOptimisticUpdate(updateId);
  };

  const loadWishlist = async () => {
    if (!user?.id) return;

    updateWishlistState({ loading: true, error: null });

    try {
      const response = await WishlistService.getByUser(user.id);
      if (response.success && response.data) {
        updateWishlistState({
          items: response.data,
          lastSync: new Date(),
          retryCount: 0
        });
      } else {
        throw new Error(response.error || 'Erreur lors du chargement de la wishlist');
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      updateWishlistState({
        error: createError('network', 'Erreur lors du chargement de la wishlist')
      });
    } finally {
      updateWishlistState({ loading: false });
    }
  };

  const refreshWishlist = async () => {
    if (!user?.id) return;
    await loadWishlist();
  };

  const addToWishlist = async (productId: string, productName: string, price: number, productSlug: string = '') => {
    if (!user?.id) {
      updateWishlistState({
        error: createError('auth', 'Vous devez être connecté pour ajouter des produits à votre wishlist', false)
      });

      if (isHydrated) {
        addToast({
          type: 'error',
          title: 'Connexion requise',
          description: 'Vous devez être connecté pour ajouter des produits à votre wishlist'
        });
      }
      return;
    }

    updateWishlistState({ error: null });

    // Check if already in wishlist
    if (isInWishlist(productId)) {
      if (isHydrated) {
        addToast({
          type: 'info',
          title: 'Déjà dans la wishlist',
          description: 'Ce produit est déjà dans votre liste de souhaits'
        });
      }
      return;
    }

    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const optimisticUpdateId = addOptimisticUpdate('add', { tempId, productId, productName, price, productSlug });

    // Optimistic update
    const newItem: WishlistItem = {
      id: tempId,
      user_id: user.id,
      product_id: productId,
      created_at: new Date().toISOString(),
      product: {
        id: productId,
        name: productName,
        slug: productSlug,
        price,
        images: [],
        status: 'active'
      }
    };

    updateWishlistState({
      items: [...wishlistState.items, newItem]
    });

    // Show immediate feedback
    if (isHydrated) {
      addToast({
        type: 'success',
        title: 'Ajouté à la wishlist',
        description: productName
      });
    }

    // Store operation for retry
    lastFailedOperation.current = () => addToWishlist(productId, productName, price, productSlug);

    try {
      await executeWithRetry(async () => {
        const response = await WishlistService.addItem(user.id, productId);
        if (!response.success) {
          throw new Error(response.error || 'Erreur lors de l\'ajout à la wishlist');
        }
      });

      // Success - refresh to get real data
      removeOptimisticUpdate(optimisticUpdateId);
      await refreshWishlist();
  lastFailedOperation.current = null;
  queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });

    } catch (error) {
      // Rollback optimistic update
      rollbackOptimisticUpdate(optimisticUpdateId);

      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'ajout à la wishlist';
      updateWishlistState({
        error: createError('network', errorMessage, true, productId)
      });

      if (isHydrated) {
        addToast({
          type: 'error',
          title: 'Erreur',
          description: errorMessage
        });
      }
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user?.id) return;

    updateWishlistState({ error: null });

    // Find the item to remove for rollback
    const itemToRemove = wishlistState.items.find(item => item.product_id === productId);
    if (!itemToRemove) return;

    const optimisticUpdateId = addOptimisticUpdate('remove', { removedItem: itemToRemove });

    // Optimistic update
    const optimisticItems = wishlistState.items.filter(item => item.product_id !== productId);
    updateWishlistState({ items: optimisticItems });

    // Store operation for retry
    lastFailedOperation.current = () => removeFromWishlist(productId);

    try {
      await executeWithRetry(async () => {
        const response = await WishlistService.removeItem(user.id, productId);
        if (!response.success) {
          throw new Error(response.error || 'Erreur lors de la suppression');
        }
      });

      // Success
      removeOptimisticUpdate(optimisticUpdateId);
      await refreshWishlist();
  lastFailedOperation.current = null;
  queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });

      if (isHydrated) {
        addToast({
          type: 'success',
          title: 'Retiré de la wishlist',
          description: itemToRemove.product?.name || 'Produit retiré'
        });
      }

    } catch (error) {
      // Rollback optimistic update
      rollbackOptimisticUpdate(optimisticUpdateId);

      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la suppression';
      updateWishlistState({
        error: createError('network', errorMessage, true, productId)
      });

      if (isHydrated) {
        addToast({
          type: 'error',
          title: 'Erreur',
          description: errorMessage
        });
      }
    }
  };

  const removeById = async (itemId: string) => {
    if (!user?.id) return;

    updateWishlistState({ error: null });

    // Find the item to remove for rollback
    const itemToRemove = wishlistState.items.find(item => item.id === itemId);
    if (!itemToRemove) return;

    const optimisticUpdateId = addOptimisticUpdate('remove', { removedItem: itemToRemove });

    // Optimistic update
    const optimisticItems = wishlistState.items.filter(item => item.id !== itemId);
    updateWishlistState({ items: optimisticItems });

    // Store operation for retry
    lastFailedOperation.current = () => removeById(itemId);

    try {
      await executeWithRetry(async () => {
        const response = await WishlistService.removeById(user.id, itemId);
        if (!response.success) {
          throw new Error(response.error || 'Erreur lors de la suppression');
        }
      });

      // Success
      removeOptimisticUpdate(optimisticUpdateId);
      await refreshWishlist();
      lastFailedOperation.current = null;

      if (isHydrated) {
        addToast({
          type: 'success',
          title: 'Retiré de la wishlist',
          description: itemToRemove.product?.name || 'Produit retiré'
        });
      }

    } catch (error) {
      // Rollback optimistic update
      rollbackOptimisticUpdate(optimisticUpdateId);

      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la suppression';
      updateWishlistState({
        error: createError('network', errorMessage, true)
      });

      if (isHydrated) {
        addToast({
          type: 'error',
          title: 'Erreur',
          description: errorMessage
        });
      }
    }
  };

  const clearWishlist = async () => {
    if (!user?.id) return;

    updateWishlistState({ error: null, loading: true });

    try {
      await executeWithRetry(async () => {
        const response = await WishlistService.clearAll(user.id);
        if (!response.success) {
          throw new Error('Erreur lors de la suppression de la wishlist');
        }
      });

      updateWishlistState({
        items: [],
        lastSync: new Date()
      });
      queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });

      if (isHydrated) {
        addToast({
          type: 'success',
          title: 'Wishlist vidée',
          description: 'Tous les produits ont été retirés de votre liste de souhaits'
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la suppression de la wishlist';
      updateWishlistState({
        error: createError('network', errorMessage)
      });

      if (isHydrated) {
        addToast({
          type: 'error',
          title: 'Erreur',
          description: errorMessage
        });
      }
    } finally {
      updateWishlistState({ loading: false });
    }
  };

  const moveToCart = async (itemIds: string[]): Promise<{ moved: number; errors: string[] }> => {
    if (!user?.id) {
      return { moved: 0, errors: ['Vous devez être connecté'] };
    }

    updateWishlistState({ syncing: true, error: null });

    try {
      const response = await WishlistService.moveToCart(user.id, itemIds);
      
      if (response.success && response.data) {
        // Refresh wishlist to reflect changes
        await refreshWishlist();

        if (response.data.moved > 0 && isHydrated) {
          addToast({
            type: 'success',
            title: 'Produits déplacés',
            description: `${response.data.moved} produit(s) ajouté(s) au panier`
          });
        }

        if (response.data.errors.length > 0 && isHydrated) {
          addToast({
            type: 'warning',
            title: 'Certains produits n\'ont pas pu être déplacés',
            description: `${response.data.errors.length} erreur(s)`
          });
        }

        return response.data;
      } else {
        throw new Error(response.error || 'Erreur lors du déplacement vers le panier');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du déplacement vers le panier';
      updateWishlistState({
        error: createError('network', errorMessage)
      });

      if (isHydrated) {
        addToast({
          type: 'error',
          title: 'Erreur',
          description: errorMessage
        });
      }

      return { moved: 0, errors: [errorMessage] };
    } finally {
      updateWishlistState({ syncing: false });
    }
  };

  const retryLastOperation = async () => {
    if (lastFailedOperation.current) {
      updateWishlistState({ error: null, retryCount: 0 });
      await lastFailedOperation.current();
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlistState.items.some(item => item.product_id === productId);
  };

  const getWishlistCount = (): number => {
    return wishlistState.items.length;
  };

  const value: WishlistContextType = {
    wishlistItems: wishlistState.items,
    loading: wishlistState.loading,
    syncing: wishlistState.syncing,
    error: wishlistState.error,
    addToWishlist,
    removeFromWishlist,
    removeById,
    clearWishlist,
    refreshWishlist,
    retryLastOperation,
    isInWishlist,
    getWishlistCount,
    moveToCart
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};