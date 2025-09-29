'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  const params = useSearchParams();
  const ref = params.get('ref') || params.get('reference') || '';
  return (
    <div className="min-h-screen bg-jomiastore-background flex items-center">
      <div className="container py-8">
        <div className="max-w-lg mx-auto text-center">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Commande confirmée</CardTitle>
            </CardHeader>
            <CardContent>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-700 mb-4">Merci pour votre achat. Un email de confirmation vous a été envoyé.</p>
              {ref ? (
                <p className="text-gray-600 mb-4 text-sm">Référence paiement: <span className="font-mono">{ref}</span></p>
              ) : null}
              <div className="space-x-4">
                <Link href="/account/orders" className="text-jomiastore-primary hover:underline">Voir mes commandes</Link>
                <Link href="/" className="text-jomiastore-primary hover:underline">Continuer mes achats</Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


