'use client';

import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email);
    setEmail('');
  };


  return (
    <section className="py-12 bg-white">
      <div className="container">
        {/* Newsletter */}
        <div className="bg-gradient-to-r from-jomionstore-primary to-blue-600 rounded-xl p-8 md:p-12 text-white text-center mb-12">
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
                className="bg-jomionstore-secondary hover:bg-orange-600 px-8 h-12 font-semibold"
              >
                S'abonner
              </Button>
            </form>
            
            <p className="text-sm mt-4 opacity-75">
              En vous abonnant, vous acceptez de recevoir nos emails marketing. Vous pouvez vous désabonner à tout moment.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default NewsletterSection;