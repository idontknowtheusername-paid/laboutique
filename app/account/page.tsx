'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-beshop-background flex items-center">
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Mon compte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/account/orders" className="text-beshop-primary hover:underline">Mes commandes</Link>
              <Link href="/account/wishlist" className="text-beshop-primary hover:underline">Ma liste de souhaits</Link>
              <Link href="/" className="text-beshop-primary hover:underline">Retour à l'accueil</Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


