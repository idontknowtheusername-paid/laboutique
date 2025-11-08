'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Download, Apple, PlayCircle, Zap, Clock, Package, Truck, CheckCircle } from 'lucide-react';

interface BannerProps {
  banner: {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    cta_text: string;
    cta_link: string;
    gradient: string;
    badge: string;
  };
}

// Bannière 1 : App Mobile
export const CustomAppBanner: React.FC<BannerProps> = ({ banner }) => {
  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${banner.gradient} overflow-hidden`}>
      {/* Formes décoratives animées */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative h-full flex items-center p-4 sm:p-6 md:p-8 lg:p-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full items-center">
          {/* Contenu gauche */}
          <div className="text-white space-y-4 md:space-y-6">
            {/* Logo JomionStore */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden bg-white/20 backdrop-blur-sm p-2">
                <Image
                  src="/images/latestlogo.jpg"
                  alt="JomionStore"
                  fill
                  className="object-contain"
                  sizes="64px"
                />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold">JomionStore</h3>
                <p className="text-xs md:text-sm opacity-90">Shopping App</p>
              </div>
            </div>

            <Badge className="bg-white/20 text-white border-white/30 text-xs md:text-sm backdrop-blur-sm">
              {banner.badge}
            </Badge>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              {banner.title}
            </h2>

            <p className="text-base md:text-lg lg:text-xl opacity-90 leading-relaxed">
              {banner.subtitle}
            </p>

            <p className="text-sm md:text-base opacity-80">
              {banner.description}
            </p>

            {/* Boutons de téléchargement */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link href={banner.cta_link}>
                <Button className="bg-black text-white hover:bg-gray-900 font-semibold px-6 py-6 text-sm md:text-base flex items-center gap-2 w-full sm:w-auto">
                  <Apple className="w-5 h-5" />
                  <div className="text-left">
                    <div className="text-[10px] opacity-80">Télécharger sur</div>
                    <div className="font-bold">App Store</div>
                  </div>
                </Button>
              </Link>
              <Link href={banner.cta_link}>
                <Button className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-6 py-6 text-sm md:text-base flex items-center gap-2 w-full sm:w-auto">
                  <PlayCircle className="w-5 h-5" />
                  <div className="text-left">
                    <div className="text-[10px] opacity-80">Disponible sur</div>
                    <div className="font-bold">Google Play</div>
                  </div>
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-6 pt-4 text-sm">
              <div>
                <div className="text-2xl font-bold">10K+</div>
                <div className="opacity-80">Téléchargements</div>
              </div>
              <div>
                <div className="text-2xl font-bold">4.8★</div>
                <div className="opacity-80">Note moyenne</div>
              </div>
            </div>
          </div>

          {/* Mockup téléphone droite */}
          <div className="hidden md:flex justify-center items-center relative">
            <div className="relative w-64 h-96 lg:w-80 lg:h-[500px]">
              {/* Personne tenant le téléphone - Illustration SVG */}
              <svg viewBox="0 0 400 600" className="w-full h-full drop-shadow-2xl">
                {/* Main tenant le téléphone */}
                <ellipse cx="200" cy="500" rx="80" ry="40" fill="#FDB4B4" opacity="0.3"/>
                <path d="M 140 480 Q 140 520 200 540 Q 260 520 260 480 L 260 400 Q 260 380 240 380 L 160 380 Q 140 380 140 400 Z" fill="#FDB4B4"/>
                
                {/* Téléphone */}
                <rect x="150" y="100" width="180" height="360" rx="25" fill="#1F2937" className="animate-float"/>
                <rect x="160" y="110" width="160" height="340" rx="20" fill="#111827"/>
                
                {/* Écran avec gradient */}
                <defs>
                  <linearGradient id="screenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
                <rect x="165" y="130" width="150" height="300" rx="15" fill="url(#screenGradient)"/>
                
                {/* Icônes sur l'écran */}
                <circle cx="200" cy="200" r="30" fill="white" opacity="0.9"/>
                <text x="200" y="210" textAnchor="middle" fontSize="30" fill="#3B82F6">🛍️</text>
                
                {/* Notch */}
                <rect x="210" y="115" width="60" height="8" rx="4" fill="#111827"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Animation CSS */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// Bannière 2 : Promo Flash -50%
export const CustomPromoBanner: React.FC<BannerProps> = ({ banner }) => {
  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${banner.gradient} overflow-hidden`}>
      {/* Effets de fond */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
      </div>

      {/* Éclairs animés */}
      <div className="absolute top-10 right-20 text-6xl animate-bounce">⚡</div>
      <div className="absolute bottom-20 left-10 text-4xl animate-bounce" style={{ animationDelay: '0.5s' }}>🔥</div>

      <div className="relative h-full flex items-center p-4 sm:p-6 md:p-8 lg:p-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full items-center">
          {/* Contenu gauche */}
          <div className="text-white space-y-4 md:space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden bg-white/20 backdrop-blur-sm p-2">
                <Image
                  src="/images/latestlogo.jpg"
                  alt="JomionStore"
                  fill
                  className="object-contain"
                  sizes="64px"
                />
              </div>
            </div>

            <Badge className="bg-white/20 text-white border-white/30 text-xs md:text-sm backdrop-blur-sm animate-pulse">
              {banner.badge}
            </Badge>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              {banner.title}
            </h2>

            <div className="flex items-baseline gap-2">
              <span className="text-6xl md:text-8xl font-black">-50%</span>
              <span className="text-2xl md:text-3xl opacity-90">OFF</span>
            </div>

            <p className="text-base md:text-lg opacity-90">
              {banner.subtitle}
            </p>

            <p className="text-sm md:text-base opacity-80">
              {banner.description}
            </p>

            {/* Timer countdown */}
            <div className="flex gap-4 pt-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center min-w-[60px]">
                <div className="text-2xl font-bold">12</div>
                <div className="text-xs opacity-80">Heures</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center min-w-[60px]">
                <div className="text-2xl font-bold">34</div>
                <div className="text-xs opacity-80">Minutes</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center min-w-[60px]">
                <div className="text-2xl font-bold">56</div>
                <div className="text-xs opacity-80">Secondes</div>
              </div>
            </div>

            <Link href={banner.cta_link}>
              <Button className="bg-white text-orange-600 hover:bg-gray-100 font-bold px-8 py-6 text-base md:text-lg mt-4 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
                <Zap className="w-5 h-5 mr-2" />
                {banner.cta_text}
              </Button>
            </Link>
          </div>

          {/* Illustration droite */}
          <div className="hidden md:flex justify-center items-center relative">
            <div className="relative w-80 h-80">
              <svg viewBox="0 0 400 400" className="w-full h-full">
                {/* Personne excitée */}
                <circle cx="200" cy="150" r="50" fill="#FDB4B4"/>
                <circle cx="185" cy="145" r="5" fill="#000"/>
                <circle cx="215" cy="145" r="5" fill="#000"/>
                <path d="M 180 165 Q 200 175 220 165" stroke="#000" strokeWidth="3" fill="none"/>
                
                {/* Corps */}
                <rect x="170" y="200" width="60" height="80" rx="10" fill="#3B82F6"/>
                
                {/* Bras levés (célébration) */}
                <rect x="130" y="210" width="40" height="15" rx="7" fill="#FDB4B4" transform="rotate(-45 150 217)"/>
                <rect x="230" y="210" width="40" height="15" rx="7" fill="#FDB4B4" transform="rotate(45 250 217)"/>
                
                {/* Téléphone dans la main */}
                <rect x="240" y="180" width="40" height="60" rx="5" fill="#1F2937" className="animate-wiggle"/>
                <rect x="245" y="185" width="30" height="50" rx="3" fill="#3B82F6"/>
                
                {/* Étoiles de joie */}
                <text x="140" y="120" fontSize="30" className="animate-spin-slow">⭐</text>
                <text x="260" y="130" fontSize="25" className="animate-spin-slow" style={{ animationDelay: '0.5s' }}>✨</text>
                <text x="200" y="90" fontSize="35" className="animate-bounce">🎉</text>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-wiggle {
          animation: wiggle 1s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

// Bannière 3 : Livraison Gratuite
export const CustomDeliveryBanner: React.FC<BannerProps> = ({ banner }) => {
  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${banner.gradient} overflow-hidden`}>
      {/* Formes décoratives */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

      <div className="relative h-full flex items-center p-4 sm:p-6 md:p-8 lg:p-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full items-center">
          {/* Contenu gauche */}
          <div className="text-white space-y-4 md:space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden bg-white/20 backdrop-blur-sm p-2">
                <Image
                  src="/images/latestlogo.jpg"
                  alt="JomionStore"
                  fill
                  className="object-contain"
                  sizes="64px"
                />
              </div>
            </div>

            <Badge className="bg-white/20 text-white border-white/30 text-xs md:text-sm backdrop-blur-sm">
              {banner.badge}
            </Badge>

            <div className="flex items-center gap-4">
              <Truck className="w-16 h-16 md:w-20 md:h-20 animate-bounce" />
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                {banner.title}
              </h2>
            </div>

            <p className="text-lg md:text-xl lg:text-2xl font-semibold">
              {banner.subtitle}
            </p>

            <p className="text-sm md:text-base opacity-90">
              {banner.description}
            </p>

            {/* Avantages */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <CheckCircle className="w-6 h-6 flex-shrink-0" />
                <span className="text-sm md:text-base">Livraison en 24-48h</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <CheckCircle className="w-6 h-6 flex-shrink-0" />
                <span className="text-sm md:text-base">Suivi en temps réel</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <CheckCircle className="w-6 h-6 flex-shrink-0" />
                <span className="text-sm md:text-base">Partout au Bénin</span>
              </div>
            </div>

            <Link href={banner.cta_link}>
              <Button className="bg-white text-green-600 hover:bg-gray-100 font-bold px-8 py-6 text-base md:text-lg mt-4 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
                <Package className="w-5 h-5 mr-2" />
                {banner.cta_text}
              </Button>
            </Link>
          </div>

          {/* Illustration droite */}
          <div className="hidden md:flex justify-center items-center relative">
            <div className="relative w-80 h-80">
              <svg viewBox="0 0 400 400" className="w-full h-full">
                {/* Personne recevant un colis */}
                <circle cx="200" cy="120" r="40" fill="#FDB4B4"/>
                <circle cx="190" cy="115" r="4" fill="#000"/>
                <circle cx="210" cy="115" r="4" fill="#000"/>
                <path d="M 190 130 Q 200 135 210 130" stroke="#000" strokeWidth="2" fill="none"/>
                
                {/* Corps */}
                <rect x="175" y="160" width="50" height="70" rx="10" fill="#10B981"/>
                
                {/* Bras tenant le colis */}
                <rect x="140" y="180" width="35" height="12" rx="6" fill="#FDB4B4"/>
                <rect x="225" y="180" width="35" height="12" rx="6" fill="#FDB4B4"/>
                
                {/* Colis */}
                <rect x="160" y="200" width="80" height="80" rx="5" fill="#8B4513" className="animate-float"/>
                <line x1="160" y1="240" x2="240" y2="240" stroke="#654321" strokeWidth="4"/>
                <line x1="200" y1="200" x2="200" y2="280" stroke="#654321" strokeWidth="4"/>
                <text x="200" y="250" textAnchor="middle" fontSize="30">📦</text>
                
                {/* Camion de livraison en arrière-plan */}
                <g transform="translate(280, 300)" className="animate-drive">
                  <rect x="0" y="0" width="80" height="40" rx="5" fill="#10B981"/>
                  <rect x="60" y="10" width="20" height="20" rx="3" fill="#065F46"/>
                  <circle cx="20" cy="45" r="8" fill="#1F2937"/>
                  <circle cx="60" cy="45" r="8" fill="#1F2937"/>
                  <text x="40" y="25" textAnchor="middle" fontSize="20">🚚</text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes drive {
          0% { transform: translate(280px, 300px); }
          50% { transform: translate(290px, 300px); }
          100% { transform: translate(280px, 300px); }
        }
        .animate-float {
          animation: float 2s ease-in-out infinite;
        }
        .animate-drive {
          animation: drive 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
