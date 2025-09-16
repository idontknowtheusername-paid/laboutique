'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { CategoriesService, Category } from '@/lib/services';
import Image from 'next/image';

export default function CategoriesConnected() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const response = await CategoriesService.getWithProductCount();
        
        if (response.success && response.data) {
          // Prendre les catégories principales avec le plus de produits
          const topCategories = response.data
            .filter(cat => !cat.parent_id) // Seulement les catégories principales
            .sort((a, b) => (b.product_count || 0) - (a.product_count || 0))
            .slice(0, 8); // Limiter à 8 catégories
            
          setCategories(topCategories);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Images par défaut pour les catégories basées sur leur slug
  const getDefaultImage = (slug: string): string => {
    const imageMap: Record<string, string> = {
      'electronique': 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=300',
      'mode-beaute': 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=300',
      'maison-jardin': 'https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg?auto=compress&cs=tinysrgb&w=300',
      'sport-loisirs': 'https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=300',
      'alimentation': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300',
      'auto-moto': 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=300',
      'livre-media': 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=300',
      'sante-bien-etre': 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=300'
    };
    
    return imageMap[slug] || 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=300';
  };

  // Couleurs de gradient basées sur le slug
  const getGradient = (slug: string): string => {
    const gradientMap: Record<string, string> = {
      'electronique': 'from-blue-600 to-purple-600',
      'mode-beaute': 'from-pink-500 to-rose-600',
      'maison-jardin': 'from-green-500 to-teal-600',
      'sport-loisirs': 'from-orange-500 to-red-600',
      'alimentation': 'from-yellow-500 to-orange-600',
      'auto-moto': 'from-gray-600 to-gray-800',
      'livre-media': 'from-indigo-500 to-purple-600',
      'sante-bien-etre': 'from-emerald-500 to-teal-600'
    };
    
    return gradientMap[slug] || 'from-gray-500 to-gray-700';
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Parcourir par Catégorie</h2>
            <p className="text-gray-600">Trouvez exactement ce que vous cherchez</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-xl mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Parcourir par Catégorie</h2>
            <p className="text-gray-600">Aucune catégorie disponible pour le moment</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Parcourir par Catégorie</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explorez notre large gamme de produits organisés par catégorie pour trouver exactement ce que vous cherchez
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {categories.map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`}>
              <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-square">
                    {/* Background Image */}
                    <div className="absolute inset-0">
                      <Image
                        src={category.image_url || getDefaultImage(category.slug)}
                        alt={category.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(category.slug)} opacity-80 group-hover:opacity-70 transition-opacity`} />
                    
                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                      <h3 className="font-bold text-lg mb-1 group-hover:scale-105 transition-transform">
                        {category.name}
                      </h3>
                      <p className="text-sm opacity-90">
                        {category.product_count || 0} produit{(category.product_count || 0) !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Arrow Icon */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/20 backdrop-blur rounded-full p-2">
                        <ArrowRight className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* View All Categories Button */}
        <div className="text-center">
          <Link href="/categories">
            <button className="bg-beshop-primary text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Voir toutes les catégories
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}