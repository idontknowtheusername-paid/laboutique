'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Cookie, 
  Shield, 
  Settings, 
  BarChart3, 
  Target,
  Save,
  RotateCcw,
  CheckCircle
} from 'lucide-react';
import { useCookieConsent } from '@/hooks/useCookieConsent';

const cookieCategories = [
  {
    id: 'essential',
    name: 'Cookies essentiels',
    icon: Shield,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    required: true,
    description: 'Nécessaires au fonctionnement du site. Ne peuvent pas être désactivés.',
    examples: [
      'Gestion de la connexion utilisateur',
      'Contenu du panier d\'achat',
      'Protection contre les attaques CSRF',
      'Mémorisation de vos préférences cookies'
    ]
  },
  {
    id: 'functional',
    name: 'Cookies fonctionnels',
    icon: Settings,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    required: false,
    description: 'Améliorent votre expérience en mémorisant vos préférences.',
    examples: [
      'Langue et devise préférées',
      'Produits récemment consultés',
      'Liste de souhaits',
      'Filtres de recherche appliqués'
    ]
  },
  {
    id: 'analytics',
    name: 'Cookies de performance',
    icon: BarChart3,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    required: false,
    description: 'Nous aident à comprendre comment vous utilisez le site pour l\'améliorer.',
    examples: [
      'Google Analytics - Identification visiteur unique',
      'Analyse des performances du site',
      'Mesure des temps de chargement',
      'Détection des problèmes techniques'
    ]
  },
  {
    id: 'marketing',
    name: 'Cookies marketing',
    icon: Target,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    required: false,
    description: 'Permettent de personnaliser les publicités et de mesurer leur efficacité.',
    examples: [
      'Facebook Pixel - Suivi des conversions',
      'Google Ads - Publicité display',
      'Recommandations de produits adaptées',
      'Offres promotionnelles ciblées'
    ]
  }
] as const;

export default function CookiePreferences() {
  const { 
    consent, 
    acceptAll, 
    rejectAll, 
    customize, 
    reset,
    hasConsent 
  } = useCookieConsent();
  
  const [preferences, setPreferences] = useState(consent);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Mettre à jour les préférences quand le consentement change
  useEffect(() => {
    setPreferences(consent);
  }, [consent]);

  // Vérifier s'il y a des changements
  useEffect(() => {
    const hasChanges = JSON.stringify(preferences) !== JSON.stringify(consent);
    setHasChanges(hasChanges);
  }, [preferences, consent]);

  const handleToggle = (categoryId: keyof typeof preferences) => {
    if (categoryId === 'essential') return; // Ne pas modifier les essentiels
    
    setPreferences(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleSave = () => {
    customize(preferences);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    reset();
    setPreferences(consent);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-jomionstore-primary/10 rounded-lg">
            <Cookie className="w-8 h-8 text-jomionstore-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestion des cookies
            </h1>
            <p className="text-gray-600 mt-2">
              Personnalisez vos préférences de cookies pour une expérience sur mesure
            </p>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <Card className="border-jomionstore-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-jomionstore-primary" />
            Actions rapides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={acceptAll}
              className="bg-jomionstore-primary hover:bg-orange-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Accepter tous les cookies
            </Button>
            
            <Button
              onClick={rejectAll}
              variant="outline"
              className="border-gray-300 hover:bg-gray-50"
            >
              Refuser les cookies non essentiels
            </Button>
            
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Préférences détaillées */}
      <div className="space-y-4">
        {cookieCategories.map((category) => {
          const IconComponent = category.icon;
          const isEnabled = preferences[category.id as keyof typeof preferences];
          
          return (
            <Card key={category.id} className={`border-2 ${category.borderColor}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${category.bgColor}`}>
                      <IconComponent className={`w-6 h-6 ${category.color}`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {category.name}
                        </h3>
                        {category.required && (
                          <Badge className="bg-gray-600">Obligatoire</Badge>
                        )}
                        {isEnabled && (
                          <Badge className="bg-green-600">Activé</Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3">
                        {category.description}
                      </p>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Exemples d'utilisation :
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {category.examples.map((example, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <Switch
                      checked={Boolean(isEnabled)}
                      onCheckedChange={() => handleToggle(category.id as keyof typeof preferences)}
                      disabled={category.required}
                      className="data-[state=checked]:bg-jomionstore-primary"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Actions de sauvegarde */}
      {hasChanges && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <p className="text-gray-700">
                  Vous avez des modifications non sauvegardées
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  className="bg-jomionstore-primary hover:bg-orange-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Message de confirmation */}
      {isSaved && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-medium">
                Vos préférences de cookies ont été sauvegardées avec succès !
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informations supplémentaires */}
      <Card>
        <CardHeader>
          <CardTitle>Informations importantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>💡 Conseil :</strong> Les cookies essentiels sont toujours activés car ils sont 
              nécessaires au bon fonctionnement du site (connexion, panier, sécurité).
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700">
              <strong>🔒 Confidentialité :</strong> Vos préférences sont stockées localement sur votre 
              appareil et ne sont pas partagées avec des tiers. Vous pouvez modifier ces paramètres 
              à tout moment.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}