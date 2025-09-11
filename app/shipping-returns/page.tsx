'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function ShippingReturnsPage() {
  return (
    <div className="min-h-screen bg-beshop-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-beshop-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Livraison & Retours</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Livraison</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 space-y-3">
              <p>• Cotonou: 24-48h • Villes principales: 2-4 jours • Autres: 3-7 jours</p>
              <p>• Frais: gratuits dès 50 000 XOF, sinon à partir de 2 000 XOF</p>
              <p>• Suivi: disponible depuis Mon compte &gt; Mes commandes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Retours & Remboursements</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 space-y-3">
              <p>• 30 jours pour changer d'avis (produit non utilisé, emballage d'origine)</p>
              <p>• Remboursement sous 7-10 jours ouvrés après réception et contrôle</p>
              <p>• Produits non éligibles: consommables ouverts, cartes cadeaux</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}




