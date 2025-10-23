'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Truck, ShoppingCart, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FreeShippingPopupProps {
  onClose: () => void;
  cartTotal: number;
}

export default function FreeShippingPopup({ onClose, cartTotal }: FreeShippingPopupProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Vérifier si le pop-up doit s'afficher quand panier < 75 000 F
    if (cartTotal > 0 && cartTotal < 75000) {
      setIsVisible(true);
    }
  }, [cartTotal]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  const handleViewCart = () => {
    handleClose();
    router.push('/cart');
  };

  const remainingAmount = 75000 - cartTotal;

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className={`w-full max-w-sm relative border-2 border-blue-500 shadow-2xl transition-all duration-300 ${
        isLeaving ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}>
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 hover:bg-blue-100 rounded-full transition-colors z-10"
          aria-label="Fermer"
        >
          <X className="w-5 h-5 text-blue-600" />
        </button>
        
        <CardContent className="p-6 text-center">
          {/* Header avec icône */}
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-green-500 p-3 rounded-full">
              <Truck className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-green-500 text-white border-0">
            LIVRAISON GRATUITE
          </Badge>

          <h2 className="text-xl font-bold text-gray-900 mb-2">
            🚚 Livraison gratuite !
          </h2>
          
          <p className="text-gray-600 mb-4">
            Ajoutez encore <strong className="text-blue-600">{remainingAmount.toLocaleString()} F</strong> à votre panier pour bénéficier de la livraison gratuite
          </p>

          {/* Barre de progression */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Votre panier</span>
              <span>{cartTotal.toLocaleString()} F / 75 000 F</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(cartTotal / 75000) * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {Math.round((cartTotal / 75000) * 100)}% complété
            </div>
          </div>

          {/* Montant restant */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-blue-500 mr-2" />
              <span className="text-blue-700 font-bold text-lg">
                Plus que {remainingAmount.toLocaleString()} F
              </span>
            </div>
          </div>

          {/* Avantages de la livraison gratuite */}
          <div className="space-y-1 mb-4 text-left">
            <div className="flex items-center text-xs text-gray-600">
              <Truck className="w-3 h-3 text-blue-500 mr-2" />
              Livraison gratuite partout en Côte d'Ivoire
            </div>
            <div className="flex items-center text-xs text-gray-600">
              <Truck className="w-3 h-3 text-blue-500 mr-2" />
              Livraison en 24-48h
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="space-y-2">
            <Button 
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-bold py-2 rounded-lg transition-all duration-300"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Continuer mes achats
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleViewCart}
              className="w-full border-blue-300 text-blue-600 hover:bg-blue-50 py-2"
            >
              Voir le panier
            </Button>
          </div>

          {/* Message d'encouragement */}
          <p className="text-xs text-gray-500 mt-4">
            * Livraison gratuite valable dès 75 000 F d'achat
          </p>
        </CardContent>
      </Card>
    </div>
  );
}