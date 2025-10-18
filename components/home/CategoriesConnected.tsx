'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Search, Filter, SortAsc } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CategoriesService, Category } from '@/lib/services';
import Image from 'next/image';

// Définition des groupes logiques
const CATEGORY_GROUPS = {
  'tech': {
    name: 'Technologie & Électronique',
    icon: '💻',
    color: 'from-blue-500 to-purple-600',
    categories: ['electronique', 'telephones-accessoires', 'ordinateurs-tablettes', 'audio-video', 'gaming-vr']
  },
  'mode': {
    name: 'Mode & Beauté',
    icon: '👗',
    color: 'from-pink-500 to-rose-600',
    categories: ['mode-beaute', 'vetements-homme', 'vetements-femme', 'vetements-enfant', 'chaussures', 'sacs-maroquinerie', 'montres-bijoux', 'cosmetiques-soins']
  },
  'maison': {
    name: 'Maison & Jardin',
    icon: '🏠',
    color: 'from-green-500 to-teal-600',
    categories: ['maison-jardin', 'mobilier', 'electromenager', 'luminaires', 'cuisine-salle-bain', 'jardinage-outils']
  },
  'sport': {
    name: 'Sport & Loisirs',
    icon: '⚽',
    color: 'from-orange-500 to-red-600',
    categories: ['sport-loisirs', 'fitness-musculation', 'sports-exterieur', 'jeux-jouets', 'instruments-musique']
  },
  'lifestyle': {
    name: 'Lifestyle & Bien-être',
    icon: '🌟',
    color: 'from-emerald-500 to-teal-600',
    categories: ['sante-bien-etre', 'bebe-enfant', 'livre-papeterie', 'voyage-bagages', 'animaux-accessoires']
  },
  'automotive': {
    name: 'Automobile & Outils',
    icon: '🚗',
    color: 'from-gray-600 to-slate-700',
    categories: ['automobile-moto', 'outils-bricolage']
  }
};

export default function CategoriesConnected() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'products'>('products');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(12); // Afficher 12 catégories par page

  const [subcategories, setSubcategories] = useState<Record<string, Category[]>>({});

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const response = await CategoriesService.getWithProductCount();
        
        if (response.success && response.data) {
          // Séparer les catégories principales et les sous-catégories
          const mainCategories = response.data
            .filter(cat => !cat.parent_id)
            .sort((a, b) => (b.product_count || 0) - (a.product_count || 0));
            
          const subcategoriesMap: Record<string, Category[]> = {};
          response.data
            .filter(cat => cat.parent_id)
            .forEach(subcat => {
              if (!subcategoriesMap[subcat.parent_id!]) {
                subcategoriesMap[subcat.parent_id!] = [];
              }
              subcategoriesMap[subcat.parent_id!].push(subcat);
            });
            
          setCategories(mainCategories);
          setSubcategories(subcategoriesMap);
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

  // Logique de filtrage et tri
  const filteredCategories = categories
    .filter(cat => {
      // Filtrage par groupe
      const groupMatch = !selectedGroup || CATEGORY_GROUPS[selectedGroup as keyof typeof CATEGORY_GROUPS]?.categories.includes(cat.slug);
      
      // Filtrage par recherche
      const searchMatch = !searchTerm || 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return groupMatch && searchMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        return (b.product_count || 0) - (a.product_count || 0);
      }
    });

  // Logique de pagination
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCategories = filteredCategories.slice(startIndex, endIndex);

  // Reset page when group changes
  React.useEffect(() => {
    setCurrentPage(0);
  }, [selectedGroup]);

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
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Explorez notre large gamme de produits organisés par catégorie pour trouver exactement ce que vous cherchez
          </p>
          
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 max-w-4xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Rechercher une catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'products')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-jomionstore-primary"
              >
                <option value="products">Trier par popularité</option>
                <option value="name">Trier par nom</option>
              </select>
            </div>
          </div>

          {/* Group Selection */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <button
              onClick={() => setSelectedGroup(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedGroup === null
                  ? 'bg-jomionstore-primary text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Toutes ({categories.length})
            </button>
            {Object.entries(CATEGORY_GROUPS).map(([key, group]) => {
              const groupCategories = categories.filter(cat => group.categories.includes(cat.slug));
              return (
                <button
                  key={key}
                  onClick={() => setSelectedGroup(key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedGroup === key
                      ? 'bg-jomionstore-primary text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {group.icon} {group.name} ({groupCategories.length})
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Indicator */}
        {(selectedGroup || searchTerm) && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedGroup && (
                  <span className="text-2xl">{CATEGORY_GROUPS[selectedGroup as keyof typeof CATEGORY_GROUPS].icon}</span>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedGroup 
                      ? CATEGORY_GROUPS[selectedGroup as keyof typeof CATEGORY_GROUPS].name
                      : `Résultats pour "${searchTerm}"`
                    }
                  </h3>
                  <p className="text-sm text-gray-600">
                    {filteredCategories.length} catégorie{filteredCategories.length !== 1 ? 's' : ''} trouvée{filteredCategories.length !== 1 ? 's' : ''}
                    {selectedGroup && searchTerm && ' (filtrées)'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedGroup(null);
                  setSearchTerm('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Categories Grid - Responsive pour toutes les catégories */}
        <div className="space-y-8">
          {currentCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-xl shadow-sm border p-6">
              {/* Main Category */}
              <Link href={`/category/${category.slug}`}>
                <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden mb-4">
                  <CardContent className="p-0">
                    <div className="relative aspect-video">
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
                      <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-6">
                        <h3 className="font-bold text-2xl mb-2 group-hover:scale-105 transition-transform text-center">
                          {category.name}
                        </h3>
                        <p className="text-sm opacity-90 text-center">
                          {category.product_count || 0} produit{(category.product_count || 0) !== 1 ? 's' : ''}
                        </p>
                      </div>

                      {/* Arrow Icon */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white/20 backdrop-blur rounded-full p-2">
                          <ArrowRight className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Subcategories */}
              {subcategories[category.id] && subcategories[category.id].length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-3">Sous-catégories :</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {subcategories[category.id].map((subcategory) => (
                      <Link key={subcategory.id} href={`/category/${subcategory.slug}`}>
                        <div className="group p-3 rounded-lg border hover:border-jomionstore-primary hover:bg-orange-50 transition-all duration-200">
                          <div className="text-center">
                            <div className="text-2xl mb-1">{subcategory.icon || '📁'}</div>
                            <h5 className="text-xs font-medium text-gray-900 group-hover:text-jomionstore-primary transition-colors leading-tight">
                              {subcategory.name}
                            </h5>
                            <p className="text-xs text-gray-500 mt-1">
                              {subcategory.product_count || 0} produit{(subcategory.product_count || 0) !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
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