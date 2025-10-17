'use client';
export const revalidate = 300;

import React from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Smartphone, 
  Shield, 
  CheckCircle,
  Zap,
  Lock,
  AlertTriangle,
  Info
} from 'lucide-react';
import Link from 'next/link';

export default function PaymentInfoPage() {
  return (
    <div className="min-h-screen bg-jomionstore-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-jomionstore-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Moyens de paiement</span>
        </nav>

        <div className="mb-6">
          <Badge className="bg-jomionstore-primary mb-3">Paiements 100% sécurisés</Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Moyens de paiement</h1>
          <p className="text-gray-600 text-lg">
            Payez en toute sécurité avec le mode de paiement qui vous convient.
          </p>
        </div>

        <div className="space-y-6">
          {/* Sécurité */}
          <Alert className="border-green-200 bg-green-50">
            <Shield className="w-5 h-5 text-green-600" />
            <AlertDescription className="text-gray-700">
              <strong>🔒 Paiements 100% sécurisés</strong> - Toutes les transactions sont chiffrées et 
              protégées par nos partenaires certifiés PCI-DSS. Vos données bancaires ne sont jamais stockées sur nos serveurs.
            </AlertDescription>
          </Alert>

          {/* Mobile Money */}
          <Card className="border-orange-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-6 h-6 text-orange-600" />
                📱 Mobile Money (Recommandé)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-6 h-6 text-orange-600" />
                  <h5 className="font-semibold text-orange-900">Paiement instantané et sécurisé</h5>
                </div>
                <p className="text-sm text-gray-700">Le moyen le plus rapide et pratique pour payer sur JomionStore !</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-400">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xl">M</span>
                    </div>
                    <div>
                      <h5 className="font-bold text-yellow-900">MTN Mobile Money</h5>
                      <p className="text-xs text-gray-600">Le plus utilisé au Bénin</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700 mt-3">
                    <p><strong>Comment ça marche :</strong></p>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Choisissez "MTN MoMo" au checkout</li>
                      <li>Entrez votre numéro MTN</li>
                      <li>Validez le paiement sur votre téléphone</li>
                      <li>Entrez votre code PIN MTN</li>
                      <li>Confirmation instantanée ✅</li>
                    </ol>
                  </div>
                  <div className="mt-3 pt-3 border-t border-yellow-300">
                    <p className="text-xs text-gray-600">
                      <strong>Frais :</strong> Aucun frais supplémentaire | <strong>Délai :</strong> Instantané
                    </p>
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg border-2 border-red-400">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xl">M</span>
                    </div>
                    <div>
                      <h5 className="font-bold text-red-900">Moov Money</h5>
                      <p className="text-xs text-gray-600">Flooz - Rapide et fiable</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700 mt-3">
                    <p><strong>Comment ça marche :</strong></p>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Choisissez "Moov Money" au checkout</li>
                      <li>Entrez votre numéro Moov</li>
                      <li>Validez le paiement sur votre téléphone</li>
                      <li>Entrez votre code PIN Moov</li>
                      <li>Confirmation instantanée ✅</li>
                    </ol>
                  </div>
                  <div className="mt-3 pt-3 border-t border-red-300">
                    <p className="text-xs text-gray-600">
                      <strong>Frais :</strong> Aucun frais supplémentaire | <strong>Délai :</strong> Instantané
                    </p>
                  </div>
                </div>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <Info className="w-4 h-4 text-blue-600" />
                <AlertDescription>
                  <strong>💡 Avantages Mobile Money :</strong> Pas besoin de carte bancaire, paiement depuis votre téléphone, 
                  confirmation instantanée, sécurisé par votre code PIN.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Cartes bancaires */}
          <Card className="border-blue-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-blue-600" />
                💳 Cartes bancaires
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                  <div className="w-12 h-8 bg-blue-600 rounded text-white font-bold flex items-center justify-center mx-auto mb-2">VISA</div>
                  <p className="text-xs text-gray-600">Carte Visa</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
                  <div className="w-12 h-8 bg-red-600 rounded text-white font-bold flex items-center justify-center mx-auto mb-2 text-xs">MC</div>
                  <p className="text-xs text-gray-600">Mastercard</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 text-center">
                  <div className="w-12 h-8 bg-orange-600 rounded text-white font-bold flex items-center justify-center mx-auto mb-2 text-xs">VISA E</div>
                  <p className="text-xs text-gray-600">Visa Electron</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
                  <div className="w-12 h-8 bg-purple-600 rounded text-white font-bold flex items-center justify-center mx-auto mb-2 text-xs">MAE</div>
                  <p className="text-xs text-gray-600">Maestro</p>
                </div>
              </div>

              <div>
                <h5 className="font-semibold mb-3">Comment payer par carte ?</h5>
                <div className="space-y-2">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <p className="text-sm text-gray-700">Sélectionnez "Carte bancaire" au checkout</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <p className="text-sm text-gray-700">Entrez les informations : numéro, date d'expiration, CVV</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <p className="text-sm text-gray-700">Validation 3D Secure (code SMS de votre banque)</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
                    <p className="text-sm text-gray-700">Paiement confirmé - Commande validée !</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h5 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Sécurité renforcée
                </h5>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• <strong>3D Secure :</strong> Authentification par SMS ou application bancaire</li>
                  <li>• <strong>Chiffrement SSL/TLS :</strong> Données cryptées de bout en bout</li>
                  <li>• <strong>PCI-DSS :</strong> Conformité aux normes bancaires internationales</li>
                  <li>• <strong>Partenaire :</strong> Qosic (certifié et agréé)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Virement bancaire */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏦 Virement bancaire
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Pour les commandes importantes (à partir de 100 000 XOF), vous pouvez payer par virement bancaire.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h5 className="font-semibold mb-3">Procédure :</h5>
                <ol className="space-y-2 text-sm text-gray-700 list-decimal pl-5">
                  <li>Sélectionnez "Virement bancaire" au checkout</li>
                  <li>Notez les coordonnées bancaires affichées (IBAN, BIC, référence)</li>
                  <li>Effectuez le virement depuis votre banque en ligne ou agence</li>
                  <li>Envoyez le justificatif à <a href="mailto:contact@jomionstore.com" className="text-jomionstore-primary hover:underline">contact@jomionstore.com</a></li>
                  <li>Votre commande est validée dès réception du paiement (1-3 jours ouvrés)</li>
                </ol>
              </div>
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <AlertDescription>
                  <strong>⏱️ Délai :</strong> La validation prend 1 à 3 jours ouvrés. L'expédition commence après confirmation du paiement.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Sécurité */}
          <Card className="border-green-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-600" />
                🔒 Sécurité des paiements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h5 className="font-semibold text-green-900 mb-2">Protection des données</h5>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• <strong>Chiffrement HTTPS/TLS 1.3</strong></li>
                    <li>• <strong>Tokenisation</strong> des cartes bancaires</li>
                    <li>• <strong>Aucun stockage</strong> des données bancaires complètes</li>
                    <li>• <strong>Conformité PCI-DSS</strong> niveau 1</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h5 className="font-semibold text-blue-900 mb-2">Partenaires de confiance</h5>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• <strong>Qosic</strong> : Paiements Mobile Money & Cartes</li>
                    <li>• <strong>MTN</strong> : Mobile Money certifié</li>
                    <li>• <strong>Moov</strong> : Flooz sécurisé</li>
                    <li>• <strong>Banques partenaires</strong> : Agréées BCEAO</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border">
                <h5 className="font-semibold mb-2">🛡️ Protection acheteur</h5>
                <p className="text-sm text-gray-700">
                  En cas de problème (produit non reçu, article défectueux, erreur de paiement), 
                  vous êtes protégé. Contactez notre service client dans les <strong>48 heures</strong> pour 
                  ouvrir une réclamation. Remboursement garanti si le problème est avéré.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Comparaison */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Comparaison des modes de paiement</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left p-3">Mode</th>
                    <th className="text-left p-3">Frais</th>
                    <th className="text-left p-3">Délai</th>
                    <th className="text-left p-3">Sécurité</th>
                    <th className="text-left p-3">Recommandé</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-3 font-semibold">MTN Mobile Money</td>
                    <td className="p-3"><Badge className="bg-green-600">0 XOF</Badge></td>
                    <td className="p-3"><Badge className="bg-green-600">Instantané</Badge></td>
                    <td className="p-3"><Badge className="bg-green-600">Très élevée</Badge></td>
                    <td className="p-3"><CheckCircle className="w-5 h-5 text-green-600" /></td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-3 font-semibold">Moov Money</td>
                    <td className="p-3"><Badge className="bg-green-600">0 XOF</Badge></td>
                    <td className="p-3"><Badge className="bg-green-600">Instantané</Badge></td>
                    <td className="p-3"><Badge className="bg-green-600">Très élevée</Badge></td>
                    <td className="p-3"><CheckCircle className="w-5 h-5 text-green-600" /></td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-3 font-semibold">Visa / Mastercard</td>
                    <td className="p-3"><Badge className="bg-green-600">0 XOF</Badge></td>
                    <td className="p-3"><Badge className="bg-green-600">Instantané</Badge></td>
                    <td className="p-3"><Badge className="bg-green-600">Très élevée</Badge></td>
                    <td className="p-3"><CheckCircle className="w-5 h-5 text-green-600" /></td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-3 font-semibold">Virement bancaire</td>
                    <td className="p-3"><Badge variant="outline">Selon banque</Badge></td>
                    <td className="p-3"><Badge className="bg-orange-600">1-3 jours</Badge></td>
                    <td className="p-3"><Badge className="bg-green-600">Très élevée</Badge></td>
                    <td className="p-3 text-gray-400">-</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* FAQ Paiement */}
          <Card>
            <CardHeader>
              <CardTitle>❓ Questions fréquentes - Paiement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-4 border-jomionstore-primary pl-4 py-2">
                <h5 className="font-semibold mb-1">Mes données bancaires sont-elles sécurisées ?</h5>
                <p className="text-sm text-gray-700">
                  Oui, absolument. Nous utilisons le chiffrement SSL/TLS et nos partenaires sont certifiés PCI-DSS. 
                  Vos données ne sont jamais stockées sur nos serveurs.
                </p>
              </div>

              <div className="border-l-4 border-jomionstore-primary pl-4 py-2">
                <h5 className="font-semibold mb-1">Puis-je payer en plusieurs fois ?</h5>
                <p className="text-sm text-gray-700">
                  Cette option est en cours de déploiement. Elle sera bientôt disponible pour les commandes 
                  supérieures à 30 000 XOF (paiement en 3x ou 4x sans frais).
                </p>
              </div>

              <div className="border-l-4 border-jomionstore-primary pl-4 py-2">
                <h5 className="font-semibold mb-1">Que faire si mon paiement échoue ?</h5>
                <p className="text-sm text-gray-700">
                  Vérifiez que vous avez suffisamment de solde, que les informations sont correctes, 
                  et que votre compte n'est pas bloqué. Si le problème persiste, contactez notre support 
                  ou votre opérateur/banque.
                </p>
              </div>

              <div className="border-l-4 border-jomionstore-primary pl-4 py-2">
                <h5 className="font-semibold mb-1">Puis-je annuler un paiement ?</h5>
                <p className="text-sm text-gray-700">
                  Une fois le paiement validé, la commande est confirmée. Vous pouvez demander un remboursement 
                  via la procédure de retour (30 jours).
                </p>
              </div>

              <div className="border-l-4 border-jomionstore-primary pl-4 py-2">
                <h5 className="font-semibold mb-1">Recevrai-je une facture ?</h5>
                <p className="text-sm text-gray-700">
                  Oui, une facture électronique est automatiquement générée et disponible dans 
                  <strong> Mon compte → Mes commandes</strong>. Vous pouvez la télécharger en PDF.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="border-jomionstore-primary bg-jomionstore-primary/5">
            <CardHeader>
              <CardTitle>💬 Problème de paiement ?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Notre équipe technique est disponible pour vous aider à résoudre tout problème de paiement :
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <p className="font-semibold mb-2">📞 Support technique urgent</p>
                  <p className="text-jomionstore-primary font-semibold">
                    <a href="tel:0164354089" className="hover:underline">01 64 35 40 89</a>
                  </p>
                  <p className="text-xs text-gray-600">Disponible 7j/7 pour problèmes de paiement</p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <p className="font-semibold mb-2">✉️ Email support</p>
                  <p className="text-jomionstore-primary font-semibold">
                    <a href="mailto:contact@jomionstore.com" className="hover:underline">contact@jomionstore.com</a>
                  </p>
                  <p className="text-xs text-gray-600">Réponse sous 2h pour problèmes de paiement</p>
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
