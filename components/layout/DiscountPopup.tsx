'use client';

import React, { useState, useEffect } from 'react';
import { X, Percent, Gift, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DiscountPopupProps {
  onClose: () => void;
}

export default function DiscountPopup({ onClose }: DiscountPopupProps) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes en secondes
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Afficher le pop-up après 5 secondes
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 5000);

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
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md relative border-2 border-orange-500 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-orange-100 rounded-full transition-colors z-10"
          aria-label="Fermer"
        >
          <X className="w-5 h-5 text-orange-600" />
        </button>
        
        <CardContent className="p-8 text-center">
          {/* Header avec icône et badge */}
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-full">
              <Percent className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <Badge className="mb-4 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
            OFFRE LIMITÉE
          </Badge>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🎉 10% de réduction !
          </h2>
          
          <p className="text-gray-600 mb-4">
            Profitez de <strong>10% de réduction</strong> sur votre première commande
          </p>

          {/* Code promo */}
          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-2">Votre code promo :</p>
            <div className="bg-white border-2 border-dashed border-orange-300 rounded-lg p-3">
              <code className="text-xl font-mono font-bold text-orange-600">
                BIENVENUE10
              </code>
            </div>
          </div>

          {/* Compte à rebours */}
          <div className="flex items-center justify-center mb-6">
            <Clock className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-600 font-bold">
              Offre expire dans : {formatTime(timeLeft)}
            </span>
          </div>

          {/* Avantages */}
          <div className="space-y-2 mb-6 text-left">
            <div className="flex items-center text-sm text-gray-600">
              <Gift className="w-4 h-4 text-orange-500 mr-2" />
              Livraison gratuite dès 50 000 F
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Gift className="w-4 h-4 text-orange-500 mr-2" />
              Retour gratuit sous 30 jours
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Gift className="w-4 h-4 text-orange-500 mr-2" />
              Paiement sécurisé
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="space-y-3">
            <Button 
              onClick={onClose}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Utiliser le code maintenant
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
            >
              Continuer sans code
            </Button>
          </div>

          {/* Message de confiance */}
          <p className="text-xs text-gray-500 mt-4">
            * Code valable une seule fois par client
          </p>
        </CardContent>
      </Card>
    </div>
  );
}