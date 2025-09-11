'use client';

import React, { useState } from 'react';
import { Mail, Gift, Truck, Shield, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  const features = [
    {
      icon: Truck,
      title: 'Livraison Gratuite',
      description: 'À Cotonou et environs dès 25,000 FCFA'
    },
    {
      icon: Shield,
      title: 'Paiement Sécurisé',
      description: 'Vos transactions sont protégées'
    },
    {
      icon: Gift,
      title: 'Offres Exclusives',
      description: 'Promotions réservées aux membres'
    },
    {
      icon: Headphones,
      title: 'Support 24/7',
      description: 'Assistance client disponible'
    }
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container">
        {/* Newsletter */}
        <div className="bg-gradient-to-r from-beshop-primary to-blue-600 rounded-xl p-8 md:p-12 text-white text-center mb-12">
          <div className="max-w-2xl mx-auto">
            <Mail className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Restez informé de nos offres
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Abonnez-vous à notre newsletter et recevez des offres exclusives, les nouveautés et des codes promo directement dans votre boîte mail
            </p>
            
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row max-w-md mx-auto space-y-3 sm:space-y-0 sm:space-x-3">
              <Input
                type="email"
                placeholder="Votre adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white text-gray-900 border-0 h-12"
                required
              />
              <Button 
                type="submit"
                className="bg-beshop-secondary hover:bg-orange-600 px-8 h-12 font-semibold"
              >
                S'abonner
              </Button>
            </form>
            
            <p className="text-sm mt-4 opacity-75">
              En vous abonnant, vous acceptez de recevoir nos emails marketing. Vous pouvez vous désabonner à tout moment.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="text-center p-6 hover-lift">
                <CardContent className="space-y-4">
                  <div className="w-16 h-16 bg-beshop-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <IconComponent className="w-8 h-8 text-beshop-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;