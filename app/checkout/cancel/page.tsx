'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-jomiastore-background flex items-center">
      <div className="container py-8">
        <div className="max-w-lg mx-auto text-center">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Paiement annulé</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">Votre paiement n'a pas abouti. Vous pouvez réessayer ou revenir au panier.</p>
              <div className="space-x-4">
                <Link href="/checkout" className="text-jomiastore-primary hover:underline">Réessayer</Link>
                <Link href="/cart" className="text-jomiastore-primary hover:underline">Voir mon panier</Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


