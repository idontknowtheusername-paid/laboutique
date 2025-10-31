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

  // Dupliquer les partenaires pour l'effet de boucle infinie
  const duplicatedPartners = [...partners, ...partners];

  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 text-orange-600 border-orange-200 bg-orange-50">
            Nos Partenaires
          </Badge>
        </div>

        {/* Carrousel Infini des Partenaires */}
        <div className="relative overflow-hidden mb-12">
          {/* Gradient de fondu sur les côtés */}
          <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

          {/* Carrousel */}
          <div className="flex animate-scroll pause-animation">
            {duplicatedPartners.map((partner, index) => (
              <div
                key={`${partner.name}-${index}`}
                className="flex-shrink-0 mx-4 sm:mx-6 md:mx-8 group relative"
                style={{ width: 'clamp(80px, 15vw, 120px)' }}
              >
                <div className="relative w-full h-12 sm:h-14 md:h-16 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-lg">
                  {imageErrors.has(index % partners.length) ? (
                    <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-lg border-2 border-gray-200">
                      <span className="text-sm sm:text-lg md:text-xl font-bold text-gray-400">{partner.name.charAt(0)}</span>
                    </div>
                  ) : (
                      <div className="relative w-full h-full bg-white rounded-lg border border-gray-100 p-1 sm:p-2 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                        <Image
                          src={partner.logo}
                          alt={`Logo ${partner.name}`}
                          fill
                          className="object-contain transition-all duration-300"
                          sizes="(max-width: 480px) 80px, (max-width: 768px) 100px, 120px"
                          onError={() => {
                            setImageErrors(prev => new Set([...prev, index % partners.length]));
                          }}
                        />
                      </div>
                  )}
                </div>

                {/* Tooltip au hover - masqué sur mobile */}
                <div className="hidden sm:block absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-20">
                  {partner.name}
                </div>
              </div>
            ))}
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