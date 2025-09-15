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


const queryClient = new QueryClient();

function PrefetchUserData() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  React.useEffect(() => {
    if (user?.id) {
      // Prefetch profile
      queryClient.prefetchQuery({
        queryKey: ["profile", user.id],
        queryFn: () =>
          import("@/lib/services/auth.service").then((m) =>
            m.AuthService.getProfile(user.id)
          ),
      });
      // Prefetch orders
      queryClient.prefetchQuery({
        queryKey: ["orders", user.id],
        queryFn: () => OrdersService.getByUser(user.id),
      });
      // Prefetch wishlist
      queryClient.prefetchQuery({
        queryKey: ["wishlist", user.id],
        queryFn: () => WishlistService.getByUser(user.id),
      });
    }
  }, [user, queryClient]);
  return null;
}

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