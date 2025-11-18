'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Star,
  Quote,
  ShoppingBag,
  Store,
  ThumbsUp,
  TrendingUp,
  Award,
  Users,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

const customerTestimonials = [
  {
    id: 1,
    name: 'Aminata D.',
    role: 'Cliente fidèle',
    location: 'Cotonou',
    rating: 5,
    text: 'JomionStore a complètement changé ma façon de faire du shopping ! La livraison est rapide, les produits sont de qualité et le service client est exceptionnel. Je recommande à 100% !',
    product: 'Smartphone Samsung Galaxy',
    date: '2025-01-15',
    verified: true,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aminata&backgroundColor=c0aede'
  },
  {
    id: 2,
    name: 'Koffi M.',
    role: 'Entrepreneur',
    location: 'Porto-Novo',
    rating: 5,
    text: 'J\'ai commandé du matériel informatique pour mon entreprise. Tout est arrivé en parfait état en moins de 48h. Prix compétitifs et service impeccable. Merci JomionStore !',
    product: 'Ordinateur portable HP',
    date: '2025-01-12',
    verified: true,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=koffi&backgroundColor=b6e3f4'
  },
  {
    id: 3,
    name: 'Fatoumata S.',
    role: 'Étudiante',
    location: 'Parakou',
    rating: 5,
    text: 'Super expérience ! J\'ai trouvé exactement ce que je cherchais à un prix abordable. La plateforme est facile à utiliser et le suivi de commande est très pratique.',
    product: 'Sac à dos et fournitures',
    date: '2025-01-10',
    verified: true,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fatoumata&backgroundColor=ffd5dc'
  },
  {
    id: 4,
    name: 'Jean-Baptiste A.',
    role: 'Professionnel',
    location: 'Cotonou',
    rating: 5,
    text: 'Excellent service ! J\'ai été impressionné par la rapidité de livraison et la qualité des produits. JomionStore est devenu mon site de shopping préféré au Bénin.',
    product: 'Montre connectée',
    date: '2025-01-08',
    verified: true,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jeanbaptiste&backgroundColor=d1d4f9'
  },
  {
    id: 5,
    name: 'Marie-Claire T.',
    role: 'Maman de 3 enfants',
    location: 'Abomey-Calavi',
    rating: 5,
    text: 'Avec 3 enfants, je n\'ai pas toujours le temps d\'aller en magasin. JomionStore me facilite la vie ! Je commande en ligne et je reçois tout à domicile. C\'est parfait !',
    product: 'Vêtements enfants',
    date: '2025-01-05',
    verified: true,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marieclaire&backgroundColor=ffdfbf'
  },
  {
    id: 6,
    name: 'Rodrigue K.',
    role: 'Ingénieur',
    location: 'Cotonou',
    rating: 5,
    text: 'Interface moderne, paiement sécurisé, livraison rapide... JomionStore coche toutes les cases ! Bravo pour cette initiative qui modernise le commerce au Bénin.',
    product: 'Accessoires tech',
    date: '2025-01-03',
    verified: true,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rodrigue&backgroundColor=c0aede'
  }
];

const vendorTestimonials = [
  {
    id: 1,
    name: 'Boutique TechPro',
    owner: 'Serge A.',
    category: 'Électronique',
    location: 'Cotonou',
    rating: 5,
    text: 'Depuis que j\'ai rejoint JomionStore, mes ventes ont augmenté de 300% ! La plateforme est intuitive, le support est réactif et les paiements sont rapides. Un vrai partenaire de croissance.',
    sales: '500+ ventes',
    date: '2024-12-20',
    verified: true,
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=TP&backgroundColor=FF5722'
  },
  {
    id: 2,
    name: 'Fashion Elegance',
    owner: 'Nadège M.',
    category: 'Mode & Beauté',
    location: 'Porto-Novo',
    rating: 5,
    text: 'JomionStore m\'a permis de toucher des clients dans tout le Bénin. Les outils de gestion sont excellents et l\'équipe est toujours là pour nous accompagner. Je recommande vivement !',
    sales: '800+ ventes',
    date: '2024-12-15',
    verified: true,
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=FE&backgroundColor=E91E63'
  },
  {
    id: 3,
    name: 'Maison & Déco Plus',
    owner: 'Ibrahim S.',
    category: 'Maison & Jardin',
    location: 'Parakou',
    rating: 5,
    text: 'Excellente plateforme pour développer son business ! Dashboard complet, analytics précis, et surtout une visibilité incroyable. Mes ventes ont doublé en 3 mois.',
    sales: '350+ ventes',
    date: '2024-12-10',
    verified: true,
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=MD&backgroundColor=4CAF50'
  },
  {
    id: 4,
    name: 'Sports & Fitness BJ',
    owner: 'Yves K.',
    category: 'Sport & Loisirs',
    location: 'Cotonou',
    rating: 5,
    text: 'JomionStore est la meilleure décision que j\'ai prise pour mon business. Interface pro, commission raisonnable, et une équipe qui comprend vraiment les besoins des vendeurs.',
    sales: '600+ ventes',
    date: '2024-12-05',
    verified: true,
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SF&backgroundColor=2196F3'
  }
];

const stats = [
  {
    icon: Users,
    value: '500K+',
    label: 'Clients satisfaits',
    color: 'text-jomionstore-primary'
  },
  {
    icon: Store,
    value: '1200+',
    label: 'Vendeurs partenaires',
    color: 'text-jomionstore-secondary'
  },
  {
    icon: Star,
    value: '4.8/5',
    label: 'Note moyenne',
    color: 'text-yellow-500'
  },
  {
    icon: TrendingUp,
    value: '98%',
    label: 'Taux de satisfaction',
    color: 'text-green-600'
  }
];

export default function TestimonialsPage() {
  const [activeTab, setActiveTab] = useState('customers');

  return (
    <div className="min-h-screen bg-jomionstore-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-jomionstore-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Témoignages</span>
        </nav>

        {/* Hero */}
        <div className="text-center mb-16">
          <Badge className="bg-jomionstore-primary/10 text-jomionstore-primary mb-4">
            <ThumbsUp className="w-4 h-4 mr-2" />
            Avis Clients
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Ils nous font
            <span className="text-jomionstore-primary"> confiance</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez les témoignages de nos clients et vendeurs partenaires qui ont choisi JomionStore
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="text-center p-6">
                <CardContent className="space-y-3">
                  <div className={`w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center`}>
                    <IconComponent className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-16">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
            <TabsTrigger value="customers" className="text-lg">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="vendors" className="text-lg">
              <Store className="w-5 h-5 mr-2" />
              Vendeurs
            </TabsTrigger>
          </TabsList>

          {/* Customer Testimonials */}
          <TabsContent value="customers" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customerTestimonials.map((testimonial) => (
                <Card key={testimonial.id} className="hover-lift">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                          <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900">{testimonial.name}</h3>
                            {testimonial.verified && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{testimonial.role}</p>
                          <p className="text-xs text-gray-500">{testimonial.location}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>

                    <Quote className="w-8 h-8 text-jomionstore-primary/20 mb-2" />
                    <p className="text-gray-700 mb-4 leading-relaxed">{testimonial.text}</p>

                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Produit acheté:</span> {testimonial.product}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(testimonial.date).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Vendor Testimonials */}
          <TabsContent value="vendors" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vendorTestimonials.map((testimonial) => (
                <Card key={testimonial.id} className="hover-lift">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                        <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 text-lg">{testimonial.name}</h3>
                          {testimonial.verified && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">Par {testimonial.owner}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {testimonial.category}
                          </Badge>
                          <span className="text-xs text-gray-500">{testimonial.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <Badge className="bg-green-100 text-green-700">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {testimonial.sales}
                      </Badge>
                    </div>

                    <Quote className="w-8 h-8 text-jomionstore-secondary/20 mb-2" />
                    <p className="text-gray-700 mb-4 leading-relaxed">{testimonial.text}</p>

                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Partenaire depuis{' '}
                        {new Date(testimonial.date).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long'
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <Card className="bg-gradient-to-br from-jomionstore-primary to-jomionstore-secondary text-white p-8 md:p-12 text-center">
          <CardContent>
            <Award className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Rejoignez notre communauté !
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Que vous soyez client ou vendeur, faites partie de l'aventure JomionStore
              et bénéficiez d'une expérience e-commerce exceptionnelle au Bénin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-jomionstore-primary hover:bg-gray-100"
                asChild
              >
                <Link href="/products">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Commencer à acheter
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                asChild
              >
                <Link href="/vendor/register">
                  <Store className="w-5 h-5 mr-2" />
                  Devenir vendeur
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}