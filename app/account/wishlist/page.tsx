'use client';

import React from 'react';
import ProductGrid from '@/components/home/ProductGrid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

const wishlistProducts = [
  {
    id: 'w1',
    name: 'Produit coup de cœur',
    slug: 'produit-coup-de-coeur',
    image: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 85000,
    rating: 4.6,
    reviews: 124,
    vendor: 'Be Shop',
    category: 'Électronique',
  },
];

export default function AccountWishlistPage() {
  return (
    <div className="min-h-screen bg-beshop-background">
      <div className="container py-8">
        <div className="max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Ma liste de souhaits</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductGrid products={wishlistProducts} columns={3} />
              <div className="mt-6">
                <Link href="/" className="text-beshop-primary hover:underline">Découvrir plus de produits</Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


