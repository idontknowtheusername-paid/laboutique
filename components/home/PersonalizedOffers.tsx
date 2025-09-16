'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Sparkles, Gift, Crown, Star, Heart, Eye, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import QuickAddToCart from './QuickAddToCart';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

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

const personalizedProducts: PersonalizedProduct[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max 256GB',
    slug: 'iphone-15-pro-max-256gb',
    image: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 850000,
    comparePrice: 950000,
    rating: 4.8,
    reviews: 324,
    discount: 11,
    vendor: 'Apple Store',
    category: 'Smartphones',
    personalizationReason: 'Basé sur vos recherches récentes',
    loyaltyPoints: 850,
    isFlashOffer: true,
    timeLeft: 3600
  },
  {
    id: '2',
    name: 'AirPods Pro 2ème génération',
    slug: 'airpods-pro-2',
    image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 140000,
    comparePrice: 180000,
    rating: 4.7,
    reviews: 891,
    discount: 22,
    vendor: 'Apple Store',
    category: 'Audio',
    personalizationReason: 'Complète parfaitement votre iPhone',
    loyaltyPoints: 140,
    isFlashOffer: false
  },
  {
    id: '3',
    name: 'MacBook Air M3 13"',
    slug: 'macbook-air-m3-13',
    image: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 720000,
    comparePrice: 850000,
    rating: 4.9,
    reviews: 189,
    discount: 15,
    vendor: 'Apple Store',
    category: 'Ordinateurs',
    personalizationReason: 'Recommandé par nos experts',
    loyaltyPoints: 720,
    isFlashOffer: true,
    timeLeft: 7200
  },
  {
    id: '4',
    name: 'Sony WH-1000XM5 Casque',
    slug: 'sony-wh-1000xm5',
    image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 180000,
    comparePrice: 220000,
    rating: 4.7,
    reviews: 445,
    discount: 18,
    vendor: 'Sony Official',
    category: 'Audio',
    personalizationReason: 'Clients similaires ont aimé',
    loyaltyPoints: 180,
    isFlashOffer: false
  },
  {
    id: '5',
    name: 'Samsung Galaxy S24 Ultra',
    slug: 'samsung-galaxy-s24-ultra',
    image: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 780000,
    comparePrice: 890000,
    rating: 4.6,
    reviews: 256,
    discount: 12,
    vendor: 'Samsung Official',
    category: 'Smartphones',
    personalizationReason: 'Alternative premium recommandée',
    loyaltyPoints: 780,
    isFlashOffer: true,
    timeLeft: 5400
  }
];

const PersonalizedOffers = () => {
  const { addToCart } = useCart();
  const [userLoyaltyPoints, setUserLoyaltyPoints] = useState(2450);
  const [userLevel, setUserLevel] = useState('Gold');
  const [timeLeft, setTimeLeft] = useState(3600);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 3600);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
    <section className="py-12 bg-gradient-to-br from-blue-50 to-indigo-100">
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

        {/* Loyalty Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
            <div className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-600">Points de fidélité</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{userLoyaltyPoints.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Prochain niveau: 500 points</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
            <div className="flex items-center space-x-2">
              <Gift className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Offres exclusives</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">3</p>
            <p className="text-xs text-gray-500 mt-1">Disponibles maintenant</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium text-gray-600">Économies totales</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">125,000 XOF</p>
            <p className="text-xs text-gray-500 mt-1">Ce mois-ci</p>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {personalizedProducts.map((product, index) => (
            <Card key={product.id} className="group hover-lift card-shadow h-full flex flex-col bg-white border-blue-100">
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

              <CardContent className="p-2 md:p-4 flex flex-col flex-grow">
                <div className="space-y-1.5 md:space-y-2 flex-grow">
                  {/* Personalization Reason */}
                  <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-center">
                    {product.personalizationReason}
                  </p>

                  {/* Product Name */}
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="font-medium text-xs md:text-sm line-clamp-2 hover:text-blue-600 transition-colors min-h-[2.5rem] md:min-h-[3rem]">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center space-x-2 text-xs md:text-sm">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-2.5 h-2.5 md:w-3 md:h-3 ${
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
                  <div className="space-y-1">
                    <div className="flex flex-col md:flex-row items-start md:items-center space-y-1 md:space-y-0 md:space-x-2">
                      <span className="font-bold text-blue-600 text-sm md:text-lg">
                        {formatPrice(product.price)}
                      </span>
                      {product.comparePrice && (
                        <span className="text-xs md:text-sm text-gray-500 line-through">
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

                {/* Add to Cart */}
                <div className="mt-2 md:mt-3">
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

        {/* AI Recommendation Footer */}
        <div className="mt-8 bg-white rounded-lg p-4 shadow-sm border border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Recommandations IA</h4>
                <p className="text-sm text-gray-600">Basées sur vos préférences et l'historique d'achat</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50">
              Personnaliser
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PersonalizedOffers;

