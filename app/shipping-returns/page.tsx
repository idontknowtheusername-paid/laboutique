'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Truck, 
  Package, 
  MapPin, 
  Clock, 
  DollarSign,
  CheckCircle,
  RefreshCw,
  AlertTriangle,
  Info,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function ShippingReturnsPage() {
  return (
    <div className="min-h-screen bg-jomionstore-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-jomionstore-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Livraison & Retours</span>
        </nav>

        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Livraison & Retours</h1>
          <p className="text-gray-600 text-lg">
            Tout ce que vous devez savoir sur la livraison de vos commandes et les retours.
          </p>
        </div>

        <div className="space-y-6">
          {/* SECTION LIVRAISON */}
          <Card className="border-jomionstore-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-6 h-6 text-jomionstore-primary" />
                📦 Livraison
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Zones et délais */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-jomionstore-primary" />
                  Zones et délais de livraison
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h5 className="font-semibold text-green-900">Cotonou</h5>
                    </div>
                    <p className="text-2xl font-bold text-green-700 mb-1">24-48h</p>
                    <p className="text-xs text-gray-600">Livraison express disponible</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <h5 className="font-semibold text-blue-900">Villes principales</h5>
                    </div>
                    <p className="text-2xl font-bold text-blue-700 mb-1">2-4 jours</p>
                    <p className="text-xs text-gray-600">Porto-Novo, Parakou, Abomey-Calavi</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-5 h-5 text-orange-600" />
                      <h5 className="font-semibold text-orange-900">Autres zones</h5>
                    </div>
                    <p className="text-2xl font-bold text-orange-700 mb-1">3-7 jours</p>
                    <p className="text-xs text-gray-600">Selon l'accessibilité</p>
                  </div>
                </div>
              </div>

              {/* Frais de livraison */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-jomionstore-primary" />
                  Frais de livraison
                </h4>
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border-2 border-green-300">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Commande de 200 000 XOF et plus</p>
                      <p className="text-3xl font-bold text-green-700">LIVRAISON GRATUITE 🎉</p>
                    </div>
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <p className="text-sm text-gray-600 mb-1">Commande inférieure à 50 000 XOF</p>
                    <p className="text-xl font-bold text-gray-900">À partir de 2 000 XOF</p>
                    <p className="text-xs text-gray-600 mt-1">Selon le poids et la destination</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <p className="text-sm text-gray-600 mb-1">Livraison express (Cotonou)</p>
                    <p className="text-xl font-bold text-gray-900">+ 1 500 XOF</p>
                    <p className="text-xs text-gray-600 mt-1">Livraison en moins de 24h</p>
                  </div>
                </div>
              </div>

              {/* Processus de livraison */}
              <div>
                <h4 className="font-semibold mb-3">📋 Processus de livraison (étape par étape)</h4>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-jomionstore-primary text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <div>
                      <h5 className="font-semibold">Commande validée</h5>
                      <p className="text-sm text-gray-600">Vous recevez un email de confirmation avec le numéro de commande.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-jomionstore-primary text-white rounded-full flex items-center justify-center font-bold">2</div>
                    <div>
                      <h5 className="font-semibold">En préparation (24-48h)</h5>
                      <p className="text-sm text-gray-600">Le vendeur prépare votre colis et vérifie les produits.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-jomionstore-primary text-white rounded-full flex items-center justify-center font-bold">3</div>
                    <div>
                      <h5 className="font-semibold">Expédié</h5>
                      <p className="text-sm text-gray-600">Email avec numéro de suivi. Suivez votre colis en temps réel.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-jomionstore-primary text-white rounded-full flex items-center justify-center font-bold">4</div>
                    <div>
                      <h5 className="font-semibold">En transit</h5>
                      <p className="text-sm text-gray-600">Votre colis est en route vers l'adresse de livraison.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">✓</div>
                    <div>
                      <h5 className="font-semibold text-green-700">Livré !</h5>
                      <p className="text-sm text-gray-600">Vérifiez le colis avant de signer. Profitez de vos achats ! 🎉</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Suivi */}
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="w-4 h-4 text-blue-600" />
                <AlertDescription>
                  <strong>📍 Suivi en temps réel :</strong> Connectez-vous à <strong>Mon compte → Mes commandes</strong> 
                  {' '}pour suivre votre colis en direct avec le numéro de tracking.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* SECTION RETOURS */}
          <Card className="border-orange-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-6 h-6 text-orange-600" />
                🔄 Retours & Remboursements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Droit de rétractation */}
              <div className="bg-orange-50 p-6 rounded-lg border-2 border-orange-300">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-8 h-8 text-orange-600" />
                  <div>
                    <h4 className="text-xl font-bold text-orange-900">30 jours pour changer d'avis</h4>
                    <p className="text-sm text-gray-700">Retours gratuits et remboursement intégral</p>
                  </div>
                </div>
              </div>

              {/* Procédure retour étape par étape */}
              <div>
                <h4 className="font-semibold mb-3">📋 Comment retourner un produit (étape par étape)</h4>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <div>
                      <h5 className="font-semibold">Connectez-vous à votre compte</h5>
                      <p className="text-sm text-gray-600">Allez dans <strong>Mon compte → Mes commandes</strong></p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                    <div>
                      <h5 className="font-semibold">Sélectionnez la commande</h5>
                      <p className="text-sm text-gray-600">Cliquez sur "Demander un retour" à côté du produit concerné.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                    <div>
                      <h5 className="font-semibold">Indiquez le motif</h5>
                      <p className="text-sm text-gray-600">Choisissez la raison : "Ne convient pas", "Défectueux", "Erreur de commande", etc.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                    <div>
                      <h5 className="font-semibold">Recevez l'étiquette retour</h5>
                      <p className="text-sm text-gray-600">Un email avec l'étiquette de retour prépayée vous sera envoyé sous 24h.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">5</div>
                    <div>
                      <h5 className="font-semibold">Emballez le produit</h5>
                      <p className="text-sm text-gray-600">Dans son emballage d'origine avec tous les accessoires, notices et étiquettes.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">6</div>
                    <div>
                      <h5 className="font-semibold">Déposez le colis</h5>
                      <p className="text-sm text-gray-600">Point relais ou transporteur indiqué sur l'étiquette retour.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">✓</div>
                    <div>
                      <h5 className="font-semibold text-green-700">Remboursé !</h5>
                      <p className="text-sm text-gray-600">Remboursement sous 7-10 jours après réception et contrôle du produit.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conditions de retour */}
              <div>
                <h4 className="font-semibold mb-3">✅ Conditions pour un retour valide</h4>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Produit non utilisé</strong> : Dans son état d'origine, avec étiquettes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Emballage intact</strong> : Boîte, notices et accessoires complets</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Délai respecté</strong> : Demande dans les 30 jours après réception</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Produit éligible</strong> : Voir liste des exclusions ci-dessous</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Produits non éligibles */}
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <AlertDescription>
                  <strong>❌ Produits NON éligibles aux retours :</strong>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                    <li>Cosmétiques, parfums et produits d'hygiène ouverts</li>
                    <li>Sous-vêtements (sauf défectueux)</li>
                    <li>Cartes cadeaux et bons d'achat</li>
                    <li>Produits personnalisés ou sur mesure</li>
                    <li>Denrées périssables</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Remboursement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-green-600" />
                💰 Remboursement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h5 className="font-semibold text-green-900 mb-2">Délai de remboursement</h5>
                <p className="text-sm text-gray-700">
                  Le remboursement est effectué dans un délai de <strong>7 à 10 jours ouvrés</strong> après 
                  réception et contrôle du produit retourné.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h5 className="font-semibold mb-2">Mode de remboursement</h5>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• <strong>Mobile Money :</strong> Compte initial</li>
                    <li>• <strong>Carte bancaire :</strong> Même carte</li>
                    <li>• <strong>Virement :</strong> RIB fourni</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h5 className="font-semibold mb-2">Montant remboursé</h5>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>✅ Prix du produit : 100%</li>
                    <li>✅ Frais de livraison initiaux</li>
                    <li>❌ Frais retour : pris en charge par JomionStore</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Suivi retour */}
          <Card>
            <CardHeader>
              <CardTitle>📍 Suivi de votre retour</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Vous pouvez suivre l'état de votre demande de retour depuis votre compte :
              </p>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <ArrowRight className="w-4 h-4 text-jomionstore-primary" />
                    <span className="text-sm"><strong>Mon compte</strong> → <strong>Mes retours</strong></span>
                  </div>
                  <p className="text-xs text-gray-600 pl-7">
                    Statuts : Demande reçue → Étiquette envoyée → Colis reçu → Contrôle en cours → Remboursé
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="border-jomionstore-primary bg-jomionstore-primary/5">
            <CardHeader>
              <CardTitle>💬 Questions sur votre livraison ou retour ?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">Notre service client est disponible pour vous aider :</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <p className="font-semibold mb-2">📞 Par téléphone</p>
                  <p className="text-jomionstore-primary font-semibold">
                    <a href="tel:+2290164354089" className="hover:underline">+229 01 64 35 40 89</a>
                  </p>
                  <p className="text-xs text-gray-600">Lun-Ven : 8h-18h | Sam : 9h-16h</p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <p className="font-semibold mb-2">✉️ Par email</p>
                  <p className="text-jomionstore-primary font-semibold">
                    <a href="mailto:contact@jomionstore.com" className="hover:underline">contact@jomionstore.com</a>
                  </p>
                  <p className="text-xs text-gray-600">Réponse sous 48h ouvrées</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
