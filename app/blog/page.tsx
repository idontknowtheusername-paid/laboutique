'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const posts = [
  {
    title: 'Tendances e-commerce 2025 au Bénin',
    excerpt: "Découvrez les tendances clés qui façonneront l'e-commerce au Bénin en 2025.",
    tag: 'Insights',
  },
  {
    title: 'Guide: choisir son smartphone en 2025',
    excerpt: 'Critères essentiels, comparatifs et conseils pour faire le bon choix.',
    tag: 'Guides',
  },
  {
    title: 'Be Shop x Vendeurs: meilleures pratiques',
    excerpt: 'Optimisez vos ventes avec nos recommandations éprouvées.',
    tag: 'Vendeurs',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-beshop-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-beshop-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Blog</span>
        </nav>

        <div className="text-center mb-10">
          <Badge className="bg-beshop-primary/10 text-beshop-primary mb-3">Actus & Guides</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Le blog Be Shop</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Articles, tutoriels et tendances pour mieux acheter et vendre.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((p, i) => (
            <Card key={i} className="hover-lift">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{p.title}</CardTitle>
                  <Badge variant="secondary">{p.tag}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 text-sm">{p.excerpt}</p>
                <Button variant="outline">Lire</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}




