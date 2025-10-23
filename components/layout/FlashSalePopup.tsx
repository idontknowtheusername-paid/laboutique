'use client';

import React, { useState, useEffect } from 'react';
import { X, Zap, Clock, Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FlashSalePopupProps {
  onClose: () => void;
}

export default function FlashSalePopup({ onClose }: FlashSalePopupProps) {
  const [timeLeft, setTimeLeft] = useState(3600); // 1 heure en secondes
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Afficher le pop-up après 30 secondes
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isVisible) {
      const countdown = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdown);
    }
  }, [isVisible]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg relative border-2 border-red-500 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-red-100 rounded-full transition-colors z-10"
          aria-label="Fermer"
        >
          <X className="w-5 h-5 text-red-600" />
        </button>
        
        <CardContent className="p-8 text-center">
          {/* Header avec animation */}
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-red-500 to-black p-3 rounded-full animate-pulse">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <Badge className="mb-4 bg-gradient-to-r from-red-500 to-black text-white border-0 animate-bounce">
            <Flame className="w-4 h-4 mr-1" />
            VENTE FLASH
          </Badge>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            🔥 VENTE FLASH ÉLECTRONIQUE
          </h2>
          
          <p className="text-gray-600 mb-4 text-lg">
            Jusqu'à <strong className="text-red-600">-50%</strong> sur tous les produits électroniques
          </p>

          {/* Compte à rebours principal */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-6 h-6 text-red-500 mr-2" />
              <span className="text-red-700 font-bold text-lg">
                Temps restant : {formatTime(timeLeft)}
              </span>
            </div>
            <div className="w-full bg-red-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(timeLeft / 3600) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Produits en vente */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">📱</div>
              <p className="text-sm font-semibold">Smartphones</p>
              <p className="text-red-600 font-bold">-40%</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">💻</div>
              <p className="text-sm font-semibold">Laptops</p>
              <p className="text-red-600 font-bold">-50%</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">🎧</div>
              <p className="text-sm font-semibold">Audio</p>
              <p className="text-red-600 font-bold">-30%</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">📷</div>
              <p className="text-sm font-semibold">Caméras</p>
              <p className="text-red-600 font-bold">-45%</p>
            </div>
          </div>

          {/* Avantages */}
          <div className="space-y-2 mb-6 text-left">
            <div className="flex items-center text-sm text-gray-600">
              <Zap className="w-4 h-4 text-red-500 mr-2" />
              Livraison express gratuite
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Zap className="w-4 h-4 text-red-500 mr-2" />
              Garantie constructeur incluse
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Zap className="w-4 h-4 text-red-500 mr-2" />
              Stock limité - Dépêchez-vous !
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="space-y-3">
            <Button 
              onClick={onClose}
              className="w-full bg-gradient-to-r from-red-500 to-black hover:from-red-600 hover:to-gray-800 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Voir les offres maintenant
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full border-red-300 text-red-600 hover:bg-red-50"
            >
              Fermer
            </Button>
          </div>

          {/* Message d'urgence */}
          <p className="text-xs text-red-600 mt-4 font-semibold">
            ⚡ Offre valable uniquement pendant la vente flash
          </p>
        </CardContent>
      </Card>
    </div>
  );
}