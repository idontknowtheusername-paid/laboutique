'use client';

import React, { useState } from 'react';
import HeroCarouselVariants from '@/components/home/HeroCarouselVariants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Smartphone, Zap } from 'lucide-react';

type HeroVariant = 'fullscreen' | 'balanced' | 'compact';

const HeroDemo = () => {
  const [selectedVariant, setSelectedVariant] = useState<HeroVariant>('balanced');

  const variants = [
    {
      id: 'fullscreen' as HeroVariant,
      name: 'Fullscreen',
      description: 'Impact maximum, plein écran',
      icon: Monitor,
      specs: {
        mobile: '100vh (plein écran)',
        desktop: '80vh (80% écran)',
        title: '6xl mobile / 8xl desktop',
        content: 'max-w-4xl'
      },
      pros: ['Impact visuel maximum', 'Moderne et tendance', 'Parfait pour promotions', 'Espace pour contenu riche'],
      cons: ['Peut être trop imposant', 'Chargement plus long', 'Moins de contenu visible']
    },
    {
      id: 'balanced' as HeroVariant,
      name: 'Balanced',
      description: 'Équilibré et professionnel',
      icon: Smartphone,
      specs: {
        mobile: '60vh (60% écran)',
        desktop: '50vh (50% écran)',
        title: '5xl mobile / 6xl desktop',
        content: 'max-w-3xl'
      },
      pros: ['Équilibre parfait', 'Professionnel', 'Compatible tous écrans', 'Laisse espace contenu'],
      cons: ['Moins d\'impact visuel', 'Espace limité pour contenu']
    },
    {
      id: 'compact' as HeroVariant,
      name: 'Compact',
      description: 'Efficace et rapide',
      icon: Zap,
      specs: {
        mobile: '400px (fixe)',
        desktop: '500px (fixe)',
        title: '4xl mobile / 5xl desktop',
        content: 'max-w-2xl'
      },
      pros: ['Chargement rapide', 'Contenu visible immédiatement', 'Parfait e-commerce', 'Optimisé conversion'],
      cons: ['Moins d\'espace', 'Impact visuel réduit', 'Contenu limité']
    }
  ];

  const currentVariant = variants.find(v => v.id === selectedVariant);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container py-4">
          <h1 className="text-3xl font-bold text-gray-900">Hero Carousel - Démonstration</h1>
          <p className="text-gray-600 mt-2">Testez les 3 variantes de taille pour choisir la meilleure</p>
        </div>
      </div>

      <div className="container py-8">
        {/* Variant Selector */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Choisissez une variante :</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {variants.map((variant) => {
              const Icon = variant.icon;
              return (
                <Card 
                  key={variant.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedVariant === variant.id 
                      ? 'ring-2 ring-jomionstore-primary border-jomionstore-primary' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedVariant(variant.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-6 h-6 text-jomionstore-primary" />
                      <div>
                        <CardTitle className="text-lg">{variant.name}</CardTitle>
                        <CardDescription>{variant.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <strong>Mobile:</strong> {variant.specs.mobile}
                      </div>
                      <div className="text-sm">
                        <strong>Desktop:</strong> {variant.specs.desktop}
                      </div>
                      <div className="text-sm">
                        <strong>Titre:</strong> {variant.specs.title}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Current Variant Info */}
        {currentVariant && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <currentVariant.icon className="w-6 h-6 text-jomionstore-primary" />
                    <div>
                      <CardTitle>{currentVariant.name} - Spécifications</CardTitle>
                      <CardDescription>{currentVariant.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-jomionstore-primary">
                    Variante sélectionnée
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-600 mb-2">✅ Avantages :</h4>
                    <ul className="space-y-1 text-sm">
                      {currentVariant.pros.map((pro, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-600 mb-2">❌ Inconvénients :</h4>
                    <ul className="space-y-1 text-sm">
                      {currentVariant.cons.map((con, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Hero Carousel Demo */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Aperçu en temps réel :</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <HeroCarouselVariants
              variant={selectedVariant}
              autoRotate={true}
              showControls={true}
              showIndicators={true}
              showProgress={true}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <Button 
            onClick={() => setSelectedVariant('fullscreen')}
            variant={selectedVariant === 'fullscreen' ? 'default' : 'outline'}
            className="flex items-center space-x-2"
          >
            <Monitor className="w-4 h-4" />
            <span>Fullscreen</span>
          </Button>
          <Button 
            onClick={() => setSelectedVariant('balanced')}
            variant={selectedVariant === 'balanced' ? 'default' : 'outline'}
            className="flex items-center space-x-2"
          >
            <Smartphone className="w-4 h-4" />
            <span>Balanced</span>
          </Button>
          <Button 
            onClick={() => setSelectedVariant('compact')}
            variant={selectedVariant === 'compact' ? 'default' : 'outline'}
            className="flex items-center space-x-2"
          >
            <Zap className="w-4 h-4" />
            <span>Compact</span>
          </Button>
        </div>

        {/* Recommendation */}
        <div className="mt-8 p-6 bg-jomionstore-primary/10 rounded-lg">
          <h3 className="text-lg font-semibold text-jomionstore-primary mb-2">
            💡 Recommandation pour JomionStore
          </h3>
          <p className="text-gray-700">
            Pour un site e-commerce comme JomionStore, nous recommandons la variante <strong>Balanced</strong> 
            car elle offre le meilleur équilibre entre impact visuel et performance, tout en laissant de l'espace 
            pour le contenu important (produits, offres, etc.).
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroDemo;