'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, Grid, List, ChevronDown, Star, TrendingUp, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CategoriesService, Category } from '@/lib/services';
import Image from 'next/image';

// Configuration des groupes thématiques avec icônes et couleurs
const CATEGORY_GROUPS = {
  'tech': {
    name: 'Technologie',
    icon: '💻',
    color: 'from-blue-500 to-purple-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700'
  },
  'mode': {
    name: 'Mode & Beauté',
    icon: '👗',
    color: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    textColor: 'text-pink-700'
  },
  'maison': {
    name: 'Maison & Jardin',
    icon: '🏠',
    color: 'from-green-500 to-teal-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700'
  },
  'sport': {
    name: 'Sport & Loisirs',
    icon: '⚽',
    color: 'from-orange-500 to-red-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700'
  },
  'lifestyle': {
    name: 'Lifestyle',
    icon: '🌟',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700'
  },
  'automotive': {
    name: 'Auto & Outils',
    icon: '🚗',
    color: 'from-gray-600 to-slate-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    textColor: 'text-gray-700'
  }
};

// Mapping des catégories vers les groupes
const CATEGORY_TO_GROUP: Record<string, keyof typeof CATEGORY_GROUPS> = {
  'electronique': 'tech',
  'telephones-accessoires': 'tech',
  'ordinateurs-tablettes': 'tech',
  'audio-video': 'tech',
  'gaming-vr': 'tech',
  'mode-beaute': 'mode',
  'vetements-homme': 'mode',
  'vetements-femme': 'mode',
  'vetements-enfant': 'mode',
  'chaussures': 'mode',
  'sacs-maroquinerie': 'mode',
  'montres-bijoux': 'mode',
  'cosmetiques-soins': 'mode',
  'maison-jardin': 'maison',
  'mobilier': 'maison',
  'electromenager': 'maison',
  'luminaires': 'maison',
  'cuisine-salle-bain': 'maison',
  'jardinage-outils': 'maison',
  'sport-loisirs': 'sport',
  'fitness-musculation': 'sport',
  'sports-exterieur': 'sport',
  'jeux-jouets': 'sport',
  'instruments-musique': 'sport',
  'sante-bien-etre': 'lifestyle',
  'bebe-enfant': 'lifestyle',
  'livre-papeterie': 'lifestyle',
  'voyage-bagages': 'lifestyle',
  'animaux-accessoires': 'lifestyle',
  'automobile-moto': 'automotive',
  'outils-bricolage': 'automotive'
};

// Images par défaut pour les catégories
const getDefaultImage = (slug: string): string => {
  const imageMap: Record<string, string> = {
    'electronique': 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400',
    'maison-jardin': 'https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg?auto=compress&cs=tinysrgb&w=400',
    'mode-beaute': 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400',
    'sport-loisirs': 'https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=400',
    'telephones-accessoires': 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400',
    'ordinateurs-tablettes': 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=400',
    'audio-video': 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400',
    'gaming-vr': 'https://images.pexels.com/photos/1267350/pexels-photo-1267350.jpeg?auto=compress&cs=tinysrgb&w=400',
    'vetements-homme': 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400',
    'vetements-femme': 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400',
    'vetements-enfant': 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400',
    'chaussures': 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400',
    'sacs-maroquinerie': 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400',
    'montres-bijoux': 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=400',
    'cosmetiques-soins': 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=400',
    'mobilier': 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
    'electromenager': 'https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg?auto=compress&cs=tinysrgb&w=400',
    'luminaires': 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
    'cuisine-salle-bain': 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
    'jardinage-outils': 'https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg?auto=compress&cs=tinysrgb&w=400',
    'fitness-musculation': 'https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=400',
    'sports-exterieur': 'https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=400',
    'jeux-jouets': 'https://images.pexels.com/photos/1267350/pexels-photo-1267350.jpeg?auto=compress&cs=tinysrgb&w=400',
    'instruments-musique': 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400',
    'livre-papeterie': 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400',
    'sante-bien-etre': 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=400',
    'bebe-enfant': 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400',
    'automobile-moto': 'https://images.pexels.com/photos/919073/pexels-photo-919073.jpeg?auto=compress&cs=tinysrgb&w=400',
    'outils-bricolage': 'https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg?auto=compress&cs=tinysrgb&w=400',
    'voyage-bagages': 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400',
    'animaux-accessoires': 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400'
  };
  
  return imageMap[slug] || 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=400';
};

export default function MegaCategoriesGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const response = await CategoriesService.getWithProductCount();
        
        if (response.success && response.data) {
          const mainCategories = response.data
            .filter(cat => !cat.parent_id)
            .sort((a, b) => (b.product_count || 0) - (a.product_count || 0));
            
          setCategories(mainCategories);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Filtrage des catégories
  const filteredCategories = categories.filter(cat => {
    const groupMatch = !selectedGroup || CATEGORY_TO_GROUP[cat.slug] === selectedGroup;
    const searchMatch = !searchTerm || 
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return groupMatch && searchMatch;
  });

  // Grouper les catégories par groupe thématique
  const groupedCategories = filteredCategories.reduce((acc, category) => {
    const group = CATEGORY_TO_GROUP[category.slug] || 'other';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(category);
    return acc;
  }, {} as Record<string, Category[]>);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
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

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            🛍️ Parcourir par Catégorie
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Trouvez exactement ce que vous cherchez parmi nos {categories.length} catégories
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8 max-w-6xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Rechercher une catégorie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedGroup || ''}
              onChange={(e) => setSelectedGroup(e.target.value || null)}
              className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-jomionstore-primary h-12"
            >
              <option value="">Tous les groupes</option>
              {Object.entries(CATEGORY_GROUPS).map(([key, group]) => (
                <option key={key} value={key}>
                  {group.icon} {group.name}
                </option>
              ))}
            </select>
            
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => setViewMode('grid')}
              className="h-12 px-4"
            >
              <Grid className="w-4 h-4" />
            </Button>
            
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
              className="h-12 px-4"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-center mb-8">
          <p className="text-gray-600">
            {filteredCategories.length} catégorie{filteredCategories.length !== 1 ? 's' : ''} trouvée{filteredCategories.length !== 1 ? 's' : ''}
            {selectedGroup && ` dans ${CATEGORY_GROUPS[selectedGroup as keyof typeof CATEGORY_GROUPS]?.name}`}
          </p>
        </div>

        {/* Categories Grid */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-7xl mx-auto">
            {filteredCategories.map((category) => {
              const group = CATEGORY_TO_GROUP[category.slug];
              const groupConfig = group ? CATEGORY_GROUPS[group] : null;
              
              return (
                <Link key={category.id} href={`/category/${category.slug}`}>
                  <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden h-full border-2 hover:border-jomionstore-primary hover:scale-105">
                    <CardContent className="p-0">
                      <div className="relative aspect-square">
                        {/* Background Image */}
                        <div className="absolute inset-0">
                          <Image
                            src={category.image_url || getDefaultImage(category.slug)}
                            alt={category.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        
                        {/* Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${groupConfig?.color || 'from-gray-500 to-gray-700'} opacity-80 group-hover:opacity-70 transition-opacity`} />
                        
                        {/* Content */}
                        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-4 text-center">
                          <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                            {groupConfig?.icon || '📁'}
                          </div>
                          <h3 className="font-bold text-sm sm:text-base mb-1 group-hover:scale-105 transition-transform leading-tight">
                            {category.name}
                          </h3>
                          <p className="text-xs opacity-90">
                            {category.product_count || 0} produit{(category.product_count || 0) !== 1 ? 's' : ''}
                          </p>
                        </div>

                        {/* Badge */}
                        {category.product_count && category.product_count > 100 && (
                          <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                            <TrendingUp className="w-3 h-3 inline mr-1" />
                            Populaire
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="max-w-4xl mx-auto space-y-4">
            {Object.entries(groupedCategories).map(([groupKey, groupCategories]) => {
              const groupConfig = CATEGORY_GROUPS[groupKey as keyof typeof CATEGORY_GROUPS];
              
              return (
                <div key={groupKey} className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{groupConfig?.icon || '📁'}</span>
                    <h3 className="text-xl font-bold text-gray-900">{groupConfig?.name || 'Autres'}</h3>
                    <span className="text-sm text-gray-500">({groupCategories.length})</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {groupCategories.map((category) => (
                      <Link key={category.id} href={`/category/${category.slug}`}>
                        <div className="group p-4 rounded-lg border hover:border-jomionstore-primary hover:bg-orange-50 transition-all duration-200">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{groupConfig?.icon || '📁'}</div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 group-hover:text-jomionstore-primary transition-colors">
                                {category.name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {category.product_count || 0} produit{(category.product_count || 0) !== 1 ? 's' : ''}
                              </p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-jomionstore-primary transition-colors rotate-[-90deg]" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link href="/categories">
            <Button size="lg" className="bg-jomionstore-primary hover:bg-orange-700 text-white px-8 py-4 text-lg">
              <Sparkles className="w-5 h-5 mr-2" />
              Voir toutes les catégories ({categories.length})
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}