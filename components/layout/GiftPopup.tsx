'use client';

import React, { useState, useEffect } from 'react';
import { X, Gift, Heart, Star, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface GiftPopupProps {
  onClose: () => void;
  productName?: string;
}

export default function GiftPopup({ onClose, productName }: GiftPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHolidaySeason, setIsHolidaySeason] = useState(false);

  useEffect(() => {
    // Vérifier si c'est la période de fêtes (décembre-janvier)
    const now = new Date();
    const month = now.getMonth() + 1; // 0-11 -> 1-12
    const isHoliday = month === 12 || month === 1;
    setIsHolidaySeason(isHoliday);

    // Afficher le pop-up après 45 secondes seulement en période de fêtes
    if (isHoliday) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 45000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  if (!isVisible || !isHolidaySeason) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md relative border-2 border-pink-500 shadow-2xl">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 hover:bg-pink-100 rounded-full transition-colors z-10"
          aria-label="Fermer"
        >
          <X className="w-5 h-5 text-pink-600" />
        </button>
        
        <CardContent className="p-8 text-center">
          {/* Header avec animation */}
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-pink-500 to-yellow-500 p-3 rounded-full animate-pulse">
              <Gift className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <Badge className="mb-4 bg-gradient-to-r from-pink-500 to-yellow-500 text-white border-0">
            <Sparkles className="w-4 h-4 mr-1" />
            PÉRIODE DE FÊTES
          </Badge>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🎁 Offrez un cadeau parfait !
          </h2>
          
          <p className="text-gray-600 mb-4">
            {productName ? (
              <>
                <strong>{productName}</strong> ferait un excellent cadeau pour vos proches
              </>
            ) : (
              <>
                Découvrez notre sélection de <strong>cadeaux parfaits</strong> pour vos proches
              </>
            )}
          </p>

          {/* Cadeaux populaires */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gradient-to-br from-pink-50 to-yellow-50 rounded-lg p-3 text-center border border-pink-200">
              <div className="text-2xl mb-1">📱</div>
              <p className="text-sm font-semibold text-gray-700">Smartphones</p>
              <p className="text-xs text-pink-600">Cadeau idéal</p>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-yellow-50 rounded-lg p-3 text-center border border-pink-200">
              <div className="text-2xl mb-1">🎧</div>
              <p className="text-sm font-semibold text-gray-700">Audio</p>
              <p className="text-xs text-pink-600">Toujours apprécié</p>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-yellow-50 rounded-lg p-3 text-center border border-pink-200">
              <div className="text-2xl mb-1">⌚</div>
              <p className="text-sm font-semibold text-gray-700">Montres</p>
              <p className="text-xs text-pink-600">Élégant</p>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-yellow-50 rounded-lg p-3 text-center border border-pink-200">
              <div className="text-2xl mb-1">💄</div>
              <p className="text-sm font-semibold text-gray-700">Beauté</p>
              <p className="text-xs text-pink-600">Féminin</p>
            </div>
          </div>

          {/* Avantages cadeaux */}
          <div className="space-y-2 mb-6 text-left">
            <div className="flex items-center text-sm text-gray-600">
              <Heart className="w-4 h-4 text-pink-500 mr-2" />
              Emballage cadeau gratuit
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Star className="w-4 h-4 text-pink-500 mr-2" />
              Carte de vœux personnalisée
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Gift className="w-4 h-4 text-pink-500 mr-2" />
              Livraison directe au destinataire
            </div>
          </div>

          {/* Message spécial */}
          <div className="bg-gradient-to-r from-pink-50 to-yellow-50 border border-pink-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              <Sparkles className="w-5 h-5 text-pink-500 mr-2" />
              <span className="text-pink-700 font-semibold">Offre spéciale fêtes</span>
            </div>
            <p className="text-sm text-gray-600">
              -20% sur tous les cadeaux + emballage gratuit
            </p>
          </div>

          {/* Boutons d'action */}
          <div className="space-y-3">
            <Button 
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              <Gift className="w-4 h-4 mr-2" />
              Voir les cadeaux
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="w-full border-pink-300 text-pink-600 hover:bg-pink-50"
            >
              Continuer mes achats
            </Button>
          </div>

          {/* Message de saison */}
          <p className="text-xs text-gray-500 mt-4">
            🎄 Joyeuses fêtes de fin d'année !
          </p>
        </CardContent>
      </Card>
    </div>
  );
}