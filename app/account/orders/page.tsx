'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

const orders = [
  { id: '#ORD-12345', date: '2025-01-15', total: 125000, status: 'Livré' },
  { id: '#ORD-12344', date: '2025-01-10', total: 45000, status: 'Expédié' },
];

const formatPrice = (price: number) => new Intl.NumberFormat('fr-BJ', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(price);

export default function AccountOrdersPage() {
  return (
    <div className="min-h-screen bg-beshop-background">
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Mes commandes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {orders.map((o) => (
                <div key={o.id} className="p-4 border rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{o.id}</div>
                    <div className="text-sm text-gray-600">{o.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatPrice(o.total)}</div>
                    <div className="text-sm text-gray-600">{o.status}</div>
                  </div>
                </div>
              ))}
              <Link href="/" className="text-beshop-primary hover:underline">Continuer mes achats</Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


