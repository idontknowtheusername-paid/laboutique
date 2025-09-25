'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Clock, ShieldCheck } from 'lucide-react';

export default function DeliveryInfoPage() {
  return (
    <div className="min-h-screen bg-beshop-background">
      <Header />
      <main className="container pt-28 pb-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Informations de livraison</h1>
            <p className="text-gray-600 mt-2">Rapide, fiable et suivi en temps réel.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Truck className="w-5 h-5" /> Standard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">3–5 jours ouvrés • 2 000 FCFA</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5" /> Express</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">1–2 jours ouvrés • 5 000 FCFA</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> Gratuite</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">À partir de 50 000 FCFA d'achat</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

