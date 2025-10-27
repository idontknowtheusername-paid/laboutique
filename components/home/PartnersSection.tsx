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
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Des partenaires de confiance
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Nous collaborons avec les plus grandes marques mondiales pour vous offrir 
            les meilleurs produits et services
          </p>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-12">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-xl border border-gray-200 p-6 hover:border-orange-200 hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center min-h-[120px]"
            >
              <div className="relative w-full h-16 mb-3">
                {imageErrors.has(index) ? (
                  <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-lg">
                    <span className="text-2xl font-bold text-gray-400">{partner.name.charAt(0)}</span>
                  </div>
                ) : (
                  <Image
                    src={partner.logo}
                    alt={`Logo ${partner.name}`}
                    fill
                    className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    onError={() => {
                      setImageErrors(prev => new Set([...prev, index]));
                    }}
                  />
                )}
              </div>
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-end justify-center pb-4">
                <div className="text-center">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">{partner.name}</h4>
                  <p className="text-xs text-gray-600">{partner.description}</p>
                </div>
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

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Vous souhaitez devenir partenaire ?
          </p>
          <button className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors duration-200">
            Devenir partenaire
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;