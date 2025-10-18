'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CategoriesService, Category } from '@/lib/services';
import Image from 'next/image';

export default function CategoriesConnected() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(12); // Afficher 12 catégories par page

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const response = await CategoriesService.getWithProductCount();
        
        if (response.success && response.data) {
          // Prendre toutes les catégories principales avec le plus de produits
          const allCategories = response.data
            .filter(cat => !cat.parent_id) // Seulement les catégories principales
            .sort((a, b) => (b.product_count || 0) - (a.product_count || 0));
            
          setCategories(allCategories);
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
      'maison-jardin': 'https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg?auto=compress&cs=tinysrgb&w=300',
      'mode-beaute': 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=300',
      'sport-loisirs': 'https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=300',
      'telephones-accessoires': 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=300',
      'ordinateurs-tablettes': 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=300',
      'audio-video': 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=300',
      'gaming-vr': 'https://images.pexels.com/photos/1267350/pexels-photo-1267350.jpeg?auto=compress&cs=tinysrgb&w=300',
      'vetements-homme': 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=300',
      'vetements-femme': 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=300',
      'vetements-enfant': 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=300',
      'chaussures': 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=300',
      'sacs-maroquinerie': 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=300',
      'montres-bijoux': 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=300',
      'cosmetiques-soins': 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=300',
      'mobilier': 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=300',
      'electromenager': 'https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg?auto=compress&cs=tinysrgb&w=300',
      'luminaires': 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=300',
      'cuisine-salle-bain': 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=300',
      'jardinage-outils': 'https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg?auto=compress&cs=tinysrgb&w=300',
      'fitness-musculation': 'https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=300',
      'sports-exterieur': 'https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=300',
      'jeux-jouets': 'https://images.pexels.com/photos/1267350/pexels-photo-1267350.jpeg?auto=compress&cs=tinysrgb&w=300',
      'instruments-musique': 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=300',
      'livre-papeterie': 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=300',
      'sante-bien-etre': 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=300',
      'bebe-enfant': 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=300',
      'automobile-moto': 'https://images.pexels.com/photos/919073/pexels-photo-919073.jpeg?auto=compress&cs=tinysrgb&w=300',
      'outils-bricolage': 'https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg?auto=compress&cs=tinysrgb&w=300',
      'voyage-bagages': 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=300',
      'animaux-accessoires': 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=300'
    };
    
    return imageMap[slug] || 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=300';
  };

  // Couleurs de gradient basées sur le slug
  const getGradient = (slug: string): string => {
    const gradientMap: Record<string, string> = {
      'electronique': 'from-orange-600 to-purple-600',
      'maison-jardin': 'from-green-500 to-teal-600',
      'mode-beaute': 'from-pink-500 to-rose-600',
      'sport-loisirs': 'from-orange-500 to-red-600',
      'telephones-accessoires': 'from-blue-600 to-indigo-600',
      'ordinateurs-tablettes': 'from-slate-600 to-gray-700',
      'audio-video': 'from-purple-500 to-pink-600',
      'gaming-vr': 'from-cyan-500 to-blue-600',
      'vetements-homme': 'from-gray-600 to-slate-700',
      'vetements-femme': 'from-pink-500 to-rose-600',
      'vetements-enfant': 'from-yellow-500 to-orange-500',
      'chaussures': 'from-amber-600 to-orange-600',
      'sacs-maroquinerie': 'from-amber-500 to-yellow-600',
      'montres-bijoux': 'from-purple-600 to-indigo-600',
      'cosmetiques-soins': 'from-pink-500 to-purple-600',
      'mobilier': 'from-green-600 to-emerald-600',
      'electromenager': 'from-blue-500 to-cyan-600',
      'luminaires': 'from-yellow-500 to-amber-600',
      'cuisine-salle-bain': 'from-teal-500 to-green-600',
      'jardinage-outils': 'from-green-600 to-teal-600',
      'fitness-musculation': 'from-red-500 to-orange-600',
      'sports-exterieur': 'from-orange-500 to-red-600',
      'jeux-jouets': 'from-cyan-500 to-blue-600',
      'instruments-musique': 'from-purple-500 to-pink-600',
      'livre-papeterie': 'from-indigo-500 to-purple-600',
      'sante-bien-etre': 'from-emerald-500 to-teal-600',
      'bebe-enfant': 'from-pink-400 to-rose-500',
      'automobile-moto': 'from-gray-600 to-slate-700',
      'outils-bricolage': 'from-amber-600 to-orange-600',
      'voyage-bagages': 'from-blue-500 to-indigo-600',
      'animaux-accessoires': 'from-green-500 to-emerald-600'
    };
    
    return gradientMap[slug] || 'from-gray-500 to-gray-700';
  };

  // Logique de pagination
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCategories = categories.slice(startIndex, endIndex);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
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

        {/* Categories Grid - Responsive pour toutes les catégories */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
          {currentCategories.map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`}>
              <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
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
                    <div className="absolute inset-0 flex flex-col justify-end p-3 text-white">
                      <h3 className="font-bold text-sm sm:text-base mb-1 group-hover:scale-105 transition-transform leading-tight">
                        {category.name}
                      </h3>
                      <p className="text-xs opacity-90">
                        {category.product_count || 0} produit{(category.product_count || 0) !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Arrow Icon */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/20 backdrop-blur rounded-full p-1.5">
                        <ArrowRight className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={prevPage}
              disabled={currentPage === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Page {currentPage + 1} sur {totalPages}
              </span>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === currentPage ? 'bg-jomionstore-primary' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
              className="flex items-center gap-2"
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* View All Categories Button */}
        <div className="text-center">
          <Link href="/categories">
            <button className="bg-jomionstore-primary text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium">
              Voir toutes les catégories ({categories.length})
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}