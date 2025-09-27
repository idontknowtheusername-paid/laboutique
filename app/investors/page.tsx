'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Users, 
  Globe, 
  DollarSign, 
  BarChart3,
  FileText,
  Calendar,
  ArrowRight,
  Target,
  Zap,
  Shield,
  Award,
  Download,
  Mail,
  Phone
} from 'lucide-react';
import Link from 'next/link';

const keyMetrics = [
  {
    title: 'Chiffre d\'affaires',
    value: '2.5M€',
    growth: '+150%',
    period: '2024 vs 2023',
    icon: DollarSign
  },
  {
    title: 'Utilisateurs actifs',
    value: '500K+',
    growth: '+200%',
    period: 'Croissance annuelle',
    icon: Users
  },
  {
    title: 'Marché adressable',
    value: '50M€',
    growth: 'TAM',
    period: 'Afrique de l\'Ouest',
    icon: Globe
  },
  {
    title: 'Vendeurs actifs',
    value: '15K+',
    growth: '+300%',
    period: 'Sur la plateforme',
    icon: Target
  }
];

const milestones = [
  {
    date: '2024',
    title: 'Série A - 5M€',
    description: 'Expansion régionale et développement produit',
    status: 'completed'
  },
  {
    date: '2023',
    title: 'Seed - 1.5M€',
    description: 'Lancement au Bénin et validation produit',
    status: 'completed'
  },
  {
    date: '2022',
    title: 'Pre-seed - 500K€',
    description: 'MVP et premiers utilisateurs',
    status: 'completed'
  },
  {
    date: '2025',
    title: 'Série B - 15M€',
    description: 'Expansion panafricaine et nouvelles verticales',
    status: 'planned'
  }
];

const investors = [
  {
    name: 'Orange Ventures',
    type: 'Corporate VC',
    logo: 'O',
    description: 'Investisseur stratégique avec expertise télécoms'
  },
  {
    name: 'Partech Africa',
    type: 'VC Fund',
    logo: 'P',
    description: 'Fonds spécialisé dans les startups africaines'
  },
  {
    name: 'TLcom Capital',
    type: 'VC Fund',
    logo: 'T',
    description: 'Investisseur de croissance en Afrique'
  },
  {
    name: 'Business Angels',
    type: 'Angel Investors',
    logo: 'BA',
    description: 'Entrepreneurs et dirigeants expérimentés'
  }
];

const documents = [
  {
    title: 'Pitch Deck 2024',
    type: 'PDF',
    size: '2.4 MB',
    description: 'Présentation complète de JomiaStore'
  },
  {
    title: 'Business Plan',
    type: 'PDF',
    size: '1.8 MB',
    description: 'Plan d\'affaires détaillé 2024-2027'
  },
  {
    title: 'Financial Model',
    type: 'Excel',
    size: '3.2 MB',
    description: 'Modèle financier et projections'
  },
  {
    title: 'Market Research',
    type: 'PDF',
    size: '4.1 MB',
    description: 'Étude de marché Afrique de l\'Ouest'
  }
];

export default function InvestorsPage() {
  const [selectedTab, setSelectedTab] = useState('overview');

  return (
    <div className="min-h-screen bg-jomiastore-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-jomiastore-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Investisseurs</span>
        </nav>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="bg-jomiastore-primary/10 text-jomiastore-primary mb-4 px-4 py-2">
            Investisseurs
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Investissez dans l'avenir du
            <span className="text-jomiastore-primary"> e-commerce africain</span>
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto text-xl">
            Rejoignez-nous pour révolutionner le commerce en ligne en Afrique de l'Ouest. 
            Une opportunité unique de croissance et d'impact social.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {keyMetrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-jomiastore-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-6 h-6 text-jomiastore-primary" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</div>
                  <div className="text-sm text-gray-600 mb-1">{metric.title}</div>
                  <div className="flex items-center justify-center space-x-2">
                    <Badge className="bg-green-100 text-green-700">
                      {metric.growth}
                    </Badge>
                    <span className="text-xs text-gray-500">{metric.period}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="metrics">Métriques</TabsTrigger>
            <TabsTrigger value="investors">Investisseurs</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Company Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-jomiastore-primary" />
                    Notre Vision
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    Devenir la plateforme e-commerce de référence en Afrique de l'Ouest, 
                    en connectant des millions de consommateurs et de vendeurs dans un écosystème 
                    digital florissant.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-jomiastore-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700">
                        <strong>Marché en croissance :</strong> L'e-commerce en Afrique de l'Ouest croît de 25% par an
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-jomiastore-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700">
                        <strong>Premier arrivant :</strong> Position de leader sur un marché fragmenté
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-jomiastore-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700">
                        <strong>Impact social :</strong> Création d'emplois et inclusion financière
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2 text-jomiastore-primary" />
                    Opportunité d'Investissement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Série B - 15M€</h4>
                      <p className="text-sm text-gray-700">
                        Levée de fonds pour accélérer notre expansion panafricaine
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Utilisation des fonds :</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Expansion géographique</span>
                          <span className="font-medium">40%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Développement produit</span>
                          <span className="font-medium">30%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Marketing & Acquisition</span>
                          <span className="font-medium">20%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Opérations & Recrutement</span>
                          <span className="font-medium">10%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Milestones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-jomiastore-primary" />
                  Historique de Financement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        milestone.status === 'completed' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {milestone.status === 'completed' ? (
                          <Award className="w-6 h-6" />
                        ) : (
                          <Calendar className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{milestone.title}</h4>
                          <Badge variant={milestone.status === 'completed' ? 'default' : 'outline'}>
                            {milestone.status === 'completed' ? 'Terminé' : 'Prévu'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{milestone.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{milestone.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-jomiastore-primary" />
                    Croissance Utilisateurs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-gradient-to-r from-jomiastore-primary to-blue-600 text-white rounded-lg">
                      <div className="text-3xl font-bold mb-2">500K+</div>
                      <div className="text-blue-100">Utilisateurs actifs mensuels</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">+200%</div>
                        <div className="text-sm text-gray-600">Croissance annuelle</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">85%</div>
                        <div className="text-sm text-gray-600">Rétention mensuelle</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-jomiastore-primary" />
                    Performance Financière
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg">
                      <div className="text-3xl font-bold mb-2">2.5M€</div>
                      <div className="text-green-100">Chiffre d'affaires 2024</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">+150%</div>
                        <div className="text-sm text-gray-600">Croissance CA</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">15%</div>
                        <div className="text-sm text-gray-600">Marge brute</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="investors" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Nos Investisseurs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {investors.map((investor, index) => (
                    <div key={index} className="p-6 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-jomiastore-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">{investor.logo}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{investor.name}</h4>
                          <p className="text-sm text-gray-600">{investor.type}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{investor.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-jomiastore-primary" />
                  Documents d'Investissement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map((doc, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{doc.title}</h4>
                        <Badge variant="outline">{doc.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{doc.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{doc.size}</span>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Télécharger
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Contact CTA */}
        <Card className="mt-16 bg-gradient-to-r from-jomiastore-primary to-blue-600 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              Intéressé par cette opportunité ?
            </h3>
            <p className="text-blue-100 mb-6">
              Contactez notre équipe pour discuter de cette opportunité d'investissement
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-white text-jomiastore-primary hover:bg-gray-100">
                <Mail className="w-4 h-4 mr-2" />
                Contactez-nous
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-jomiastore-primary">
                <Phone className="w-4 h-4 mr-2" />
                Planifier un appel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}