'use client';
export const revalidate = 300;

import React from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-jomionstore-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-jomionstore-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Politique de confidentialité</span>
        </nav>

        <div className="mb-6">
          <Badge className="bg-jomionstore-primary mb-3">Dernière mise à jour : 15 octobre 2025</Badge>
          <h1 className="text-4xl font-bold text-gray-900">Politique de confidentialité</h1>
        </div>

        <div className="space-y-6">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle>1. Introduction</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <p>
                JomionStore (ci-après "nous", "notre" ou "JomionStore") s'engage à protéger la vie privée 
                de ses utilisateurs. Cette politique de confidentialité explique comment nous collectons, 
                utilisons, partageons et protégeons vos données personnelles lorsque vous utilisez notre 
                plateforme e-commerce accessible sur <strong>jomionstore.com</strong>.
              </p>
              <p>
                En utilisant JomionStore, vous acceptez les pratiques décrites dans cette politique. 
                Si vous n'êtes pas d'accord, veuillez ne pas utiliser nos services.
              </p>
              <p className="font-semibold text-jomionstore-primary">
                Responsable du traitement des données : JomionStore, République du Bénin
              </p>
            </CardContent>
          </Card>

          {/* Données collectées */}
          <Card>
            <CardHeader>
              <CardTitle>2. Données personnelles collectées</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <h4 className="font-semibold">2.1. Données fournies directement</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Compte utilisateur :</strong> Nom, prénom, email, téléphone, mot de passe (crypté)</li>
                <li><strong>Adresse de livraison :</strong> Adresse complète, ville, code postal, pays</li>
                <li><strong>Informations de paiement :</strong> Données bancaires (traitées par nos prestataires de paiement sécurisés), historique de transactions</li>
                <li><strong>Communications :</strong> Messages via formulaire de contact, chat support, emails</li>
                <li><strong>Avis produits :</strong> Commentaires, notes, photos soumises</li>
              </ul>

              <h4 className="font-semibold mt-4">2.2. Données collectées automatiquement</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Données de navigation :</strong> Pages visitées, produits consultés, temps de visite, clics</li>
                <li><strong>Données techniques :</strong> Adresse IP, type de navigateur, système d'exploitation, résolution d'écran, langue</li>
                <li><strong>Cookies :</strong> Cookies de session, préférences, analyse de trafic (voir section 7)</li>
                <li><strong>Géolocalisation :</strong> Localisation approximative (ville) pour optimiser les livraisons</li>
              </ul>

              <h4 className="font-semibold mt-4">2.3. Données des vendeurs</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Informations d'entreprise :</strong> Raison sociale, numéro d'enregistrement, adresse professionnelle</li>
                <li><strong>Données bancaires :</strong> Coordonnées bancaires pour les paiements (RIB/IBAN)</li>
                <li><strong>Documents légaux :</strong> Justificatifs d'identité, licences commerciales</li>
              </ul>
            </CardContent>
          </Card>

          {/* Utilisation des données */}
          <Card>
            <CardHeader>
              <CardTitle>3. Utilisation des données</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <p>Nous utilisons vos données personnelles pour :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Traitement des commandes :</strong> Confirmation, préparation, expédition, suivi de livraison</li>
                <li><strong>Gestion de compte :</strong> Création, authentification, historique des achats</li>
                <li><strong>Paiements sécurisés :</strong> Vérification, traitement, remboursements</li>
                <li><strong>Service client :</strong> Assistance, réclamations, SAV, retours produits</li>
                <li><strong>Personnalisation :</strong> Recommandations de produits, offres ciblées</li>
                <li><strong>Marketing :</strong> Newsletters, promotions (avec votre consentement)</li>
                <li><strong>Analyse et amélioration :</strong> Statistiques d'usage, optimisation UX, détection de bugs</li>
                <li><strong>Conformité légale :</strong> Facturation, comptabilité, lutte contre la fraude</li>
                <li><strong>Sécurité :</strong> Prévention des abus, protection contre le spam et les cyberattaques</li>
              </ul>
            </CardContent>
          </Card>

          {/* Base légale */}
          <Card>
            <CardHeader>
              <CardTitle>4. Base légale du traitement</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <p>Nous traitons vos données personnelles sur la base de :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Exécution du contrat :</strong> Nécessaire pour fournir nos services (commandes, livraison)</li>
                <li><strong>Consentement :</strong> Pour le marketing, cookies non essentiels (vous pouvez retirer ce consentement)</li>
                <li><strong>Obligations légales :</strong> Facturation, comptabilité, conformité fiscale</li>
                <li><strong>Intérêts légitimes :</strong> Amélioration du service, sécurité, analyse</li>
              </ul>
            </CardContent>
          </Card>

          {/* Partage des données */}
          <Card>
            <CardHeader>
              <CardTitle>5. Partage des données</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <p>Nous partageons vos données uniquement dans les cas suivants :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Prestataires de services :</strong> Paiement (Qosic, MTN MoMo, Moov Money), livraison, hébergement (Vercel, Supabase), email (Resend)</li>
                <li><strong>Vendeurs partenaires :</strong> Nom et adresse de livraison pour traiter vos commandes</li>
                <li><strong>Autorités légales :</strong> En cas d'obligation légale, demande judiciaire ou enquête</li>
                <li><strong>Analyse et publicité :</strong> Partenaires marketing (Google Analytics, Facebook Pixel) si consentement donné</li>
              </ul>
              <p className="font-semibold text-orange-600">
                ⚠️ Nous ne vendons jamais vos données personnelles à des tiers.
              </p>
            </CardContent>
          </Card>

          {/* Conservation */}
          <Card>
            <CardHeader>
              <CardTitle>6. Durée de conservation</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Compte actif :</strong> Tant que le compte existe</li>
                <li><strong>Commandes :</strong> 5 ans (obligation légale comptable)</li>
                <li><strong>Paiements :</strong> 13 mois (obligation bancaire anti-fraude)</li>
                <li><strong>Marketing :</strong> 3 ans après le dernier contact (si consentement)</li>
                <li><strong>Compte supprimé :</strong> 30 jours (puis suppression définitive, sauf obligations légales)</li>
                <li><strong>Cookies :</strong> 13 mois maximum</li>
              </ul>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>7. Cookies et technologies similaires</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <h4 className="font-semibold">7.1. Types de cookies utilisés</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Cookies essentiels :</strong> Authentification, panier d'achat, sécurité (obligatoires)</li>
                <li><strong>Cookies de performance :</strong> Analyse de trafic, statistiques (Google Analytics)</li>
                <li><strong>Cookies fonctionnels :</strong> Préférences, langue, devise</li>
                <li><strong>Cookies marketing :</strong> Publicité ciblée, remarketing (nécessitent consentement)</li>
              </ul>

              <h4 className="font-semibold mt-4">7.2. Gestion des cookies</h4>
              <p>
                Vous pouvez gérer vos préférences de cookies via notre bandeau de consentement ou dans les 
                paramètres de votre navigateur. Le refus de certains cookies peut limiter les fonctionnalités du site.
              </p>
              <p>
                Plus d'informations : <Link href="/cookies" className="text-jomionstore-primary hover:underline">Politique de cookies</Link>
              </p>
            </CardContent>
          </Card>

          {/* Sécurité */}
          <Card>
            <CardHeader>
              <CardTitle>8. Sécurité des données</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <p>Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Chiffrement :</strong> HTTPS (TLS 1.3), cryptage des mots de passe (bcrypt)</li>
                <li><strong>Authentification sécurisée :</strong> OAuth 2.0, authentification à deux facteurs (2FA)</li>
                <li><strong>Protection des paiements :</strong> Conformité PCI-DSS via nos prestataires</li>
                <li><strong>Surveillance :</strong> Détection des accès non autorisés, logs d'activité</li>
                <li><strong>Hébergement sécurisé :</strong> Serveurs certifiés (Vercel, Supabase)</li>
                <li><strong>Accès restreint :</strong> Seuls les employés autorisés ont accès aux données</li>
              </ul>
            </CardContent>
          </Card>

          {/* Vos droits */}
          <Card>
            <CardHeader>
              <CardTitle>9. Vos droits (RGPD et lois locales)</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <p>Vous disposez des droits suivants sur vos données personnelles :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Droit d'accès :</strong> Obtenir une copie de vos données</li>
                <li><strong>Droit de rectification :</strong> Corriger les données inexactes</li>
                <li><strong>Droit à l'effacement :</strong> Demander la suppression de vos données ("droit à l'oubli")</li>
                <li><strong>Droit à la limitation :</strong> Restreindre le traitement de vos données</li>
                <li><strong>Droit à la portabilité :</strong> Récupérer vos données dans un format structuré</li>
                <li><strong>Droit d'opposition :</strong> Vous opposer au traitement (marketing, profilage)</li>
                <li><strong>Retrait du consentement :</strong> Annuler votre consentement à tout moment</li>
                <li><strong>Droit de réclamation :</strong> Déposer une plainte auprès d'une autorité de protection des données</li>
              </ul>

              <h4 className="font-semibold mt-4">Comment exercer vos droits ?</h4>
              <p>
                Contactez-nous par email : <a href="mailto:contact@jomionstore.com" className="text-jomionstore-primary hover:underline font-semibold">contact@jomionstore.com</a><br />
                Téléphone : <a href="tel:+2290164354089" className="text-jomionstore-primary hover:underline">+229 01 64 35 40 89</a><br />
                Ou via votre espace <strong>Mon compte &gt; Paramètres &gt; Confidentialité</strong>
              </p>
              <p className="text-sm text-gray-600">
                Nous répondrons à votre demande dans un délai de 30 jours maximum.
              </p>
            </CardContent>
          </Card>

          {/* Transferts internationaux */}
          <Card>
            <CardHeader>
              <CardTitle>10. Transferts internationaux de données</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <p>
                Certains de nos prestataires (hébergement, paiement, analyse) sont situés en dehors du Bénin, 
                notamment aux États-Unis et en Europe. Nous nous assurons que ces transferts sont protégés par :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Clauses contractuelles types approuvées par la Commission européenne</li>
                <li>Certification Privacy Shield (pour les entreprises américaines)</li>
                <li>Garanties contractuelles de protection des données</li>
              </ul>
            </CardContent>
          </Card>

          {/* Mineurs */}
          <Card>
            <CardHeader>
              <CardTitle>11. Protection des mineurs</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <p>
                JomionStore s'adresse aux personnes majeures (18 ans et plus). Nous ne collectons pas 
                sciemment de données personnelles d'enfants de moins de 18 ans. Si vous êtes parent ou tuteur 
                et que vous découvrez que votre enfant nous a fourni des données, contactez-nous immédiatement 
                pour suppression.
              </p>
            </CardContent>
          </Card>

          {/* Modifications */}
          <Card>
            <CardHeader>
              <CardTitle>12. Modifications de la politique</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <p>
                Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. 
                Les modifications entrent en vigueur dès leur publication sur cette page. La date de dernière 
                mise à jour est indiquée en haut de ce document.
              </p>
              <p>
                En cas de changement majeur, nous vous informerons par email ou notification sur le site.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="border-jomionstore-primary">
            <CardHeader>
              <CardTitle>13. Contact</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <p className="font-semibold">Pour toute question concernant cette politique de confidentialité :</p>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="mb-0"><strong>JomionStore - Protection des Données</strong></p>
                <p className="mb-0">Email : <a href="mailto:contact@jomionstore.com" className="text-jomionstore-primary hover:underline font-semibold">contact@jomionstore.com</a></p>
                <p className="mb-0">Téléphone : <a href="tel:+2290164354089" className="text-jomionstore-primary hover:underline">+229 01 64 35 40 89</a></p>
                <p className="mb-0">Adresse : Quartier Ganhi, Cotonou, République du Bénin</p>
              </div>
              <p className="text-sm text-gray-600 mb-0">
                Nous nous engageons à traiter vos demandes dans les meilleurs délais et à protéger vos droits conformément 
                aux lois en vigueur sur la protection des données personnelles.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
