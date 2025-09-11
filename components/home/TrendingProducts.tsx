'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Fire, Star, Eye, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface TrendingProduct {
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
  trendScore: number;
  hashtags: string[];
  views: number;
  sales: number;
}

const trendingProducts: TrendingProduct[] = [
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
    trendScore: 95,
    hashtags: ['#iPhone15', '#ProMax', '#Tendance'],
    views: 12500,
    sales: 89
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
    trendScore: 88,
    hashtags: ['#AirPods', '#Audio', '#Apple'],
    views: 8900,
    sales: 156
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
    trendScore: 92,
    hashtags: ['#MacBook', '#M3', '#Productivité'],
    views: 11200,
    sales: 42
  },
  {
    id: '4',
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
    trendScore: 85,
    hashtags: ['#GalaxyS24', '#Samsung', '#Ultra'],
    views: 9800,
    sales: 67
  },
  {
    id: '5',
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
    trendScore: 78,
    hashtags: ['#Sony', '#NoiseCancelling', '#Audio'],
    views: 7200,
    sales: 34
  }
];

const TrendingProducts = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setItemsToShow(2);
      else if (width < 1024) setItemsToShow(3);
      else setItemsToShow(4);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTrendIcon = (score: number) => {
    if (score >= 90) return <Fire className="w-4 h-4 text-red-500" />;
    if (score >= 80) return <TrendingUp className="w-4 h-4 text-orange-500" />;
    return <Star className="w-4 h-4 text-yellow-500" />;
  };

  const getTrendColor = (score: number) => {
    if (score >= 90) return 'bg-red-500';
    if (score >= 80) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  return (
    <section className="py-12 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Fire className="w-6 h-6 text-red-500" />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Tendances du Moment
              </h2>
            </div>
            <Badge className="bg-red-500 text-white animate-pulse">
              🔥 HOT
            </Badge>
          </div>
          
          <Link href="/trending">
            <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
              Voir toutes les tendances
            </Button>
          </Link>
        </div>

        {/* Trending Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-100">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Produits tendance</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">+24%</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-100">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">Vues totales</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">49.6K</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-100">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium text-gray-600">Ventes</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">388</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-100">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-600">Note moyenne</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">4.7</p>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {trendingProducts.map((product, index) => (
            <Card key={product.id} className="group hover-lift card-shadow h-full flex flex-col bg-white border-purple-100">
              <div className="relative overflow-hidden">
                {/* Product Image */}
                <div className="aspect-square bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                {/* Trend Badge */}
                <div className="absolute top-2 left-2 flex items-center space-x-1">
                  <Badge className={`${getTrendColor(product.trendScore)} text-white text-xs`}>
                    {getTrendIcon(product.trendScore)}
                    <span className="ml-1">{product.trendScore}%</span>
                  </Badge>
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
                  {/* Hashtags */}
                  <div className="flex flex-wrap gap-1">
                    {product.hashtags.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="text-xs text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Product Name */}
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="font-medium text-xs md:text-sm line-clamp-2 hover:text-purple-600 transition-colors min-h-[2.5rem] md:min-h-[3rem]">
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
                      <span className="font-bold text-purple-600 text-sm md:text-lg">
                        {formatPrice(product.price)}
                      </span>
                      {product.comparePrice && (
                        <span className="text-xs md:text-sm text-gray-500 line-through">
                          {formatPrice(product.comparePrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Trend Stats */}
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>👁️ {product.views.toLocaleString()}</span>
                    <span>🛒 {product.sales}</span>
                  </div>
                </div>

                {/* Add to Cart */}
                <div className="mt-2 md:mt-3">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-xs md:text-sm h-8 md:h-10">
                    <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;
