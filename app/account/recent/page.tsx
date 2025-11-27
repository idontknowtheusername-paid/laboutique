"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from '@/lib/services/products.service';

const RECENT_KEY = 'recently_viewed';

export default function RecentPage() {
  const { user } = useAuth();
  const [products, setProducts] = React.useState<Product[]>([]);

  React.useEffect(() => {
    // Read recent product snapshots from localStorage
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      const items = raw ? JSON.parse(raw) as Array<Partial<Product>> : [];
      if (!Array.isArray(items) || items.length === 0) return;
      // Keep latest 24, ensure minimal fields
      const normalized = items.slice(0, 24).map((p) => ({
        id: String(p.id || ''),
        name: p.name || '',
        slug: p.slug || '',
        price: Number((p as any).price || 0),
        images: Array.isArray(p.images) ? p.images : [],
      })) as unknown as Product[];
      setProducts(normalized);
    } catch {}
  }, []);

  // Simple helper to track recent views: developers should call recordRecentView(productId) on product pages
  // Keeping this page read-only for now.

  return (
    <ProtectedRoute>
      <div>
        <div className="py-2">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <a href="/" className="hover:text-jomionstore-primary">Accueil</a>
            <span>/</span>
            <a href="/account" className="hover:text-jomionstore-primary">Mon compte</a>
            <span>/</span>
            <span className="text-gray-900 font-medium">Récemment consultés</span>
          </nav>
          <Card>
            <CardHeader>
              <CardTitle>Produits consultés récemment</CardTitle>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <div className="text-sm text-gray-500">Aucun produit consulté récemment.</div>
              ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                  {products.map((p) => (
                    <Link key={p.id} href={`/product/${p.slug}`} className="group">
                      <div className="border rounded-lg overflow-hidden">
                        <div className="relative w-full aspect-square bg-gray-50">
                          <Image src={p.images?.[0] || '/placeholder-product.jpg'} alt={p.name} fill className="object-cover" sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw" />
                        </div>
                        <div className="p-2 sm:p-3">
                          <div className="text-xs sm:text-sm font-medium line-clamp-2 group-hover:text-jomionstore-primary">{p.name}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}

