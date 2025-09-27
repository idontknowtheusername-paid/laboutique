'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function SizeGuidePage() {
  return (
    <div className="min-h-screen bg-jomiastore-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-jomiastore-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Guide des tailles</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Hommes (Tops)</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 space-y-2">
              <p>S: Poitrine 88-96 cm</p>
              <p>M: Poitrine 96-104 cm</p>
              <p>L: Poitrine 104-112 cm</p>
              <p>XL: Poitrine 112-120 cm</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Femmes (Tops)</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 space-y-2">
              <p>XS: Poitrine 78-84 cm</p>
              <p>S: Poitrine 84-90 cm</p>
              <p>M: Poitrine 90-96 cm</p>
              <p>L: Poitrine 96-102 cm</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}




