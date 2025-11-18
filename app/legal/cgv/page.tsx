'use client';

import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShoppingCart, CreditCard, Truck, Shield, AlertTriangle, Info } from 'lucide-react';
import Link from 'next/link';

export default function CGVPage() {
  return (
    <div className="min-h-screen bg-jomionstore-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-jomionstore-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Conditions Générales de Vente</span>
        </nav>

        <div className="mb-6">
          <Badge className="bg-jomionstore-primary mb-3">Dernière mise à jour : 18 novembre 2025</Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Conditions Générales de Vente (CGV)</h1>
          <p className="text-gray-600 text-lg">
            Les présentes Conditions Générales de Vente régissent les transactions commerciales 
            effectuées sur la plateforme JomionStore.
          </p>
        </div>

        <div className="space-y-6">
          {/* Préambule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-6 h-6 text-jomionstore-primary" />
                Préambule
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <p>
                Les présentes Conditions Générales de Vente (CGV) s'appliquent à toutes les ventes 
                de produits effectuées sur la plateforme <strong>JomionStore</strong> accessible à l'adresse 
                <strong> jomionstore.com</strong>.
              </p>
              <p>
                JomionStore est une marketplace mettant en relation des acheteurs et des vendeurs professionnels. 
                Les présentes CGV régissent les relations contractuelles entre :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Le Vendeur :</strong> Professionnel partenaire proposant des produits à la vente</li>
                <li><strong>L'Acheteur :</strong> Toute personne physique ou morale effectuant un achat</li>
                <li><strong>JomionStore :</strong> Plateforme intermédiaire facilitant la transaction</li>
              </ul>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mt-4">
                <p className="mb-0 font-semibold text-orange-900">
                  ⚠️ En passant commande sur JomionStore, vous acceptez sans réserve les présentes CGV.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Article 1 - Objet */}
          <Card>
            <CardHeader>
              <CardTitle>Article 1 - Objet</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <p>
                Les présentes CGV ont pour objet de définir les droits et obligations des parties dans le 
                cadre de la vente en ligne de produits proposés par les Vendeurs partenaires via la plateforme 
                JomionStore.
              </p>
              <p>
                Ces CGV s'appliquent à l'exclusion de toutes autres conditions, sauf dérogation expresse et 
                écrite acceptée par JomionStore et le Vendeur concerné.
              </p>
            </CardContent>
          </Card>

          {/* Article 2 - Produits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-jomionstore-primary" />
                Article 2 - Produits et Services
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <h4 className="font-semibold">2.1. Description des produits</h4>
              <p>
                Les produits proposés à la vente sont décrits avec la plus grande exactitude possible. 
                Chaque fiche produit comprend :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Photographies représentatives du produit</li>
                <li>Description détaillée (caractéristiques, dimensions, matériaux)</li>
                <li>Prix en Francs CFA (XOF) toutes taxes comprises</li>
                <li>Disponibilité et délai de livraison estimé</li>
                <li>Informations sur le Vendeur</li>
              </ul>

              <h4 className="font-semibold mt-4">2.2. Disponibilité</h4>
              <p>
                Les produits sont proposés dans la limite des stocks disponibles. En cas d'indisponibilité 
                d'un produit après passation de la commande, l'Acheteur en sera informé dans les plus brefs 
                délais et pourra choisir entre :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>L'annulation de la commande avec remboursement intégral</li>
                <li>Le remplacement par un produit équivalent (si disponible)</li>
                <li>L'attente d'un réapprovisionnement (délai communiqué)</li>
              </ul>

              <h4 className="font-semibold mt-4">2.3. Conformité</h4>
              <p>
                Les Vendeurs s'engagent à fournir des produits conformes à la législation en vigueur au Bénin, 
                notamment en matière de sécurité, d'hygiène et de protection du consommateur.
              </p>
            </CardContent>
          </Card>

          {/* Article 3 - Prix */}
          <Card>
            <CardHeader>
              <CardTitle>Article 3 - Prix</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <h4 className="font-semibold">3.1. Prix des produits</h4>
              <p>
                Les prix des produits sont indiqués en <strong>Francs CFA (XOF)</strong> toutes taxes comprises (TTC). 
                Ils incluent la TVA applicable au jour de la commande.
              </p>
              <p>
                Les prix affichés ne comprennent pas les frais de livraison, qui sont calculés et indiqués 
                avant la validation finale de la commande.
              </p>

              <h4 className="font-semibold mt-4">3.2. Modification des prix</h4>
              <p>
                Les prix peuvent être modifiés à tout moment par les Vendeurs. Toutefois, les produits seront 
                facturés sur la base des tarifs en vigueur au moment de la validation de la commande, sous 
                réserve de disponibilité.
              </p>

              <h4 className="font-semibold mt-4">3.3. Frais de livraison</h4>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="mb-2"><strong>🎉 Livraison gratuite</strong></p>
                <p className="mb-0">Pour toute commande d'un montant égal ou supérieur à <strong>200 000 XOF</strong></p>
              </div>
              <p className="mt-3">
                Pour les commandes inférieures à ce montant, les frais de livraison sont calculés en fonction :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Du poids et du volume du colis</li>
                <li>De la zone de livraison (Cotonou, autres villes, zones rurales)</li>
                <li>Du mode de livraison choisi (standard ou express)</li>
              </ul>
              <p>
                Les frais de livraison sont clairement indiqués avant la validation de la commande et 
                inclus dans le montant total à payer.
              </p>

              <h4 className="font-semibold mt-4">3.4. Promotions et réductions</h4>
              <p>
                Les offres promotionnelles, codes promo et réductions sont valables dans les conditions 
                et durées indiquées. Elles ne sont pas cumulables sauf mention contraire.
              </p>
            </CardContent>
          </Card>

          {/* Article 4 - Commande */}
          <Card>
            <CardHeader>
              <CardTitle>Article 4 - Commande</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <h4 className="font-semibold">4.1. Processus de commande</h4>
              <p>Pour passer commande, l'Acheteur doit suivre les étapes suivantes :</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Sélection des produits et ajout au panier</li>
                <li>Vérification du contenu du panier</li>
                <li>Création d'un compte ou connexion (si déjà client)</li>
                <li>Saisie ou sélection de l'adresse de livraison</li>
                <li>Choix du mode de livraison</li>
                <li>Vérification du récapitulatif de commande (produits, prix, frais de livraison)</li>
                <li>Choix du mode de paiement</li>
                <li>Acceptation des présentes CGV (case à cocher obligatoire)</li>
                <li>Validation et paiement de la commande</li>
              </ol>

              <h4 className="font-semibold mt-4">4.2. Confirmation de commande</h4>
              <p>
                Une fois la commande validée et le paiement accepté, l'Acheteur reçoit un email de 
                confirmation contenant :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Le numéro de commande unique</li>
                <li>Le récapitulatif détaillé des produits commandés</li>
                <li>Le montant total payé (produits + livraison)</li>
                <li>L'adresse de livraison</li>
                <li>Le délai de livraison estimé</li>
              </ul>

              <h4 className="font-semibold mt-4">4.3. Formation du contrat</h4>
              <p>
                Le contrat de vente est considéré comme définitivement formé à la réception par l'Acheteur 
                de l'email de confirmation de commande, sous réserve de l'acceptation du paiement.
              </p>

              <h4 className="font-semibold mt-4">4.4. Annulation de commande</h4>
              <p>
                L'Acheteur peut annuler sa commande gratuitement tant que celle-ci n'a pas été expédiée. 
                Pour cela, il doit contacter le service client dans les plus brefs délais :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Par email : <a href="mailto:contact@jomionstore.com" className="text-jomionstore-primary hover:underline">contact@jomionstore.com</a></li>
                <li>Par téléphone : <a href="tel:+2290164354089" className="text-jomionstore-primary hover:underline">+229 01 64 35 40 89</a></li>
                <li>Depuis son compte : <strong>Mes commandes → Annuler</strong></li>
              </ul>
              <p>
                Une fois la commande expédiée, l'annulation n'est plus possible. L'Acheteur devra alors 
                exercer son droit de rétractation (voir Article 8).
              </p>
            </CardContent>
          </Card>

          {/* Article 5 - Paiement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-jomionstore-primary" />
                Article 5 - Paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <h4 className="font-semibold">5.1. Moyens de paiement acceptés</h4>
              <p>JomionStore accepte les modes de paiement suivants :</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h5 className="font-semibold mb-2">📱 Mobile Money</h5>
                  <ul className="text-sm space-y-1">
                    <li>• MTN Mobile Money</li>
                    <li>• Moov Money</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h5 className="font-semibold mb-2">💳 Cartes bancaires</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Visa</li>
                    <li>• Mastercard</li>
                  </ul>
                </div>
              </div>

              <h4 className="font-semibold mt-4">5.2. Sécurité des paiements</h4>
              <p>
                Tous les paiements sont sécurisés et traités par nos prestataires de paiement certifiés 
                <strong> PCI-DSS</strong> (Lygos, Stripe). Les données bancaires sont chiffrées et ne sont 
                jamais stockées sur les serveurs de JomionStore.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="mb-0">
                  <strong>🔒 Sécurité garantie :</strong> Protocole SSL/TLS, authentification 3D Secure, 
                  conformité aux normes bancaires internationales.
                </p>
              </div>

              <h4 className="font-semibold mt-4">5.3. Validation du paiement</h4>
              <p>
                La commande n'est validée qu'après confirmation du paiement par le prestataire de paiement. 
                En cas de refus ou d'échec du paiement, la commande est automatiquement annulée.
              </p>

              <h4 className="font-semibold mt-4">5.4. Facturation</h4>
              <p>
                Une facture électronique conforme à la législation béninoise est générée automatiquement 
                pour chaque commande. Elle est disponible :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Dans l'email de confirmation de commande</li>
                <li>Dans l'espace client : <strong>Mon compte → Mes commandes → Télécharger la facture</strong></li>
              </ul>
            </CardContent>
          </Card>

          {/* Article 6 - Livraison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-6 h-6 text-jomionstore-primary" />
                Article 6 - Livraison
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <h4 className="font-semibold">6.1. Zones de livraison</h4>
              <p>JomionStore livre sur l'ensemble du territoire béninois :</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="font-semibold text-green-900 mb-1">Zone 1 - Express</p>
                  <p className="text-sm mb-2">Cotonou, Porto-Novo, Abomey-Calavi</p>
                  <p className="text-lg font-bold text-green-700">24-48h</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="font-semibold text-blue-900 mb-1">Zone 2 - Standard</p>
                  <p className="text-sm mb-2">Parakou, Bohicon, Abomey, Ouidah</p>
                  <p className="text-lg font-bold text-blue-700">2-4 jours</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <p className="font-semibold text-orange-900 mb-1">Zone 3 - Étendue</p>
                  <p className="text-sm mb-2">Autres villes et zones rurales</p>
                  <p className="text-lg font-bold text-orange-700">3-7 jours</p>
                </div>
              </div>

              <h4 className="font-semibold mt-4">6.2. Délais de livraison</h4>
              <p>
                Les délais de livraison indiqués sont des estimations et peuvent varier en fonction de :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>La disponibilité du produit chez le Vendeur</li>
                <li>La zone géographique de livraison</li>
                <li>Les conditions météorologiques</li>
                <li>Les événements exceptionnels (jours fériés, grèves, etc.)</li>
              </ul>
              <p>
                Le délai commence à courir à partir de la confirmation de la commande et du paiement.
              </p>

              <h4 className="font-semibold mt-4">6.3. Suivi de livraison</h4>
              <p>
                L'Acheteur peut suivre sa commande en temps réel via :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Le lien de suivi envoyé par email</li>
                <li>Son espace client : <strong>Mon compte → Mes commandes</strong></li>
                <li>Les notifications SMS (si activées)</li>
              </ul>

              <h4 className="font-semibold mt-4">6.4. Réception de la commande</h4>
              <p>
                À la livraison, l'Acheteur ou toute personne autorisée doit :
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Vérifier l'état du colis (emballage non endommagé)</li>
                <li>Vérifier le contenu en présence du livreur</li>
                <li>Signer le bon de livraison</li>
              </ol>
              <Alert className="border-orange-200 bg-orange-50 mt-4">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <AlertDescription>
                  <strong>⚠️ Important :</strong> En cas de colis endommagé ou de contenu non conforme, 
                  refusez la livraison et contactez immédiatement le service client. Toute réserve doit 
                  être notée sur le bon de livraison.
                </AlertDescription>
              </Alert>

              <h4 className="font-semibold mt-4">6.5. Livraison impossible</h4>
              <p>
                En cas d'absence lors de la livraison, le transporteur laissera un avis de passage. 
                L'Acheteur dispose de <strong>7 jours</strong> pour récupérer son colis au point relais 
                indiqué ou convenir d'une nouvelle date de livraison.
              </p>
              <p>
                Passé ce délai, le colis sera retourné au Vendeur et la commande annulée. Les frais de 
                livraison ne seront pas remboursés.
              </p>
            </CardContent>
          </Card>

          {/* Article 7 - Transfert de propriété et risques */}
          <Card>
            <CardHeader>
              <CardTitle>Article 7 - Transfert de propriété et des risques</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <h4 className="font-semibold">7.1. Transfert de propriété</h4>
              <p>
                Le transfert de propriété des produits au profit de l'Acheteur ne sera réalisé qu'après 
                complet paiement du prix, quelle que soit la date de livraison.
              </p>

              <h4 className="font-semibold mt-4">7.2. Transfert des risques</h4>
              <p>
                Les risques liés aux produits (perte, détérioration) sont transférés à l'Acheteur dès la 
                livraison effective, c'est-à-dire dès la remise matérielle du produit à l'Acheteur ou à 
                toute personne autorisée à réceptionner le colis.
              </p>
            </CardContent>
          </Card>

          {/* Article 8 - Droit de rétractation */}
          <Card>
            <CardHeader>
              <CardTitle>Article 8 - Droit de rétractation</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
                <p className="font-bold text-green-900 text-lg mb-2">
                  ✅ Vous disposez de 30 jours pour changer d'avis
                </p>
                <p className="text-sm text-gray-700 mb-0">
                  Conformément à la législation sur la protection du consommateur, vous pouvez retourner 
                  tout produit qui ne vous convient pas dans un délai de 30 jours à compter de sa réception.
                </p>
              </div>

              <h4 className="font-semibold mt-4">8.1. Conditions d'exercice</h4>
              <p>Pour exercer votre droit de rétractation, le produit doit être :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Dans son état d'origine, non utilisé</li>
                <li>Dans son emballage d'origine intact</li>
                <li>Complet (accessoires, notices, étiquettes)</li>
                <li>Accompagné de la facture</li>
              </ul>

              <h4 className="font-semibold mt-4">8.2. Procédure de retour</h4>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Connectez-vous à votre compte</li>
                <li>Accédez à <strong>Mes commandes</strong></li>
                <li>Cliquez sur <strong>Demander un retour</strong></li>
                <li>Indiquez le motif du retour</li>
                <li>Recevez l'étiquette de retour par email (sous 24h)</li>
                <li>Emballez le produit et collez l'étiquette</li>
                <li>Déposez le colis au point relais indiqué</li>
              </ol>

              <h4 className="font-semibold mt-4">8.3. Produits exclus du droit de rétractation</h4>
              <p>Conformément à la loi, certains produits ne peuvent pas être retournés :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Produits d'hygiène descellés (cosmétiques, sous-vêtements)</li>
                <li>Produits personnalisés ou sur mesure</li>
                <li>Denrées périssables</li>
                <li>Cartes cadeaux et bons d'achat</li>
                <li>Contenus numériques téléchargés</li>
              </ul>

              <h4 className="font-semibold mt-4">8.4. Remboursement</h4>
              <p>
                Après réception et contrôle du produit retourné, JomionStore procédera au remboursement 
                dans un délai de <strong>7 à 10 jours ouvrés</strong> via le même moyen de paiement utilisé 
                lors de l'achat.
              </p>
              <p>Le remboursement comprend :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>✅ Le prix du produit</li>
                <li>✅ Les frais de livraison initiaux</li>
                <li>✅ Les frais de retour (pris en charge par JomionStore)</li>
              </ul>
            </CardContent>
          </Card>

          {/* Article 9 - Garanties */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-jomionstore-primary" />
                Article 9 - Garanties
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <h4 className="font-semibold">9.1. Garantie légale de conformité</h4>
              <p>
                Tous les produits vendus sur JomionStore bénéficient de la garantie légale de conformité 
                prévue par le Code de la consommation béninois. L'Acheteur dispose d'un délai de 
                <strong> 2 ans</strong> à compter de la livraison pour agir.
              </p>
              <p>Cette garantie couvre :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Les défauts de conformité existant lors de la délivrance</li>
                <li>Les défauts de conformité résultant de l'emballage ou des instructions de montage</li>
              </ul>

              <h4 className="font-semibold mt-4">9.2. Garantie des vices cachés</h4>
              <p>
                L'Acheteur bénéficie également de la garantie légale contre les vices cachés. Il peut 
                choisir entre la résolution de la vente ou une réduction du prix.
              </p>

              <h4 className="font-semibold mt-4">9.3. Garantie commerciale (constructeur)</h4>
              <p>
                Certains produits peuvent bénéficier d'une garantie commerciale du fabricant, en complément 
                des garanties légales. Les conditions sont précisées sur la fiche produit et dans la notice.
              </p>

              <h4 className="font-semibold mt-4">9.4. Mise en œuvre des garanties</h4>
              <p>Pour faire jouer une garantie, contactez le service client avec :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Le numéro de commande</li>
                <li>La facture</li>
                <li>Une description détaillée du problème</li>
                <li>Des photos si nécessaire</li>
              </ul>
            </CardContent>
          </Card>

          {/* Article 10 - Responsabilité */}
          <Card>
            <CardHeader>
              <CardTitle>Article 10 - Responsabilité</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <h4 className="font-semibold">10.1. Responsabilité de JomionStore</h4>
              <p>
                JomionStore agit en qualité d'intermédiaire technique entre les Acheteurs et les Vendeurs. 
                À ce titre, JomionStore :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Facilite la mise en relation et la transaction</li>
                <li>Assure la sécurité des paiements</li>
                <li>Coordonne la logistique de livraison</li>
                <li>Fournit un service client et un service après-vente</li>
              </ul>
              <p>
                Toutefois, la responsabilité concernant la qualité, la conformité et la sécurité des 
                produits incombe aux Vendeurs partenaires.
              </p>

              <h4 className="font-semibold mt-4">10.2. Responsabilité des Vendeurs</h4>
              <p>Les Vendeurs sont responsables de :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>L'exactitude des descriptions et photos des produits</li>
                <li>La conformité des produits aux normes en vigueur</li>
                <li>La qualité et la sécurité des produits vendus</li>
                <li>Le respect des délais de préparation et d'expédition</li>
                <li>La gestion du service après-vente</li>
              </ul>

              <h4 className="font-semibold mt-4">10.3. Limitation de responsabilité</h4>
              <p>JomionStore ne saurait être tenu responsable :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Des dommages indirects (perte de profits, de données, d'exploitation)</li>
                <li>Des retards de livraison dus à des cas de force majeure</li>
                <li>Des erreurs de saisie de l'Acheteur (adresse incorrecte, etc.)</li>
                <li>De l'utilisation non conforme des produits par l'Acheteur</li>
                <li>Des interruptions temporaires du site pour maintenance</li>
              </ul>
            </CardContent>
          </Card>

          {/* Article 11 - Données personnelles */}
          <Card>
            <CardHeader>
              <CardTitle>Article 11 - Protection des données personnelles</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <p>
                Les données personnelles collectées lors de la commande sont nécessaires au traitement 
                de celle-ci et à la gestion de la relation client. Elles sont traitées conformément à 
                notre <Link href="/privacy" className="text-jomionstore-primary hover:underline font-semibold">Politique de confidentialité</Link>.
              </p>
              <p>Conformément à la réglementation en vigueur, vous disposez de droits sur vos données :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Droit d'accès, de rectification et de suppression</li>
                <li>Droit à la limitation et à la portabilité</li>
                <li>Droit d'opposition au traitement</li>
              </ul>
              <p>
                Pour exercer ces droits, contactez-nous à : 
                <a href="mailto:contact@jomionstore.com" className="text-jomionstore-primary hover:underline font-semibold"> contact@jomionstore.com</a>
              </p>
            </CardContent>
          </Card>

          {/* Article 12 - Propriété intellectuelle */}
          <Card>
            <CardHeader>
              <CardTitle>Article 12 - Propriété intellectuelle</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <p>
                Tous les éléments du site JomionStore (textes, images, logos, vidéos, graphismes, code source) 
                sont la propriété exclusive de JomionStore ou de ses partenaires et sont protégés par le droit 
                d'auteur, le droit des marques et autres droits de propriété intellectuelle.
              </p>
              <p>
                Toute reproduction, représentation, modification, publication ou adaptation totale ou partielle 
                du site ou de son contenu, par quelque procédé que ce soit, est interdite sans autorisation 
                écrite préalable de JomionStore.
              </p>
            </CardContent>
          </Card>

          {/* Article 13 - Force majeure */}
          <Card>
            <CardHeader>
              <CardTitle>Article 13 - Force majeure</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <p>
                JomionStore et les Vendeurs ne pourront être tenus responsables en cas d'inexécution ou de 
                retard dans l'exécution de leurs obligations résultant d'un cas de force majeure.
              </p>
              <p>Sont considérés comme cas de force majeure :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Catastrophes naturelles (inondations, tremblements de terre, etc.)</li>
                <li>Guerre, émeutes, troubles civils</li>
                <li>Grèves générales affectant les transports</li>
                <li>Pannes généralisées des réseaux de télécommunication</li>
                <li>Décisions gouvernementales (confinement, restrictions, etc.)</li>
              </ul>
              <p>
                En cas de force majeure, JomionStore informera l'Acheteur dans les meilleurs délais et 
                s'efforcera de minimiser les conséquences.
              </p>
            </CardContent>
          </Card>

          {/* Article 14 - Réclamations */}
          <Card>
            <CardHeader>
              <CardTitle>Article 14 - Réclamations et litiges</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <h4 className="font-semibold">14.1. Service client</h4>
              <p>
                Pour toute question ou réclamation concernant une commande, l'Acheteur peut contacter 
                le service client JomionStore :
              </p>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <ul className="space-y-2 text-sm">
                  <li><strong>Email :</strong> <a href="mailto:contact@jomionstore.com" className="text-jomionstore-primary hover:underline">contact@jomionstore.com</a></li>
                  <li><strong>Téléphone :</strong> <a href="tel:+2290164354089" className="text-jomionstore-primary hover:underline">+229 01 64 35 40 89</a></li>
                  <li><strong>Horaires :</strong> Lundi-Vendredi : 8h-18h | Samedi : 9h-16h</li>
                  <li><strong>Adresse :</strong> Quartier Ganhi, Cotonou, République du Bénin</li>
                </ul>
              </div>

              <h4 className="font-semibold mt-4">14.2. Résolution amiable</h4>
              <p>
                En cas de litige, nous vous encourageons à contacter notre service client pour trouver 
                une solution amiable avant toute action judiciaire. Nous nous engageons à répondre dans 
                un délai de <strong>48 heures ouvrées</strong>.
              </p>

              <h4 className="font-semibold mt-4">14.3. Médiation</h4>
              <p>
                Conformément aux dispositions du Code de la consommation, l'Acheteur peut recourir 
                gratuitement à un médiateur de la consommation en vue de la résolution amiable du litige 
                qui l'oppose à JomionStore.
              </p>
            </CardContent>
          </Card>

          {/* Article 15 - Droit applicable */}
          <Card>
            <CardHeader>
              <CardTitle>Article 15 - Droit applicable et juridiction</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <h4 className="font-semibold">15.1. Loi applicable</h4>
              <p>
                Les présentes CGV sont régies par le droit béninois, notamment par le Code de la consommation 
                et le Code du commerce de la République du Bénin.
              </p>

              <h4 className="font-semibold mt-4">15.2. Juridiction compétente</h4>
              <p>
                En cas de litige et à défaut de résolution amiable, les tribunaux compétents de 
                <strong> Cotonou, République du Bénin</strong>, seront seuls compétents, nonobstant pluralité 
                de défendeurs ou appel en garantie.
              </p>

              <h4 className="font-semibold mt-4">15.3. Langue</h4>
              <p>
                Les présentes CGV sont rédigées en langue française. En cas de traduction dans une autre 
                langue, seule la version française fait foi en cas de litige.
              </p>
            </CardContent>
          </Card>

          {/* Article 16 - Modifications */}
          <Card>
            <CardHeader>
              <CardTitle>Article 16 - Modifications des CGV</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <p>
                JomionStore se réserve le droit de modifier les présentes CGV à tout moment. Les modifications 
                entrent en vigueur dès leur publication sur le site.
              </p>
              <p>
                Les CGV applicables sont celles en vigueur à la date de passation de la commande. L'Acheteur 
                est invité à consulter régulièrement les CGV avant toute commande.
              </p>
              <p>
                En cas de modification substantielle, les clients enregistrés seront informés par email au 
                moins <strong>30 jours</strong> avant l'entrée en vigueur des nouvelles conditions.
              </p>
            </CardContent>
          </Card>

          {/* Article 17 - Acceptation */}
          <Card className="border-jomionstore-primary bg-jomionstore-primary/5">
            <CardHeader>
              <CardTitle>Article 17 - Acceptation des CGV</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <div className="bg-white p-6 rounded-lg border-2 border-jomionstore-primary">
                <p className="font-bold text-lg text-jomionstore-primary mb-3">
                  ✅ Validation de votre commande = Acceptation des CGV
                </p>
                <p className="mb-3">
                  En cochant la case "J'accepte les Conditions Générales de Vente" lors de la validation 
                  de votre commande, vous reconnaissez avoir pris connaissance des présentes CGV et les 
                  accepter sans réserve.
                </p>
                <p className="mb-0 text-sm text-gray-600">
                  Nous vous recommandons de télécharger et de conserver une copie de ces CGV pour vos archives.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Informations légales */}
          <Card className="border-gray-300">
            <CardHeader>
              <CardTitle>Informations légales</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700">
              <div className="bg-gray-50 p-6 rounded-lg space-y-3">
                <p className="font-semibold text-lg mb-3">JomionStore</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold mb-1">Raison sociale</p>
                    <p className="text-gray-600">JomionStore SARL</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Forme juridique</p>
                    <p className="text-gray-600">Société à Responsabilité Limitée</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Siège social</p>
                    <p className="text-gray-600">Quartier Ganhi, Cotonou, République du Bénin</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Email</p>
                    <p className="text-gray-600">
                      <a href="mailto:contact@jomionstore.com" className="text-jomionstore-primary hover:underline">
                        contact@jomionstore.com
                      </a>
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Téléphone</p>
                    <p className="text-gray-600">
                      <a href="tel:+2290164354089" className="text-jomionstore-primary hover:underline">
                        +229 01 64 35 40 89
                      </a>
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Site web</p>
                    <p className="text-gray-600">
                      <a href="https://jomionstore.com" className="text-jomionstore-primary hover:underline">
                        www.jomionstore.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liens utiles */}
          <Card>
            <CardHeader>
              <CardTitle>Documents complémentaires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link 
                  href="/terms" 
                  className="bg-gray-50 p-4 rounded-lg border hover:border-jomionstore-primary hover:bg-jomionstore-primary/5 transition-colors"
                >
                  <p className="font-semibold mb-1">📜 Conditions d'utilisation</p>
                  <p className="text-sm text-gray-600">Règles d'usage de la plateforme</p>
                </Link>
                <Link 
                  href="/privacy" 
                  className="bg-gray-50 p-4 rounded-lg border hover:border-jomionstore-primary hover:bg-jomionstore-primary/5 transition-colors"
                >
                  <p className="font-semibold mb-1">🔒 Politique de confidentialité</p>
                  <p className="text-sm text-gray-600">Protection de vos données personnelles</p>
                </Link>
                <Link 
                  href="/shipping-returns" 
                  className="bg-gray-50 p-4 rounded-lg border hover:border-jomionstore-primary hover:bg-jomionstore-primary/5 transition-colors"
                >
                  <p className="font-semibold mb-1">🚚 Livraison & Retours</p>
                  <p className="text-sm text-gray-600">Informations détaillées sur la livraison</p>
                </Link>
                <Link 
                  href="/faq" 
                  className="bg-gray-50 p-4 rounded-lg border hover:border-jomionstore-primary hover:bg-jomionstore-primary/5 transition-colors"
                >
                  <p className="font-semibold mb-1">❓ FAQ</p>
                  <p className="text-sm text-gray-600">Questions fréquemment posées</p>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Footer note */}
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-gray-700">
              <strong>💡 Besoin d'aide ?</strong> Notre service client est à votre disposition pour répondre 
              à toutes vos questions concernant ces Conditions Générales de Vente. N'hésitez pas à nous contacter !
            </AlertDescription>
          </Alert>
        </div>
      </div>

      <Footer />
    </div>
  );
}
