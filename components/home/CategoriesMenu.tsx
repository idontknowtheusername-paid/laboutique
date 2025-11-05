'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { CategoriesService, Category } from '@/lib/services';

// Configuration des groupes thématiques (repris de CarouselCategories)
const CATEGORY_GROUPS = {
  'tech': { icon: '💻', color: 'text-blue-400' },
  'mode': { icon: '👗', color: 'text-pink-400' },
  'maison': { icon: '🏠', color: 'text-green-400' },
  'sport': { icon: '⚽', color: 'text-orange-400' },
  'lifestyle': { icon: '🌟', color: 'text-purple-400' },
  'automotive': { icon: '🚗', color: 'text-gray-400' }
};

// Mapping des catégories vers les groupes
const CATEGORY_TO_GROUP: Record<string, keyof typeof CATEGORY_GROUPS> = {
  'electronique': 'tech', 'telephones-accessoires': 'tech', 'ordinateurs-tablettes': 'tech', 'audio-video': 'tech', 'gaming-vr': 'tech',
  'mode-beaute': 'mode', 'vetements-homme': 'mode', 'vetements-femme': 'mode', 'vetements-enfant': 'mode', 'chaussures': 'mode', 'sacs-maroquinerie': 'mode', 'montres-bijoux': 'mode', 'cosmetiques-soins': 'mode',
  'maison-jardin': 'maison', 'mobilier': 'maison', 'electromenager': 'maison', 'luminaires': 'maison', 'cuisine-salle-bain': 'maison', 'jardinage-outils': 'maison',
  'sport-loisirs': 'sport', 'fitness-musculation': 'sport', 'sports-exterieur': 'sport', 'jeux-jouets': 'sport', 'instruments-musique': 'sport',
  'sante-bien-etre': 'lifestyle', 'bebe-enfant': 'lifestyle', 'livre-papeterie': 'lifestyle', 'voyage-bagages': 'lifestyle', 'animaux-accessoires': 'lifestyle',
  'automobile-moto': 'automotive', 'outils-bricolage': 'automotive'
};

interface CategoriesMenuProps {
  onCategoryHover?: (category: Category | null) => void;
}

const CategoriesMenu: React.FC<CategoriesMenuProps> = ({ onCategoryHover }) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const handleCategoryHover = (category: Category | null) => {
    console.log('🔍 Category hovered:', category?.name, 'Children:', category?.children?.length || 0);
    setHoveredCategory(category?.id || null);
    onCategoryHover?.(category);
  };

  // Charger les catégories au montage du composant
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const response = await CategoriesService.getCategoryTree();
        
        if (response.success && response.data) {
          // Prendre les catégories principales avec leurs enfants, limiter à 8 pour un meilleur affichage
          const mainCategories = response.data.slice(0, 8);
          console.log('📊 Loaded categories:', mainCategories.map(cat => ({ 
            name: cat.name, 
            childrenCount: cat.children?.length || 0 
          })));
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

  if (loading) {
    return (
      <div className="h-full relative">
        <div className="p-4 border-b border-slate-700">
          <div className="h-4 bg-slate-600 rounded animate-pulse"></div>
        </div>
        <div className="flex flex-col p-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center p-3 space-x-2">
              <div className="w-6 h-6 bg-slate-600 rounded animate-pulse"></div>
              <div className="h-3 bg-slate-600 rounded flex-1 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-white text-sm font-bold flex items-center">
          <span className="mr-2">📂</span>
          Catégories
        </h3>
      </div>

      {/* Categories List */}
      <div className="flex flex-col h-full">
        {categories.map((category) => {
          const group = CATEGORY_TO_GROUP[category.slug];
          const groupConfig = group ? CATEGORY_GROUPS[group] : null;
          
          return (
            <div
              key={category.id}
              className="relative"
              onMouseEnter={() => handleCategoryHover(category)}
              onMouseLeave={() => handleCategoryHover(null)}
            >
              {/* Category Item */}
              <Link href={`/category/${category.slug}`}>
                <div className="flex items-center justify-between p-3 text-white hover:bg-slate-700/50 transition-colors duration-200 cursor-pointer group">
                  <div className="flex items-center space-x-2 flex-1">
                    <span className={`text-lg ${groupConfig?.color || 'text-gray-400'}`}>
                      {groupConfig?.icon || '📁'}
                    </span>
                    <div className="flex-1">
                      <span className="text-xs font-medium group-hover:text-white/90 block">
                        {category.name}
                      </span>
                      {category.children && category.children.length > 0 && (
                        <span className="text-xs text-slate-400 group-hover:text-white/70">
                          {category.children.length} sous-catégories
                        </span>
                      )}
                    </div>
                  </div>
                  {category.children && category.children.length > 0 && (
                    <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors flex-shrink-0" />
                  )}
                </div>
              </Link>


            </div>
          );
        })}


      </div>
    </div>
  );
};

export default CategoriesMenu;
