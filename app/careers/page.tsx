'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const jobs = [
  { title: 'Senior Frontend Engineer', team: 'Engineering', location: 'Cotonou (hybride)', type: 'Temps plein' },
  { title: 'Product Designer', team: 'Produit', location: 'Cotonou (hybride)', type: 'Temps plein' },
  { title: 'Growth Marketer', team: 'Marketing', location: 'Remote Afrique Ouest', type: 'Temps plein' },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-beshop-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-beshop-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Carrières</span>
        </nav>

        <div className="text-center mb-10">
          <Badge className="bg-beshop-primary/10 text-beshop-primary mb-3">Nous recrutons</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Rejoignez l'aventure Be Shop</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Construisons l'avenir du e-commerce en Afrique de l'Ouest.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Postes ouverts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {jobs.map((job, i) => (
                <div key={i} className="p-4 border rounded-lg hover:bg-gray-50 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                      <span>{job.team}</span>
                      <span>•</span>
                      <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {job.location}</span>
                      <span>•</span>
                      <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {job.type}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="flex items-center">Postuler <ArrowRight className="w-4 h-4 ml-2" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pourquoi nous rejoindre ?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700">
              <p>• Impact réel sur des millions d'utilisateurs</p>
              <p>• Culture d'excellence, d'humilité et d'apprentissage</p>
              <p>• Packages compétitifs et avantages</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}




