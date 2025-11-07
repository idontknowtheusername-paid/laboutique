'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Search, User, Heart, ShoppingCart, Menu, Crown, Package, CreditCard, MapPin, Bell, Settings, TicketPercent, Wallet, Shield, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import ClientSafe from '@/components/ui/client-safe';
import SearchSuggestions from '@/components/search/SearchSuggestions';

import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [advancedSuggestions, setAdvancedSuggestions] = useState<any[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const { getCartItemsCount } = useCart();
  const { user, profile, signOut } = useAuth();
  const pathname = usePathname();
  const [annApi, setAnnApi] = useState<CarouselApi | null>(null);
  const router = useRouter();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoize announcements to prevent re-renders
  const announcements = useMemo(() => [
    {
      id: 'a1',
      title: 'Super Soldes du Week-end',
      subtitle: 'Jusqu\'à -30% sur électronique',
      href: '/category/electronique',
      bg: 'from-jomionstore-primary to-orange-700',
      animation: 'animate-pulse',
      emoji: '🔥'
    },
    {
      id: 'a2',
      title: 'Nouvelles Collections Mode',
      subtitle: 'Tendances 2025 disponibles',
      href: '/category/mode',
      bg: 'from-rose-500 to-pink-600',
      animation: 'animate-bounce',
      emoji: '✨'
    },
    {
      id: 'a3',
      title: 'Maison & Jardin en promo',
      subtitle: 'Équipez votre intérieur',
      href: '/category/maison-jardin',
      bg: 'from-amber-500 to-orange-600',
      animation: '',
      emoji: '🏠'
    },
    {
      id: 'a4',
      title: 'Black Friday Permanent',
      subtitle: 'Prix cassés - Jusqu\'à -70%',
      href: '/flash-sales',
      bg: 'from-gray-900 to-black',
      animation: 'animate-pulse',
      emoji: '⚡'
    },
    {
      id: 'a5',
      title: 'Livraison Gratuite',
      subtitle: 'Partout au Bénin',
      href: '/delivery-info',
      bg: 'from-green-600 to-emerald-700',
      animation: 'animate-bounce',
      emoji: '🚚'
    },
    {
      id: 'a6',
      title: 'Méga Promo Gaming',
      subtitle: 'Setup complet à -50%',
      href: '/category/gaming-vr',
      bg: 'from-purple-600 to-indigo-700',
      animation: 'animate-pulse',
      emoji: '🎮'
    },
  ], []);

  // Suggestions de recherche populaires
  const popularSearches = useMemo(() => [
    'Smartphone', 'Laptop', 'TV', 'Mode', 'Chaussures', 'Sac', 'Montre', 'Parfum',
    'Électronique', 'Maison', 'Jardin', 'Sport', 'Loisirs', 'Beauté', 'Santé'
  ], []);

  useEffect(() => {
    if (!annApi) return;
    const intervalId = setInterval(() => {
      annApi.scrollNext();
    }, 6000);
    return () => clearInterval(intervalId);
  }, [annApi]);

  // Throttled scroll handler for performance
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Gestion des suggestions de recherche dynamiques
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length >= 2) {
        setIsLoadingSuggestions(true);
        try {
          const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=8`);
          const data = await response.json();
          
          if (data.success) {
            setAdvancedSuggestions(data.data.suggestions || []);
            setTrendingSearches(data.data.trending || []);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des suggestions:', error);
          setShowSuggestions(true);
        } finally {
          setIsLoadingSuggestions(false);
        }
      } else {
        setAdvancedSuggestions([]);
        setTrendingSearches([]);
        setShowSuggestions(false);
      }
    };

    // Debounce pour éviter trop de requêtes
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    
    // Validation de la recherche
    if (!trimmedQuery || trimmedQuery.length < 2) {
      return;
    }

    // Validation des caractères spéciaux
    const hasSpecialChars = /[<>:"/\\|?*]/.test(trimmedQuery);
    if (hasSpecialChars) {
      return;
    }

    // Recherche valide - navigation
    setShowSuggestions(false);
    setIsSearchModalOpen(false);
    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
  }, [searchQuery, router]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setIsSearchModalOpen(false);
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
  }, [router]);

  const cartItemsCount = useMemo(() => getCartItemsCount(), [getCartItemsCount]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-gray-200 transition-all duration-300 ${isScrolled ? "shadow-lg" : "shadow-sm"
      }`}
    >
      {/* Announcement Bar - Pleine largeur */}
      <div className="text-white overflow-hidden w-full">
        <Carousel setApi={setAnnApi} opts={{ align: "start", loop: true }}>
          <CarouselContent>
            {announcements.map((a) => (
              <CarouselItem key={a.id} className="basis-full">
                <Link href={a.href} className="block">
                  <div className={`bg-gradient-to-r ${a.bg} flex items-center justify-center text-center px-4 py-1.5 hover:opacity-90 transition-opacity`}>
                    <div className="text-sm md:text-base font-medium text-white">
                      <span className={`inline-block mr-2 ${a.animation}`}>{a.emoji}</span>
                      <span className="font-bold">{a.title}</span>
                      <span className="mx-2">•</span>
                      <span className="opacity-90">{a.subtitle}</span>
                      <span className="ml-3 underline hover:no-underline">Voir →</span>
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Main Header */}
      <div className="container py-3 md:py-4">
        <div className="flex items-center justify-between gap-3 md:gap-6">
          {/* Logo - Plus petit sur mobile */}
          <Link href="/" className="flex items-center header-logo flex-shrink-0">
            <div className="relative w-24 h-16 sm:w-28 sm:h-13 md:w-52 md:h-18 lg:w-100 lg:h-30 rounded-lg overflow-hidden">
              <Image
                src="/images/latestlogo.jpg"
                alt="JomionStore"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, (max-width: 1024px) 192px, 224px"
              />
            </div>
          </Link>

          {/* Search Bar - Desktop only */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-2xl mx-8"
            role="search"
            aria-label="Recherche de produits"
          >
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Rechercher des produits, marques et catégories..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
                onFocus={() => setShowSuggestions(searchQuery.length >= 2)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="pr-14 h-14 text-base border-2 border-gray-200 focus:border-jomionstore-primary rounded-lg"
                aria-label="Champ de recherche de produits"
                aria-describedby="search-help"
                aria-expanded={showSuggestions}
                aria-autocomplete="list"
                role="combobox"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1 h-12 px-5 bg-jomionstore-secondary hover:bg-orange-600 rounded-md"
                aria-label="Lancer la recherche"
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* Suggestions de recherche avancées */}
              {showSuggestions && (
                <SearchSuggestions
                  suggestions={advancedSuggestions}
                  trending={trendingSearches}
                  onSuggestionClick={handleSuggestionClick}
                  onTrendingClick={handleSuggestionClick}
                  isLoading={isLoadingSuggestions}
                />
              )}
            </div>
          </form>

          {/* Mobile Search Input - Inline */}
          <form onSubmit={handleSearch} className="flex-1 md:hidden mx-2">
            <div className="relative">
              <Input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(searchQuery.length >= 2)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="h-11 text-sm pl-3 pr-11 border-2 border-gray-200 focus:border-jomionstore-primary rounded-lg"
                aria-label="Recherche rapide"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-0.5 top-0.5 h-10 px-3 bg-jomionstore-secondary hover:bg-orange-600 rounded-md"
                aria-label="Lancer la recherche"
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* Suggestions de recherche - Mobile */}
              {showSuggestions && (
                <div className="md:hidden">
                  <SearchSuggestions
                    suggestions={advancedSuggestions}
                    trending={trendingSearches}
                    onSuggestionClick={handleSuggestionClick}
                    onTrendingClick={handleSuggestionClick}
                    isLoading={isLoadingSuggestions}
                  />
                </div>
              )}
            </div>
          </form>

          {/* Right Section */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Account or Admin - Desktop only */}
            {profile?.role === "admin" ? (
              <Link href="/admin/dashboard" className="hidden md:block">
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 text-yellow-600 hover:text-yellow-700"
                  title="Admin Dashboard"
                  aria-label="Accéder au tableau de bord administrateur"
                >
                  <Crown className="w-7 h-7" />
                  <span className="hidden lg:block text-base font-medium">
                    Admin
                  </span>
                </Button>
              </Link>
            ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="hidden md:flex items-center space-x-2 text-gray-700 hover:text-jomionstore-primary"
                      aria-label={
                        user
                          ? "Menu du compte utilisateur"
                          : "Se connecter ou créer un compte"
                      }
                      aria-expanded="false"
                    >
                      <User className="w-6 h-6" />
                      <div className="hidden lg:block text-left">
                        <div className="text-sm text-gray-500">
                          {user ? "Connecté" : "Se connecter"}
                        </div>
                        <div className="text-base font-medium">
                          {user
                            ? user.user_metadata?.first_name || "Mon profil"
                            : "Mon compte"}
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {user ? (
                      <>
                        <DropdownMenuItem asChild>
                          <Link
                            href="/account/profile"
                            className="flex items-center gap-2"
                          >
                            <User className="w-4 h-4" />
                            Mon profil
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => signOut()}
                          className="text-red-600 hover:text-red-700"
                        >
                          Se déconnecter
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/auth/login">Se connecter</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/auth/register">Créer un compte</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
            )}

            {/* Wishlist */}
            {profile?.role !== "admin" && (
              <Link href="/wishlist" className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-700 hover:text-jomionstore-primary p-0 h-11 w-11 md:h-12 md:w-12"
                  aria-label="Voir ma liste de souhaits"
                >
                  <Heart className="w-6 h-6 md:w-7 md:h-7" />
                </Button>
              </Link>
            )}

            {/* Cart */}
            <Link href="/cart" className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-700 hover:text-jomionstore-primary p-0 h-11 w-11 md:h-12 md:w-12"
                aria-label={`Voir le panier${
                  cartItemsCount > 0 ? ` (${cartItemsCount} articles)` : ""
                }`}
              >
                <ShoppingCart className="w-6 h-6 md:w-7 md:h-7" />
                {mounted && (
                  <ClientSafe>
                    {cartItemsCount > 0 && (
                      <Badge
                        className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-jomionstore-secondary text-white text-xs px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center"
                        aria-label={`${cartItemsCount} articles dans le panier`}
                      >
                        {cartItemsCount}
                      </Badge>
                    )}
                  </ClientSafe>
                )}
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden p-0 h-11 w-11"
                  aria-label="Ouvrir le menu de navigation mobile"
                >
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Menu de navigation</SheetTitle>
                </SheetHeader>
                <MobileMenu />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

const MobileMenu = () => {
  const { user, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Catégories organisées
  const menuCategories = [
    {
      id: 'shopping',
      title: 'Shopping',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      items: [
        { href: '/account/orders', label: 'Mes Commandes', icon: Package },
        { href: '/account/wishlist', label: 'Ma Wishlist', icon: Heart },
        { href: '/account/returns', label: 'Retours & SAV', icon: FileText },
      ]
    },
    {
      id: 'wallet',
      title: 'Finances',
      icon: Wallet,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      items: [
        { href: '/account/wallet', label: 'Mon Wallet', icon: Wallet },
        { href: '/account/coupons', label: 'Mes Coupons', icon: TicketPercent },
        { href: '/account/points', label: 'Points Fidélité', icon: Shield },
        { href: '/account/payment-methods', label: 'Moyens de paiement', icon: CreditCard },
      ]
    },
    {
      id: 'account',
      title: 'Mon Compte',
      icon: Settings,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      items: [
        { href: '/account', label: 'Paramètres', icon: Settings },
        { href: '/account/addresses', label: 'Mes Adresses', icon: MapPin },
        { href: '/account/notifications', label: 'Notifications', icon: Bell },
        { href: '/account/invoices', label: 'Factures', icon: FileText },
      ]
    }
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const toggleSection = (sectionId: string) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* En-tête utilisateur amélioré */}
      <div className="bg-gradient-to-r from-jomionstore-primary to-orange-600 p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
            <User className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-lg">
              Bonjour, {user?.user_metadata?.first_name || 'Visiteur'} 👋
            </div>
            <div className="text-sm text-white/80 truncate">
              {user ? user.email : 'Accédez à votre compte'}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {user ? (
          <>
            {/* Catégories avec items */}
            {menuCategories.map((category) => {
              const CategoryIcon = category.icon;
              const isActive = activeSection === category.id;
              
              return (
                <div key={category.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* Header de catégorie */}
                  <button
                    onClick={() => toggleSection(category.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${category.bgColor} flex items-center justify-center`}>
                        <CategoryIcon className={`w-5 h-5 ${category.color}`} />
                      </div>
                      <span className="font-semibold text-gray-900">{category.title}</span>
                    </div>
                    <X 
                      className={`w-5 h-5 text-gray-400 transition-transform ${isActive ? 'rotate-45' : 'rotate-0'}`}
                    />
                  </button>

                  {/* Items de la catégorie */}
                  {isActive && (
                    <div className="border-t border-gray-100">
                      {category.items.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                          >
                            <div className="flex items-center gap-3">
                              <ItemIcon className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700">{item.label}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Liens d'aide en mode compact */}
            <div className="bg-white rounded-xl shadow-sm p-3 space-y-1">
              <Link href="/help" className="flex items-center gap-3 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                <span>Centre d&apos;aide</span>
              </Link>
              <Link href="/about" className="flex items-center gap-3 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                <span>À propos</span>
              </Link>
              <Link href="/contact" className="flex items-center gap-3 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                <span>Contact</span>
              </Link>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <Link href="/auth/login">
              <Button className="w-full bg-jomionstore-primary hover:bg-jomionstore-primary/90 text-white font-medium py-3 rounded-lg">
                Se connecter
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline" className="w-full border-2 border-gray-300 hover:border-jomionstore-primary text-gray-700 font-medium py-3 rounded-lg">
                Créer un compte
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Footer avec bouton de déconnexion fixe */}
      {user && (
        <div className="p-4 bg-white border-t border-gray-200">
          <Button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg"
          >
            Se déconnecter
          </Button>
        </div>
      )}
    </div>
  );
};

export default Header;