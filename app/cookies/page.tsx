'use client';
export const revalidate = 300;

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Cookie, 
  Shield, 
  BarChart3, 
  Settings, 
  Target,
  Info,
  CheckCircle,
  X,
  ChevronDown,
  ChevronUp,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

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
      { name: 'auth_session', purpose: 'Gestion de la connexion utilisateur', duration: 'Session' },
      { name: 'cart_items', purpose: 'Contenu du panier d\'achat', duration: '30 jours' },
      { name: 'csrf_token', purpose: 'Protection contre les attaques CSRF', duration: 'Session' },
      { name: 'cookie_consent', purpose: 'Mémorisation de vos préférences cookies', duration: '13 mois' },
      { name: 'session_id', purpose: 'Identifiant de session sécurisée', duration: 'Session' }
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
      { name: 'user_preferences', purpose: 'Langue, devise, mode d\'affichage', duration: '12 mois' },
      { name: 'recently_viewed', purpose: 'Produits récemment consultés', duration: '30 jours' },
      { name: 'wishlist', purpose: 'Liste de souhaits (utilisateurs non connectés)', duration: '90 jours' },
      { name: 'search_history', purpose: 'Historique de recherche', duration: '30 jours' },
      { name: 'filters_applied', purpose: 'Filtres de recherche appliqués', duration: 'Session' }
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
      { name: '_ga', purpose: 'Google Analytics - Identification visiteur unique', duration: '2 ans' },
      { name: '_gid', purpose: 'Google Analytics - Distinction des utilisateurs', duration: '24 heures' },
      { name: '_gat', purpose: 'Google Analytics - Limitation du taux de requête', duration: '1 minute' },
      { name: 'vercel_analytics', purpose: 'Analyse des performances du site', duration: '13 mois' },
      { name: 'performance_metrics', purpose: 'Mesure des temps de chargement', duration: '30 jours' }
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
      { name: '_fbp', purpose: 'Facebook Pixel - Suivi des conversions', duration: '90 jours' },
      { name: 'fr', purpose: 'Facebook - Publicité ciblée', duration: '90 jours' },
      { name: 'IDE', purpose: 'Google Ads - Publicité display', duration: '13 mois' },
      { name: 'conversion_tracking', purpose: 'Suivi des achats pour remarketing', duration: '90 jours' },
      { name: 'campaign_source', purpose: 'Source de la campagne marketing', duration: '30 jours' }
    ]
  }
];

export default function CookiesPage() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <div className="min-h-screen bg-jomionstore-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-jomionstore-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Politique de cookies</span>
        </nav>

        <div className="mb-6">
          <Badge className="bg-jomionstore-primary mb-3 flex items-center gap-2 w-fit">
            <Cookie className="w-4 h-4" />
            Dernière mise à jour : 15 octobre 2025
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Politique de cookies</h1>
          <p className="text-gray-600 text-lg">
            Cette politique explique comment JomionStore utilise les cookies et technologies similaires 
            pour améliorer votre expérience sur notre plateforme.
          </p>
        </div>

        <div className="space-y-6">
          {/* Qu'est-ce qu'un cookie */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-6 h-6 text-jomionstore-primary" />
                1. Qu'est-ce qu'un cookie ?
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <p>
                Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur, smartphone, tablette) 
                lorsque vous visitez un site web. Les cookies permettent au site de mémoriser vos actions et 
                préférences (connexion, langue, taille de police, etc.) pour améliorer votre expérience.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="mb-0">
                  <strong>💡 Bon à savoir :</strong> Les cookies ne contiennent pas de virus et ne peuvent pas 
                  accéder à vos fichiers personnels. Ils servent uniquement à améliorer votre navigation.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Pourquoi nous utilisons des cookies */}
          <Card>
            <CardHeader>
              <CardTitle>2. Pourquoi JomionStore utilise des cookies ?</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <p>Nous utilisons des cookies pour :</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2">🔐 Sécurité & Fonctionnement</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Maintenir votre session de connexion</li>
                    <li>• Protéger contre les cyberattaques</li>
                    <li>• Gérer votre panier d'achat</li>
                    <li>• Assurer le bon fonctionnement du site</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2">⚙️ Préférences</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Mémoriser votre langue et devise</li>
                    <li>• Sauvegarder vos filtres de recherche</li>
                    <li>• Afficher vos produits récemment vus</li>
                    <li>• Conserver vos préférences d'affichage</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2">📊 Analyse</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Comprendre comment vous utilisez le site</li>
                    <li>• Identifier les pages les plus visitées</li>
                    <li>• Détecter les problèmes techniques</li>
                    <li>• Améliorer la performance du site</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2">🎯 Personnalisation</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Recommandations de produits adaptées</li>
                    <li>• Publicités pertinentes selon vos intérêts</li>
                    <li>• Offres promotionnelles ciblées</li>
                    <li>• Mesure de l'efficacité des campagnes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Types de cookies */}
          <Card>
            <CardHeader>
              <CardTitle>3. Types de cookies utilisés</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cookieCategories.map((category) => {
                const IconComponent = category.icon;
                const isExpanded = expandedCategory === category.id;
                
                return (
                  <div key={category.id} className={`border-2 ${category.borderColor} rounded-lg overflow-hidden`}>
                    {/* Header */}
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className={`w-full ${category.bgColor} p-4 flex items-center justify-between hover:opacity-80 transition-opacity`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className={`w-6 h-6 ${category.color}`} />
                        <div className="text-left">
                          <h4 className="font-semibold text-gray-900">{category.name}</h4>
                          <p className="text-sm text-gray-600">{category.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {category.required ? (
                          <Badge className="bg-gray-600">Obligatoires</Badge>
                        ) : (
                          <Badge variant="outline" className="border-gray-400">Optionnels</Badge>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                    </button>

                    {/* Content */}
                    {isExpanded && (
                      <div className="bg-white p-4">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b-2 border-gray-200">
                              <th className="text-left p-2 font-semibold">Nom du cookie</th>
                              <th className="text-left p-2 font-semibold">Finalité</th>
                              <th className="text-left p-2 font-semibold">Durée</th>
                            </tr>
                          </thead>
                          <tbody>
                            {category.examples.map((example, index) => (
                              <tr key={index} className="border-b border-gray-100">
                                <td className="p-2 font-mono text-xs">{example.name}</td>
                                <td className="p-2 text-gray-700">{example.purpose}</td>
                                <td className="p-2">
                                  <Badge variant="outline" className="text-xs">{example.duration}</Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}

              <Alert className="border-orange-200 bg-orange-50 mt-4">
                <Info className="w-4 h-4 text-orange-600" />
                <AlertDescription className="text-gray-700">
                  <strong>Durée "Session" :</strong> Le cookie est supprimé dès que vous fermez votre navigateur.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Cookies tiers */}
          <Card>
            <CardHeader>
              <CardTitle>4. Cookies tiers</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <p>
                Certains cookies sont déposés par des services tiers que nous utilisons pour améliorer 
                notre plateforme :
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h5 className="font-semibold mb-2">📊 Google Analytics</h5>
                  <p className="text-sm text-gray-700 mb-2">
                    Service d'analyse de trafic web. Nous aide à comprendre comment les visiteurs utilisent le site.
                  </p>
                  <a 
                    href="https://policies.google.com/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-jomionstore-primary hover:underline"
                  >
                    Politique de confidentialité Google →
                  </a>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h5 className="font-semibold mb-2">📘 Facebook Pixel</h5>
                  <p className="text-sm text-gray-700 mb-2">
                    Outil de suivi des conversions et de remarketing publicitaire sur Facebook et Instagram.
                  </p>
                  <a 
                    href="https://www.facebook.com/privacy/policy/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-jomionstore-primary hover:underline"
                  >
                    Politique de confidentialité Facebook →
                  </a>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h5 className="font-semibold mb-2">🎯 Google Ads</h5>
                  <p className="text-sm text-gray-700 mb-2">
                    Publicité ciblée sur le réseau Google Display et YouTube.
                  </p>
                  <a 
                    href="https://policies.google.com/technologies/ads" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-jomionstore-primary hover:underline"
                  >
                    Paramètres de publicité Google →
                  </a>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h5 className="font-semibold mb-2">⚡ Vercel Analytics</h5>
                  <p className="text-sm text-gray-700 mb-2">
                    Analyse des performances techniques du site (vitesse de chargement, erreurs).
                  </p>
                  <a 
                    href="https://vercel.com/legal/privacy-policy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-jomionstore-primary hover:underline"
                  >
                    Politique de confidentialité Vercel →
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gestion des cookies */}
          <Card className="border-jomionstore-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-6 h-6 text-jomionstore-primary" />
                5. Comment gérer vos cookies ?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-jomionstore-primary/5 p-4 rounded-lg border border-jomionstore-primary">
                <h5 className="font-semibold mb-3">🍪 Via notre bandeau de consentement</h5>
                <p className="text-sm text-gray-700 mb-3">
                  Lors de votre première visite, un bandeau apparaît pour vous permettre d'accepter ou de refuser 
                  les cookies optionnels. Vous pouvez modifier vos préférences à tout moment.
                </p>
                <Button className="bg-jomionstore-primary hover:bg-orange-700">
                  Gérer mes préférences cookies
                </Button>
              </div>

              <div className="space-y-4">
                <h5 className="font-semibold">🌐 Via votre navigateur</h5>
                <p className="text-sm text-gray-700">
                  Tous les navigateurs permettent de gérer les cookies. Voici comment accéder aux paramètres :
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { name: 'Google Chrome', path: 'Paramètres > Confidentialité et sécurité > Cookies et autres données de site' },
                    { name: 'Firefox', path: 'Paramètres > Vie privée et sécurité > Cookies et données de site' },
                    { name: 'Safari (Mac)', path: 'Préférences > Confidentialité > Gérer les données de site web' },
                    { name: 'Edge', path: 'Paramètres > Cookies et autorisations de site > Cookies et données de site' },
                    { name: 'Safari (iOS)', path: 'Réglages > Safari > Confidentialité et sécurité' },
                    { name: 'Chrome (Android)', path: 'Paramètres > Paramètres du site > Cookies' }
                  ].map((browser, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg border text-sm">
                      <p className="font-semibold mb-1">{browser.name}</p>
                      <p className="text-xs text-gray-600">{browser.path}</p>
                    </div>
                  ))}
                </div>

                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <AlertDescription className="text-gray-700">
                    <strong>⚠️ Attention :</strong> Le blocage de tous les cookies peut empêcher certaines 
                    fonctionnalités du site de fonctionner correctement (connexion, panier, etc.).
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Désactiver la publicité ciblée */}
          <Card>
            <CardHeader>
              <CardTitle>6. Désactiver la publicité ciblée</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <p>
                Si vous souhaitez refuser la publicité personnalisée, vous pouvez utiliser ces outils :
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border text-center">
                  <h5 className="font-semibold mb-2">🛡️ YourOnlineChoices</h5>
                  <p className="text-sm text-gray-700 mb-3">
                    Plateforme européenne de désactivation de la publicité ciblée
                  </p>
                  <a 
                    href="https://www.youronlinechoices.com/fr/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-jomionstore-primary hover:underline"
                  >
                    Accéder à YourOnlineChoices →
                  </a>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border text-center">
                  <h5 className="font-semibold mb-2">🚫 Google Ads Settings</h5>
                  <p className="text-sm text-gray-700 mb-3">
                    Gérez vos préférences publicitaires Google
                  </p>
                  <a 
                    href="https://adssettings.google.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-jomionstore-primary hover:underline"
                  >
                    Paramètres Google Ads →
                  </a>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border text-center">
                  <h5 className="font-semibold mb-2">📘 Facebook Ads</h5>
                  <p className="text-sm text-gray-700 mb-3">
                    Contrôlez vos préférences publicitaires Facebook
                  </p>
                  <a 
                    href="https://www.facebook.com/ads/preferences/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-jomionstore-primary hover:underline"
                  >
                    Préférences Facebook Ads →
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Do Not Track */}
          <Card>
            <CardHeader>
              <CardTitle>7. Signal "Do Not Track"</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <p>
                La plupart des navigateurs modernes proposent une option "Do Not Track" (DNT) pour indiquer 
                aux sites web que vous ne souhaitez pas être suivi. Toutefois, il n'existe pas encore de norme 
                universelle pour interpréter ce signal.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="mb-0">
                  <strong>Position de JomionStore :</strong> Nous respectons le signal DNT pour les cookies 
                  de marketing et de publicité ciblée, mais les cookies essentiels et fonctionnels restent 
                  nécessaires au bon fonctionnement du site.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Modifications */}
          <Card>
            <CardHeader>
              <CardTitle>8. Modifications de cette politique</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <p>
                Nous nous réservons le droit de modifier cette politique de cookies à tout moment pour refléter 
                les changements dans nos pratiques ou pour des raisons légales, réglementaires ou techniques.
              </p>
              <p>
                Les modifications seront publiées sur cette page avec une date de mise à jour. Nous vous 
                encourageons à consulter régulièrement cette politique.
              </p>
              <p>
                En cas de modification substantielle, nous vous en informerons via une notification sur le site 
                ou par email.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="border-jomionstore-primary bg-jomionstore-primary/5">
            <CardHeader>
              <CardTitle>9. Questions sur les cookies ?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Pour toute question concernant notre utilisation des cookies, contactez-nous :
              </p>
              <div className="bg-white p-4 rounded-lg border">
                <p className="font-semibold mb-3">JomionStore - Protection des données</p>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    <strong>Email :</strong> <a href="mailto:contact@jomionstore.com" className="text-jomionstore-primary hover:underline">contact@jomionstore.com</a>
                  </p>
                  <p>
                    <strong>Téléphone :</strong> <a href="tel:+2290164354089" className="text-jomionstore-primary hover:underline">+229 01 64 35 40 89</a>
                  </p>
                  <p>
                    <strong>Adresse :</strong> Quartier Ganhi, Cotonou, République du Bénin
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Voir aussi notre <Link href="/privacy" className="text-jomionstore-primary hover:underline font-semibold">Politique de confidentialité</Link> 
                {' '}pour plus d'informations sur la protection de vos données personnelles.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
