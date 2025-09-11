'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-beshop-background flex items-center">
      <div className="container py-8">
        <div className="max-w-lg mx-auto text-center">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Commande confirmée</CardTitle>
            </CardHeader>
            <CardContent>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-700 mb-4">Merci pour votre achat. Un email de confirmation vous a été envoyé.</p>
              <div className="space-x-4">
                <Link href="/account/orders" className="text-beshop-primary hover:underline">Voir mes commandes</Link>
                <Link href="/" className="text-beshop-primary hover:underline">Continuer mes achats</Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


