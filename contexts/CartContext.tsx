"use client";
import { useQueryClient } from "@tanstack/react-query";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";
import { CartService, CartItem, CartSummary } from "@/lib/services";
import { useToast } from "@/components/ui/toast";
import { useHydration } from "@/hooks";

interface CartError {
  type: "network" | "auth" | "validation" | "server" | "conflict";
  message: string;
  retryable: boolean;
  itemId?: string;
}

interface CartState {
  items: CartItem[];
  summary: CartSummary | null;
  loading: boolean;
  syncing: boolean;
  lastSync: Date | null;
  localChanges: boolean;
  error: CartError | null;
  retryCount: number;
}

interface OptimisticUpdate {
  id: string;
  type: "add" | "update" | "remove";
  data: any;
  timestamp: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartSummary: CartSummary | null;
  loading: boolean;
  syncing: boolean;
  error: CartError | null;
  localChanges: boolean;
  addToCart: (
    productId: string,
    productName: string,
    price: number,
    quantity?: number
  ) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  retryLastOperation: () => Promise<void>;
  resolveConflict: (strategy: "local" | "remote" | "merge") => Promise<void>;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [cartState, setCartState] = useState<CartState>({
    items: [],
    summary: null,
    loading: false,
    syncing: false,
    lastSync: null,
    localChanges: false,
    error: null,
    retryCount: 0,
  });

  const isHydrated = useHydration();
  const { addToast } = useToast();
  const optimisticUpdates = useRef<OptimisticUpdate[]>([]);
  const lastFailedOperation = useRef<(() => Promise<void>) | null>(null);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced cart loading and synchronization
  useEffect(() => {
    if (user?.id && isHydrated) {
      handleUserLogin();
    } else if (!user && isHydrated) {
      loadLocalCart();
    }
  }, [user, isHydrated]);

  // Auto-sync when online and cleanup
  useEffect(() => {
    const handleOnline = () => {
      if (user?.id) {
        handleNetworkRecovery();
      }
    };

    const handleOffline = () => {
      // Cancel any pending sync operations
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = null;
      }
    };

    const handleBeforeUnload = () => {
      // Save current state before page unload
      if (cartState.items.length > 0 && !user?.id) {
        saveLocalCart(cartState.items, cartState.localChanges);
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user, cartState.localChanges, cartState.items]);

  // Cleanup on user logout
  useEffect(() => {
    if (!user && cartState.items.length > 0) {
      cleanupUserData();
    }
  }, [user]);

  const createError = (
    type: CartError["type"],
    message: string,
    retryable: boolean = true,
    itemId?: string
  ): CartError => ({
    type,
    message,
    retryable,
    itemId,
  });

  const updateCartState = (updates: Partial<CartState>) => {
    setCartState((prev) => ({ ...prev, ...updates }));
  };

  const loadLocalCart = () => {
    if (typeof window !== "undefined") {
      try {
        const savedCart = localStorage.getItem("jomiastore-cart");
        const savedMeta = localStorage.getItem("jomiastore-cart-meta");

        if (savedCart) {
          const localItems = JSON.parse(savedCart);
          const meta = savedMeta ? JSON.parse(savedMeta) : {};

          // Validate cart data
          if (validateCartData(localItems)) {
            updateCartState({
              items: localItems,
              localChanges: meta.hasChanges || false,
              lastSync: meta.lastSync ? new Date(meta.lastSync) : null,
            });
            calculateLocalSummary(localItems);
          } else {
            // Try to recover corrupted data
            // recoverCorruptedCart is async, so wrap in an async IIFE or make parent function async
            (async () => {
              await recoverCorruptedCart();
            })();
          }
        }
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
        updateCartState({
          error: createError(
            "validation",
            "Erreur lors du chargement du panier local"
          ),
        });
        clearLocalCart();
      }
    }
  };

  const validateCartData = (items: any[]): boolean => {
    if (!Array.isArray(items)) return false;

    return items.every(
      (item) =>
        item &&
        typeof item.id === "string" &&
        typeof item.product_id === "string" &&
        typeof item.quantity === "number" &&
        item.quantity > 0 &&
        item.quantity <= 999 && // Reasonable max quantity
        item.created_at &&
        item.updated_at
    );
  };

  const sanitizeCartData = (items: any[]): CartItem[] => {
    if (!Array.isArray(items)) return [];

    return items
      .filter((item) => {
        // Basic validation
        return (
          item &&
          typeof item.id === "string" &&
          typeof item.product_id === "string" &&
          typeof item.quantity === "number" &&
          item.quantity > 0
        );
      })
      .map((item) => ({
        id: item.id,
        user_id: item.user_id || "",
        product_id: item.product_id,
        quantity: Math.min(Math.max(1, Math.floor(item.quantity)), 999),
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString(),
        product: item.product || null,
      }))
      .slice(0, 50); // Limit to 50 items max
  };

  const recoverCorruptedCart = async () => {
    try {
      const savedCart = localStorage.getItem("jomiastore-cart");
      if (savedCart) {
        const rawItems = JSON.parse(savedCart);
        const sanitizedItems = sanitizeCartData(rawItems);

        if (sanitizedItems.length > 0) {
          updateCartState({ items: sanitizedItems });
          calculateLocalSummary(sanitizedItems);
          saveLocalCart(sanitizedItems, true);

          if (isHydrated) {
            addToast({
              type: "info",
              title: "Panier récupéré",
              description: `${sanitizedItems.length} article(s) récupéré(s)`,
            });
          }
        } else {
          clearLocalCart();
        }
      }
    } catch (error) {
      console.error("Error recovering corrupted cart:", error);
      clearLocalCart();
    }
  };

  const clearLocalCart = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("jomiastore-cart");
      localStorage.removeItem("jomiastore-cart-meta");
    }
  };

  const saveLocalCart = (items: CartItem[], hasChanges: boolean = true) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("jomiastore-cart", JSON.stringify(items));
        localStorage.setItem(
          "jomiastore-cart-meta",
          JSON.stringify({
            hasChanges,
            lastSync: cartState.lastSync?.toISOString(),
            timestamp: new Date().toISOString(),
          })
        );
      } catch (error) {
        console.error("Error saving cart to localStorage:", error);
        updateCartState({
          error: createError(
            "validation",
            "Erreur lors de la sauvegarde du panier"
          ),
        });
      }
    }
  };

  const calculateLocalSummary = (items: CartItem[]) => {
    const subtotal = items.reduce(
      (sum, item) => sum + (item.product?.price || 0) * item.quantity,
      0
    );
    const taxAmount = subtotal * 0.02;
    const shippingAmount = subtotal > 50000 ? 0 : 2000;
    const totalAmount = subtotal + taxAmount + shippingAmount;
    const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const summary: CartSummary = {
      items,
      subtotal,
      tax_amount: taxAmount,
      shipping_amount: shippingAmount,
      discount_amount: 0,
      total_amount: totalAmount,
      items_count: itemsCount,
      currency: "XOF",
    };

    updateCartState({ summary });
  };

  const handleUserLogin = async () => {
    if (!user?.id) return;

    updateCartState({ syncing: true, error: null });

    try {
      // Get local cart
      const localItems = cartState.items;

      // Get remote cart
      const remoteResponse = await CartService.getCartSummary(user.id);

      if (!remoteResponse.success) {
        throw new Error(
          remoteResponse.error || "Erreur lors de la récupération du panier"
        );
      }

      const remoteItems = remoteResponse.data?.items || [];

      // Check for conflicts
      if (localItems.length > 0 && remoteItems.length > 0) {
        await handleCartConflict(localItems, remoteItems);
      } else if (localItems.length > 0) {
        // Merge local cart to remote
        await mergeLocalToRemote(localItems);
      } else {
        // Use remote cart
        updateCartState({
          items: remoteItems,
          summary: remoteResponse.data,
          lastSync: new Date(),
          localChanges: false,
        });
      }
    } catch (error) {
      console.error("Error during user login cart sync:", error);
      updateCartState({
        error: createError(
          "network",
          "Erreur lors de la synchronisation du panier"
        ),
      });
    } finally {
      updateCartState({ syncing: false });
    }
  };

  const handleCartConflict = async (
    localItems: CartItem[],
    remoteItems: CartItem[]
  ) => {
    // Check if items are identical
    const localMap = new Map(
      localItems.map((item) => [item.product_id, item.quantity])
    );
    const remoteMap = new Map(
      remoteItems.map((item) => [item.product_id, item.quantity])
    );

    let hasConflicts = false;

    // Check for conflicts
    for (const entry of Array.from(localMap.entries())) {
      const [productId, localQty] = entry;
      const remoteQty = remoteMap.get(productId);
      if (remoteQty && remoteQty !== localQty) {
        hasConflicts = true;
        break;
      }
    }

    if (!hasConflicts) {
      // No conflicts, merge safely
      await mergeLocalToRemote(localItems);
    } else {
      // Show conflict resolution UI
      updateCartState({
        error: createError(
          "conflict",
          "Conflit détecté entre le panier local et distant",
          true
        ),
      });
    }
  };

  const mergeLocalToRemote = async (localItems: CartItem[]) => {
    if (!user?.id) return;

    try {
      for (const localItem of localItems) {
        await CartService.addItem(user.id, {
          product_id: localItem.product_id,
          quantity: localItem.quantity,
        });
      }

      // Clear local cart after successful merge
      clearLocalCart();

      // Refresh to get updated cart
      await refreshCart();

      if (isHydrated) {
        addToast({
          type: "success",
          title: "Panier synchronisé",
          description: "Vos articles ont été ajoutés à votre compte",
        });
      }
    } catch (error) {
      console.error("Error merging local cart:", error);
      updateCartState({
        error: createError("network", "Erreur lors de la fusion du panier"),
      });
    }
  };

  const refreshCart = async () => {
    if (!user?.id) return;

    updateCartState({ loading: true, error: null });

    try {
      const response = await CartService.getCartSummary(user.id);
      if (response.success && response.data) {
        updateCartState({
          items: response.data.items,
          summary: response.data,
          lastSync: new Date(),
          localChanges: false,
          retryCount: 0,
        });
      } else {
        throw new Error(response.error || "Erreur lors du rafraîchissement");
      }
    } catch (error) {
      console.error("Error refreshing cart:", error);
      updateCartState({
        error: createError(
          "network",
          "Erreur lors du rafraîchissement du panier"
        ),
      });
    } finally {
      updateCartState({ loading: false });
    }
  };

  const syncWithBackend = async () => {
    if (!user?.id || !cartState.localChanges) return;

    updateCartState({ syncing: true });

    try {
      // Check if we're online
      if (!navigator.onLine) {
        throw new Error("Pas de connexion internet");
      }

      await refreshCart();
      updateCartState({ localChanges: false });

      // Clear local changes flag in storage
      if (typeof window !== "undefined") {
        const savedMeta = localStorage.getItem("jomiastore-cart-meta");
        if (savedMeta) {
          const meta = JSON.parse(savedMeta);
          localStorage.setItem(
            "jomiastore-cart-meta",
            JSON.stringify({
              ...meta,
              hasChanges: false,
              lastSync: new Date().toISOString(),
            })
          );
        }
      }
    } catch (error) {
      console.error("Error syncing with backend:", error);

      // Schedule retry if we're offline
      if (!navigator.onLine) {
        scheduleOfflineSync();
      }
    } finally {
      updateCartState({ syncing: false });
    }
  };

  const scheduleOfflineSync = () => {
    // Clear any existing timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Schedule sync when back online
    const checkOnlineAndSync = () => {
      if (navigator.onLine && user?.id && cartState.localChanges) {
        syncWithBackend();
      } else if (!navigator.onLine) {
        // Check again in 30 seconds
        syncTimeoutRef.current = setTimeout(checkOnlineAndSync, 30000);
      }
    };

    syncTimeoutRef.current = setTimeout(checkOnlineAndSync, 5000);
  };

  const handleNetworkRecovery = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Validate current cart state
      const currentItems = cartState.items;
      if (currentItems.length > 0) {
        const validItems = sanitizeCartData(currentItems);
        if (validItems.length !== currentItems.length) {
          updateCartState({ items: validItems });
          calculateLocalSummary(validItems);
          saveLocalCart(validItems, true);
        }
      }

      // Sync with backend if we have local changes
      if (cartState.localChanges) {
        await syncWithBackend();
      } else {
        // Just refresh to ensure we have latest data
        await refreshCart();
      }
    } catch (error) {
      console.error("Error during network recovery:", error);
      updateCartState({
        error: createError("network", "Erreur lors de la récupération réseau"),
      });
    }
  }, [user, cartState.items, cartState.localChanges]);

  const executeWithRetry = async (
    operation: () => Promise<void>,
    maxRetries: number = 3
  ) => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        await operation();
        updateCartState({ retryCount: 0, error: null });
        return;
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
          updateCartState({ retryCount: attempt + 1 });
        }
      }
    }

    // All retries failed
    throw lastError;
  };

  const addOptimisticUpdate = (
    type: OptimisticUpdate["type"],
    data: any
  ): string => {
    const id = `optimistic-${Date.now()}-${Math.random()}`;
    optimisticUpdates.current.push({
      id,
      type,
      data,
      timestamp: Date.now(),
    });
    return id;
  };

  const removeOptimisticUpdate = (id: string) => {
    optimisticUpdates.current = optimisticUpdates.current.filter(
      (update) => update.id !== id
    );
  };

  const rollbackOptimisticUpdate = (updateId: string) => {
    const update = optimisticUpdates.current.find((u) => u.id === updateId);
    if (!update) return;

    // Rollback the optimistic change
    switch (update.type) {
      case "add":
        updateCartState({
          items: cartState.items.filter(
            (item) => item.id !== update.data.tempId
          ),
        });
        break;
      case "update":
        updateCartState({
          items: cartState.items.map((item) =>
            item.id === update.data.itemId
              ? { ...item, quantity: update.data.originalQuantity }
              : item
          ),
        });
        break;
      case "remove":
        updateCartState({
          items: [...cartState.items, update.data.removedItem],
        });
        break;
    }

    removeOptimisticUpdate(updateId);
  };

  const addToCart = async (
    productId: string,
    productName: string,
    price: number,
    quantity: number = 1
  ) => {
    updateCartState({ error: null });

    if (user?.id) {
      // Authenticated user - use service with optimistic updates
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const optimisticUpdateId = addOptimisticUpdate("add", {
        tempId,
        productId,
        productName,
        price,
        quantity,
      });

      // Optimistic update
      const existingItem = cartState.items.find(
        (item) => item.product_id === productId
      );
      let optimisticItems: CartItem[];

      if (existingItem) {
        optimisticItems = cartState.items.map((item) =>
          item.product_id === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        const newItem: CartItem = {
          id: tempId,
          user_id: user.id,
          product_id: productId,
          quantity,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          product: {
            id: productId,
            name: productName,
            slug: "",
            price,
            images: [],
            status: "active",
            quantity: 999,
            track_quantity: false,
          },
        };
        optimisticItems = [...cartState.items, newItem];
      }

      updateCartState({ items: optimisticItems });
      calculateLocalSummary(optimisticItems);

      // Show immediate feedback
      if (isHydrated) {
        addToast({
          type: "success",
          title: "Produit ajouté au panier",
          description: `${productName} (${quantity})`,
        });
      }

      // Store operation for retry
      lastFailedOperation.current = () =>
        addToCart(productId, productName, price, quantity);

      try {
        await executeWithRetry(async () => {
          const response = await CartService.addItem(user.id, {
            product_id: productId,
            quantity,
          });
          if (!response.success) {
            throw new Error(
              response.error || "Erreur lors de l'ajout au panier"
            );
          }
        });

        // Success - refresh to get real data
        removeOptimisticUpdate(optimisticUpdateId);
        await refreshCart();
        queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
        lastFailedOperation.current = null;
      } catch (error) {
        // Rollback optimistic update
        rollbackOptimisticUpdate(optimisticUpdateId);

        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erreur lors de l'ajout au panier";
        updateCartState({
          error: createError("network", errorMessage, true, productId),
        });

        if (isHydrated) {
          addToast({
            type: "error",
            title: "Erreur",
            description: errorMessage,
          });
        }
      }
    } else {
      // Unauthenticated user - use localStorage
      const existingItem = cartState.items.find(
        (item) => item.product_id === productId
      );
      let newItems: CartItem[];

      if (existingItem) {
        newItems = cartState.items.map((item) =>
          item.product_id === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        const newItem: CartItem = {
          id: `cart-${Date.now()}-${Math.random()}`,
          user_id: "",
          product_id: productId,
          quantity,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          product: {
            id: productId,
            name: productName,
            slug: "",
            price,
            images: [],
            status: "active",
            quantity: 999,
            track_quantity: false,
          },
        };
        newItems = [...cartState.items, newItem];
      }

      updateCartState({ items: newItems, localChanges: true });
      saveLocalCart(newItems);
      calculateLocalSummary(newItems);

      if (isHydrated) {
        addToast({
          type: "success",
          title: "Produit ajouté au panier",
          description: `${productName} (${quantity})`,
        });
      }
    }
  };

  const removeFromCart = async (itemId: string) => {
    updateCartState({ error: null });

    if (user?.id) {
      // Find the item to remove for rollback
      const itemToRemove = cartState.items.find((item) => item.id === itemId);
      if (!itemToRemove) return;

      const optimisticUpdateId = addOptimisticUpdate("remove", {
        removedItem: itemToRemove,
      });

      // Optimistic update
      const optimisticItems = cartState.items.filter(
        (item) => item.id !== itemId
      );
      updateCartState({ items: optimisticItems });
      calculateLocalSummary(optimisticItems);

      // Store operation for retry
      lastFailedOperation.current = () => removeFromCart(itemId);

      try {
        await executeWithRetry(async () => {
          const response = await CartService.removeItem(user.id, itemId);
          if (!response.success) {
            throw new Error(response.error || "Erreur lors de la suppression");
          }
        });

        // Success
        removeOptimisticUpdate(optimisticUpdateId);
        await refreshCart();
        queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
        lastFailedOperation.current = null;
      } catch (error) {
        // Rollback optimistic update
        rollbackOptimisticUpdate(optimisticUpdateId);

        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erreur lors de la suppression";
        updateCartState({
          error: createError("network", errorMessage, true, itemId),
        });

        if (isHydrated) {
          addToast({
            type: "error",
            title: "Erreur",
            description: errorMessage,
          });
        }
      }
    } else {
      const newItems = cartState.items.filter((item) => item.id !== itemId);
      updateCartState({ items: newItems, localChanges: true });
      saveLocalCart(newItems);
      calculateLocalSummary(newItems);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    updateCartState({ error: null });

    if (user?.id) {
      // Find the item for rollback
      const currentItem = cartState.items.find((item) => item.id === itemId);
      if (!currentItem) return;

      const originalQuantity = currentItem.quantity;
      const optimisticUpdateId = addOptimisticUpdate("update", {
        itemId,
        originalQuantity,
      });

      // Optimistic update
      const optimisticItems = cartState.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );
      updateCartState({ items: optimisticItems });
      calculateLocalSummary(optimisticItems);

      // Store operation for retry
      lastFailedOperation.current = () => updateQuantity(itemId, quantity);

      try {
        await executeWithRetry(async () => {
          const response = await CartService.updateItem(user.id, {
            id: itemId,
            quantity,
          });
          if (!response.success) {
            throw new Error(response.error || "Erreur lors de la mise à jour");
          }
        });

        // Success
        removeOptimisticUpdate(optimisticUpdateId);
        await refreshCart();
        queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
        lastFailedOperation.current = null;
      } catch (error) {
        // Rollback optimistic update
        rollbackOptimisticUpdate(optimisticUpdateId);

        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erreur lors de la mise à jour";
        updateCartState({
          error: createError("network", errorMessage, true, itemId),
        });

        if (isHydrated) {
          addToast({
            type: "error",
            title: "Erreur",
            description: errorMessage,
          });
        }
      }
    } else {
      const newItems = cartState.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );
      updateCartState({ items: newItems, localChanges: true });
      saveLocalCart(newItems);
      calculateLocalSummary(newItems);
    }
  };

  const clearCart = async () => {
    updateCartState({ error: null });

    if (user?.id) {
      updateCartState({ loading: true });

      try {
        await executeWithRetry(async () => {
          const response = await CartService.clearCart(user.id);
          if (!response.success) {
            throw new Error("Erreur lors de la suppression du panier");
          }
        });

        updateCartState({
          items: [],
          summary: null,
          lastSync: new Date(),
          localChanges: false,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erreur lors de la suppression du panier";
        updateCartState({
          error: createError("network", errorMessage),
        });

        if (isHydrated) {
          addToast({
            type: "error",
            title: "Erreur",
            description: errorMessage,
          });
        }
      } finally {
        updateCartState({ loading: false });
        queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
      }
    } else {
      updateCartState({ items: [], summary: null, localChanges: false });
      clearLocalCart();
    }
  };

  const cleanupUserData = () => {
    // Clean up user-specific cart data on logout
    updateCartState({
      items: cartState.items.filter(
        (item) => !item.user_id || item.user_id === ""
      ),
      summary: null,
      lastSync: null,
      localChanges: cartState.items.some(
        (item) => !item.user_id || item.user_id === ""
      ),
      error: null,
      syncing: false,
    });

    // Clear any pending sync operations
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = null;
    }

    // Clear optimistic updates
    optimisticUpdates.current = [];
    lastFailedOperation.current = null;
  };

  const retryLastOperation = async () => {
    if (lastFailedOperation.current) {
      updateCartState({ error: null, retryCount: 0 });
      await lastFailedOperation.current();
    }
  };

  const resolveConflict = async (strategy: "local" | "remote" | "merge") => {
    if (!user?.id || cartState.error?.type !== "conflict") return;

    updateCartState({ syncing: true, error: null });

    try {
      switch (strategy) {
        case "local":
          // Keep local cart, overwrite remote
          await mergeLocalToRemote(cartState.items);
          break;

        case "remote":
          // Keep remote cart, discard local
          clearLocalCart();
          await refreshCart();
          break;

        case "merge":
          // Merge both carts intelligently
          const remoteResponse = await CartService.getCartSummary(user.id);
          if (remoteResponse.success && remoteResponse.data) {
            const remoteItems = remoteResponse.data.items;
            const localItems = cartState.items;

            // Create a map of remote items
            const remoteMap = new Map(
              remoteItems.map((item) => [item.product_id, item.quantity])
            );

            // Merge logic: sum quantities for same products
            for (const localItem of localItems) {
              const remoteQty = remoteMap.get(localItem.product_id) || 0;
              const totalQty = localItem.quantity + remoteQty;

              await CartService.addItem(user.id, {
                product_id: localItem.product_id,
                quantity: totalQty,
              });
            }

            clearLocalCart();
            await refreshCart();
          }
          break;
      }

      if (isHydrated) {
        addToast({
          type: "success",
          title: "Conflit résolu",
          description: "Votre panier a été synchronisé",
        });
      }
    } catch (error) {
      console.error("Error resolving conflict:", error);
      updateCartState({
        error: createError(
          "network",
          "Erreur lors de la résolution du conflit"
        ),
      });
    } finally {
      updateCartState({ syncing: false });
    }
  };

  const getCartTotal = () => {
    return cartState.summary?.total_amount || 0;
  };

  const getCartItemsCount = () => {
    return cartState.summary?.items_count || 0;
  };

  const value: CartContextType = {
    cartItems: cartState.items,
    cartSummary: cartState.summary,
    loading: cartState.loading,
    syncing: cartState.syncing,
    error: cartState.error,
    localChanges: cartState.localChanges,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
    retryLastOperation,
    resolveConflict,
    getCartTotal,
    getCartItemsCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
