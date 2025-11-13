'use client';

import { useState } from 'react';
import { X, Gift, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomePopupProps {
  onClose: () => void;
}

export default function WelcomePopup({ onClose }: WelcomePopupProps) {
  const [copied, setCopied] = useState(false);
  const promoCode = 'BENIN25';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-gradient-to-br from-orange-50 to-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
          {/* Bouton fermer */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Contenu */}
          <div className="p-8 text-center">
            {/* Icône */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-jomionstore-primary to-orange-600 rounded-full flex items-center justify-center">
                  <Gift className="w-10 h-10 text-white" />
                </div>
                <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-pulse" />
              </div>
            </div>

            {/* Titre */}
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Bienvenue sur JomionStore ! 🎉
            </h2>
            
            <p className="text-gray-600 mb-6">
              Pour célébrer votre première visite, profitez d'une réduction exclusive sur votre première commande !
            </p>

            {/* Code promo */}
            <div className="bg-gradient-to-r from-jomionstore-primary to-orange-600 rounded-xl p-6 mb-6">
              <p className="text-white text-sm font-medium mb-2">
                Votre code promo
              </p>
              <div className="bg-white rounded-lg p-4 mb-3">
                <p className="text-3xl font-bold text-jomionstore-primary tracking-wider">
                  {promoCode}
                </p>
              </div>
              <p className="text-white text-lg font-semibold">
                -5% sur votre première commande
              </p>
            </div>

            {/* Boutons */}
            <div className="space-y-3">
              <Button
                onClick={handleCopyCode}
                className="w-full bg-jomionstore-primary hover:bg-orange-600 text-white font-semibold py-3 rounded-lg"
              >
                {copied ? '✓ Code copié !' : 'Copier le code'}
              </Button>
              
              <button
                onClick={onClose}
                className="w-full text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                Continuer sans code
              </button>
            </div>

            {/* Note */}
            <p className="text-xs text-gray-500 mt-4">
              * Valable sur toutes les commandes sans minimum d'achat
            </p>
          </div>
      </div>
    </div>
  );
}
