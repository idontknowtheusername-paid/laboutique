'use client';

import React, { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import ProductGrid from '@/components/home/ProductGrid';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

// Minimal mock products so every category renders
const baseProducts = [
  {
    id: 'p1',
    name: 'Produit vedette 1',
    slug: 'produit-vedette-1',
    image: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 45000,
    rating: 4.6,
    reviews: 120,
  },
  {
    id: 'p2',
    name: 'Produit vedette 2',
    slug: 'produit-vedette-2',
    image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 65000,
    rating: 4.4,
    reviews: 86,
  },
  {
    id: 'p3',
    name: 'Produit vedette 3',
    slug: 'produit-vedette-3',
    image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 85000,
    rating: 4.7,
    reviews: 203,
  },
  {
    id: 'p4',
    name: 'Produit vedette 4',
    slug: 'produit-vedette-4',
    image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 120000,
    rating: 4.5,
    reviews: 65,
  },
  {
    id: 'p5',
    name: 'Produit vedette 5',
    slug: 'produit-vedette-5',
    image: 'https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 38000,
    rating: 4.2,
    reviews: 54,
  },
  {
    id: 'p6',
    name: 'Produit vedette 6',
    slug: 'produit-vedette-6',
    image: 'https://images.pexels.com/photos/1444416/pexels-photo-1444416.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 99000,
    rating: 4.8,
    reviews: 312,
  },
];

const titleMap: Record<string, { title: string; breadcrumb: string }> = {
  smartphones: { title: 'Smartphones', breadcrumb: 'Smartphones' },
  'mode-femme': { title: 'Mode Femme', breadcrumb: 'Mode Femme' },
  electromenager: { title: 'Électroménager', breadcrumb: 'Électroménager' },
  'beaute-cosmetiques': { title: 'Beauté & Cosmétiques', breadcrumb: 'Beauté & Cosmétiques' },
  'sport-fitness': { title: 'Sport & Fitness', breadcrumb: 'Sport & Fitness' },
  'maison-decoration': { title: 'Maison & Décoration', breadcrumb: 'Maison & Décoration' },
  automobile: { title: 'Automobile', breadcrumb: 'Automobile' },
  'livres-education': { title: 'Livres & Éducation', breadcrumb: 'Livres & Éducation' },
};

export default function DynamicCategoryPage() {
  const params = useParams();
  const slug = (params?.slug as string) || '';
  const meta = titleMap[slug] || { title: slug.replace(/-/g, ' ') || 'Catégorie', breadcrumb: slug.replace(/-/g, ' ') || 'Catégorie' };
  const [sortBy, setSortBy] = useState('popularity');

  const products = useMemo(() => baseProducts, [slug]);

  return (
    <div className="min-h-screen bg-beshop-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-beshop-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{meta.breadcrumb}</span>
        </nav>

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{meta.title}</h1>
          <div className="flex items-center space-x-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Popularité</SelectItem>
                <SelectItem value="price-low">Prix croissant</SelectItem>
                <SelectItem value="price-high">Prix décroissant</SelectItem>
                <SelectItem value="rating">Meilleures notes</SelectItem>
                <SelectItem value="newest">Plus récents</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4 text-sm text-gray-600">
            Résultats: {products.length}
          </CardContent>
        </Card>

        <ProductGrid products={products} columns={3} />

        <div className="flex items-center justify-center mt-10 space-x-2">
          <Button variant="outline" disabled>Précédent</Button>
          <Button className="bg-beshop-primary">1</Button>
          <Button variant="outline">2</Button>
          <Button variant="outline">Suivant</Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}


