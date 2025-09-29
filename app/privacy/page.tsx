'use client';
export const revalidate = 300;

import React from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-jomiastore-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-jomiastore-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Politique de confidentialité</span>
        </nav>

        <Card>
          <CardHeader>
            <CardTitle>Politique de confidentialité</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-gray-700">
            <p>Nous respectons votre vie privée et protégeons vos données personnelles.</p>
            <h3 className="font-semibold mt-4">Données collectées</h3>
            <p>Compte, commandes, paiements, navigation (cookies).</p>
            <h3 className="font-semibold mt-4">Usage</h3>
            <p>Traitement des commandes, support client, amélioration du service.</p>
            <h3 className="font-semibold mt-4">Vos droits</h3>
            <p>Accès, rectification, suppression, opposition. Contact: privacy@jomiastore.com.</p>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}


