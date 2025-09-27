'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

const categories = [
  { name: 'Smartphones', slug: 'smartphones' },
  { name: 'Mode Femme', slug: 'mode-femme' },
  { name: 'Électroménager', slug: 'electromenager' },
  { name: 'Beauté & Cosmétiques', slug: 'beaute-cosmetiques' },
  { name: 'Sport & Fitness', slug: 'sport-fitness' },
  { name: 'Maison & Décoration', slug: 'maison-decoration' },
  { name: 'Automobile', slug: 'automobile' },
  { name: 'Livres & Éducation', slug: 'livres-education' },
];

export default function CategoriesIndexPage() {
  return (
    <div className="min-h-screen bg-jomiastore-background">
      <div className="container py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Toutes les catégories</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`}>
              <Card className="hover-lift">
                <CardContent className="p-4 font-medium">{c.name}</CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}


