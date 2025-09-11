'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Grid3X3, Smartphone, Shirt, Home, Sparkles, Dumbbell, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

const categories = [
  {
    id: '1',
    name: 'Électronique',
    slug: 'electronique',
    icon: Smartphone,
    subcategories: [
      { name: 'Smartphones & Tablettes', slug: 'smartphones-tablettes', items: ['iPhone', 'Samsung', 'Xiaomi', 'Huawei'] },
      { name: 'Ordinateurs', slug: 'ordinateurs', items: ['Laptops', 'PC Bureau', 'Accessoires'] },
      { name: 'TV & Audio', slug: 'tv-audio', items: ['Smart TV', 'Casques', 'Enceintes'] },
      { name: 'Appareils Photo', slug: 'appareils-photo', items: ['DSLR', 'Mirrorless', 'Action Cam'] },
    ]
  },
  {
    id: '2',
    name: 'Mode',
    slug: 'mode',
    icon: Shirt,
    subcategories: [
      { name: 'Hommes', slug: 'hommes', items: ['Vêtements', 'Chaussures', 'Accessoires'] },
      { name: 'Femmes', slug: 'femmes', items: ['Robes', 'Chaussures', 'Sacs', 'Bijoux'] },
      { name: 'Enfants', slug: 'enfants', items: ['Garçons', 'Filles', 'Bébé'] },
      { name: 'Sport', slug: 'sport', items: ['Fitness', 'Football', 'Running'] },
    ]
  },
  {
    id: '3',
    name: 'Maison & Jardin',
    slug: 'maison-jardin',
    icon: Home,
    subcategories: [
      { name: 'Meubles', slug: 'meubles', items: ['Salon', 'Chambre', 'Cuisine', 'Bureau'] },
      { name: 'Électroménager', slug: 'electromenager', items: ['Réfrigérateurs', 'Machines à laver', 'Micro-ondes'] },
      { name: 'Décoration', slug: 'decoration', items: ['Éclairage', 'Textiles', 'Art mural'] },
      { name: 'Jardin', slug: 'jardin', items: ['Outils', 'Plantes', 'Mobilier extérieur'] },
    ]
  },
  {
    id: '4',
    name: 'Beauté & Santé',
    slug: 'beaute-sante',
    icon: Sparkles,
    subcategories: [
      { name: 'Cosmétiques', slug: 'cosmetiques', items: ['Maquillage', 'Soins visage', 'Parfums'] },
      { name: 'Cheveux', slug: 'cheveux', items: ['Shampooings', 'Colorations', 'Accessoires'] },
      { name: 'Santé', slug: 'sante', items: ['Vitamines', 'Premiers secours', 'Bien-être'] },
      { name: 'Hygiène', slug: 'hygiene', items: ['Dentaire', 'Corporel', 'Intime'] },
    ]
  },
  {
    id: '5',
    name: 'Sport & Loisirs',
    slug: 'sport-loisirs',
    icon: Dumbbell,
    subcategories: [
      { name: 'Fitness', slug: 'fitness', items: ['Équipements', 'Vêtements', 'Nutrition'] },
      { name: 'Sports collectifs', slug: 'sports-collectifs', items: ['Football', 'Basketball', 'Volleyball'] },
      { name: 'Outdoor', slug: 'outdoor', items: ['Camping', 'Randonnée', 'Vélo'] },
      { name: 'Jeux', slug: 'jeux', items: ['Jouets', 'Puzzles', 'Cartes'] },
    ]
  },
  {
    id: '6',
    name: 'Alimentation',
    slug: 'alimentation',
    icon: ShoppingBag,
    subcategories: [
      { name: 'Épicerie', slug: 'epicerie', items: ['Conserves', 'Céréales', 'Condiments'] },
      { name: 'Boissons', slug: 'boissons', items: ['Eaux', 'Jus', 'Sodas', 'Alcools'] },
      { name: 'Produits frais', slug: 'produits-frais', items: ['Fruits', 'Légumes', 'Viandes'] },
      { name: 'Bio', slug: 'bio', items: ['Produits biologiques', 'Sans gluten', 'Végétarien'] },
    ]
  },
];

const CategoryMenu = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 150);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`bg-white border-b transition-all duration-300 ${
      isScrolled ? 'py-2' : 'py-3'
    }`} style={{ marginTop: '110px' }}>
      <div className="container">
        <NavigationMenu>
          <NavigationMenuList className="flex flex-wrap gap-1">
            {/* All Categories Button */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-beshop-primary text-white hover:bg-blue-700 px-6 py-2 h-auto">
                <Grid3X3 className="w-4 h-4 mr-2" />
                Toutes les catégories
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid grid-cols-3 gap-6 p-6 w-[800px]">
                  {categories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <div key={category.id} className="space-y-3">
                        <Link
                          href={`/category/${category.slug}`}
                          className="flex items-center space-x-2 font-semibold text-beshop-primary hover:text-blue-700"
                        >
                          <IconComponent className="w-5 h-5" />
                          <span>{category.name}</span>
                        </Link>
                        <div className="space-y-2">
                          {category.subcategories.map((sub) => (
                            <div key={sub.slug}>
                              <Link
                                href={`/category/${category.slug}/${sub.slug}`}
                                className="block font-medium text-gray-700 hover:text-beshop-primary transition-colors"
                              >
                                {sub.name}
                              </Link>
                              <ul className="ml-2 mt-1 space-y-1">
                                {sub.items.map((item, idx) => (
                                  <li key={idx}>
                                    <Link
                                      href={`/category/${category.slug}/${sub.slug}?filter=${item.toLowerCase()}`}
                                      className="text-sm text-gray-500 hover:text-beshop-secondary transition-colors"
                                    >
                                      {item}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Individual Category Links */}
            {categories.slice(0, 6).map((category) => {
              const IconComponent = category.icon;
              return (
                <NavigationMenuItem key={category.id}>
                  <NavigationMenuTrigger className="text-gray-700 hover:text-beshop-primary px-4 py-2 h-auto bg-transparent">
                    <IconComponent className="w-4 h-4 mr-2" />
                    {category.name}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid grid-cols-2 gap-6 p-6 w-[500px]">
                      {category.subcategories.map((sub) => (
                        <div key={sub.slug} className="space-y-2">
                          <Link
                            href={`/category/${category.slug}/${sub.slug}`}
                            className="block font-semibold text-beshop-primary hover:text-blue-700"
                          >
                            {sub.name}
                          </Link>
                          <ul className="space-y-1">
                            {sub.items.map((item, idx) => (
                              <li key={idx}>
                                <Link
                                  href={`/category/${category.slug}/${sub.slug}?filter=${item.toLowerCase()}`}
                                  className="text-sm text-gray-600 hover:text-beshop-secondary transition-colors"
                                >
                                  {item}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
};

export default CategoryMenu;