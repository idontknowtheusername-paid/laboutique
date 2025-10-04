'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Sparkles, Gift, Crown, Star, Heart, Eye, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import QuickAddToCart from './QuickAddToCart';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { ProductsService, Product } from '@/lib/services/products.service';

interface PersonalizedProduct {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  comparePrice?: number;
  rating: number;
  reviews: number;
  discount?: number;
  vendor: string;
  category: string;
  personalizationReason: string;
  loyaltyPoints: number;
  isFlashOffer: boolean;
  timeLeft?: number;
}

// Runtime data from backend
const mapToPersonalized = (p: Product, reason: string): PersonalizedProduct => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  image: p.images?.[0] || '/placeholder-product.jpg',
  price: p.price,
  comparePrice: p.compare_price,
  rating: p.average_rating || 0,
  reviews: p.reviews_count || 0,
  discount: p.compare_price && p.compare_price > p.price ? Math.round(((p.compare_price - p.price) / p.compare_price) * 100) : undefined,
  vendor: p.vendor?.name || '',
  category: p.category?.name || '',
  personalizationReason: reason,
  loyaltyPoints: Math.max(1, Math.round(p.price / 1000)),
  isFlashOffer: false
});

const PersonalizedOffers = () => {
  const { addToCart } = useCart();
  const [userLoyaltyPoints, setUserLoyaltyPoints] = useState(2450);
  const [userLevel, setUserLevel] = useState('Gold');
  const [timeLeft, setTimeLeft] = useState(3600);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const itemWidthRef = useRef<number>(240 + 16);
  const rafRef = useRef<number | null>(null);
  const [items, setItems] = useState<PersonalizedProduct[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 3600);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Load personalized items from backend
  useEffect(() => {
    (async () => {
      try {
        // Try to load recently viewed from localStorage
        let recentIds: string[] = [];
        try {
          const raw = localStorage.getItem('recently_viewed_product_ids') || localStorage.getItem('recently_viewed');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) recentIds = parsed.slice(-3).reverse();
          }
        } catch {}

        let recs: Product[] = [];
        if (recentIds.length > 0) {
          // Use getSimilar on the most recent product id
          const similar = await ProductsService.getSimilar(recentIds[0], 10);
          if (similar.success && similar.data) recs = similar.data as Product[];
        }

        if (recs.length === 0) {
          // Fallback: featured then popular
          const featured = await ProductsService.getFeatured(10);
          if (featured.success && featured.data && featured.data.length > 0) {
            recs = featured.data as Product[];
          } else {
            const popular = await ProductsService.getPopular(10);
            if (popular.success && popular.data) recs = popular.data as Product[];
          }
        }

        const reason = recentIds.length > 0 ? 'Basé sur vos vues récentes' : 'Sélection pour vous';
        setItems(recs.map(p => mapToPersonalized(p, reason)));
      } catch {
        setItems([]);
      }
    })();
  }, []);

  // Measure first card width for snapping calculations
  useEffect(() => {
    if (!trackRef.current) return;
    const firstCard = trackRef.current.querySelector('.perso-card') as HTMLElement | null;
    if (firstCard) {
      const rect = firstCard.getBoundingClientRect();
      itemWidthRef.current = rect.width + 16; // include gap estimate
    }
  }, []);

  const scrollByAmount = (amount: number) => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const scrollToIndex = useCallback((index: number) => {
    if (!trackRef.current) return;
    const safeIndex = Math.max(0, Math.min(index, items.length - 1));
    trackRef.current.scrollTo({ left: safeIndex * (itemWidthRef.current), behavior: 'smooth' });
    setCurrent(safeIndex);
  }, [items.length]);

  // Update current index on scroll (throttled)
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const idx = Math.round(el.scrollLeft / itemWidthRef.current);
        if (idx !== current) setCurrent(Math.max(0, Math.min(idx, items.length - 1)));
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [current, items.length, itemWidthRef]);

  // Autoplay
  useEffect(() => {
    if (paused || items.length === 0) return;
    const id = setInterval(() => {
      const next = (current + 1) % items.length;
      scrollToIndex(next);
    }, 4500);
    return () => clearInterval(id);
  }, [current, paused, items.length, scrollToIndex]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Gold': return 'bg-yellow-500';
      case 'Platinum': return 'bg-purple-500';
      case 'Diamond': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Gold': return <Crown className="w-4 h-4" />;
      case 'Platinum': return <Star className="w-4 h-4" />;
      case 'Diamond': return <Sparkles className="w-4 h-4" />;
      default: return <Gift className="w-4 h-4" />;
    }
  };

  return (
    <section className="py-12 bg-gradient-to-br from-blue-50 to-indigo-100" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Recommandé pour vous
              </h2>
            </div>
            <Badge className={`${getLevelColor(userLevel)} text-white`}>
              {getLevelIcon(userLevel)}
              <span className="ml-1">{userLevel}</span>
            </Badge>
          </div>
          
          <Link href="/personalized">
            <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
              Voir toutes les offres
            </Button>
          </Link>
        </div>

        {/* Loyalty Status removed on request */}

        {/* Products Carousel */}
        <div className="relative">
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 hidden md:block">
            <Button variant="outline" size="icon" onClick={() => scrollByAmount(-300)} aria-label="Précédent">‹</Button>
          </div>
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 hidden md:block">
            <Button variant="outline" size="icon" onClick={() => scrollByAmount(300)} aria-label="Suivant">›</Button>
          </div>
          <div
            ref={trackRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none]"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            style={{ scrollbarWidth: 'none' as any }}
          >
          {items.map((product) => (
            <Card key={product.id} className="perso-card group hover-lift card-shadow h-full flex flex-col bg-white border-blue-100 snap-start shrink-0 w-[240px]">
              <div className="relative overflow-hidden">
                {/* Product Image */}
                <div className="aspect-square bg-gray-100 relative">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 50vw, 20vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                {/* Personalization Badge */}
                <div className="absolute top-2 left-2 flex flex-col space-y-1">
                  <Badge className="bg-blue-500 text-white text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Pour vous
                  </Badge>
                  {product.isFlashOffer && (
                    <Badge className="bg-red-500 text-white text-xs animate-pulse">
                      <Zap className="w-3 h-3 mr-1" />
                      Flash
                    </Badge>
                  )}
                </div>
                
                {/* Quick Actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
                  <Button size="icon" variant="secondary" className="w-7 h-7 md:w-8 md:h-8 bg-white/90 hover:bg-white shadow-sm">
                    <Heart className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                  <Button size="icon" variant="secondary" className="w-7 h-7 md:w-8 md:h-8 bg-white/90 hover:bg-white shadow-sm">
                    <Eye className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-3 md:p-4 flex flex-col flex-grow">
                <div className="space-y-1 md:space-y-1.5 flex-grow">
                  {/* Personalization Reason */}
                  <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-center">
                    {product.personalizationReason}
                  </p>

                  {/* Product Name */}
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="font-medium text-xs md:text-sm line-clamp-2 hover:text-jomionstore-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center space-x-1 text-[10px] md:text-xs">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-2.5 h-2.5 ${
                            i < Math.floor(product.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-200 text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-500 truncate">({product.reviews})</span>
                  </div>

                  {/* Price */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-jomionstore-primary text-sm md:text-base truncate">
                        {formatPrice(product.price)}
                      </span>
                      {product.comparePrice && (
                        <span className="text-xs text-gray-500 line-through truncate">
                          {formatPrice(product.comparePrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Loyalty Points */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                      +{product.loyaltyPoints} pts
                    </span>
                    {product.isFlashOffer && product.timeLeft && (
                      <span className="text-red-600 font-medium">
                        {formatTime(product.timeLeft)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Add to Cart - Toujours en bas */}
                <div className="mt-auto pt-2">
                  <QuickAddToCart
                    productId={product.id}
                    productName={product.name}
                    price={product.price}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
          <div className="flex items-center justify-center gap-2 mt-6">
            {items.map((_, i) => (
              <button
                key={i}
                aria-label={`Aller à l'élément ${i + 1}`}
                onClick={() => scrollToIndex(i)}
                className={`h-2 rounded-full transition-all ${i === current ? 'w-6 bg-jomionstore-primary' : 'w-2 bg-blue-200'}`}
              />
            ))}
          </div>
        </div>

        {/* AI Recommendation Footer removed on request */}
      </div>
    </section>
  );
};

export default PersonalizedOffers;

