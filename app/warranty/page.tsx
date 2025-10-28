'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  FileText, 
  AlertTriangle,
  Phone,
  Mail
} from 'lucide-react';
import Link from 'next/link';

const warrantyByCategory = [
  {
    category: 'Électronique & High-Tech',
    icon: '📱',
    products: 'Smartphones, tablettes, ordinateurs, TV, audio',
    legal: '2 ans (conformité)',
    manufacturer: '12-24 mois',
    commercial: 'Selon vendeur'
  },
  {
    category: 'Électroménager',
    icon: '🏠',
    products: 'Réfrigérateurs, machines à laver, micro-ondes',
    legal: '2 ans (conformité)',
    manufacturer: '12-24 mois',
    commercial: 'Extension possible'
  },
  {
    category: 'Mode & Accessoires',
    icon: '👕',
    products: 'Vêtements, chaussures, sacs, montres',
    legal: '2 ans (conformité)',
    manufacturer: '6-12 mois (montres)',
    commercial: 'Selon conditions vendeur'
  },
  {
    category: 'Maison & Jardin',
    icon: '🛋️',
    products: 'Meubles, décoration, outils',
    legal: '2 ans (conformité)',
    manufacturer: '12-24 mois (outils)',
    commercial: 'Variable'
  },
  {
    category: 'Beauté & Santé',
    icon: '💄',
    products: 'Cosmétiques, appareils beauté, bien-être',
    legal: '2 ans (appareils)',
    manufacturer: '12 mois (appareils)',
    commercial: 'Satisfait ou remboursé 30j'
  },
  {
    category: 'Sport & Loisirs',
    icon: '⚽',
    products: 'Équipements sportifs, vélos, camping',
    legal: '2 ans (conformité)',
    manufacturer: '6-24 mois',
    commercial: 'Variable selon marque'
  }
];

export default function WarrantyPage() {
  return (
    <div className="min-h-screen bg-jomionstore-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-jomionstore-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Garanties</span>
        </nav>

        <div className="mb-6">
          <Badge className="bg-jomionstore-primary mb-3">Protection complète</Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Garanties produits</h1>
          <p className="text-gray-600 text-lg">
            Tous les produits vendus sur JomionStore bénéficient de garanties légales et constructeur. 
            Vos achats sont protégés.
          </p>
        </div>

        <div className="space-y-6">
          {/* Types de garanties */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-jomionstore-primary" />
                1. Types de garanties
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Garantie légale de conformité */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  A. Garantie légale de conformité (2 ans)
                </h4>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Durée :</strong> 2 ans à compter de la livraison</li>
                  <li><strong>Obligatoire :</strong> S'applique à tous les produits neufs</li>
                  <li><strong>Couvre :</strong> Défauts de conformité existants à la livraison</li>
                  <li><strong>Gratuite :</strong> Réparation ou remplacement sans frais</li>
                  <li><strong>Présomption :</strong> Défaut apparu dans les 24 mois présumé existant à la livraison</li>
                  <li><strong>Recours :</strong> Contre le vendeur, pas le fabricant</li>
                </ul>
              </div>

              {/* Garantie légale des vices cachés */}
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  B. Garantie des vices cachés
                </h4>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Définition :</strong> Défaut grave rendant le produit impropre à l'usage</li>
                  <li><strong>Condition :</strong> Vice non apparent au moment de l'achat</li>
                  <li><strong>Délai :</strong> Action dans les 2 ans suivant la découverte du vice</li>
                  <li><strong>Solution :</strong> Remboursement intégral ou réduction du prix</li>
                  <li><strong>Preuve :</strong> À la charge de l'acheteur (expertise possible)</li>
                </ul>
              </div>

              {/* Garantie commerciale constructeur */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  C. Garantie commerciale constructeur
                </h4>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Facultative :</strong> Offerte par le fabricant (Apple, Samsung, LG, etc.)</li>
                  <li><strong>Durée variable :</strong> Généralement 12 à 24 mois selon la marque</li>
                  <li><strong>Conditions :</strong> Voir certificat de garantie fourni avec le produit</li>
                  <li><strong>Exclusions :</strong> Usure normale, mauvaise utilisation, dommages accidentels</li>
                  <li><strong>SAV :</strong> Prise en charge via centres agréés du constructeur</li>
                  <li><strong>Complémentaire :</strong> S'ajoute à la garantie légale (ne la remplace pas)</li>
                </ul>
              </div>

              {/* Garantie commerciale vendeur */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  D. Garantie commerciale vendeur (optionnelle)
                </h4>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Variable :</strong> Selon le vendeur partenaire</li>
                  <li><strong>Exemples :</strong> "Satisfait ou remboursé 30 jours", extension de garantie</li>
                  <li><strong>Payante ou gratuite :</strong> Selon les conditions du vendeur</li>
                  <li><strong>Détails :</strong> Consultez la fiche produit pour les conditions spécifiques</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Durées par catégorie */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-6 h-6 text-jomionstore-primary" />
                2. Durées de garantie par catégorie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left p-3 font-semibold">Catégorie</th>
                      <th className="text-left p-3 font-semibold">Produits</th>
                      <th className="text-left p-3 font-semibold">Légale</th>
                      <th className="text-left p-3 font-semibold">Constructeur</th>
                      <th className="text-left p-3 font-semibold">Commerciale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {warrantyByCategory.map((item, index) => (
                      <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{item.icon}</span>
                            <span className="font-medium">{item.category}</span>
                          </div>
                        </td>
                        <td className="p-3 text-sm text-gray-600">{item.products}</td>
                        <td className="p-3">
                          <Badge className="bg-green-600 text-white">{item.legal}</Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="border-blue-600 text-blue-600">{item.manufacturer}</Badge>
                        </td>
                        <td className="p-3 text-sm text-gray-600">{item.commercial}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Que faire en cas de problème */}
          <Card>
            <CardHeader>
              <CardTitle>3. Que faire en cas de problème ?</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <h4 className="font-semibold">Étape 1 : Identifier le type de problème</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Défaut de conformité :</strong> Produit différent de la description, dysfonctionnement</li>
                <li><strong>Vice caché :</strong> Défaut grave non visible à l'achat</li>
                <li><strong>Panne :</strong> Dysfonctionnement dans la période de garantie</li>
                <li><strong>Casse accidentelle :</strong> Chute, choc, immersion (non couvert)</li>
              </ul>

              <h4 className="font-semibold mt-6">Étape 2 : Contacter le bon interlocuteur</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2">📞 Garantie légale (0-24 mois)</h5>
                  <p className="text-sm mb-2">Contactez le vendeur via JomionStore :</p>
                  <ul className="text-sm space-y-1">
                    <li>• <strong>Mon compte</strong> &gt; Mes commandes &gt; Demander un retour</li>
                    <li>• Ou : <a href="mailto:contact@jomionstore.com" className="text-jomionstore-primary hover:underline">contact@jomionstore.com</a></li>
                    <li>• Tél : <a href="tel:+2290164354089" className="text-jomionstore-primary hover:underline">+229 01 64 35 40 89</a></li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2">🏭 Garantie constructeur</h5>
                  <p className="text-sm mb-2">Contactez le SAV du fabricant :</p>
                  <ul className="text-sm space-y-1">
                    <li>• Consultez le certificat de garantie fourni</li>
                    <li>• Appelez le numéro SAV de la marque</li>
                    <li>• Centres agréés listés sur le site du constructeur</li>
                    <li>• Conservez facture + emballage</li>
                  </ul>
                </div>
              </div>

              <h4 className="font-semibold mt-6">Étape 3 : Préparer le dossier</h4>
              <p>Documents à fournir :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Facture :</strong> Téléchargeable depuis <strong>Mon compte</strong> &gt; Mes commandes</li>
                <li><strong>Photos du défaut :</strong> Clair et détaillées</li>
                <li><strong>Description précise :</strong> Symptômes, date d'apparition</li>
                <li><strong>Numéro de série :</strong> Si applicable (électronique)</li>
                <li><strong>Emballage d'origine :</strong> Recommandé pour retour</li>
              </ul>

              <h4 className="font-semibold mt-6">Étape 4 : Solutions possibles</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                  <h5 className="font-semibold text-green-900 mb-2">✅ Réparation</h5>
                  <p className="text-sm text-gray-700">Sans frais dans la garantie</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                  <h5 className="font-semibold text-blue-900 mb-2">🔄 Remplacement</h5>
                  <p className="text-sm text-gray-700">Produit identique ou équivalent</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 text-center">
                  <h5 className="font-semibold text-orange-900 mb-2">💰 Remboursement</h5>
                  <p className="text-sm text-gray-700">Si réparation impossible</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exclusions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                4. Exclusions de garantie
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <AlertDescription className="text-gray-700">
                  Les garanties ne couvrent pas les dommages résultant de :
                </AlertDescription>
              </Alert>

              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Mauvaise utilisation :</strong> Non-respect des instructions d'utilisation</li>
                <li><strong>Dommages accidentels :</strong> Chutes, chocs, immersion, surtension</li>
                <li><strong>Usure normale :</strong> Piles, batteries, consommables, éléments d'usure</li>
                <li><strong>Réparations non autorisées :</strong> Intervention par un tiers non agréé</li>
                <li><strong>Modifications :</strong> Démontage, transformation, customisation non autorisée</li>
                <li><strong>Conditions extrêmes :</strong> Température, humidité, poussière hors normes</li>
                <li><strong>Défauts esthétiques mineurs :</strong> Rayures superficielles, variations de teinte</li>
                <li><strong>Produits d'occasion :</strong> Garantie réduite selon âge (voir conditions vendeur)</li>
              </ul>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
                <p className="mb-0">
                  <strong>💡 Conseil :</strong> Pour protéger votre achat contre les dommages accidentels, 
                  certains vendeurs proposent des <strong>extensions de garantie payantes</strong> ou des 
                  <strong>assurances produit</strong> (casse, vol, oxydation). Consultez les options lors de l'achat.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Délais de traitement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-6 h-6 text-jomionstore-primary" />
                5. Délais de traitement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2">1️⃣ Demande de prise en charge</h5>
                  <p className="text-sm text-gray-700">Réponse sous <strong>48 heures ouvrées</strong></p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2">2️⃣ Diagnostic</h5>
                  <p className="text-sm text-gray-700">Analyse sous <strong>5 à 7 jours</strong> après réception</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2">3️⃣ Résolution</h5>
                  <p className="text-sm text-gray-700">Réparation : <strong>10-21 jours</strong><br/>Remplacement : <strong>3-7 jours</strong></p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conseils */}
          <Card className="border-jomionstore-primary">
            <CardHeader>
              <CardTitle>6. Conseils pour préserver votre garantie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h5 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    ✅ À faire
                  </h5>
                  <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700">
                    <li>Conserver la facture et l'emballage d'origine</li>
                    <li>Enregistrer le produit sur le site du fabricant (si applicable)</li>
                    <li>Lire attentivement le manuel d'utilisation</li>
                    <li>Respecter les conditions d'utilisation et d'entretien</li>
                    <li>Signaler rapidement tout défaut constaté</li>
                    <li>Passer par les centres SAV agréés</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h5 className="font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    ❌ À éviter
                  </h5>
                  <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700">
                    <li>Jeter l'emballage et les accessoires</li>
                    <li>Faire réparer par un tiers non agréé</li>
                    <li>Démonter ou modifier le produit</li>
                    <li>Utiliser dans des conditions extrêmes</li>
                    <li>Ignorer les messages d'erreur ou défauts mineurs</li>
                    <li>Retarder la demande de garantie</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="border-jomionstore-primary bg-jomionstore-primary/5">
            <CardHeader>
              <CardTitle>7. Besoin d'aide avec votre garantie ?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Notre équipe est là pour vous accompagner dans toutes vos démarches de garantie.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h5 className="font-semibold mb-3 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-jomionstore-primary" />
                    Par téléphone
                  </h5>
                  <p className="text-sm text-gray-700 mb-2">Service client disponible :</p>
                  <p className="font-semibold text-jomionstore-primary mb-1">
                    <a href="tel:+2290164354089" className="hover:underline">+229 01 64 35 40 89</a>
                  </p>
                  <p className="text-xs text-gray-600">Lun-Ven : 8h-18h | Sam : 9h-16h</p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h5 className="font-semibold mb-3 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-jomionstore-primary" />
                    Par email
                  </h5>
                  <p className="text-sm text-gray-700 mb-2">Envoyez-nous votre demande :</p>
                  <p className="font-semibold text-jomionstore-primary mb-1">
                    <a href="mailto:contact@jomionstore.com" className="hover:underline">contact@jomionstore.com</a>
                  </p>
                  <p className="text-xs text-gray-600">Réponse sous 48h ouvrées</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <h5 className="font-semibold mb-2">En ligne</h5>
                <p className="text-sm text-gray-700">
                  Accédez à <strong>Mon compte</strong> &gt; <strong>Mes commandes</strong> pour gérer 
                  vos retours et demandes de garantie directement en ligne.
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
