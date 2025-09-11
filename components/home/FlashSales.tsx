'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Star, ShoppingCart, Eye, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface FlashProduct {
  id: string;
  name: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
  rating: number;
  reviews: number;
  sold: number;
  stock: number;
  slug: string;
}

const flashProducts: FlashProduct[] = [
  {
    id: '1',
    name: 'Smartphone Samsung Galaxy A54',
    image: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400',
    originalPrice: 250000,
    salePrice: 180000,
    discount: 28,
    rating: 4.5,
    reviews: 324,
    sold: 89,
    stock: 150,
    slug: 'samsung-galaxy-a54'
  },
  {
    id: '2',
    name: 'MacBook Air M2',
    image: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=400',
    originalPrice: 850000,
    salePrice: 720000,
    discount: 15,
    rating: 4.8,
    reviews: 156,
    sold: 42,
    stock: 80,
    slug: 'macbook-air-m2'
  },
  {
    id: '3',
    name: 'AirPods Pro 2ème génération',
    image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400',
    originalPrice: 180000,
    salePrice: 140000,
    discount: 22,
    rating: 4.7,
    reviews: 891,
    sold: 156,
    stock: 200,
    slug: 'airpods-pro-2'
  },
  {
    id: '4',
    name: 'TV Smart LG 55" 4K',
    image: 'https://images.pexels.com/photos/1444416/pexels-photo-1444416.jpeg?auto=compress&cs=tinysrgb&w=400',
    originalPrice: 450000,
    salePrice: 350000,
    discount: 22,
    rating: 4.4,
    reviews: 267,
    sold: 73,
    stock: 120,
    slug: 'tv-lg-55-4k'
  },
  {
    id: '5',
    name: 'PlayStation 5 Console',
    image: 'https://images.pexels.com/photos/9820190/pexels-photo-9820190.jpeg?auto=compress&cs=tinysrgb&w=400',
    originalPrice: 420000,
    salePrice: 380000,
    discount: 10,
    rating: 4.9,
    reviews: 523,
    sold: 198,
    stock: 60,
    slug: 'playstation-5'
  },
];

const FlashSales = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 45,
    seconds: 30
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-BJ', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-gradient-to-r from-beshop-secondary to-orange-600 rounded-xl p-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-3xl font-bold">Flash Sales</h2>
          <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">Se termine dans:</span>
            <div className="flex space-x-1">
              <span className="bg-white text-beshop-secondary px-2 py-1 rounded font-bold min-w-[2rem] text-center">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="bg-white text-beshop-secondary px-2 py-1 rounded font-bold min-w-[2rem] text-center">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="bg-white text-beshop-secondary px-2 py-1 rounded font-bold min-w-[2rem] text-center">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
        
        <Link href="/flash-sales">
          <Button variant="secondary" className="bg-white text-beshop-secondary hover:bg-gray-100">
            Voir tout
          </Button>
        </Link>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {flashProducts.map((product) => {
          const progressPercentage = (product.sold / (product.sold + product.stock)) * 100;
          
          return (
            <Card key={product.id} className="group hover-lift card-shadow bg-white text-gray-900 overflow-hidden">
              <div className="relative">
                {/* Product Image */}
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                {/* Discount Badge */}
                <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                  -{product.discount}%
                </Badge>
                
                {/* Quick Actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
                  <Button size="icon" variant="secondary" className="w-8 h-8 bg-white/90 hover:bg-white">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="secondary" className="w-8 h-8 bg-white/90 hover:bg-white">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                {/* Product Name */}
                <Link href={`/product/${product.slug}`}>
                  <h3 className="font-medium text-sm line-clamp-2 hover:text-beshop-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center space-x-2 text-sm">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(product.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-500">({product.reviews})</span>
                </div>

                {/* Prices */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-beshop-primary text-lg">
                      {formatPrice(product.salePrice)}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  </div>
                </div>

                {/* Stock Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Vendu: {product.sold}</span>
                    <span>Stock: {product.stock}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-beshop-secondary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Button className="w-full bg-beshop-primary hover:bg-blue-700">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Ajouter au panier
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default FlashSales;