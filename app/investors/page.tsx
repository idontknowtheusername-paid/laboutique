'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function InvestorsPage() {
  return (
    <div className="min-h-screen bg-beshop-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-beshop-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Investisseurs</span>
        </nav>

        <div className="text-center mb-10">
          <Badge className="bg-beshop-primary/10 text-beshop-primary mb-3">Relations investisseurs</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Be Shop – IR</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Chiffres clés, vision et ressources pour investisseurs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Chiffres clés</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 space-y-2">
              <p>• 500K+ clients</p>
              <p>• 1,200+ vendeurs</p>
              <p>• 50K+ produits</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Vision</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700">
              Devenir la plateforme e-commerce de référence en Afrique de l'Ouest.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Contact IR</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700">
              investors@beshop.bj
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}




