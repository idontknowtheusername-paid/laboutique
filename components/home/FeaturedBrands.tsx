'use client';

import React from 'react';
import { Card } from '@/components/ui/card';

const brands = [
  { name: 'Apple', logo: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=100', products: '1,250+' },
  { name: 'Samsung', logo: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=100', products: '2,100+' },
  { name: 'Nike', logo: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=100', products: '850+' },
  { name: 'Adidas', logo: 'https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=100', products: '720+' },
  { name: 'Sony', logo: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=100', products: '650+' },
  { name: 'LG', logo: 'https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg?auto=compress&cs=tinysrgb&w=100', products: '890+' },
  { name: 'Dell', logo: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=100', products: '450+' },
  { name: 'HP', logo: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=100', products: '380+' },
  { name: 'Canon', logo: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=100', products: '320+' },
  { name: 'Chanel', logo: 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=100', products: '180+' },
  { name: 'Dior', logo: 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=100', products: '150+' },
  { name: 'Gucci', logo: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=100', products: '120+' }
];

const FeaturedBrands = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Marques Partenaires
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Nous travaillons avec les meilleures marques mondiales pour vous offrir des produits authentiques et de qualité supérieure
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {brands.map((brand, index) => (
            <Card key={index} className="group hover-lift card-shadow p-6 text-center bg-white">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full overflow-hidden">
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-beshop-primary transition-colors">
                    {brand.name}
                  </h3>
                  <p className="text-sm text-gray-500">{brand.products} produits</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-12 p-6 bg-gradient-to-r from-beshop-primary to-blue-600 rounded-xl text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">1200+</div>
              <div className="text-sm opacity-90">Marques partenaires</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">50K+</div>
              <div className="text-sm opacity-90">Produits disponibles</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">24h</div>
              <div className="text-sm opacity-90">Livraison express</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">99%</div>
              <div className="text-sm opacity-90">Clients satisfaits</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBrands;