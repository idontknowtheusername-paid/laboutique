'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PressPage() {
  return (
    <div className="min-h-screen bg-beshop-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-beshop-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Presse</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Dossiers & Communiqués</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Dossier de presse 2025</h3>
                  <p className="text-sm text-gray-600">Présentation, chiffres clés, visuels de marque.</p>
                </div>
                <Button variant="outline">Télécharger</Button>
              </div>
              <div className="p-4 border rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Communiqué: Expansion régionale</h3>
                  <p className="text-sm text-gray-600">Notre stratégie 2025 en Afrique de l'Ouest.</p>
                </div>
                <Button variant="outline">Télécharger</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Presse</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 space-y-2">
              <p>Email: media@beshop.bj</p>
              <p>Tél: +229 XX XX XX XX</p>
              <Link href="/contact">
                <Button className="w-full mt-2">Nous contacter</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}




