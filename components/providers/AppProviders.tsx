'use client';


import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { ToastProvider } from "@/components/ui/toast";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { OrdersService } from "@/lib/services/orders.service";
import { WishlistService } from "@/lib/services/wishlist.service";
import React from "react";

interface AppProvidersProps {
  children: React.ReactNode;
}


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

const PrefetchUserData = React.memo(function PrefetchUserData() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  React.useEffect(() => {
    if (user?.id) {
      // Prefetch profile with stale time
      queryClient.prefetchQuery({
        queryKey: ["profile", user.id],
        queryFn: () =>
          import("@/lib/services/auth.service").then((m) =>
            m.AuthService.getProfile(user.id)
          ),
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
      
      // Prefetch orders with stale time
      queryClient.prefetchQuery({
        queryKey: ["orders", user.id],
        queryFn: () => OrdersService.getByUser(user.id),
        staleTime: 2 * 60 * 1000, // 2 minutes
      });
      
      // Prefetch wishlist with stale time
      queryClient.prefetchQuery({
        queryKey: ["wishlist", user.id],
        queryFn: () => WishlistService.getByUser(user.id),
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    }
  }, [user?.id, queryClient]);
  
  return null;
});

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <PrefetchUserData />
              {children}
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}