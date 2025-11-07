'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import CategoriesMenu from './CategoriesMenu';
import { Category } from '@/lib/services';

// Bannières statiques intégrées dans le code
const STATIC_BANNERS = [
  {
    id: 'banner-1',
    title: 'MÉGA SOLDES D\'HIVER',
    subtitle: 'Jusqu\'à -70% sur l\'électronique',
    description: 'iPhone, Samsung, laptops et plus encore avec livraison gratuite',
    cta_text: 'DÉCOUVRIR LES OFFRES',
    cta_link: '/flash-sales',
    image_url: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=1200',
    gradient: 'from-red-600 via-orange-600 to-yellow-500',
    badge: '🔥 FLASH SALE'
  },
  {
    id: 'banner-2',
    title: 'NOUVELLE COLLECTION MODE',
    subtitle: 'Tendances Printemps 2024',
    description: 'Découvrez les dernières créations des designers locaux et internationaux',
    cta_text: 'EXPLORER LA MODE',
    cta_link: '/category/mode-beaute',
    image_url: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1200',
    gradient: 'from-purple-600 via-pink-600 to-rose-500',
    badge: '✨ NOUVEAU'
  },
  {
    id: 'banner-3',
    title: 'GAMING ZONE',
    subtitle: 'Setup de rêve pour gamers',
    description: 'PS5, Xbox, PC Gaming, casques et accessoires pro',
    cta_text: 'CONFIGURER SETUP',
    cta_link: '/category/gaming-vr',
    image_url: 'https://images.pexels.com/photos/1267350/pexels-photo-1267350.jpeg?auto=compress&cs=tinysrgb&w=1200',
    gradient: 'from-blue-600 via-purple-600 to-indigo-700',
    badge: '🎮 GAMING'
  },
  {
    id: 'banner-4',
    title: 'LIVRAISON GRATUITE',
    subtitle: 'Partout au Bénin',
    description: 'Commandez maintenant et recevez vos produits sous 24h',
    cta_text: 'COMMANDER MAINTENANT',
    cta_link: '/products',
    image_url: 'https://images.pexels.com/photos/4393021/pexels-photo-4393021.jpeg?auto=compress&cs=tinysrgb&w=1200',
    gradient: 'from-green-600 via-teal-600 to-cyan-500',
    badge: '🚚 GRATUIT'
  }
];

// Publicités avec animations dynamiques et messages engageants
const DYNAMIC_ADVERTISEMENTS = [
  {
    id: 'ad-1',
    icon: '🎫',
    iconColor: 'text-yellow-400',
    title: 'Profitez de nos codes promo',
    subtitle: 'WELCOME15 pour 15% de réduction !',
    animation: 'slideFromTop',
    link: '/coupons'
  },
  {
    id: 'ad-2',
    icon: '🔥',
    iconColor: 'text-red-500',
    title: 'Black Friday toute l\'année',
    subtitle: 'Des prix cassés tous les jours !',
    animation: 'slideFromBottom',
    link: '/flash-sales'
  },
  {
    id: 'ad-3',
    icon: '⚡',
    iconColor: 'text-yellow-500',
    title: 'Flash Deals en continu',
    subtitle: 'Nouvelles offres toutes les 2h',
    animation: 'slideFromLeft',
    link: '/flash-sales'
  },
  {
    id: 'ad-4',
    icon: '💰',
    iconColor: 'text-green-400',
    title: 'Économisez jusqu\'à 70%',
    subtitle: 'Code MEGA70 disponible maintenant',
    animation: 'slideFromRight',
    link: '/coupons'
  },
  {
    id: 'ad-5',
    icon: '🚚',
    iconColor: 'text-blue-400',
    title: 'Livraison express 24h',
    subtitle: 'Partout au Bénin, c\'est gratuit !',
    animation: 'fadeIn',
    link: '/delivery-info'
  },
  {
    id: 'ad-6',
    icon: '👑',
    iconColor: 'text-purple-400',
    title: 'Devenez membre VIP',
    subtitle: 'Accès aux ventes privées exclusives',
    animation: 'zoomIn',
    link: '/vip'
  },
  {
    id: 'ad-7',
    icon: '🎁',
    iconColor: 'text-pink-400',
    title: 'Offre spéciale mode',
    subtitle: 'Achetez 2 articles, payez-en 1 seul',
    animation: 'slideFromTop',
    link: '/category/mode-beaute'
  },
  {
    id: 'ad-8',
    icon: '💎',
    iconColor: 'text-cyan-400',
    title: 'Frais de port offerts',
    subtitle: 'Code FREESHIP sur toute commande',
    animation: 'slideFromBottom',
    link: '/coupons'
  },
  {
    id: 'ad-9',
    icon: '🎯',
    iconColor: 'text-orange-400',
    title: 'Deal mystère du jour',
    subtitle: 'Jusqu\'à 80% sur un produit surprise',
    animation: 'slideFromLeft',
    link: '/daily-deals'
  },
  {
    id: 'ad-10',
    icon: '🎮',
    iconColor: 'text-indigo-400',
    title: 'Gaming Week en cours',
    subtitle: 'Setup complet à -45%, c\'est le moment !',
    animation: 'slideFromRight',
    link: '/category/gaming-vr'
  },
  {
    id: 'ad-11',
    icon: '💳',
    iconColor: 'text-emerald-400',
    title: 'Payez en 3 fois sans frais',
    subtitle: 'Facilité de paiement pour tous',
    animation: 'fadeIn',
    link: '/payment-info'
  },
  {
    id: 'ad-12',
    icon: '🔄',
    iconColor: 'text-teal-400',
    title: 'Satisfait ou remboursé',
    subtitle: '30 jours pour changer d\'avis',
    animation: 'zoomIn',
    link: '/returns'
  }
];

interface HeroCarouselImprovedProps {
  className?: string;
}

const HeroCarouselImproved: React.FC<HeroCarouselImprovedProps> = ({
  className = ''
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);

  // Debug pour voir si l'état change
  useEffect(() => {
    console.log('🎯 Hovered category changed:', hoveredCategory?.name, 'Has children:', hoveredCategory?.children?.length || 0);
  }, [hoveredCategory]);

  return (
    <div className={`w-full h-[400px] sm:h-[420px] md:h-[425px] lg:h-[510px] ${className} relative`}>
      {/* Layout Grid Responsive - Même structure sur tous les écrans */}
      <div className="grid grid-cols-12 grid-rows-2 gap-2 sm:gap-3 md:gap-4 h-full">

        {/* SECTION GAUCHE - Menu Catégories (masqué sur mobile) */}
        <div className="hidden md:block md:col-span-2 row-span-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg md:rounded-xl overflow-visible relative group/menu">
          <CategoriesMenu onCategoryHover={setHoveredCategory} />
        </div>

        {/* SECTION PRINCIPALE - Hero Carousel (pleine largeur sur mobile) */}
        <div className="col-span-9 md:col-span-8 row-span-2 bg-gray-100 rounded-lg md:rounded-xl overflow-hidden">
          <MainHeroCarousel />
        </div>

        {/* SECTION DROITE-1 - Contact & Partenariat */}
        <div className="col-span-3 md:col-span-2 row-span-1 bg-black rounded-lg md:rounded-xl p-1 sm:p-2 md:p-3 text-white">
          <div className="h-full flex flex-col justify-start space-y-1 sm:space-y-2 md:space-y-3">
            {/* Appelez pour commander */}
            <div className="mb-1 sm:mb-2">
              <div className="flex items-center mb-0.5 sm:mb-1">
                <span className="text-xs sm:text-sm md:text-lg mr-1 sm:mr-2">📞</span>
                <h3 className="text-[10px] sm:text-xs md:text-sm font-bold leading-tight">Appelez pour commander</h3>
              </div>
              <a href="tel:+22997123456" className="text-[9px] sm:text-xs md:text-xs font-semibold hover:underline ml-3 sm:ml-4 md:ml-6 block">
                +229 97 12 34 56
              </a>
            </div>

            {/* Vendez sur JomionStore - Masqué sur très petit écran */}
            <div className="hidden sm:block mb-1 sm:mb-2">
              <div className="flex items-center mb-0.5 sm:mb-1">
                <span className="text-xs sm:text-sm md:text-lg mr-1 sm:mr-2">🏪</span>
                <Link href="/become-seller" className="block">
                  <h3 className="text-[10px] sm:text-xs md:text-xs font-bold hover:underline leading-tight">Vendez sur JomionStore</h3>
                </Link>
              </div>
              <p className="text-[9px] sm:text-xs md:text-xs opacity-90 ml-3 sm:ml-4 md:ml-6">Devenez partenaire aujourd'hui</p>
            </div>

            {/* Promotion - Masqué sur petit écran */}
            <div className="hidden md:block">
              <div className="flex items-center mb-1">
                <span className="text-lg mr-2">📧</span>
                <Link href="/contact" className="block">
                  <h3 className="text-xs font-bold hover:underline">Envoyez-nous vos produits</h3>
                </Link>
              </div>
              <p className="text-xs opacity-90 ml-6">On gère la promotion</p>
            </div>
          </div>
        </div>

        {/* SECTION DROITE-2 - Zone Publicitaire */}
        <div className="col-span-3 md:col-span-2 row-span-1 rounded-lg md:rounded-xl overflow-hidden">
          <AdvertisingZone />
        </div>

      </div>

      {/* MEGA MENU OVERLAY - Desktop seulement */}
      {hoveredCategory && (
        <div className="hidden md:block absolute top-0 left-0 w-full h-full z-[70] pointer-events-none group/overlay"
          onMouseEnter={() => console.log('🎯 Entered overlay')}
          onMouseLeave={() => {
            console.log('🎯 Left overlay - closing');
            setTimeout(() => setHoveredCategory(null), 100);
          }}
        >
          <div className="grid grid-cols-12 grid-rows-2 gap-2 sm:gap-3 md:gap-4 h-full">
            {/* Espace pour le menu des catégories - ZONE DE TOLÉRANCE */}
            <div className="col-span-3 sm:col-span-3 md:col-span-2 row-span-2 pointer-events-auto bg-transparent"></div>

            {/* MEGA MENU - Par-dessus la section principale */}
            <div className="col-span-9 sm:col-span-9 md:col-span-10 row-span-2 pointer-events-auto">
              <MegaMenuOverlay category={hoveredCategory} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant pour le carousel principal (section centrale)
const MainHeroCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % STATIC_BANNERS.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + STATIC_BANNERS.length) % STATIC_BANNERS.length);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // Auto-play effect
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  return (
    <div 
      className="relative h-full w-full"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Slides */}
      <div className="relative h-full">
        {STATIC_BANNERS.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
              index === currentSlide ? 'translate-x-0' : 
              index < currentSlide ? '-translate-x-full' : 'translate-x-full'
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <Image
                src={banner.image_url}
                alt={banner.title}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={90}
              />
            </div>
            
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient} opacity-90`} />
            
            {/* Content - Responsive */}
            <div className="relative h-full flex items-center p-4 sm:p-4 md:p-6 lg:p-8">
              <div className="max-w-[240px] sm:max-w-xs md:max-w-sm lg:max-w-md text-white">
                {/* Badge */}
                <Badge className="mb-1.5 sm:mb-2 md:mb-3 lg:mb-4 bg-white/20 text-white border-white/30 text-[10px] sm:text-xs">
                  {banner.badge}
                </Badge>

                {/* Title - Responsive */}
                <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold mb-1.5 sm:mb-2 md:mb-3 leading-tight">
                  {banner.title}
                </h2>

                {/* Subtitle - Responsive */}
                <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-light mb-1.5 sm:mb-2 md:mb-3 opacity-90 leading-tight">
                  {banner.subtitle}
                </h3>

                {/* Description - Responsive - Masqué sur très petit écran */}
                <p className="hidden sm:block text-xs md:text-sm lg:text-base mb-2.5 sm:mb-3 md:mb-4 lg:mb-6 opacity-80 leading-tight line-clamp-2 sm:line-clamp-3">
                  {banner.description}
                </p>

                {/* CTA Button - Responsive */}
                <Link href={banner.cta_link}>
                  <Button
                    size="sm"
                    className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-3 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 lg:px-6 lg:py-3 text-[11px] sm:text-xs md:text-sm lg:text-base"
                  >
                    {banner.cta_text}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-1 sm:p-2 rounded-full transition-all duration-300 z-10"
        aria-label="Slide précédent"
      >
        <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-1 sm:p-2 rounded-full transition-all duration-300 z-10"
        aria-label="Slide suivant"
      >
        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
      </button>

      {/* Play/Pause Button */}
      <button
        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
        className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white/20 hover:bg-white/30 text-white p-1 sm:p-2 rounded-full transition-all duration-300"
        aria-label={isAutoPlaying ? 'Pause' : 'Play'}
      >
        {isAutoPlaying ? <Pause className="w-3 h-3 sm:w-4 sm:h-4" /> : <Play className="w-3 h-3 sm:w-4 sm:h-4" />}
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-3 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3">
        {STATIC_BANNERS.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${index === currentSlide
              ? 'bg-white scale-125'
              : 'bg-white/50 hover:bg-white/75'
              }`}
            aria-label={`Aller au slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-white/20">
        <div
          className="h-full bg-white transition-all duration-100"
          style={{
            width: `${((currentSlide + 1) / STATIC_BANNERS.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
};

// Composant Zone Publicitaire avec animations dynamiques
const AdvertisingZone: React.FC = () => {
  const [currentAd, setCurrentAd] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  // Auto-défilement des publicités
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1); // Force re-render pour animation
      setCurrentAd((prev) => (prev + 1) % DYNAMIC_ADVERTISEMENTS.length);
    }, 4000); // Change toutes les 4 secondes

    return () => clearInterval(interval);
  }, [isPaused]);

  const currentAdvertisement = DYNAMIC_ADVERTISEMENTS[currentAd];

  // Classes d'animation selon le type
  const getAnimationClass = (animation: string) => {
    const baseClasses = "transition-all duration-600 ease-out";
    const animations = {
      slideFromTop: `${baseClasses} animate-[slideFromTop_0.6s_ease-out]`,
      slideFromBottom: `${baseClasses} animate-[slideFromBottom_0.6s_ease-out]`,
      slideFromLeft: `${baseClasses} animate-[slideFromLeft_0.6s_ease-out]`,
      slideFromRight: `${baseClasses} animate-[slideFromRight_0.6s_ease-out]`,
      fadeIn: `${baseClasses} animate-[fadeIn_0.6s_ease-out]`,
      zoomIn: `${baseClasses} animate-[zoomIn_0.6s_ease-out]`
    };
    return animations[animation as keyof typeof animations] || `${baseClasses} animate-[fadeIn_0.6s_ease-out]`;
  };

  return (
    <Link href={currentAdvertisement.link}>
      <div
        className="h-full bg-black relative overflow-hidden cursor-pointer group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Effet de particules en arrière-plan */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 left-2 w-1 h-1 bg-white rounded-full animate-ping"></div>
          <div className="absolute top-8 right-4 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-6 left-6 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-2 right-2 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
        </div>

        {/* Contenu principal avec animation */}
        <div
          key={animationKey}
          className={`h-full flex flex-col justify-center items-center text-center p-1 sm:p-2 md:p-4 ${getAnimationClass(currentAdvertisement.animation)}`}
        >
          {/* Icon avec couleur */}
          <div className={`text-lg sm:text-2xl md:text-4xl mb-1 sm:mb-2 md:mb-3 ${currentAdvertisement.iconColor} transform group-hover:scale-110 transition-transform duration-300`}>
            {currentAdvertisement.icon}
          </div>

          {/* Titre principal */}
          <h3 className="text-white text-[9px] sm:text-xs md:text-sm font-bold mb-1 sm:mb-2 leading-tight">
            {currentAdvertisement.title}
          </h3>

          {/* Sous-titre */}
          <p className="text-gray-300 text-[8px] sm:text-[10px] md:text-xs leading-tight">
            {currentAdvertisement.subtitle}
          </p>

          {/* Effet hover */}
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
        </div>

        {/* Indicateur discret en bas */}
        <div className="absolute bottom-1 sm:bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-0.5 sm:space-x-1">
            {DYNAMIC_ADVERTISEMENTS.map((_, index) => (
              <div
                key={index}
                className={`w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full transition-all duration-300 ${index === currentAd ? 'bg-white' : 'bg-gray-600'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};

// Composant MegaMenuOverlay - Affiche les sous-catégories
interface MegaMenuOverlayProps {
  category: Category;
}

const MegaMenuOverlay: React.FC<MegaMenuOverlayProps> = ({ category }) => {
  // Configuration des groupes (même que dans CategoriesMenu)
  const CATEGORY_GROUPS = {
    'tech': { icon: '💻', color: 'text-blue-400' },
    'mode': { icon: '👗', color: 'text-pink-400' },
    'maison': { icon: '🏠', color: 'text-green-400' },
    'sport': { icon: '⚽', color: 'text-orange-400' },
    'lifestyle': { icon: '🌟', color: 'text-purple-400' },
    'automotive': { icon: '🚗', color: 'text-gray-400' }
  };

  const CATEGORY_TO_GROUP: Record<string, keyof typeof CATEGORY_GROUPS> = {
    'electronique': 'tech', 'telephones-accessoires': 'tech', 'ordinateurs-tablettes': 'tech', 'audio-video': 'tech', 'gaming-vr': 'tech',
    'mode-beaute': 'mode', 'vetements-homme': 'mode', 'vetements-femme': 'mode', 'vetements-enfant': 'mode', 'chaussures': 'mode', 'sacs-maroquinerie': 'mode', 'montres-bijoux': 'mode', 'cosmetiques-soins': 'mode',
    'maison-jardin': 'maison', 'mobilier': 'maison', 'electromenager': 'maison', 'luminaires': 'maison', 'cuisine-salle-bain': 'maison', 'jardinage-outils': 'maison',
    'sport-loisirs': 'sport', 'fitness-musculation': 'sport', 'sports-exterieur': 'sport', 'jeux-jouets': 'sport', 'instruments-musique': 'sport',
    'sante-bien-etre': 'lifestyle', 'bebe-enfant': 'lifestyle', 'livre-papeterie': 'lifestyle', 'voyage-bagages': 'lifestyle', 'animaux-accessoires': 'lifestyle',
    'automobile-moto': 'automotive', 'outils-bricolage': 'automotive'
  };

  const group = CATEGORY_TO_GROUP[category.slug];
  const groupConfig = group ? CATEGORY_GROUPS[group] : null;

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 h-full p-6 animate-in slide-in-from-left-2 duration-300">
      {/* Header du mega menu */}
      <div className="flex items-center mb-6 pb-4 border-b border-gray-100">
        <span className={`text-3xl mr-4 ${groupConfig?.color || 'text-gray-400'}`}>
          {groupConfig?.icon || '📁'}
        </span>
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {category.name}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {category.children?.length || 0} sous-catégories disponibles
          </p>
        </div>
      </div>

      {/* Grille des sous-catégories */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 max-h-[350px] overflow-y-auto">
        {category.children && category.children.length > 0 ? (
          category.children.map((subcategory) => (
            <Link
              key={subcategory.id}
              href={`/category/${subcategory.slug}`}
              className="group"
            >
              <div className="p-4 rounded-lg border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all duration-200 bg-gray-50 hover:bg-white">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 text-sm leading-tight">
                    {subcategory.name}
                  </h3>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full ml-2 flex-shrink-0">
                    {subcategory.product_count || 0}
                  </span>
                </div>
                {subcategory.description && (
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {subcategory.description}
                  </p>
                )}
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">Aucune sous-catégorie disponible</p>
            <p className="text-sm text-gray-400 mt-2">Cette catégorie n'a pas encore de sous-catégories</p>
          </div>
        )}
      </div>

      {/* Bouton "Voir tout" */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <Link href={`/category/${category.slug}`}>
          <div className="w-full text-center p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
            <span className="font-semibold">
              🔍 Voir tous les produits {category.name}
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default HeroCarouselImproved;
