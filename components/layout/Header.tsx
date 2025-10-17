'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, User, Heart, ShoppingCart, Menu, X, Crown, Package, CreditCard, MapPin, Bell, Settings, TicketPercent, Wallet, Shield, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  useMobileViewport, 
  useTouchGestures,
  MobileSpacing 
} from '@/components/mobile/MobileOptimizations';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import ClientSafe from '@/components/ui/client-safe';
import SearchSuggestions from '@/components/search/SearchSuggestions';

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [advancedSuggestions, setAdvancedSuggestions] = useState<any[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const { getCartItemsCount } = useCart();
  const { user, profile, signOut } = useAuth();
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [annApi, setAnnApi] = useState<CarouselApi | null>(null);
  const router = useRouter();
  
  // Mobile optimizations
  const { isMobile, isTablet } = useMobileViewport();
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useTouchGestures();

  // Memoize announcements to prevent re-renders
  const announcements = useMemo(() => [
    {
      id: 'a1',
      title: 'Super Soldes du Week-end',
      subtitle: 'Jusqu\'à -30% sur électronique',
      href: '/category/electronique',
      bg: 'from-jomionstore-primary to-orange-700',
    },
    {
      id: 'a2',
      title: 'Nouvelles Collections Mode',
      subtitle: 'Tendances 2025 disponibles',
      href: '/category/mode',
      bg: 'from-rose-500 to-pink-600',
    },
    {
      id: 'a3',
      title: 'Maison & Jardin en promo',
      subtitle: 'Équipez votre intérieur',
      href: '/category/maison-jardin',
      bg: 'from-amber-500 to-orange-600',
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
          // Fallback sur les suggestions statiques
          const filtered = popularSearches.filter(term => 
            term.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setSearchSuggestions(filtered.slice(0, 5));
          setShowSuggestions(true);
        } finally {
          setIsLoadingSuggestions(false);
        }
      } else {
        setAdvancedSuggestions([]);
        setTrendingSearches([]);
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    };

    // Debounce pour éviter trop de requêtes
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, popularSearches]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    
    // Validation de la recherche
    if (!trimmedQuery) {
      // Feedback visuel pour recherche vide
      const input = e.currentTarget.querySelector('input');
      if (input) {
        input.style.borderColor = '#ef4444';
        input.style.backgroundColor = '#fef2f2';
        setTimeout(() => {
          input.style.borderColor = '';
          input.style.backgroundColor = '';
        }, 2000);
      }
      return;
    }

    // Validation de la longueur minimale
    if (trimmedQuery.length < 2) {
      // Feedback pour recherche trop courte
      const input = e.currentTarget.querySelector('input');
      if (input) {
        input.style.borderColor = '#f59e0b';
        input.style.backgroundColor = '#fffbeb';
        setTimeout(() => {
          input.style.borderColor = '';
          input.style.backgroundColor = '';
        }, 2000);
      }
      return;
    }

    // Validation des caractères spéciaux
    const hasSpecialChars = /[<>:"/\\|?*]/.test(trimmedQuery);
    if (hasSpecialChars) {
      // Feedback pour caractères invalides
      const input = e.currentTarget.querySelector('input');
      if (input) {
        input.style.borderColor = '#dc2626';
        input.style.backgroundColor = '#fef2f2';
        setTimeout(() => {
          input.style.borderColor = '';
          input.style.backgroundColor = '';
        }, 2000);
      }
      return;
    }

    // Recherche valide - navigation
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
  }, [searchQuery, router]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
  }, [router]);

  const cartItemsCount = useMemo(() => getCartItemsCount(), [getCartItemsCount]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${
        isScrolled ? "shadow-md" : "shadow-sm"
      }`}
    >
      {/* Announcement Bar - TEMPORAIREMENT MASQUÉ */}
      {/* <div className="bg-gradient-to-r from-jomionstore-primary to-orange-700 text-white py-2">
        <div className="container relative">
          <Carousel setApi={setAnnApi} opts={{ align: "start", loop: true }}>
            <CarouselContent>
              {announcements.map((a) => (
                <CarouselItem key={a.id} className="basis-full">
                  <Link href={a.href} className="block">
                    <div className="flex items-center justify-center text-center px-4 py-2">
                      <div className="text-base md:text-lg font-medium">
                        <span className="font-bold">{a.title}</span>
                        <span className="mx-2">•</span>
                        <span className="opacity-90">{a.subtitle}</span>
                        <span className="ml-3 underline">Voir</span>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div> */}

      {/* Main Header */}
      <div className="container py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Nom seulement */}
          <Link href="/" className="flex items-center">
            <div>
              <h1 className="text-2xl font-bold text-jomionstore-primary">
                JomionStore
              </h1>
              <p className="text-xs text-gray-500 -mt-1">
                Centre commercial digital
              </p>
            </div>
          </Link>

          {/* Search Bar */}
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(searchQuery.length >= 2)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="pr-12 h-12 text-base border-2 border-gray-200 focus:border-jomionstore-primary rounded-lg"
                aria-label="Champ de recherche de produits"
                aria-describedby="search-help"
                aria-expanded={showSuggestions}
                aria-autocomplete="list"
                role="combobox"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1 h-10 px-4 bg-jomionstore-secondary hover:bg-orange-600 rounded-md"
                aria-label="Lancer la recherche"
              >
                <Search className="w-4 h-4" />
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

          {/* Right Section */}

          <div className="flex items-center space-x-4">
            {/* Account or Admin */}
            {profile?.role === 'admin' ? (
              // Admin: Crown icon, direct link to dashboard, no dropdown
              <Link href="/admin/dashboard">
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 text-yellow-600 hover:text-yellow-700"
                  title="Admin Dashboard"
                  aria-label="Accéder au tableau de bord administrateur"
                >
                  <Crown className="w-6 h-6" />
                  <span className="hidden lg:block text-sm font-medium">Admin</span>
                </Button>
              </Link>
            ) : (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2 text-gray-700 hover:text-jomionstore-primary"
                      aria-label={user ? "Menu du compte utilisateur" : "Se connecter ou créer un compte"}
                      aria-expanded="false"
                    >
                      <User className="w-5 h-5" />
                      <div className="hidden lg:block text-left">
                        <div className="text-xs text-gray-500">
                          {user ? "Connecté" : "Se connecter"}
                        </div>
                        <div className="text-sm font-medium">
                          {user ? user.user_metadata?.first_name || "Mon profil" : "Mon compte"}
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {user ? (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/account/profile" className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Mon profil
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => signOut()} className="text-red-600 hover:text-red-700">
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
              </>
            )}

            {/* Wishlist (hide for admin) */}
            {profile?.role !== 'admin' && (
              <Link href="/wishlist" className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-700 hover:text-jomionstore-primary"
                  aria-label="Voir ma liste de souhaits"
                >
                  <Heart className="w-6 h-6" />
                </Button>
              </Link>
            )}

            {/* Cart */}
            <Link href="/cart" className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-700 hover:text-jomionstore-primary"
                aria-label={`Voir le panier${cartItemsCount > 0 ? ` (${cartItemsCount} articles)` : ''}`}
              >
                <ShoppingCart className="w-6 h-6" />
                <ClientSafe>
                  {cartItemsCount > 0 && (
                    <Badge 
                      className="absolute -top-2 -right-2 bg-jomionstore-secondary text-white text-xs px-2 py-1"
                      aria-label={`${cartItemsCount} articles dans le panier`}
                    >
                      {cartItemsCount}
                    </Badge>
                  )}
                </ClientSafe>
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden"
                  aria-label="Ouvrir le menu de navigation mobile"
                >
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>Menu de navigation</SheetTitle>
                </SheetHeader>
                <MobileMenu />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search */}
        <form 
          onSubmit={handleSearch} 
          className="md:hidden mt-4"
          role="search"
          aria-label="Recherche de produits mobile"
        >
          <div className="relative">
            <Input
              type="text"
              placeholder="Rechercher des produits, marques et catégories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-12 h-10 border-2 border-gray-200 focus:border-jomionstore-primary rounded-lg"
              aria-label="Champ de recherche de produits mobile"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1 top-1 h-8 px-3 bg-jomionstore-secondary hover:bg-orange-600 rounded-md"
              aria-label="Lancer la recherche mobile"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </header>
  );
};

const MobileMenu = () => {
  const { user, signOut } = useAuth();

  // Navigation items from account layout
  const accountNavItems = [
    { href: '/account', label: 'Tableau de bord', icon: Settings },
    { href: '/account/orders', label: 'Commandes', icon: Package },
    { href: '/account/returns', label: 'Retours', icon: FileText },
    { href: '/account/coupons', label: 'Coupons', icon: TicketPercent },
    { href: '/account/wallet', label: 'Wallet', icon: Wallet },
    { href: '/account/points', label: 'Points', icon: Shield },
    { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
    { href: '/account/payment-methods', label: 'Paiements', icon: CreditCard },
    { href: '/account/addresses', label: 'Adresses', icon: MapPin },
    { href: '/account/notifications', label: 'Notifications', icon: Bell },
    { href: '/account/invoices', label: 'Factures', icon: FileText },
  ];

  return (
    <div className="flex flex-col space-y-4 p-4">
      <div className="flex items-center space-x-2 pb-4 border-b">
        <User className="w-8 h-8 text-jomionstore-primary" />
        <div>
          <div className="font-medium">
            {user ? `${user.user_metadata?.first_name || 'Mon compte'}` : 'Se connecter'}
          </div>
          <div className="text-sm text-gray-500">
            {user ? user.email : 'Accédez à votre compte'}
          </div>
        </div>
      </div>

      {user ? (
        <>
          {/* Account Navigation - Same as dashboard */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Mon compte</h3>
            {accountNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className="flex items-center gap-3 py-2 px-3 text-gray-700 hover:text-jomionstore-primary hover:bg-gray-50 rounded-md"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>
          
          <div className="pt-4 border-t">
            <Button onClick={() => signOut()} variant="outline" className="w-full">
              Se déconnecter
            </Button>
          </div>
        </>
      ) : (
        <>
          <Link href="/auth/login">
            <Button className="w-full btn-primary">Se connecter</Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="outline" className="w-full">Créer un compte</Button>
          </Link>
        </>
      )}

      <div className="pt-4 border-t">
        <Link href="/help" className="py-2 text-gray-700 hover:text-jomionstore-primary block">
          Centre d'aide
        </Link>
        <Link href="/about" className="py-2 text-gray-700 hover:text-jomionstore-primary block">
          À propos
        </Link>
        <Link href="/contact" className="py-2 text-gray-700 hover:text-jomionstore-primary block">
          Contact
        </Link>
      </div>
    </div>
  );
};

export default Header;