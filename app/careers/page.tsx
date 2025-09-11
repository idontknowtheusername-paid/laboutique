'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Clock, 
  ArrowRight, 
  Search,
  Users,
  Zap,
  Heart,
  Trophy,
  Globe,
  Coffee,
  BookOpen,
  DollarSign,
  Calendar,
  Filter
} from 'lucide-react';
import Link from 'next/link';

const jobOpenings = [
  {
    id: 1,
    title: 'Senior Frontend Engineer',
    team: 'Engineering',
    location: 'Cotonou (hybride)',
    type: 'Temps plein',
    experience: '3-5 ans',
    salary: 'Compétitif',
    description: 'Développez des interfaces utilisateur exceptionnelles avec React, Next.js et TypeScript.',
    requirements: ['React/Next.js', 'TypeScript', 'Tailwind CSS', 'Git'],
    posted: '2024-01-15',
    urgent: true
  },
  {
    id: 2,
    title: 'Product Designer',
    team: 'Produit',
    location: 'Cotonou (hybride)',
    type: 'Temps plein',
    experience: '2-4 ans',
    salary: 'Compétitif',
    description: 'Concevez des expériences utilisateur intuitives et engageantes pour nos millions d\'utilisateurs.',
    requirements: ['Figma', 'Design System', 'UX Research', 'Prototyping'],
    posted: '2024-01-12',
    urgent: false
  },
  {
    id: 3,
    title: 'Growth Marketer',
    team: 'Marketing',
    location: 'Remote Afrique Ouest',
    type: 'Temps plein',
    experience: '2-3 ans',
    salary: 'Compétitif',
    description: 'Développez et exécutez des stratégies de croissance pour conquérir de nouveaux marchés.',
    requirements: ['Digital Marketing', 'Analytics', 'Social Media', 'Content Creation'],
    posted: '2024-01-10',
    urgent: false
  },
  {
    id: 4,
    title: 'Data Analyst',
    team: 'Data',
    location: 'Cotonou',
    type: 'Temps plein',
    experience: '1-3 ans',
    salary: 'Compétitif',
    description: 'Analysez nos données pour optimiser l\'expérience client et les performances business.',
    requirements: ['SQL', 'Python', 'Tableau', 'Statistics'],
    posted: '2024-01-08',
    urgent: false
  },
  {
    id: 5,
    title: 'Customer Success Manager',
    team: 'Support',
    location: 'Cotonou',
    type: 'Temps plein',
    experience: '2-4 ans',
    salary: 'Compétitif',
    description: 'Assurez la satisfaction et la rétention de nos clients et vendeurs partenaires.',
    requirements: ['Customer Service', 'CRM', 'French/English', 'Problem Solving'],
    posted: '2024-01-05',
    urgent: false
  },
  {
    id: 6,
    title: 'DevOps Engineer',
    team: 'Engineering',
    location: 'Cotonou (hybride)',
    type: 'Temps plein',
    experience: '3-5 ans',
    salary: 'Compétitif',
    description: 'Maintenez et optimisez notre infrastructure cloud pour assurer la scalabilité.',
    requirements: ['AWS/Azure', 'Docker', 'Kubernetes', 'CI/CD'],
    posted: '2024-01-03',
    urgent: true
  }
];

const benefits = [
  {
    icon: DollarSign,
    title: 'Salaire compétitif',
    description: 'Rémunération attractive avec bonus de performance'
  },
  {
    icon: Heart,
    title: 'Assurance santé',
    description: 'Couverture médicale complète pour vous et votre famille'
  },
  {
    icon: BookOpen,
    title: 'Formation continue',
    description: 'Budget formation et conférences pour votre développement'
  },
  {
    icon: Coffee,
    title: 'Environnement flexible',
    description: 'Télétravail et horaires flexibles selon vos besoins'
  },
  {
    icon: Trophy,
    title: 'Reconnaissance',
    description: 'Programme de reconnaissance et d\'avancement'
  },
  {
    icon: Globe,
    title: 'Impact social',
    description: 'Contribuez au développement de l\'e-commerce en Afrique'
  }
];

const teams = [
  { name: 'Tous', count: jobOpenings.length },
  { name: 'Engineering', count: 2 },
  { name: 'Produit', count: 1 },
  { name: 'Marketing', count: 1 },
  { name: 'Data', count: 1 },
  { name: 'Support', count: 1 }
];

export default function CareersPage() {
  const [selectedTeam, setSelectedTeam] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredJobs = jobOpenings.filter(job => {
    const matchesTeam = selectedTeam === 'Tous' || job.team === selectedTeam;
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.requirements.some(req => req.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTeam && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-beshop-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-beshop-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Carrières</span>
        </nav>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="bg-beshop-primary/10 text-beshop-primary mb-4 px-4 py-2">
            Nous recrutons
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Rejoignez l'aventure
            <span className="text-beshop-primary"> Be Shop</span>
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto text-xl">
            Construisons ensemble l'avenir du e-commerce en Afrique de l'Ouest. 
            Votre talent peut faire la différence pour des millions d'utilisateurs.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-beshop-primary mb-2">50+</div>
            <div className="text-sm text-gray-600">Employés</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-beshop-primary mb-2">6</div>
            <div className="text-sm text-gray-600">Équipes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-beshop-primary mb-2">3</div>
            <div className="text-sm text-gray-600">Pays</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-beshop-primary mb-2">100%</div>
            <div className="text-sm text-gray-600">Remote-friendly</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher un poste..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Team Filters */}
          <div className="flex flex-wrap gap-2">
            {teams.map((team) => (
              <Button
                key={team.name}
                variant={selectedTeam === team.name ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTeam(team.name)}
                className="flex items-center space-x-2"
              >
                <span>{team.name}</span>
                <Badge variant="secondary" className="ml-1">
                  {team.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Listings */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Postes ouverts ({filteredJobs.length})
              </h2>
            </div>

            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="hover-lift">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                          {job.urgent && (
                            <Badge className="bg-red-500 text-white">Urgent</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {job.team}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {job.location}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {job.type}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {job.experience}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-4">{job.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.requirements.map((req) => (
                            <Badge key={req} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">
                          Publié le {new Date(job.posted).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <Button className="bg-beshop-primary hover:bg-blue-700 ml-4">
                        Postuler
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun poste trouvé
                </h3>
                <p className="text-gray-600 mb-6">
                  Essayez de modifier vos critères de recherche
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTeam('Tous');
                  }}
                >
                  Voir tous les postes
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Why Join Us */}
            <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-beshop-primary" />
                  Pourquoi nous rejoindre ?
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-beshop-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">
                      <strong>Impact réel</strong> sur des millions d'utilisateurs en Afrique de l'Ouest
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-beshop-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">
                      <strong>Culture d'excellence</strong> avec des équipes passionnées et talentueuses
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-beshop-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">
                      <strong>Croissance rapide</strong> avec des opportunités d'évolution
                    </p>
                    </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-beshop-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">
                      <strong>Technologies modernes</strong> et stack technique de pointe
                    </p>
                  </div>
                </div>
            </CardContent>
          </Card>

            {/* Benefits */}
          <Card>
            <CardHeader>
                <CardTitle>Nos avantages</CardTitle>
            </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {benefits.map((benefit, index) => {
                    const IconComponent = benefit.icon;
                    return (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-beshop-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-4 h-4 text-beshop-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">{benefit.title}</h4>
                          <p className="text-xs text-gray-600">{benefit.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Pas de poste qui vous correspond ?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Envoyez-nous votre CV, nous vous contacterons dès qu'un poste correspondant s'ouvre.
                </p>
                <Button variant="outline" className="w-full">
                  Candidature spontanée
                </Button>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}




