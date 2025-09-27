'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-jomiastore-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-jomiastore-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Politique de cookies</span>
        </nav>

        <Card>
          <CardHeader>
            <CardTitle>Politique de cookies</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-gray-700">
            <p>Nous utilisons des cookies pour améliorer votre expérience, analyser l'audience et personnaliser le contenu.</p>
            <h3 className="font-semibold mt-4">Types de cookies</h3>
            <p>Essentiels, performance, fonctionnalité, marketing.</p>
            <h3 className="font-semibold mt-4">Gestion</h3>
            <p>Vous pouvez gérer vos préférences via les paramètres de votre navigateur.</p>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}




