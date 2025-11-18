'use client';

import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  ShoppingCart,
  CreditCard,
  Truck,
  CheckCircle,
  Store,
  Upload,
  BarChart3,
  DollarSign,
  Shield,
  Clock,
  Package,
  Star,
  ArrowRight,
  Users,
  Smartphone
} from 'lucide-react';
import Link from 'next/link';

const buyerSteps = [
  {
    number: 1,
    icon: Search,
    title: 'Recherchez vos produits',
    description: 'Parcourez notre catalogue de 50K+ produits ou utilisez la recherche intelligente pour trouver exactement ce que vous cherchez.',
    tips: ['Utilisez les filtres pour affiner votre recherche', 'Consultez les avis clients', 'Comparez les prix']
  },
  {
    number: 2,
    icon: ShoppingCart,
    title: 'Ajoutez au panier',
    description: 'Sélectionnez vos articles préférés, choisissez la quantité et ajoutez-les à votre panier en un clic.',
    tips: ['Profitez des offres groupées', 'Vérifiez la disponibilité', 'Sauvegardez pour plus tard']
  },
  {
    number: 3,
    icon: CreditCard,
    title: 'Payez en toute sécurité',
    description: 'Choisissez votre mode de paiement préféré : Mobile Money, carte bancaire ou virement.',
    tips: ['Paiement 100% sécurisé', 'Plusieurs options disponibles', 'Confirmation instantanée']
  },
  {
    number: 4,
    icon: Truck,
    title: 'Recevez votre commande',
    description: 'Suivez votre colis en temps réel et recevez-le à l\'adresse de votre choix sous 24-48h.',
    tips: ['Suivi en temps réel', 'Livraison gratuite dès 200K XOF', 'Notification SMS']
  }
];

const sellerSteps = [
  {
    number: 1,
    icon: Store,
    title: 'Créez votre boutique',
    description: 'Inscrivez-vous gratuitement et créez votre boutique personnalisée en quelques minutes.',
    tips: ['Inscription gratuite', 'Interface intuitive', 'Support dédié']
  },
  {
    number: 2,
    icon: Upload,
    title: 'Ajoutez vos produits',
    description: 'Importez vos produits avec photos, descriptions et prix. Utilisez nos outils d\'import en masse.',
    tips: ['Import CSV disponible', 'Photos illimitées', 'Gestion des stocks']
  },
  {
    number: 3,
    icon: BarChart3,
    title: 'Gérez vos ventes',
    description: 'Suivez vos commandes, gérez votre inventaire et analysez vos performances depuis votre dashboard.',
    tips: ['Dashboard complet', 'Analytics en temps réel', 'Rapports détaillés']
  },
  {
    number: 4,
    icon: DollarSign,
    title: 'Recevez vos paiements',
    description: 'Encaissez vos ventes rapidement et en toute sécurité. Paiements versés sous 48h.',
    tips: ['Paiements sécurisés', 'Versement rapide', 'Historique complet']
  }
];

const features = [
  {
    icon: Shield,
    title: 'Paiement sécurisé',
    description: 'Transactions protégées par cryptage SSL et conformes PCI-DSS'
  },
  {
    icon: Clock,
    title: 'Livraison rapide',
    description: '24-48h à Cotonou, 2-4 jours dans les autres villes'
  },
  {
    icon: Package,
    title: 'Retours gratuits',
    description: '30 jours pour changer d\'avis, retours pris en charge'
  },
  {
    icon: Star,
    title: 'Service client 24/7',
    description: 'Support disponible par email, téléphone et chat'
  },
  {
    icon: Users,
    title: 'Communauté active',
    description: '500K+ clients et 1200+ vendeurs partenaires'
  },
  {
    icon: Smartphone,
    title: 'App mobile',
    description: 'Disponible sur iOS et Android pour shopper partout'
  }
];

const faqs = [
  {
    question: 'Comment créer un compte ?',
    answer: 'Cliquez sur "S\'inscrire" en haut à droite, renseignez votre email et créez un mot de passe. Vous recevrez un email de confirmation.'
  },
  {
    question: 'Quels sont les modes de paiement acceptés ?',
    answer: 'Nous acceptons Mobile Money (MTN, Moov), cartes bancaires (Visa, Mastercard) et virements bancaires pour les grosses commandes.'
  },
  {
    question: 'Combien coûte la livraison ?',
    answer: 'La livraison est GRATUITE pour toute commande de 200 000 XOF et plus. Sinon, à partir de 2 000 XOF selon le poids et la destination.'
  },
  {
    question: 'Puis-je retourner un produit ?',
    answer: 'Oui, vous disposez de 30 jours pour retourner tout produit qui ne vous convient pas. Les frais de retour sont pris en charge par JomionStore.'
  },
  {
    question: 'Comment suivre ma commande ?',
    answer: 'Connectez-vous à votre compte, allez dans "Mes commandes" et cliquez sur le numéro de suivi. Vous recevrez aussi des notifications par email et SMS.'
  },
  {
    question: 'Comment devenir vendeur ?',
    answer: 'Rendez-vous sur la page "Devenir vendeur", remplissez le formulaire d\'inscription. Notre équipe vous contactera sous 48h pour valider votre compte.'
  }
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-jomionstore-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-jomionstore-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Comment ça marche</span>
        </nav>

        {/* Hero */}
        <div className="text-center mb-16">
          <Badge className="bg-jomionstore-primary/10 text-jomionstore-primary mb-4">Guide Complet</Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Comment ça marche ?
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez comment acheter ou vendre sur JomionStore en quelques étapes simples
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="buyer" className="mb-16">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
            <TabsTrigger value="buyer" className="text-lg">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Pour les Acheteurs
            </TabsTrigger>
            <TabsTrigger value="seller" className="text-lg">
              <Store className="w-5 h-5 mr-2" />
              Pour les Vendeurs
            </TabsTrigger>
          </TabsList>

          {/* Buyer Steps */}
          <TabsContent value="buyer" className="space-y-12">
            {buyerSteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-jomionstore-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {step.number}
                      </div>
                      <div className="w-16 h-16 bg-jomionstore-primary/10 rounded-full flex items-center justify-center">
                        <IconComponent className="w-8 h-8 text-jomionstore-primary" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">{step.title}</h3>
                    <p className="text-gray-600 text-lg mb-6">{step.description}</p>
                    <div className="space-y-2">
                      {step.tips.map((tip, tipIndex) => (
                        <div key={tipIndex} className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <Card className="p-8 bg-gradient-to-br from-jomionstore-primary/5 to-orange-50">
                      <CardContent className="flex items-center justify-center h-64">
                        <IconComponent className="w-32 h-32 text-jomionstore-primary/30" />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              );
            })}

            <div className="text-center pt-8">
              <Link href="/products">
                <Button className="bg-jomionstore-primary hover:bg-orange-700 text-lg px-8 py-6">
                  Commencer à acheter
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* Seller Steps */}
          <TabsContent value="seller" className="space-y-12">
            {sellerSteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-jomionstore-secondary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {step.number}
                      </div>
                      <div className="w-16 h-16 bg-jomionstore-secondary/10 rounded-full flex items-center justify-center">
                        <IconComponent className="w-8 h-8 text-jomionstore-secondary" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">{step.title}</h3>
                    <p className="text-gray-600 text-lg mb-6">{step.description}</p>
                    <div className="space-y-2">
                      {step.tips.map((tip, tipIndex) => (
                        <div key={tipIndex} className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <Card className="p-8 bg-gradient-to-br from-jomionstore-secondary/5 to-blue-50">
                      <CardContent className="flex items-center justify-center h-64">
                        <IconComponent className="w-32 h-32 text-jomionstore-secondary/30" />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              );
            })}

            <div className="text-center pt-8">
              <Link href="/vendor/register">
                <Button className="bg-jomionstore-secondary hover:bg-blue-700 text-lg px-8 py-6">
                  Devenir vendeur
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>

        {/* Features */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pourquoi choisir JomionStore ?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Une expérience shopping complète avec tous les avantages
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="p-6 hover-lift">
                  <CardContent className="space-y-4">
                    <div className="w-12 h-12 bg-jomionstore-primary/10 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-jomionstore-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Trouvez rapidement les réponses à vos questions
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6">
                <CardContent>
                  <h3 className="font-bold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/faq">
              <Button variant="outline" className="text-lg px-6 py-4">
                Voir toutes les questions
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-jomionstore-primary to-orange-600 text-white">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Prêt à commencer ?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Rejoignez des milliers de clients satisfaits et découvrez une nouvelle façon de faire du shopping
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button className="bg-white text-jomionstore-primary hover:bg-gray-100 text-lg px-8 py-4">
                  Explorer les produits
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-jomionstore-primary text-lg px-8 py-4">
                  Nous contacter
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
