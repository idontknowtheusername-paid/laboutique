'use client';

import React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

const PartnersSection = () => {
  const partners = [
    {
      name: 'Alibaba',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Alibaba_Group_logo.svg/2560px-Alibaba_Group_logo.svg.png',
      category: 'Marketplace',
      description: 'Plateforme B2B mondiale'
    },
    {
      name: 'AliExpress',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/AliExpress_logo.svg/2560px-AliExpress_logo.svg.png',
      category: 'E-commerce',
      description: 'Marketplace international'
    },
    {
      name: 'MTN',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/MTN_Group_logo.svg/2560px-MTN_Group_logo.svg.png',
      category: 'Télécoms',
      description: 'Opérateur mobile'
    },
    {
      name: 'Moov',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Moov_Africa_logo.svg/2560px-Moov_Africa_logo.svg.png',
      category: 'Télécoms',
      description: 'Opérateur mobile'
    },
    {
      name: 'Visa',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png',
      category: 'Paiement',
      description: 'Cartes de crédit'
    },
    {
      name: 'Mastercard',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/2560px-Mastercard-logo.svg.png',
      category: 'Paiement',
      description: 'Cartes de crédit'
    },
    {
      name: 'PayPal',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/2560px-PayPal.svg.png',
      category: 'Paiement',
      description: 'Paiement en ligne'
    },
    {
      name: 'DHL',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/DHL_Express_logo.svg/2560px-DHL_Express_logo.svg.png',
      category: 'Logistique',
      description: 'Transport express'
    },
    {
      name: 'FedEx',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/FedEx_Express_logo.svg/2560px-FedEx_Express_logo.svg.png',
      category: 'Logistique',
      description: 'Services de livraison'
    },
    {
      name: 'Samsung',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/2560px-Samsung_Logo.svg.png',
      category: 'Électronique',
      description: 'Technologie'
    },
    {
      name: 'Apple',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/2560px-Apple_logo_black.svg.png',
      category: 'Électronique',
      description: 'Technologie'
    },
    {
      name: 'Nike',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/2560px-Logo_NIKE.svg.png',
      category: 'Mode',
      description: 'Équipement sportif'
    }
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
              <div className="relative w-full h-12 mb-3">
                <Image
                  src={partner.logo}
                  alt={`Logo ${partner.name}`}
                  fill
                  className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                />
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