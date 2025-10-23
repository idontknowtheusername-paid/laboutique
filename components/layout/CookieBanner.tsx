'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Cookie, 
  Shield, 
  Settings, 
  BarChart3, 
  Target,
  X,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import Link from 'next/link';

const cookieCategories = [
  {
    id: 'essential',
    name: 'Essentiels',
    icon: Shield,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    required: true,
    description: 'Nécessaires au fonctionnement du site'
  },
  {
    id: 'functional',
    name: 'Fonctionnels',
    icon: Settings,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    required: false,
    description: 'Améliorent votre expérience'
  },
  {
    id: 'analytics',
    name: 'Analytiques',
    icon: BarChart3,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    required: false,
    description: 'Nous aident à améliorer le site'
  },
  {
    id: 'marketing',
    name: 'Marketing',
    icon: Target,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    required: false,
    description: 'Personnalisent les publicités'
  }
] as const;

export default function CookieBanner() {
  const { 
    consent, 
    status, 
    isLoaded, 
    acceptAll, 
    rejectAll, 
    customize, 
    hasGivenConsent 
  } = useCookieConsent();
  
  const [showDetails, setShowDetails] = useState(false);
  const [customPreferences, setCustomPreferences] = useState(consent);

  // Ne pas afficher si déjà chargé et consentement donné
  if (!isLoaded || hasGivenConsent) {
    return null;
  }

  const handleCustomize = () => {
    customize(customPreferences);
  };

  const toggleCategory = (categoryId: keyof typeof customPreferences) => {
    if (categoryId === 'essential') return; // Ne pas modifier les essentiels
    
    setCustomPreferences(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg">
      <Card className="max-w-6xl mx-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-jomionstore-primary/10 rounded-lg">
                <Cookie className="w-6 h-6 text-jomionstore-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  🍪 Gestion des cookies
                </h3>
                <p className="text-sm text-gray-600">
                  Nous utilisons des cookies pour améliorer votre expérience
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="text-gray-500 hover:text-gray-700"
            >
              {showDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Message principal */}
          <div className="mb-4">
            <p className="text-gray-700 text-sm leading-relaxed">
              JomionStore utilise des cookies pour vous offrir la meilleure expérience possible. 
              Les cookies essentiels sont nécessaires au fonctionnement du site, tandis que les autres 
              nous aident à améliorer nos services et personnaliser votre expérience.
            </p>
          </div>

          {/* Détails des catégories */}
          {showDetails && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Types de cookies utilisés :</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {cookieCategories.map((category) => {
                  const IconComponent = category.icon;
                  const isEnabled = customPreferences[category.id as keyof typeof customPreferences];
                  
                  return (
                    <div
                      key={category.id}
                      className={`p-3 rounded-lg border-2 ${category.borderColor} ${category.bgColor} ${
                        category.required ? 'opacity-75' : 'cursor-pointer hover:opacity-80'
                      }`}
                      onClick={() => !category.required && toggleCategory(category.id as keyof typeof customPreferences)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IconComponent className={`w-4 h-4 ${category.color}`} />
                          <div>
                            <p className="font-medium text-sm text-gray-900">
                              {category.name}
                              {category.required && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  Obligatoire
                                </Badge>
                              )}
                            </p>
                            <p className="text-xs text-gray-600">{category.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isEnabled ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <X className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              <Button
                onClick={acceptAll}
                className="bg-jomionstore-primary hover:bg-orange-700 text-white"
              >
                <Check className="w-4 h-4 mr-2" />
                Accepter tout
              </Button>
              
              <Button
                onClick={rejectAll}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50"
              >
                <X className="w-4 h-4 mr-2" />
                Refuser tout
              </Button>
              
              {showDetails && (
                <Button
                  onClick={handleCustomize}
                  variant="outline"
                  className="border-jomionstore-primary text-jomionstore-primary hover:bg-jomionstore-primary/5"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Personnaliser
                </Button>
              )}
            </div>
            
            <div className="text-xs text-gray-500 flex items-center justify-center sm:justify-end">
              <Link 
                href="/cookies" 
                className="text-jomionstore-primary hover:underline"
              >
                En savoir plus
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}