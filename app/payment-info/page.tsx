'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Smartphone, HandCoins } from 'lucide-react';

export default function PaymentInfoPage() {
  return (
    <div className="min-h-screen bg-beshop-background">
      <Header />
      <main className="container pt-28 pb-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Moyens de paiement</h1>
            <p className="text-gray-600 mt-2">Sécurisés, rapides et adaptés à vos besoins.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Smartphone className="w-5 h-5" /> Mobile Money</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">MTN • Moov • Orange Money</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5" /> Carte bancaire</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Visa • Mastercard (via Stripe)</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><HandCoins className="w-5 h-5" /> Paiement à la livraison</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Espèces à la réception</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

