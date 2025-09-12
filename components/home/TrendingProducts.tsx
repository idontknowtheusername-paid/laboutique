'use client';

import React from 'react';
import { TrendingUp, Star, Eye, ShoppingCart, Heart } from 'lucide-react';
import Link from 'next/link';
import QuickAddToCart from './QuickAddToCart';

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
  return (
    <section className="py-12 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              🔥 Tendances du Moment
            </h2>
            <span className="bg-red-500 text-white px-2 py-1 rounded text-sm animate-pulse">
              HOT
            </span>
          </div>

          <Link href="/trending" className="border border-purple-200 text-purple-700 hover:bg-purple-50 px-4 py-2 rounded-lg transition-colors">
            Voir toutes les tendances
          </Link>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4 md:gap-6">
          {trendingProducts.map((product) => (
            <Link key={product.id} href={`/product/${product.slug}`} className="group hover-lift card-shadow h-full flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer">
              <div className="relative overflow-hidden">
                <div className="aspect-square bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="absolute top-2 left-2">
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center">
                    🔥 {product.trendScore}%
                  </span>
                </div>

                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="w-7 h-7 md:w-8 md:h-8 bg-white/90 hover:bg-white shadow-sm rounded flex items-center justify-center"
                  >
                    <Heart className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="w-7 h-7 md:w-8 md:h-8 bg-white/90 hover:bg-white shadow-sm rounded flex items-center justify-center"
                  >
                    <Eye className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                </div>
              </div>

              <div className="p-2 md:p-4 flex flex-col flex-grow">
                <div className="space-y-1.5 md:space-y-2 flex-grow">
                  <p className="text-xs text-gray-500 uppercase tracking-wide truncate">
                    {product.vendor}
                  </p>

                  <h3 className="font-medium text-xs md:text-sm hover:text-beshop-primary transition-colors min-h-[2.5rem] md:min-h-[3rem] overflow-hidden">
                    {product.name}
                  </h3>

                  <div className="flex items-center space-x-1 text-xs">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-2.5 h-2.5 ${i < Math.floor(product.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200'
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-500 text-xs truncate">({product.reviews})</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-1 lg:space-x-2">
                      <span className="font-bold text-beshop-primary text-xs md:text-sm lg:text-lg truncate">
                        {new Intl.NumberFormat('fr-BJ', {
                          style: 'currency',
                          currency: 'XOF',
                          minimumFractionDigits: 0,
                        }).format(product.price)}
                      </span>
                      {product.comparePrice && (
                        <span className="text-xs text-gray-500 line-through truncate">
                          {new Intl.NumberFormat('fr-BJ', {
                            style: 'currency',
                            currency: 'XOF',
                            minimumFractionDigits: 0,
                          }).format(product.comparePrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-2">
                  <QuickAddToCart
                    productId={product.id}
                    productName={product.name}
                    price={product.price}
                    onAddToCart={(productId, quantity) => {
                      // TODO: Implement actual cart functionality with useCart hook
                      console.log(`Added ${quantity} of product ${productId} to cart`);
                    }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;