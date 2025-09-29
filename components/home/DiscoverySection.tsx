"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, Flame, Clock3, Star, Telescope } from 'lucide-react';

export default function DiscoverySection() {
  const tiles = [
    { title: 'Nouveautés', subtitle: 'Arrivages récents', href: '/products?sort=newest', icon: Clock3, tone: 'bg-blue-50 text-blue-700' },
    { title: 'Tendances', subtitle: 'Populaires cette semaine', href: '/search?sort=popular', icon: Flame, tone: 'bg-orange-50 text-orange-700' },
    { title: 'Sélection', subtitle: 'Notre coup de cœur', href: '/products?featured=true', icon: Star, tone: 'bg-yellow-50 text-yellow-700' },
    { title: 'Explorer', subtitle: 'Catégories inspirantes', href: '/categories', icon: Telescope, tone: 'bg-purple-50 text-purple-700' },
  ];

  return (
    <section className="container">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-jomiastore-primary" /> Découverte
          </h2>
          <p className="text-gray-600 mt-1.5">Trouvez rapidement des idées à explorer</p>
        </div>
        <Link href="/products" className="text-jomiastore-primary hover:text-blue-700 text-sm">Voir tout</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <Link key={tile.title} href={tile.href}>
              <Card className="group hover-lift h-full">
                <CardContent className="p-4 md:p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{tile.title}</h3>
                      <p className="text-sm text-gray-600">{tile.subtitle}</p>
                    </div>
                    <Badge className={`${tile.tone} border-0`}>{tile.title}</Badge>
                  </div>
                  <div className="flex items-center justify-between mt-4 text-jomiastore-primary">
                    <Icon className="w-5 h-5" />
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}