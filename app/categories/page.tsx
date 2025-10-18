'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { CategoriesService, Category } from '@/lib/services';

export default function CategoriesIndexPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const response = await CategoriesService.getAll();
        
        if (response.success && response.data) {
          setCategories(response.data);
        } else {
          setError('Erreur lors du chargement des catégories');
        }
      } catch (err) {
        setError('Erreur lors du chargement des catégories');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-jomionstore-background">
        <div className="container py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Toutes les catégories</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-jomionstore-background">
        <div className="container py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Toutes les catégories</h1>
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-jomionstore-background">
      <div className="container py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Toutes les catégories</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`}>
              <Card className="hover-lift">
                <CardContent className="p-4 font-medium">{category.name}</CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}


