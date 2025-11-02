'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Truck, 
  Clock, 
  ShieldCheck, 
  MapPin,
  Package,
  DollarSign,
  CheckCircle,
  Zap,
  Phone,
  Mail,
  Info,
  Star,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

export default function DeliveryInfoPage() {
  return (
    <div className="min-h-screen bg-jomionstore-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-jomionstore-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Informations de livraison</span>
        </nav>

        <div className="mb-6">
          <Badge className="bg-jomionstore-primary mb-3">Livraison rapide et sécurisée</Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Informations de livraison</h1>
          <p className="text-gray-600 text-lg">
            Découvrez nos options de livraison, délais, zones couvertes et frais appliqués.
          </p>
        </div>

        <div className="space-y-6">
          {/* Livraison gratuite */}
          <Card className="border-2 border-green-400 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-green-900">Livraison GRATUITE</h3>
                    <p className="text-green-700 font-semibold">Dès 200 000 XOF d'achat</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-green-700">0 XOF</p>
                  <p className="text-sm text-gray-600">Économisez jusqu'à 5 000 XOF</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Options de livraison */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📦 Options de livraison</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Standard */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-6 h-6 text-blue-600" />
                    Standard
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-3xl font-bold text-blue-700">2 000 XOF</p>
                    <p className="text-sm text-gray-600 mt-1">Commande &lt; 50 000 XOF</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <span><strong>Délai :</strong> 2-4 jours</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-600" />
                      <span><strong>Zones :</strong> Toutes les villes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="w-4 h-4 text-gray-600" />
                      <span><strong>Suivi :</strong> En temps réel</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-xs text-gray-600">
                      ✅ Livraison à domicile ou au bureau<br />
                      ✅ Notification SMS + Email<br />
                      ✅ Paiement à la livraison disponible
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Express */}
              <Card className="border-2 border-orange-400">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-6 h-6 text-orange-600" />
                    Express
                    <Badge className="bg-orange-600 ml-2">Populaire</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-3xl font-bold text-orange-700">+ 1 500 XOF</p>
                    <p className="text-sm text-gray-600 mt-1">En plus des frais standards</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <span><strong>Délai :</strong> Moins de 24h</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-600" />
                      <span><strong>Zone :</strong> Cotonou uniquement</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="w-4 h-4 text-gray-600" />
                      <span><strong>Suivi :</strong> GPS en direct</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-xs text-gray-600">
                      ⚡ Livraison ultra-rapide<br />
                      ✅ Créneau horaire précis<br />
                      ✅ Priorité absolue
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Point relais */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-purple-600" />
                    Point relais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-3xl font-bold text-purple-700">1 000 XOF</p>
                    <p className="text-sm text-gray-600 mt-1">Économisez 50%</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <span><strong>Délai :</strong> 2-3 jours</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-600" />
                      <span><strong>Points :</strong> 15+ à Cotonou</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="w-4 h-4 text-gray-600" />
                      <span><strong>Retrait :</strong> 7j/7 jusqu'à 20h</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-xs text-gray-600">
                      💰 Option la plus économique<br />
                      ✅ Horaires flexibles<br />
                      ✅ Colis sécurisé 7 jours
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Zones et délais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-6 h-6 text-jomionstore-primary" />
                Zones de livraison & Délais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <h4 className="font-bold text-green-900">Zone 1 - Cotonou</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><strong>Délai :</strong> 24-48h</p>
                    <p><strong>Frais :</strong> 2 000 XOF</p>
                    <p><strong>Express :</strong> Disponible (+1 500)</p>
                    <p className="text-xs text-gray-600 pt-2 border-t">
                      Quartiers couverts : Akpakpa, Cadjéhoun, Fidjrossè, Godomey, etc.
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <h4 className="font-bold text-blue-900">Zone 2 - Grandes villes</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><strong>Délai :</strong> 2-4 jours</p>
                    <p><strong>Frais :</strong> 3 000 XOF</p>
                    <p><strong>Express :</strong> Non disponible</p>
                    <p className="text-xs text-gray-600 pt-2 border-t">
                      Porto-Novo, Parakou, Abomey-Calavi, Bohicon, Djougou
                    </p>
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-300">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                    <h4 className="font-bold text-orange-900">Zone 3 - Autres</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><strong>Délai :</strong> 3-7 jours</p>
                    <p><strong>Frais :</strong> 4 000 - 5 000 XOF</p>
                    <p><strong>Express :</strong> Non disponible</p>
                    <p className="text-xs text-gray-600 pt-2 border-t">
                      Selon accessibilité et éloignement
                    </p>
                  </div>
                </div>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <Info className="w-4 h-4 text-blue-600" />
                <AlertDescription>
                  <strong>💡 Astuce :</strong> Les délais indiqués sont hors week-ends et jours fériés. 
                  La livraison gratuite (≥200 000 XOF) s'applique à toutes les zones.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Partenaires de livraison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-600" />
                Nos partenaires de livraison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-semibold text-sm">BLS Express</p>
                  <p className="text-xs text-gray-600">Rapide & fiable</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border text-center">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-semibold text-sm">DHL Bénin</p>
                  <p className="text-xs text-gray-600">International</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border text-center">
                  <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-semibold text-sm">Chronopost</p>
                  <p className="text-xs text-gray-600">Urgent</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border text-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-semibold text-sm">JomionFleet</p>
                  <p className="text-xs text-gray-600">Propre réseau</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Processus de livraison */}
          <Card>
            <CardHeader>
              <CardTitle>🚚 Comment se déroule la livraison ?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-jomionstore-primary text-white rounded-full flex items-center justify-center font-bold">1</div>
                  <div>
                    <h5 className="font-semibold">Validation de la commande</h5>
                    <p className="text-sm text-gray-600">
                      Dès validation du paiement, vous recevez un email de confirmation avec le numéro de commande.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-jomionstore-primary text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <div>
                    <h5 className="font-semibold">Préparation (24-48h)</h5>
                    <p className="text-sm text-gray-600">
                      Le vendeur prépare votre colis. Vous recevez une notification quand c'est prêt.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-jomionstore-primary text-white rounded-full flex items-center justify-center font-bold">3</div>
                  <div>
                    <h5 className="font-semibold">Expédition & Suivi</h5>
                    <p className="text-sm text-gray-600">
                      Le colis est confié au transporteur. Vous recevez un code de suivi pour suivre en temps réel.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-jomionstore-primary text-white rounded-full flex items-center justify-center font-bold">4</div>
                  <div>
                    <h5 className="font-semibold">Notification avant livraison</h5>
                    <p className="text-sm text-gray-600">
                      Le livreur vous appelle 1h avant pour confirmer votre disponibilité et l'adresse.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">✓</div>
                  <div>
                    <h5 className="font-semibold text-green-700">Livraison & Vérification</h5>
                    <p className="text-sm text-gray-600">
                      Le livreur vous remet le colis. <strong>Vérifiez le contenu avant de signer !</strong> Si problème, refusez le colis.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conseils pratiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-green-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  ✅ À faire
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Vérifier le colis avant de signer</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Être disponible au numéro fourni</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Avoir une pièce d'identité pour retrait</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Suivre votre colis en temps réel</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Prendre photo si colis endommagé</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-red-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-red-600" />
                  ❌ À éviter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>Signer sans vérifier le contenu</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>Donner une mauvaise adresse</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>Être injoignable au téléphone</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>Laisser le colis sans surveillance</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>Attendre plus de 7j pour réclamer</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Livraison */}
          <Card>
            <CardHeader>
              <CardTitle>❓ Questions fréquentes - Livraison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-4 border-jomionstore-primary pl-4 py-2">
                <h5 className="font-semibold mb-1">Puis-je changer l'adresse après commande ?</h5>
                <p className="text-sm text-gray-700">
                  Oui, tant que le colis n'est pas encore expédié (statut "En préparation"). 
                  Contactez-nous rapidement via <a href="tel:+2290164354089" className="text-jomionstore-primary hover:underline">+229 01 64 35 40 89</a>.
                </p>
              </div>

              <div className="border-l-4 border-jomionstore-primary pl-4 py-2">
                <h5 className="font-semibold mb-1">Que faire si je suis absent à la livraison ?</h5>
                <p className="text-sm text-gray-700">
                  Le livreur tentera 2 passages. Si échec, le colis sera disponible en point relais 
                  pendant 7 jours. Vous recevrez un SMS avec l'adresse.
                </p>
              </div>

              <div className="border-l-4 border-jomionstore-primary pl-4 py-2">
                <h5 className="font-semibold mb-1">Puis-je payer à la livraison ?</h5>
                <p className="text-sm text-gray-700">
                  Oui, le paiement à la livraison (Cash on Delivery) est disponible pour les commandes 
                  inférieures à 100 000 XOF. Frais supplémentaires : 500 XOF.
                </p>
              </div>

              <div className="border-l-4 border-jomionstore-primary pl-4 py-2">
                <h5 className="font-semibold mb-1">Mon colis est en retard, que faire ?</h5>
                <p className="text-sm text-gray-700">
                  Vérifiez d'abord le statut via{' '}
                  <Link href="/order-tracking" className="text-jomionstore-primary hover:underline font-semibold">Suivi de commande</Link>. 
                  Si retard &gt; 2 jours, contactez notre support.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact support livraison */}
          <Card className="border-jomionstore-primary bg-jomionstore-primary/5">
            <CardHeader>
              <CardTitle>💬 Questions sur la livraison ?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Notre équipe logistique est disponible pour répondre à vos questions :
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-5 h-5 text-jomionstore-primary" />
                    <p className="font-semibold">Support livraison</p>
                  </div>
                  <p className="text-jomionstore-primary font-bold text-xl mb-1">
                    <a href="tel:+2290164354089" className="hover:underline">+229 01 64 35 40 89</a>
                  </p>
                  <p className="text-xs text-gray-600">Lun-Sam : 8h-20h | Dim : 10h-18h</p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-5 h-5 text-jomionstore-primary" />
                    <p className="font-semibold">Email support</p>
                  </div>
                  <p className="text-jomionstore-primary font-bold text-lg mb-1">
                    <a href="mailto:contact@jomionstore.com" className="hover:underline">contact@jomionstore.com</a>
                  </p>
                  <p className="text-xs text-gray-600">Réponse sous 2h (problèmes urgents)</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-700 text-center">
                  📍 Suivez votre commande en direct :{' '}
                  <Link href="/order-tracking" className="text-jomionstore-primary hover:underline font-semibold">
                    Suivi de commande →
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
