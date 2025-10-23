'use client';

import React, { useState, useEffect } from 'react';
import { X, Mail, Gift, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { showSuccessToast, showErrorToast } from '@/components/ui/enhanced-toast';

interface NewsletterPopupProps {
  onClose: () => void;
}

export default function NewsletterPopup({ onClose }: NewsletterPopupProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Veuillez saisir votre adresse email');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Veuillez saisir une adresse email valide');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        showSuccessToast('Inscription à la newsletter réussie !');
        
        // Fermer le pop-up après 2 secondes
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(data.error || 'Erreur lors de l\'inscription');
        showErrorToast(data.error || 'Erreur lors de l\'inscription');
      }
    } catch (error) {
      setError('Erreur de connexion. Veuillez réessayer.');
      showErrorToast('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md relative">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Inscription réussie !
            </h3>
            <p className="text-gray-600 mb-4">
              Merci de vous être abonné à notre newsletter. Vous recevrez nos meilleures offres !
            </p>
            <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md relative">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <CardContent className="p-8">
          {/* Icône et titre */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Ne ratez aucune offre !
            </h2>
            <p className="text-gray-600">
              Abonnez-vous à notre newsletter et recevez nos meilleures promotions
            </p>
          </div>

          {/* Avantages */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-3">
              <Gift className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-gray-700">Offres exclusives et réductions</span>
            </div>
            <div className="flex items-center space-x-3">
              <Star className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-gray-700">Nouveautés en avant-première</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-gray-700">Conseils shopping personnalisés</span>
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Votre adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base"
                disabled={loading}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Inscription...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  S'abonner maintenant
                </>
              )}
            </Button>
          </form>

          {/* Texte de confiance */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Nous respectons votre vie privée. Désabonnement possible à tout moment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
