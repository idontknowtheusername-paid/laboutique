'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const categoryData = [
  {
    id: '1',
    name: 'Smartphones',
    slug: 'smartphones',
    image: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=300',
    productCount: 1250,
    gradient: 'from-blue-600 to-purple-600'
  },
  {
    id: '2',
    name: 'Mode Femme',
    slug: 'mode-femme',
    image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=300',
    productCount: 2800,
    gradient: 'from-pink-500 to-rose-600'
  },
  {
    id: '3',
    name: 'Électroménager',
    slug: 'electromenager',
    image: 'https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg?auto=compress&cs=tinysrgb&w=300',
    productCount: 850,
    gradient: 'from-green-500 to-teal-600'
  },
  {
    id: '4',
    name: 'Beauté & Cosmétiques',
    slug: 'beaute-cosmetiques',
    image: 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=300',
    productCount: 1640,
    gradient: 'from-purple-500 to-pink-600'
  },
  {
    id: '5',
    name: 'Sport & Fitness',
    slug: 'sport-fitness',
    image: 'https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=300',
    productCount: 950,
    gradient: 'from-orange-500 to-red-600'
  },
  {
    id: '6',
    name: 'Maison & Décoration',
    slug: 'maison-decoration',
    image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=300',
    productCount: 2100,
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: '7',
    name: 'Automobile',
    slug: 'automobile',
    image: 'https://images.pexels.com/photos/919073/pexels-photo-919073.jpeg?auto=compress&cs=tinysrgb&w=300',
    productCount: 680,
    gradient: 'from-gray-600 to-slate-700'
  },
  {
    id: '8',
    name: 'Livres & Education',
    slug: 'livres-education',
    image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=300',
    productCount: 1200,
    gradient: 'from-indigo-500 to-blue-600'
  },
];

const Categories = () => {
  return (
    <section className="py-12">
      <div className="container">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Catégories Populaires
            </h2>
            <p className="text-gray-600">
              Découvrez nos meilleures sélections dans chaque catégorie
            </p>
          </div>
          <Link 
            href="/categories" 
            className="flex items-center text-beshop-primary hover:text-blue-700 font-semibold group"
          >
            Voir toutes les catégories
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {categoryData.map((category, index) => (
            <Link key={category.id} href={`/category/${category.slug}`}>
              <Card className="group hover-lift card-shadow overflow-hidden h-full">
                <div className="relative h-48 overflow-hidden">
                  {/* Background Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                    style={{ backgroundImage: `url(${category.image})` }}
                  />
                  
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${category.gradient} opacity-80 group-hover:opacity-90 transition-opacity duration-300`} />
                  
                  {/* Content */}
                  <CardContent className="relative h-full flex flex-col justify-end p-4 text-white">
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg group-hover:text-xl transition-all duration-300">
                        {category.name}
                      </h3>
                      <p className="text-sm opacity-90">
                        {category.productCount.toLocaleString()} produits
                      </p>
                    </div>
                  </CardContent>

                  {/* Hover Arrow */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Featured Categories Strip */}
        <div className="mt-12 p-6 bg-gradient-to-r from-beshop-primary to-blue-600 rounded-xl text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-2xl font-bold mb-2">
                Explorez nos catégories premium
              </h3>
              <p className="opacity-90">
                Des produits de qualité sélectionnés par nos experts
              </p>
            </div>
            <div className="flex space-x-4">
              <div className="text-center">
                <div className="text-3xl font-bold">1200+</div>
                <div className="text-sm opacity-90">Marques</div>
              </div>
              <div className="w-px bg-white/30 mx-4"></div>
              <div className="text-center">
                <div className="text-3xl font-bold">50K+</div>
                <div className="text-sm opacity-90">Produits</div>
              </div>
              <div className="w-px bg-white/30 mx-4"></div>
              <div className="text-center">
                <div className="text-3xl font-bold">24h</div>
                <div className="text-sm opacity-90">Livraison</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Categories;