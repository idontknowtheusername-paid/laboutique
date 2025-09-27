'use client';

import React from 'react';
import { Download, Smartphone, QrCode, Star, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

const MobileAppSection = () => {
  return (
    <>
      {/* Desktop Version */}
      <section className="hidden md:block py-12 bg-gradient-to-r from-jomiastore-primary to-blue-600 text-white">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-8 h-8" />
                <h2 className="text-3xl md:text-4xl font-bold">
                  Téléchargez l'app JomiaStore
                </h2>
              </div>
              <p className="text-xl text-blue-100">
                Shopping plus rapide, plus facile et plus sécurisé
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Commandes express</h3>
                  <p className="text-sm text-blue-100">En 2 clics</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Notifications exclusives</h3>
                  <p className="text-sm text-blue-100">Offres spéciales</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Support prioritaire</h3>
                  <p className="text-sm text-blue-100">Chat en direct</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Paiement mobile</h3>
                  <p className="text-sm text-blue-100">MTN, Orange Money</p>
                </div>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-white text-jomiastore-primary hover:bg-gray-100 flex items-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Google Play</span>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-jomiastore-primary flex items-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>App Store</span>
              </Button>
            </div>

            {/* QR Code */}
            <div className="flex items-center space-x-4 pt-4">
              <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center">
                <QrCode className="w-12 h-12 text-jomiastore-primary" />
              </div>
              <div>
                <p className="text-sm text-blue-100">Scannez pour télécharger</p>
                <p className="text-xs text-blue-200">Disponible sur iOS et Android</p>
              </div>
            </div>
          </div>

          {/* Phone Mockup */}
          <div className="relative">
            <div className="relative mx-auto w-64 h-[500px] bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
              <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                {/* Status Bar */}
                <div className="h-8 bg-jomiastore-primary flex items-center justify-between px-6 text-white text-xs">
                  <span>9:41</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-2 bg-white/30 rounded-sm"></div>
                    <div className="w-4 h-2 bg-white/30 rounded-sm"></div>
                    <div className="w-4 h-2 bg-white/30 rounded-sm"></div>
                  </div>
                </div>
                
                {/* App Content */}
                <div className="p-4 space-y-4">
                  {/* Header */}
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-jomiastore-primary rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">JS</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">JomiaStore</h3>
                      <p className="text-xs text-gray-500">Centre commercial digital</p>
                    </div>
                  </div>
                  
                  {/* Search Bar */}
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Rechercher des produits...</p>
                  </div>
                  
                  {/* Flash Sales */}
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-3 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm">Flash Sales</h4>
                        <p className="text-xs">Se termine dans 2h 15m</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs">-30%</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Products Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-gray-100 rounded-lg p-2">
                        <div className="w-full h-16 bg-gray-200 rounded mb-2"></div>
                        <p className="text-xs text-gray-600 line-clamp-2">Produit {i}</p>
                        <p className="text-xs font-bold text-jomiastore-primary">25,000 F</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-green-400 rounded-full flex items-center justify-center animate-pulse">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>
    </section>

      {/* Mobile Version - Compact */}
      <section className="md:hidden py-8 bg-gradient-to-r from-jomiastore-primary to-blue-600 text-white">
        <div className="container">
          <div className="text-center space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <Smartphone className="w-6 h-6" />
                <h2 className="text-2xl font-bold">
                  Téléchargez l'app JomiaStore
                </h2>
              </div>
              <p className="text-blue-100">
                Shopping plus rapide et plus facile
              </p>
            </div>

            {/* Features - Compact */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span className="text-sm">Commandes express</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4" />
                <span className="text-sm">Offres exclusives</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span className="text-sm">Support prioritaire</span>
              </div>
              <div className="flex items-center space-x-2">
                <QrCode className="w-4 h-4" />
                <span className="text-sm">Paiement mobile</span>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="flex flex-col space-y-3">
              <Button 
                size="lg" 
                className="bg-white text-jomiastore-primary hover:bg-gray-100 flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger sur Google Play</span>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-jomiastore-primary flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger sur App Store</span>
              </Button>
            </div>

            {/* QR Code */}
            <div className="flex items-center justify-center space-x-3 pt-2">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                <QrCode className="w-10 h-10 text-jomiastore-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm text-blue-100">Scannez pour télécharger</p>
                <p className="text-xs text-blue-200">iOS et Android</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default MobileAppSection;