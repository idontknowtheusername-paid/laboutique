'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function OrderTrackingPage() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const track = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(`Commande ${code}: En cours de livraison - Arrivée estimée sous 2 jours`);
  };

  return (
    <div className="min-h-screen bg-jomionstore-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-jomionstore-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Suivi de commande</span>
        </nav>

        <Card>
          <CardHeader>
            <CardTitle>Suivre ma commande</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={track} className="flex gap-2">
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Entrer le code de suivi" required />
              <Button type="submit">Suivre</Button>
            </form>
            {result && <p className="mt-4 text-sm text-gray-700">{result}</p>}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}




