'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-jomiastore-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-jomiastore-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Conditions d'utilisation</span>
        </nav>

        <Card>
          <CardHeader>
            <CardTitle>Conditions d'utilisation</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-gray-700">
            <p>Bienvenue sur JomiaStore. En utilisant notre site, vous acceptez ces conditions.</p>
            <h3 className="font-semibold mt-4">Comptes</h3>
            <p>Vous êtes responsable de la confidentialité de vos identifiants et activités du compte.</p>
            <h3 className="font-semibold mt-4">Achats</h3>
            <p>Toutes les commandes sont soumises à disponibilité et confirmation du prix.</p>
            <h3 className="font-semibold mt-4">Limitation de responsabilité</h3>
            <p>JomiaStore ne pourra être tenu responsable des dommages indirects résultant de l'utilisation du site.</p>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}




