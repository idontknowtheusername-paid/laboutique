'use client';
export const revalidate = 300;

import React from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-jomionstore-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-jomionstore-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Conditions générales d'utilisation</span>
        </nav>

        <div className="mb-6">
          <Badge className="bg-jomionstore-primary mb-3">Dernière mise à jour : 15 octobre 2025</Badge>
          <h1 className="text-4xl font-bold text-gray-900">Conditions générales d'utilisation</h1>
        </div>

        <div className="space-y-6">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle>1. Objet et acceptation</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <p>
                Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de 
                la plateforme JomionStore accessible sur <strong>jomionstore.com</strong> (ci-après "le Site" ou "la Plateforme").
              </p>
              <p>
                JomionStore est une marketplace e-commerce mettant en relation des acheteurs et des vendeurs 
                professionnels pour la vente de produits variés. La Plateforme est exploitée par JomionStore, 
                société immatriculée au Bénin.
              </p>
              <p className="font-semibold text-orange-600">
                En utilisant JomionStore, vous acceptez sans réserve les présentes CGU. Si vous n'acceptez pas 
                ces conditions, veuillez ne pas utiliser la Plateforme.
              </p>
            </CardContent>
          </Card>

          {/* Définitions */}
          <Card>
            <CardHeader>
              <CardTitle>2. Définitions</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-2">
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>"Plateforme" ou "Site" :</strong> Le site web JomionStore et ses applications mobiles</li>
                <li><strong>"Utilisateur" :</strong> Toute personne accédant à la Plateforme</li>
                <li><strong>"Acheteur" :</strong> Utilisateur enregistré effectuant des achats</li>
                <li><strong>"Vendeur" :</strong> Professionnel partenaire proposant des produits à la vente</li>
                <li><strong>"Compte" :</strong> Espace personnel créé par l'Utilisateur</li>
                <li><strong>"Commande" :</strong> Achat effectué sur la Plateforme</li>
                <li><strong>"Produit" :</strong> Bien mis en vente par un Vendeur</li>
                <li><strong>"CGU" :</strong> Les présentes Conditions Générales d'Utilisation</li>
                <li><strong>"CGV" :</strong> Conditions Générales de Vente (propres à chaque Vendeur)</li>
              </ul>
            </CardContent>
          </Card>

          {/* Création de compte */}
          <Card>
            <CardHeader>
              <CardTitle>3. Création et gestion de compte</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <h4 className="font-semibold">3.1. Inscription</h4>
              <p>
                L'accès à certaines fonctionnalités (achat, vente, avis) nécessite la création d'un Compte. 
                L'inscription est gratuite et requiert :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Avoir au moins 18 ans</li>
                <li>Fournir des informations exactes et à jour (nom, email, téléphone)</li>
                <li>Accepter les présentes CGU et la Politique de confidentialité</li>
              </ul>

              <h4 className="font-semibold mt-4">3.2. Sécurité du compte</h4>
              <p>Vous êtes responsable de :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>La confidentialité de vos identifiants (email, mot de passe)</li>
                <li>Toutes les activités effectuées depuis votre Compte</li>
                <li>Informer immédiatement JomionStore en cas d'utilisation non autorisée</li>
              </ul>

              <h4 className="font-semibold mt-4">3.3. Suspension et résiliation</h4>
              <p>
                JomionStore se réserve le droit de suspendre ou supprimer tout Compte en cas de :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violation des présentes CGU</li>
                <li>Activité frauduleuse ou suspecte</li>
                <li>Impayés répétés</li>
                <li>Comportement abusif envers d'autres utilisateurs ou le support</li>
                <li>Inactivité prolongée (plus de 2 ans)</li>
              </ul>
              <p>
                Vous pouvez à tout moment supprimer votre Compte depuis <strong>Mon compte &gt; Paramètres</strong>.
              </p>
            </CardContent>
          </Card>

          {/* Achats */}
          <Card>
            <CardHeader>
              <CardTitle>4. Achats sur la Plateforme</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <h4 className="font-semibold">4.1. Processus d'achat</h4>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Sélection des produits et ajout au panier</li>
                <li>Validation du panier et choix du mode de livraison</li>
                <li>Saisie des informations de livraison et de facturation</li>
                <li>Choix du mode de paiement et validation</li>
                <li>Réception de la confirmation de commande par email</li>
              </ol>

              <h4 className="font-semibold mt-4">4.2. Prix et disponibilité</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>Les prix sont affichés en Francs CFA (XOF) toutes taxes comprises (TTC)</li>
                <li>Les prix peuvent varier sans préavis</li>
                <li>Les produits sont proposés dans la limite des stocks disponibles</li>
                <li>En cas d'indisponibilité après commande, vous serez remboursé intégralement</li>
                <li>Les frais de livraison sont indiqués avant validation de la commande</li>
              </ul>

              <h4 className="font-semibold mt-4">4.3. Confirmation de commande</h4>
              <p>
                La commande est définitivement validée après :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Acceptation du paiement par notre prestataire</li>
                <li>Confirmation de disponibilité par le Vendeur</li>
                <li>Envoi d'un email de confirmation avec numéro de commande</li>
              </ul>

              <h4 className="font-semibold mt-4">4.4. Rôle de JomionStore</h4>
              <p>
                JomionStore agit en tant qu'intermédiaire technique entre Acheteurs et Vendeurs. 
                Le contrat de vente est conclu directement entre l'Acheteur et le Vendeur. 
                JomionStore facilite la transaction mais n'est pas partie au contrat de vente.
              </p>
            </CardContent>
          </Card>

          {/* Paiement */}
          <Card>
            <CardHeader>
              <CardTitle>5. Paiement</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <h4 className="font-semibold">5.1. Moyens de paiement acceptés</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Mobile Money :</strong> MTN MoMo, Moov Money</li>
                <li><strong>Cartes bancaires :</strong> Visa, Mastercard</li>
                <li><strong>Virement bancaire</strong> (pour les commandes importantes)</li>
              </ul>

              <h4 className="font-semibold mt-4">5.2. Sécurité des paiements</h4>
              <p>
                Tous les paiements sont sécurisés via nos prestataires certifiés PCI-DSS (Qosic). 
                JomionStore ne stocke jamais vos informations bancaires complètes.
              </p>

              <h4 className="font-semibold mt-4">5.3. Facturation</h4>
              <p>
                Une facture électronique est disponible dans <strong>Mon compte &gt; Mes commandes</strong> 
                après chaque achat. Elle peut être téléchargée en PDF.
              </p>

              <h4 className="font-semibold mt-4">5.4. Erreurs de paiement</h4>
              <p>
                En cas d'erreur de paiement (montant incorrect, double débit), contactez notre 
                service client dans les 48 heures : <a href="mailto:contact@jomionstore.com" className="text-jomionstore-primary hover:underline">contact@jomionstore.com</a>
              </p>
            </CardContent>
          </Card>

          {/* Livraison */}
          <Card>
            <CardHeader>
              <CardTitle>6. Livraison</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <h4 className="font-semibold">6.1. Zones et délais</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Cotonou :</strong> 24-48 heures</li>
                <li><strong>Villes principales :</strong> 2-4 jours ouvrés</li>
                <li><strong>Autres zones :</strong> 3-7 jours ouvrés</li>
              </ul>
              <p className="text-sm text-gray-600">
                Les délais sont indicatifs et peuvent varier selon les conditions (météo, disponibilité transporteur, etc.)
              </p>

              <h4 className="font-semibold mt-4">6.2. Frais de livraison</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Livraison gratuite</strong> dès 50 000 XOF d'achat</li>
                <li>Sinon : à partir de 2 000 XOF (selon poids et destination)</li>
              </ul>

              <h4 className="font-semibold mt-4">6.3. Suivi de commande</h4>
              <p>
                Vous pouvez suivre l'état de votre commande en temps réel depuis 
                <strong> Mon compte &gt; Mes commandes</strong> ou via le lien de suivi envoyé par email.
              </p>

              <h4 className="font-semibold mt-4">6.4. Réception</h4>
              <p>
                À la livraison, vérifiez l'état du colis avant de signer le bon de livraison. 
                En cas de dommage apparent, refusez le colis et contactez immédiatement le service client.
              </p>
            </CardContent>
          </Card>

          {/* Retours */}
          <Card>
            <CardHeader>
              <CardTitle>7. Retours et remboursements</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <h4 className="font-semibold">7.1. Droit de rétractation</h4>
              <p>
                Vous disposez de <strong>30 jours</strong> à compter de la réception pour retourner 
                tout produit qui ne vous convient pas, sans avoir à justifier votre décision.
              </p>

              <h4 className="font-semibold mt-4">7.2. Conditions de retour</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>Produit non utilisé, dans son emballage d'origine</li>
                <li>Accessoires, notices et étiquettes intacts</li>
                <li>Demande de retour effectuée depuis <strong>Mon compte &gt; Mes commandes</strong></li>
              </ul>

              <h4 className="font-semibold mt-4">7.3. Produits non éligibles</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>Produits alimentaires ou cosmétiques ouverts (hygiène)</li>
                <li>Sous-vêtements (sauf défectueux)</li>
                <li>Cartes cadeaux et bons d'achat</li>
                <li>Produits personnalisés ou sur mesure</li>
              </ul>

              <h4 className="font-semibold mt-4">7.4. Remboursement</h4>
              <p>
                Le remboursement est effectué dans un délai de <strong>7 à 10 jours ouvrés</strong> 
                après réception et contrôle du produit, via le mode de paiement initial.
              </p>
            </CardContent>
          </Card>

          {/* Vendeurs */}
          <Card>
            <CardHeader>
              <CardTitle>8. Vendeurs partenaires</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <h4 className="font-semibold">8.1. Inscription vendeur</h4>
              <p>
                Les professionnels souhaitant vendre sur JomionStore doivent :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fournir un justificatif d'immatriculation d'entreprise</li>
                <li>Accepter les conditions vendeur spécifiques</li>
                <li>Être validé par l'équipe JomionStore</li>
              </ul>

              <h4 className="font-semibold mt-4">8.2. Obligations des vendeurs</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>Proposer des produits authentiques et conformes</li>
                <li>Respecter les descriptions et photos publiées</li>
                <li>Traiter les commandes dans les délais annoncés</li>
                <li>Assurer un service après-vente de qualité</li>
                <li>Respecter les lois en vigueur (fiscalité, protection du consommateur)</li>
              </ul>

              <h4 className="font-semibold mt-4">8.3. Commission</h4>
              <p>
                JomionStore prélève une commission sur chaque vente réalisée via la Plateforme. 
                Le montant est défini dans les conditions vendeur spécifiques.
              </p>
            </CardContent>
          </Card>

          {/* Propriété intellectuelle */}
          <Card>
            <CardHeader>
              <CardTitle>9. Propriété intellectuelle</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <h4 className="font-semibold">9.1. Contenu de la Plateforme</h4>
              <p>
                Tous les éléments de la Plateforme (textes, images, logos, vidéos, graphismes, code, design) 
                sont la propriété exclusive de JomionStore ou de ses partenaires et sont protégés par le 
                droit d'auteur, le droit des marques et autres droits de propriété intellectuelle.
              </p>

              <h4 className="font-semibold mt-4">9.2. Utilisation interdite</h4>
              <p>Il est strictement interdit de :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Copier, reproduire, distribuer ou modifier le contenu du Site</li>
                <li>Utiliser les marques, logos ou noms de JomionStore sans autorisation</li>
                <li>Extraire ou aspirer les données du Site (scraping)</li>
                <li>Créer des liens profonds sans accord préalable</li>
              </ul>

              <h4 className="font-semibold mt-4">9.3. Contenu utilisateur</h4>
              <p>
                En publiant du contenu sur la Plateforme (avis, photos, commentaires), vous accordez 
                à JomionStore une licence mondiale, gratuite et non exclusive d'utilisation, reproduction 
                et diffusion de ce contenu à des fins de promotion et d'amélioration du service.
              </p>
            </CardContent>
          </Card>

          {/* Responsabilité */}
          <Card>
            <CardHeader>
              <CardTitle>10. Responsabilité et garanties</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <h4 className="font-semibold">10.1. Rôle d'intermédiaire</h4>
              <p>
                JomionStore agit en tant qu'intermédiaire technique. La responsabilité concernant 
                la qualité, la conformité et la livraison des produits incombe aux Vendeurs.
              </p>

              <h4 className="font-semibold mt-4">10.2. Limitation de responsabilité</h4>
              <p>JomionStore ne saurait être tenu responsable :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Des dommages indirects (perte de profits, de données, d'exploitation)</li>
                <li>Des interruptions temporaires du Site (maintenance, pannes)</li>
                <li>Des erreurs de saisie de l'Utilisateur (adresse incorrecte, etc.)</li>
                <li>De l'utilisation frauduleuse des données par des tiers</li>
                <li>Des cas de force majeure (catastrophe naturelle, guerre, grève, etc.)</li>
              </ul>

              <h4 className="font-semibold mt-4">10.3. Garanties légales</h4>
              <p>
                Les produits vendus bénéficient des garanties légales :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Garantie de conformité :</strong> 2 ans (produits neufs)</li>
                <li><strong>Garantie des vices cachés</strong></li>
                <li><strong>Garantie constructeur</strong> (selon le produit)</li>
              </ul>
            </CardContent>
          </Card>

          {/* Comportement */}
          <Card>
            <CardHeader>
              <CardTitle>11. Comportement et usage acceptable</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <p>Il est interdit d'utiliser la Plateforme pour :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Publier des contenus illégaux, diffamatoires, injurieux ou haineux</li>
                <li>Harceler, menacer ou intimider d'autres Utilisateurs</li>
                <li>Usurper l'identité d'une personne ou d'une entité</li>
                <li>Diffuser des virus, malwares ou codes malveillants</li>
                <li>Tenter d'accéder aux systèmes de manière non autorisée (hacking)</li>
                <li>Spammer ou envoyer des messages commerciaux non sollicités</li>
                <li>Manipuler les avis ou notes (faux avis, avis achetés)</li>
                <li>Revendre un compte ou des identifiants</li>
              </ul>
              <p className="font-semibold text-orange-600">
                Toute violation peut entraîner la suspension immédiate du Compte et des poursuites judiciaires.
              </p>
            </CardContent>
          </Card>

          {/* Données personnelles */}
          <Card>
            <CardHeader>
              <CardTitle>12. Données personnelles</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <p>
                Le traitement de vos données personnelles est régi par notre 
                <Link href="/privacy" className="text-jomionstore-primary hover:underline font-semibold"> Politique de confidentialité</Link>.
              </p>
              <p>
                En utilisant la Plateforme, vous consentez à la collecte et au traitement de vos données 
                conformément à cette politique et aux lois en vigueur (RGPD, lois locales).
              </p>
            </CardContent>
          </Card>

          {/* Modifications */}
          <Card>
            <CardHeader>
              <CardTitle>13. Modifications des CGU</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <p>
                JomionStore se réserve le droit de modifier les présentes CGU à tout moment. 
                Les modifications prennent effet dès leur publication sur cette page.
              </p>
              <p>
                En cas de modification substantielle, les Utilisateurs enregistrés seront informés 
                par email au moins 30 jours avant l'entrée en vigueur des nouvelles conditions.
              </p>
              <p>
                La poursuite de l'utilisation de la Plateforme après modification vaut acceptation 
                des nouvelles CGU.
              </p>
            </CardContent>
          </Card>

          {/* Droit applicable */}
          <Card>
            <CardHeader>
              <CardTitle>14. Droit applicable et juridiction</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <h4 className="font-semibold">14.1. Loi applicable</h4>
              <p>
                Les présentes CGU sont régies par le droit béninois et les lois en vigueur en 
                République du Bénin.
              </p>

              <h4 className="font-semibold mt-4">14.2. Résolution des litiges</h4>
              <p>
                En cas de litige, nous vous encourageons à contacter notre service client pour 
                trouver une solution amiable : <a href="mailto:contact@jomionstore.com" className="text-jomionstore-primary hover:underline">contact@jomionstore.com</a>
              </p>
              <p>
                À défaut de résolution amiable dans un délai de 30 jours, le litige sera porté 
                devant les tribunaux compétents de Cotonou, République du Bénin.
              </p>

              <h4 className="font-semibold mt-4">14.3. Médiation</h4>
              <p>
                Conformément aux dispositions du Code de la consommation, vous pouvez recourir 
                à une procédure de médiation conventionnelle ou à tout mode alternatif de règlement 
                des différends.
              </p>
            </CardContent>
          </Card>

          {/* Divers */}
          <Card>
            <CardHeader>
              <CardTitle>15. Dispositions générales</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <h4 className="font-semibold">15.1. Intégralité de l'accord</h4>
              <p>
                Les présentes CGU constituent l'intégralité de l'accord entre vous et JomionStore 
                concernant l'utilisation de la Plateforme.
              </p>

              <h4 className="font-semibold mt-4">15.2. Nullité partielle</h4>
              <p>
                Si une disposition des CGU est jugée invalide ou inapplicable, les autres dispositions 
                restent pleinement en vigueur.
              </p>

              <h4 className="font-semibold mt-4">15.3. Renonciation</h4>
              <p>
                Le fait pour JomionStore de ne pas exercer un droit prévu dans les CGU ne constitue 
                pas une renonciation à ce droit.
              </p>

              <h4 className="font-semibold mt-4">15.4. Langue</h4>
              <p>
                En cas de traduction des CGU dans une autre langue, seule la version française fait foi.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="border-jomionstore-primary">
            <CardHeader>
              <CardTitle>16. Contact</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <p className="font-semibold">Pour toute question concernant les présentes CGU :</p>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="mb-0"><strong>JomionStore - Service Client</strong></p>
                <p className="mb-0">Email : <a href="mailto:contact@jomionstore.com" className="text-jomionstore-primary hover:underline font-semibold">contact@jomionstore.com</a></p>
                <p className="mb-0">Téléphone : <a href="tel:+2290164354089" className="text-jomionstore-primary hover:underline">+229 01 64 35 40 89</a></p>
                <p className="mb-0">Adresse : Quartier Ganhi, Cotonou, République du Bénin</p>
                <p className="mb-0">Horaires : Lundi - Vendredi : 8h - 18h | Samedi : 9h - 16h</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
