'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Search, Home, ArrowLeft, Package } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-beshop-background">
      <Header />
      <CategoryMenu />
      
      <div className="container py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-9xl font-bold text-beshop-primary mb-4">404</div>
            <div className="w-32 h-32 bg-beshop-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-16 h-16 text-beshop-primary" />
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Page introuvable
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/">
              <Button className="bg-beshop-primary hover:bg-blue-700">
                <Home className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Button>
            </Link>
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Page précédente
            </Button>
            <Link href="/search">
              <Button variant="outline">
                <Search className="w-4 h-4 mr-2" />
                Rechercher
              </Button>
            </Link>
          </div>

          {/* Popular Links */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Pages populaires</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/category/electronique" className="text-beshop-primary hover:underline text-sm">
                Électronique
              </Link>
              <Link href="/category/mode" className="text-beshop-primary hover:underline text-sm">
                Mode
              </Link>
              <Link href="/category/beaute-sante" className="text-beshop-primary hover:underline text-sm">
                Beauté & Santé
              </Link>
              <Link href="/category/maison-jardin" className="text-beshop-primary hover:underline text-sm">
                Maison & Jardin
              </Link>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Besoin d'aide ?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Si vous pensez qu'il s'agit d'une erreur, contactez notre équipe support.
            </p>
            <Link href="/contact">
              <Button variant="outline" size="sm">
                Contacter le support
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}


