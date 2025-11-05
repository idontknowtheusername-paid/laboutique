'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { CategoriesService, Category } from '@/lib/services';

// Configuration des groupes thématiques
const CATEGORY_GROUPS = {
  'tech': { icon: '💻', color: 'text-blue-400' },
  'mode': { icon: '👗', color: 'text-pink-400' },
  'maison': { icon: '🏠', color: 'text-green-400' },
  'sport': { icon: '⚽', color: 'text-orange-400' },
  'lifestyle': { icon: '🌟', color: 'text-purple-400' },
  'automotive': { icon: '🚗', color: 'text-gray-400' }
};

// Hiérarchie artificielle intelligente - Regroupement logique des catégories
const MEGA_MENU_STRUCTURE = {
  'Électronique': {
    icon: '💻',
    color: 'text-blue-400',
    subcategories: ['electronique', 'telephones-accessoires', 'ordinateurs-tablettes', 'audio-video', 'gaming-vr']
  },
  'Mode & Beauté': {
    icon: '👗',
    color: 'text-pink-400',
    subcategories: ['mode-beaute', 'vetements-homme', 'vetements-femme', 'vetements-enfant', 'chaussures', 'sacs-maroquinerie', 'montres-bijoux', 'cosmetiques-soins']
  },
  'Maison & Jardin': {
    icon: '🏠',
    color: 'text-green-400',
    subcategories: ['maison-jardin', 'mobilier', 'electromenager', 'luminaires', 'cuisine-salle-bain', 'jardinage-outils']
  },
  'Sport & Loisirs': {
    icon: '⚽',
    color: 'text-orange-400',
    subcategories: ['sport-loisirs', 'fitness-musculation', 'sports-exterieur', 'jeux-jouets', 'instruments-musique']
  },
  'Lifestyle': {
    icon: '🌟',
    color: 'text-purple-400',
    subcategories: ['sante-bien-etre', 'bebe-enfant', 'livre-papeterie', 'voyage-bagages', 'animaux-accessoires']
  },
  'Auto & Outils': {
    icon: '🚗',
    color: 'text-gray-400',
    subcategories: ['automobile-moto', 'outils-bricolage']
  }
};

interface CategoriesMenuProps {
  onCategoryHover?: (category: Category | null) => void;
}

const CategoriesMenu: React.FC<CategoriesMenuProps> = ({ onCategoryHover }) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [megaMenuCategories, setMegaMenuCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Fonction simple pour gérer le hover
  const handleCategoryHover = (category: Category | null) => {
    console.log('🔍 Category hovered:', category?.name, 'Children:', category?.children?.length || 0);
    setHoveredCategory(category?.id || null);
    onCategoryHover?.(category);
  };

  // Charger toutes les catégories et créer la hiérarchie artificielle
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const response = await CategoriesService.getAll();
        
        if (response.success && response.data) {
          setAllCategories(response.data);

          // Créer la hiérarchie artificielle
          const artificialHierarchy: Category[] = [];

          Object.entries(MEGA_MENU_STRUCTURE).forEach(([groupName, groupConfig]) => {
            // Trouver les catégories qui correspondent aux slugs de ce groupe
            const matchingCategories = response.data.filter(cat =>
              groupConfig.subcategories.includes(cat.slug)
            );

            if (matchingCategories.length > 0) {
              // Créer une catégorie principale artificielle
              const mainCategory: Category = {
                id: `artificial-${groupName.toLowerCase().replace(/\s+/g, '-')}`,
                name: groupName,
                slug: groupName.toLowerCase().replace(/\s+/g, '-'),
                description: `Catégorie ${groupName}`,
                image_url: null,
                parent_id: null,
                icon: null,
                color: null,
                sort_order: 0,
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                children: matchingCategories.map(cat => ({
                  ...cat,
                  parent: {
                    id: `artificial-${groupName.toLowerCase().replace(/\s+/g, '-')}`,
                    name: groupName,
                    slug: groupName.toLowerCase().replace(/\s+/g, '-')
                  }
                }))
              };

              artificialHierarchy.push(mainCategory);
            }
          });

          console.log('🎯 Created artificial hierarchy:', artificialHierarchy.map(cat => ({
            name: cat.name,
            childrenCount: cat.children?.length || 0,
            children: cat.children?.map(child => child.name)
          })));

          setMegaMenuCategories(artificialHierarchy);
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
          {[...Array(6)].map((_, i) => (
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
        {megaMenuCategories.map((category) => {
          const groupName = category.name as keyof typeof MEGA_MENU_STRUCTURE;
          const groupConfig = MEGA_MENU_STRUCTURE[groupName];
          
          return (
            <div
              key={category.id}
              className="relative group/category"
              onMouseEnter={() => handleCategoryHover(category)}
            >
              {/* Category Item */}
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
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoriesMenu;
