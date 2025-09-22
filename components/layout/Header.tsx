'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, User, Heart, ShoppingCart, Menu, X } from 'lucide-react';
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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import ClientSafe from '@/components/ui/client-safe';

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getCartItemsCount } = useCart();
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [annApi, setAnnApi] = useState<CarouselApi | null>(null);
  const router = useRouter();

  // Memoize announcements to prevent re-renders
  const announcements = useMemo(() => [
    {
      id: 'a1',
      title: 'Super Soldes du Week-end',
      subtitle: 'Jusqu'à -30% sur électronique',
      href: '/category/electronique',
      bg: 'from-beshop-primary to-blue-600',
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

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }, [searchQuery, router]);

  const cartItemsCount = useMemo(() => getCartItemsCount(), [getCartItemsCount]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${
        isScrolled ? "shadow-md" : "shadow-sm"
      }`}
    >
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-beshop-primary to-blue-600 text-white py-2">
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
      </div>

      {/* Main Header */}
      <div className="container py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-beshop-primary">
                Be Shop
              </h1>
              <p className="text-xs text-gray-500 -mt-1">
                Elite Shopping Experience
              </p>
            </div>
          </Link>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-2xl mx-8"
          >
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Rechercher des produits, marques et catégories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-12 h-12 text-base border-2 border-gray-200 focus:border-beshop-primary"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1 h-10 px-4 bg-beshop-secondary hover:bg-orange-600"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </form>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Account */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 text-gray-700 hover:text-beshop-primary"
                >
                  <User className="w-5 h-5" />
                  <div className="hidden lg:block text-left">
                    <div className="text-xs text-gray-500">
                      {user ? "Bonjour" : "Se connecter"}
                    </div>
                    <div className="text-sm font-medium">
                      {user ? user.user_metadata?.first_name || "Mon compte" : "Mon compte"}
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {user ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/account">Mon profil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/orders">Mes commandes</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/wishlist">Ma liste de souhaits</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
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

            {/* Wishlist */}
            <Link href="/wishlist" className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-700 hover:text-beshop-primary"
              >
                <Heart className="w-6 h-6" />
              </Button>
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-700 hover:text-beshop-primary"
              >
                <ShoppingCart className="w-6 h-6" />
                <ClientSafe>
                  {cartItemsCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-beshop-secondary text-white text-xs px-2 py-1">
                      {cartItemsCount}
                    </Badge>
                  )}
                </ClientSafe>
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <MobileMenu />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="md:hidden mt-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-12 h-10 border-2 border-gray-200 focus:border-beshop-primary"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1 top-1 h-8 px-3 bg-beshop-secondary hover:bg-orange-600"
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

  return (
    <div className="flex flex-col space-y-4 p-4">
      <div className="flex items-center space-x-2 pb-4 border-b">
        <User className="w-8 h-8 text-beshop-primary" />
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
          <Link href="/account" className="py-2 text-gray-700 hover:text-beshop-primary">
            Mon profil
          </Link>
          <Link href="/account/orders" className="py-2 text-gray-700 hover:text-beshop-primary">
            Mes commandes
          </Link>
          <Link href="/account/wishlist" className="py-2 text-gray-700 hover:text-beshop-primary">
            Ma liste de souhaits
          </Link>
          <Button onClick={() => signOut()} variant="outline" className="mt-4">
            Se déconnecter
          </Button>
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
        <Link href="/help" className="py-2 text-gray-700 hover:text-beshop-primary block">
          Centre d'aide
        </Link>
        <Link href="/about" className="py-2 text-gray-700 hover:text-beshop-primary block">
          À propos
        </Link>
        <Link href="/contact" className="py-2 text-gray-700 hover:text-beshop-primary block">
          Contact
        </Link>
      </div>
    </div>
  );
};

export default Header;