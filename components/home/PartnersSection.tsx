'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

const PartnersSection = () => {
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const partners = [
    {
      name: "Alibaba",
      logo: "/images/partners/alibaba.jpg",
      category: "Marketplace",
      description: "Plateforme B2B mondiale",
    },
    {
      name: "AliExpress",
      logo: "/images/partners/aliexpress.jpg",
      category: "E-commerce",
      description: "Marketplace international",
    },
    {
      name: "MTN",
      logo: "/images/partners/mtn.png",
      category: "Télécoms",
      description: "Opérateur mobile",
    },
    {
      name: "Moov",
      logo: "/images/partners/moov.jpg",
      category: "Télécoms",
      description: "Opérateur mobile",
    },
    {
      name: "Visa",
      logo: "/images/partners/visa.jpg",
      category: "Paiement",
      description: "Cartes de crédit",
    },
    {
      name: "Mastercard",
      logo: "/images/partners/mastercard.jpg",
      category: "Paiement",
      description: "Cartes de crédit",
    },
    {
      name: "PayPal",
      logo: "/images/partners/paypal.jpg",
      category: "Paiement",
      description: "Paiement en ligne",
    },
    {
      name: "DHL",
      logo: "/images/partners/dhl.jpg",
      category: "Logistique",
      description: "Transport express",
    },
    {
      name: "FedEx",
      logo: "/images/partners/fedex.jpg",
      category: "Logistique",
      description: "Services de livraison",
    },
    {
      name: "Samsung",
      logo: "/images/partners/samsung.jpg",
      category: "Électronique",
      description: "Technologie",
    },
    {
      name: "Apple",
      logo: "/images/partners/apple.jpg",
      category: "Électronique",
      description: "Technologie",
    },
    {
      name: "Nike",
      logo: "/images/partners/nike.jpg",
      category: "Mode",
      description: "Équipement sportif",
    },
  ];

  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 text-orange-600 border-orange-200 bg-orange-50">
            Nos Partenaires
          </Badge>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-12">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="flex items-center justify-center"
            >
              <div className="relative w-full h-20">
                {imageErrors.has(index) ? (
                  <div className="flex items-center justify-center w-full h-full">
                    <span className="text-2xl font-bold text-gray-400">{partner.name.charAt(0)}</span>
                  </div>
                ) : (
                  <Image
                    src={partner.logo}
                    alt={`Logo ${partner.name}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    onError={() => {
                      setImageErrors(prev => new Set([...prev, index]));
                    }}
                  />
                )}
              </div>
              

            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">
                50+
              </div>
              <div className="text-gray-700 font-medium">
                Partenaires mondiaux
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">
                100%
              </div>
              <div className="text-gray-700 font-medium">
                Produits authentiques
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">
                24h
              </div>
              <div className="text-gray-700 font-medium">
                Livraison express
              </div>
            </div>
          </div>
        </div>

        {/* CTA Partner Application */}
        <div className="text-center mt-12">
          <a 
            href="mailto:partnerships@laboutiqueb.com" 
            className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors duration-200"
          >
            Postuler à notre programme partenaire
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;