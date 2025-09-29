// server component

import React from 'react';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Target, 
  Award, 
  Globe, 
  Truck, 
  Shield, 
  Heart,
  Star,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

const stats = [
  { label: 'Clients satisfaits', value: '500K+', icon: Users },
  { label: 'Produits disponibles', value: '50K+', icon: Target },
  { label: 'Vendeurs partenaires', value: '1,200+', icon: Award },
  { label: 'Villes desservies', value: '15+', icon: Globe }
];

const values = [
  {
    icon: Heart,
    title: 'Passion Client',
    description: 'Nous mettons nos clients au cœur de tout ce que nous faisons, en offrant une expérience shopping exceptionnelle.'
  },
  {
    icon: Shield,
    title: 'Confiance & Sécurité',
    description: 'Vos transactions sont protégées et vos données personnelles sécurisées avec les dernières technologies.'
  },
  {
    icon: Star,
    title: 'Qualité Premium',
    description: 'Nous sélectionnons rigoureusement nos partenaires pour garantir des produits authentiques et de qualité.'
  },
  {
    icon: Truck,
    title: 'Livraison Rapide',
    description: 'Service de livraison express dans tout le Bénin avec suivi en temps réel de vos commandes.'
  }
];

const team = [
  {
    name: 'Koffi Mensah',
    role: 'CEO & Fondateur',
    image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Entrepreneur passionné avec 15 ans d\'expérience dans le e-commerce africain.'
  },
  {
    name: 'Aminata Diallo',
    role: 'Directrice Technique',
    image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Experte en technologies web et intelligence artificielle, diplômée MIT.'
  },
  {
    name: 'Jean-Baptiste Kouassi',
    role: 'Directeur Commercial',
    image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Spécialiste du développement commercial en Afrique de l\'Ouest depuis 12 ans.'
  }
];

const milestones = [
  { year: '2020', title: 'Création de JomiaStore', description: 'Lancement de la plateforme avec 50 vendeurs partenaires' },
  { year: '2021', title: 'Expansion régionale', description: 'Extension à 5 villes du Bénin et 10,000 produits' },
  { year: '2022', title: 'Innovation technologique', description: 'Lancement de l\'app mobile et IA de recommandation' },
  { year: '2023', title: 'Leadership marché', description: 'N°1 du e-commerce au Bénin avec 500K clients' },
  { year: '2024', title: 'Vision internationale', description: 'Expansion prévue en Afrique de l\'Ouest' }
];

export const revalidate = 300;

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-jomiastore-background">
      <Header />
      <CategoryMenu />
      
      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-jomiastore-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">À propos</span>
        </nav>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="bg-jomiastore-primary/10 text-jomiastore-primary mb-4">
            À propos de JomiaStore
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            L'avenir du shopping
            <span className="block text-jomiastore-primary">au Bénin</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            JomiaStore Hub révolutionne l'expérience e-commerce en Afrique de l'Ouest en tant que 
            centre commercial digital qui connecte les meilleurs vendeurs avec des millions de clients.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="text-center p-6 hover-lift">
                <CardContent className="space-y-4">
                  <div className="w-16 h-16 bg-jomiastore-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <IconComponent className="w-8 h-8 text-jomiastore-primary" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-jomiastore-primary mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <Card className="p-8">
            <CardContent className="space-y-6">
              <div className="w-16 h-16 bg-jomiastore-secondary/10 rounded-full flex items-center justify-center">
                <Target className="w-8 h-8 text-jomiastore-secondary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Notre Mission</h2>
                <p className="text-gray-600 leading-relaxed">
                  Démocratiser l'accès au commerce électronique en Afrique de l'Ouest en créant 
                  une plateforme inclusive, sécurisée et innovante qui permet à chacun de vendre 
                  et d'acheter facilement, tout en stimulant l'économie locale.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="p-8">
            <CardContent className="space-y-6">
              <div className="w-16 h-16 bg-jomiastore-accent/10 rounded-full flex items-center justify-center">
                <Globe className="w-8 h-8 text-jomiastore-accent" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Notre Vision</h2>
                <p className="text-gray-600 leading-relaxed">
                  Devenir le centre commercial digital de référence en Afrique de l'Ouest, 
                  reconnue pour son excellence, son innovation et son impact positif sur 
                  le développement économique et social de la région.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos Valeurs</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Les principes qui guident chacune de nos actions et décisions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="text-center p-6 hover-lift">
                  <CardContent className="space-y-4">
                    <div className="w-16 h-16 bg-jomiastore-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <IconComponent className="w-8 h-8 text-jomiastore-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">{value.title}</h3>
                      <p className="text-sm text-gray-600">{value.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Notre Histoire</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Un parcours d'innovation et de croissance continue
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 h-full w-0.5 bg-jomiastore-primary/20"></div>
            
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right md:pr-8' : 'md:text-left md:pl-8'}`}>
                    <Card className="p-6 hover-lift">
                      <CardContent>
                        <Badge className="bg-jomiastore-primary text-white mb-3">
                          {milestone.year}
                        </Badge>
                        <h3 className="font-bold text-gray-900 mb-2">{milestone.title}</h3>
                        <p className="text-gray-600">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="relative z-10 w-8 h-8 bg-jomiastore-primary rounded-full flex items-center justify-center mx-4">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  
                  <div className="flex-1 hidden md:block"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Notre Équipe</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Des experts passionnés qui travaillent chaque jour pour votre satisfaction
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center p-6 hover-lift">
                <CardContent className="space-y-4">
                  <div className="w-24 h-24 mx-auto rounded-full overflow-hidden relative">
                    <Image
                      src={member.image}
                      alt={`Photo de ${member.name}`}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-jomiastore-primary font-medium mb-3">{member.role}</p>
                    <p className="text-sm text-gray-600">{member.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-jomiastore-primary to-blue-600 rounded-xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Rejoignez l'aventure JomiaStore Hub
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Que vous soyez client ou vendeur, découvrez une nouvelle façon de faire du commerce en ligne
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/vendor/register">
              <Button className="bg-white text-jomiastore-primary hover:bg-gray-100 font-bold py-4 px-8 rounded-lg">
                Devenir vendeur
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button className="border-2 border-white hover:bg-white hover:text-jomiastore-primary font-bold py-4 px-8 rounded-lg transition-colors">
                Nous contacter
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}