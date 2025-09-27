'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function WarrantyPage() {
  return (
    <div className="min-h-screen bg-jomiastore-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-jomiastore-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Garantie</span>
        </nav>

        <Card>
          <CardHeader>
            <CardTitle>Garantie produits</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-700 space-y-3">
            <p>• Produits neufs: garantie constructeur 12 à 24 mois selon la marque.</p>
            <p>• Prise en charge via le SAV agréé ou vendeur officiel.</p>
            <p>• Conservez la facture et l'emballage pour faciliter la prise en charge.</p>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}




