'use client';

import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Server, 
  Shield,
  User,
  FileText,
  Info
} from 'lucide-react';
import Link from 'next/link';

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-jomionstore-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-jomionstore-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Mentions légales</span>
        </nav>

        <div className="mb-6">
          <Badge className="bg-jomionstore-primary mb-3">Dernière mise à jour : 18 novembre 2025</Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Mentions légales</h1>
          <p className="text-gray-600 text-lg">
            Informations légales concernant le site JomionStore conformément à la législation en vigueur 
            en République du Bénin.
          </p>
        </div>

        <div className="space-y-6">
          {/* Éditeur du site */}
          <Card className="border-jomionstore-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-jomionstore-primary" />
                1. Éditeur du site
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-jomionstore-primary/5 p-6 rounded-lg border border-jomionstore-primary">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Raison sociale</p>
                    <p className="font-semibold text-lg">JomionStore SARL</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Forme juridique</p>
                    <p className="font-semibold">Société à Responsabilité Limitée</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Capital social</p>
                    <p className="font-semibold">10 000 000 XOF</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Numéro RCCM</p>
                    <p className="font-semibold">RB/COT/XX-X-XXXXX</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">IFU (Identifiant Fiscal Unique)</p>
                    <p className="font-semibold">XXXXXXXXXXXXXXX</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Numéro de TVA</p>
                    <p className="font-semibold">BJ-XXXXXXXXXXXXXXX</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-jomionstore-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Siège social</p>
                    <p className="text-gray-700">
                      Quartier Ganhi<br />
                      Cotonou, République du Bénin
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-jomionstore-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Email</p>
                    <a href="mailto:contact@jomionstore.com" className="text-jomionstore-primary hover:underline">
                      contact@jomionstore.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-jomionstore-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Téléphone</p>
                    <a href="tel:+2290164354089" className="text-jomionstore-primary hover:underline">
                      +229 01 64 35 40 89
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-jomionstore-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Site web</p>
                    <a href="https://jomionstore.com" className="text-jomionstore-primary hover:underline">
                      www.jomionstore.com
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Directeur de publication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-6 h-6 text-jomionstore-primary" />
                2. Directeur de la publication
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="mb-2">
                  <strong>Nom :</strong> Joel TCHAYE
                </p>
                <p className="mb-2">
                  <strong>Fonction :</strong> Directeur Général et Fondateur
                </p>
                <p className="mb-0">
                  <strong>Contact :</strong>{' '}
                  <a href="mailto:contact@jomionstore.com" className="text-jomionstore-primary hover:underline">
                    contact@jomionstore.com
                  </a>
                </p>
              </div>
              <p className="text-sm text-gray-600">
                Le directeur de la publication est responsable du contenu éditorial publié sur le site 
                JomionStore conformément à la législation béninoise.
              </p>
            </CardContent>
          </Card>

          {/* Hébergement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-6 h-6 text-jomionstore-primary" />
                3. Hébergement du site
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-6 rounded-lg border">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Hébergeur</p>
                    <p className="font-semibold text-lg">Vercel Inc.</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Adresse</p>
                    <p className="text-gray-700">
                      340 S Lemon Ave #4133<br />
                      Walnut, CA 91789<br />
                      États-Unis
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Site web</p>
                    <a 
                      href="https://vercel.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-jomionstore-primary hover:underline"
                    >
                      www.vercel.com
                    </a>
                  </div>
                </div>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <Info className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-gray-700">
                  <strong>Infrastructure :</strong> Le site est hébergé sur une infrastructure cloud sécurisée 
                  avec des serveurs répartis mondialement pour garantir performance et disponibilité.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Base de données */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-6 h-6 text-jomionstore-primary" />
                4. Hébergement des données
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-6 rounded-lg border">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Fournisseur de base de données</p>
                    <p className="font-semibold text-lg">Supabase Inc.</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Adresse</p>
                    <p className="text-gray-700">
                      970 Toa Payoh North #07-04<br />
                      Singapore 318992
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Site web</p>
                    <a 
                      href="https://supabase.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-jomionstore-primary hover:underline"
                    >
                      www.supabase.com
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Localisation des données</p>
                    <p className="text-gray-700">Europe (conformité RGPD)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Propriété intellectuelle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-jomionstore-primary" />
                5. Propriété intellectuelle
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <p>
                L'ensemble du contenu présent sur le site <strong>jomionstore.com</strong> (structure, textes, 
                logos, images, vidéos, graphismes, icônes, sons, logiciels, bases de données) est la propriété 
                exclusive de JomionStore SARL ou de ses partenaires.
              </p>
              <p>
                Ces éléments sont protégés par les lois relatives à la propriété intellectuelle et notamment 
                par le Code de la propriété intellectuelle béninois, ainsi que par les conventions internationales.
              </p>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="font-semibold text-orange-900 mb-2">⚠️ Toute reproduction interdite</p>
                <p className="text-sm text-gray-700 mb-0">
                  Toute reproduction, représentation, modification, publication, adaptation de tout ou partie 
                  des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans 
                  l'autorisation écrite préalable de JomionStore.
                </p>
              </div>
              <p>
                Toute exploitation non autorisée du site ou de l'un des éléments qu'il contient sera considérée 
                comme constitutive d'une contrefaçon et poursuivie conformément aux dispositions légales en vigueur.
              </p>
            </CardContent>
          </Card>

          {/* Marques */}
          <Card>
            <CardHeader>
              <CardTitle>6. Marques et logos</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <p>
                Les marques, logos, signes et tout autre contenu du site font l'objet d'une protection par 
                le Code de la propriété intellectuelle et plus particulièrement par le droit des marques.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="font-semibold mb-2">Marques déposées :</p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li><strong>JomionStore®</strong> - Marque déposée</li>
                  <li>Logo JomionStore - Marque figurative déposée</li>
                  <li>Slogan "L'avenir du shopping au Bénin" - Marque verbale</li>
                </ul>
              </div>
              <p>
                Toute utilisation non autorisée de ces marques ou de ces logos constitue une contrefaçon 
                passible de sanctions pénales et civiles.
              </p>
            </CardContent>
          </Card>

          {/* Données personnelles */}
          <Card>
            <CardHeader>
              <CardTitle>7. Protection des données personnelles</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <p>
                JomionStore accorde une grande importance à la protection de vos données personnelles. 
                Le traitement de vos données est effectué dans le respect de la réglementation applicable, 
                notamment :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Le Règlement Général sur la Protection des Données (RGPD)</li>
                <li>La loi béninoise n°2017-20 du 20 avril 2018 portant code du numérique</li>
                <li>Les directives de l'Autorité de Protection des Données Personnelles (APDP) du Bénin</li>
              </ul>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="mb-2">
                  <strong>Responsable du traitement des données :</strong>
                </p>
                <p className="mb-2">JomionStore SARL</p>
                <p className="mb-0">
                  <strong>Contact DPO :</strong>{' '}
                  <a href="mailto:contact@jomionstore.com" className="text-jomionstore-primary hover:underline">
                    contact@jomionstore.com
                  </a>
                </p>
              </div>
              <p>
                Pour plus d'informations sur la collecte et le traitement de vos données personnelles, 
                consultez notre{' '}
                <Link href="/privacy" className="text-jomionstore-primary hover:underline font-semibold">
                  Politique de confidentialité
                </Link>.
              </p>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>8. Cookies</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <p>
                Le site JomionStore utilise des cookies pour améliorer l'expérience utilisateur, réaliser 
                des statistiques de visite et proposer des contenus adaptés.
              </p>
              <p>
                Vous pouvez à tout moment gérer vos préférences en matière de cookies via notre{' '}
                <Link href="/cookies" className="text-jomionstore-primary hover:underline font-semibold">
                  Politique de cookies
                </Link>{' '}
                ou depuis les paramètres de votre navigateur.
              </p>
            </CardContent>
          </Card>

          {/* Responsabilité */}
          <Card>
            <CardHeader>
              <CardTitle>9. Limitation de responsabilité</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <h4 className="font-semibold">9.1. Contenu du site</h4>
              <p>
                JomionStore s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées 
                sur le site. Toutefois, JomionStore ne peut garantir l'exactitude, la précision ou 
                l'exhaustivité des informations mises à disposition.
              </p>

              <h4 className="font-semibold mt-4">9.2. Disponibilité du site</h4>
              <p>
                JomionStore met en œuvre tous les moyens raisonnables pour assurer un accès continu au site. 
                Toutefois, JomionStore ne saurait être tenu responsable :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Des interruptions temporaires pour maintenance ou mise à jour</li>
                <li>Des pannes techniques indépendantes de sa volonté</li>
                <li>Des problèmes de connexion liés au fournisseur d'accès internet de l'utilisateur</li>
                <li>Des cas de force majeure</li>
              </ul>

              <h4 className="font-semibold mt-4">9.3. Liens hypertextes</h4>
              <p>
                Le site peut contenir des liens vers d'autres sites internet. JomionStore n'exerce aucun 
                contrôle sur ces sites et décline toute responsabilité quant à leur contenu, leur disponibilité 
                ou leur politique de confidentialité.
              </p>
            </CardContent>
          </Card>

          {/* Droit applicable */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-jomionstore-primary" />
                10. Droit applicable et juridiction
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-gray-700 space-y-4">
              <h4 className="font-semibold">10.1. Loi applicable</h4>
              <p>
                Les présentes mentions légales sont régies par le droit béninois. Tout litige relatif à 
                l'utilisation du site <strong>jomionstore.com</strong> est soumis au droit de la République 
                du Bénin.
              </p>

              <h4 className="font-semibold mt-4">10.2. Juridiction compétente</h4>
              <p>
                En cas de litige et à défaut de résolution amiable, les tribunaux de <strong>Cotonou, 
                République du Bénin</strong>, seront seuls compétents.
              </p>

              <h4 className="font-semibold mt-4">10.3. Médiation</h4>
              <p>
                Conformément aux dispositions du Code de la consommation, l'utilisateur peut recourir à 
                une procédure de médiation conventionnelle ou à tout mode alternatif de règlement des 
                différends en cas de contestation.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="border-jomionstore-primary bg-jomionstore-primary/5">
            <CardHeader>
              <CardTitle>11. Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Pour toute question concernant les présentes mentions légales ou le site JomionStore, 
                vous pouvez nous contacter :
              </p>
              <div className="bg-white p-6 rounded-lg border-2 border-jomionstore-primary">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Par email</p>
                    <a href="mailto:contact@jomionstore.com" className="text-jomionstore-primary hover:underline font-semibold">
                      contact@jomionstore.com
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Par téléphone</p>
                    <a href="tel:+2290164354089" className="text-jomionstore-primary hover:underline font-semibold">
                      +229 01 64 35 40 89
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Par courrier</p>
                    <p className="text-gray-700">
                      JomionStore SARL<br />
                      Quartier Ganhi<br />
                      Cotonou, République du Bénin
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Horaires</p>
                    <p className="text-gray-700">
                      Lundi-Vendredi : 8h-18h<br />
                      Samedi : 9h-16h
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents complémentaires */}
          <Card>
            <CardHeader>
              <CardTitle>Documents juridiques complémentaires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link 
                  href="/legal/cgv" 
                  className="bg-gray-50 p-4 rounded-lg border hover:border-jomionstore-primary hover:bg-jomionstore-primary/5 transition-colors"
                >
                  <p className="font-semibold mb-1">📄 Conditions Générales de Vente</p>
                  <p className="text-sm text-gray-600">Conditions applicables aux achats</p>
                </Link>
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
                  <p className="text-sm text-gray-600">Protection de vos données</p>
                </Link>
                <Link 
                  href="/cookies" 
                  className="bg-gray-50 p-4 rounded-lg border hover:border-jomionstore-primary hover:bg-jomionstore-primary/5 transition-colors"
                >
                  <p className="font-semibold mb-1">🍪 Politique de cookies</p>
                  <p className="text-sm text-gray-600">Gestion des cookies</p>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
