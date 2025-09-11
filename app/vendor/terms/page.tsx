'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function VendorTermsPage() {
  return (
    <div className="min-h-screen bg-beshop-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-beshop-primary">Accueil</Link>
          <span>/</span>
          <Link href="/vendor/register" className="hover:text-beshop-primary">Vendeur</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Conditions vendeurs</span>
        </nav>

        <Card>
          <CardHeader>
            <CardTitle>Conditions vendeurs</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-gray-700">
            <h3 className="font-semibold">Adhésion</h3>
            <p>Les vendeurs doivent fournir des informations exactes et respecter les lois applicables.</p>
            <h3 className="font-semibold mt-4">Qualité & Authenticité</h3>
            <p>Produits authentiques, conformes et livrés dans les délais annoncés.</p>
            <h3 className="font-semibold mt-4">Commissions & Paiements</h3>
            <p>Commissions variables selon les catégories, paiements mensuels.</p>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}




