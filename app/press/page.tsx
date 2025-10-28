'use client';

import { useState } from 'react';
import NextImage from 'next/image';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Newspaper, 
  Calendar, 
  ExternalLink, 
  Search,
  Download,
  Mail,
  Phone,
  User,
  Globe,
  FileText,
  Image as ImageIcon,
  Video,
  Quote
} from 'lucide-react';
import Link from 'next/link';

const pressReleases = [
  {
    id: 1,
    title: 'JomionStore lève 5M€ en Série A pour accélérer son expansion en Afrique de l\'Ouest',
    date: '2024-01-15',
    category: 'Financement',
    summary: 'La plateforme e-commerce béninoise annonce une levée de fonds majeure pour conquérir de nouveaux marchés.',
    content: 'Contenu complet du communiqué...',
    featured: true
  },
  {
    id: 2,
    title: 'JomionStore dépasse 500 000 utilisateurs actifs au Bénin',
    date: '2024-01-10',
    category: 'Croissance',
    summary: 'La plateforme enregistre une croissance exceptionnelle avec plus de 500K utilisateurs actifs mensuels.',
    content: 'Contenu complet du communiqué...',
    featured: false
  },
  {
    id: 3,
    title: 'Partenariat stratégique avec Orange Money pour les paiements digitaux',
    date: '2024-01-05',
    category: 'Partenariat',
    summary: 'JomionStore s\'associe à Orange Money pour faciliter les transactions sur sa plateforme.',
    content: 'Contenu complet du communiqué...',
    featured: false
  },
  {
    id: 4,
    title: 'Lancement de la livraison express à Cotonou',
    date: '2023-12-20',
    category: 'Service',
    summary: 'JomionStore révolutionne la logistique avec des livraisons en moins de 2 heures à Cotonou.',
    content: 'Contenu complet du communiqué...',
    featured: false
  }
];

const mediaCoverage = [
  {
    id: 1,
    title: 'JomionStore : La success story du e-commerce au Bénin',
    outlet: 'Jeune Afrique',
    date: '2024-01-12',
    type: 'Article',
    url: '#',
    summary: 'Portrait de la startup qui révolutionne le commerce en ligne en Afrique de l\'Ouest.'
  },
  {
    id: 2,
    title: 'Interview CEO : L\'avenir du e-commerce africain',
    outlet: 'RFI Afrique',
    date: '2024-01-08',
    type: 'Interview',
    url: '#',
    summary: 'Entretien exclusif avec le fondateur de JomionStore sur les défis du e-commerce en Afrique.'
  },
  {
    id: 3,
    title: 'JomionStore dans le top 10 des startups africaines à suivre',
    outlet: 'TechCrunch',
    date: '2024-01-03',
    type: 'Article',
    url: '#',
    summary: 'La plateforme béninoise figure parmi les startups les plus prometteuses du continent.'
  },
  {
    id: 4,
    title: 'Reportage : Comment JomionStore transforme le commerce au Bénin',
    outlet: 'France 24',
    date: '2023-12-15',
    type: 'Reportage',
    url: '#',
    summary: 'Reportage vidéo sur l\'impact de JomionStore sur l\'économie locale.'
  }
];

const teamMembers = [
  {
    name: 'Jean-Baptiste K.',
    role: 'CEO & Co-fondateur',
    bio: 'Ancien consultant McKinsey, expert en stratégie digitale et e-commerce.',
    email: 'jean-baptiste@jomionstore.com',
    phone: '+229 97 12 34 56',
    photo: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=200'
  },
  {
    name: 'Marie S.',
    role: 'CTO & Co-fondatrice',
    bio: 'Ingénieure logiciel avec 10 ans d\'expérience dans les fintechs africaines.',
    email: 'marie@jomionstore.com',
    phone: '+229 97 12 34 57',
    photo: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200'
  },
  {
    name: 'Koffi A.',
    role: 'CMO',
    bio: 'Spécialiste du marketing digital et de la croissance en Afrique.',
    email: 'koffi@jomionstore.com',
    phone: '+229 97 12 34 58',
    photo: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=200'
  }
];

const pressAssets = [
  {
    title: 'Logo JomionStore',
    type: 'Logo',
    format: 'PNG, SVG',
    description: 'Logo principal en différentes tailles et formats'
  },
  {
    title: 'Photos équipe',
    type: 'Photos',
    format: 'JPG',
    description: 'Photos haute résolution de l\'équipe dirigeante'
  },
  {
    title: 'Screenshots app',
    type: 'Images',
    format: 'PNG',
    description: 'Captures d\'écran de l\'application mobile et web'
  },
  {
    title: 'Vidéos démo',
    type: 'Vidéo',
    format: 'MP4',
    description: 'Vidéos de démonstration de la plateforme'
  }
];

const companyFacts = [
  {
    title: 'Fondation',
    value: '2022',
    description: 'Création de JomionStore'
  },
  {
    title: 'Siège social',
    value: 'Cotonou',
    description: 'Bénin'
  },
  {
    title: 'Employés',
    value: '50+',
    description: 'Équipe en croissance'
  },
  {
    title: 'Marchés',
    value: '3',
    description: 'Bénin, Togo, Côte d\'Ivoire'
  }
];

export default function PressPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('releases');

  const filteredReleases = pressReleases.filter(release =>
    release.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    release.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCoverage = mediaCoverage.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-jomionstore-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-jomionstore-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Presse</span>
        </nav>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="bg-jomionstore-primary/10 text-jomionstore-primary mb-4 px-4 py-2">
            Centre Presse
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Centre de
            <span className="text-jomionstore-primary"> Presse</span>
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto text-xl">
            Découvrez les dernières actualités de JomionStore, téléchargez nos ressources presse 
            et contactez notre équipe pour vos demandes médiatiques.
          </p>
        </div>

        {/* Company Facts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {companyFacts.map((fact, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-jomionstore-primary mb-2">{fact.value}</div>
                <div className="text-sm text-gray-600 mb-1">{fact.title}</div>
                <div className="text-xs text-gray-500">{fact.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher dans les actualités..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="releases">Communiqués</TabsTrigger>
            <TabsTrigger value="coverage">Couverture Média</TabsTrigger>
            <TabsTrigger value="team">Équipe</TabsTrigger>
            <TabsTrigger value="assets">Ressources</TabsTrigger>
          </TabsList>

          <TabsContent value="releases" className="space-y-6">
            {/* Featured Release */}
            {filteredReleases.find(r => r.featured) && (
              <Card className="border-2 border-jomionstore-primary">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className="bg-jomionstore-primary text-white">À la une</Badge>
                        <Badge variant="outline">
                          {filteredReleases.find(r => r.featured)?.category}
                        </Badge>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {filteredReleases.find(r => r.featured)?.title}
                      </h3>
                      <p className="text-gray-700 mb-4">
                        {filteredReleases.find(r => r.featured)?.summary}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(filteredReleases.find(r => r.featured)?.date || '').toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Button className="bg-jomionstore-primary hover:bg-orange-700">
                      Lire le communiqué
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Other Releases */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredReleases.filter(r => !r.featured).map((release) => (
                <Card key={release.id} className="hover-lift">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <Badge variant="outline">{release.category}</Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(release.date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-3 line-clamp-2">
                      {release.title}
                    </h3>
                    <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                      {release.summary}
                    </p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        Lire
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-3 h-3 mr-1" />
                        PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="coverage" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCoverage.map((article) => (
                <Card key={article.id} className="hover-lift">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <Badge variant="outline">{article.type}</Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(article.date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{article.outlet}</p>
                    <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                      {article.summary}
                    </p>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Lire l'article
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {teamMembers.map((member, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="w-24 h-24 rounded-full mx-auto mb-4 relative overflow-hidden">
                      <NextImage
                        src={member.photo}
                        alt={`Photo de ${member.name}`}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-sm text-jomionstore-primary mb-3">{member.role}</p>
                    <p className="text-sm text-gray-700 mb-4">{member.bio}</p>
                    <div className="space-y-2">
                      <Button size="sm" variant="outline" className="w-full">
                        <Mail className="w-3 h-3 mr-1" />
                        {member.email}
                      </Button>
                      <Button size="sm" variant="outline" className="w-full">
                        <Phone className="w-3 h-3 mr-1" />
                        {member.phone}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="assets" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pressAssets.map((asset, index) => (
                <Card key={index} className="hover-lift">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-jomionstore-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        {asset.type === 'Logo' && <FileText className="w-6 h-6 text-jomionstore-primary" />}
                        {asset.type === 'Photos' && <ImageIcon className="w-6 h-6 text-jomionstore-primary" />}
                        {asset.type === 'Images' && <ImageIcon className="w-6 h-6 text-jomionstore-primary" />}
                        {asset.type === 'Vidéo' && <Video className="w-6 h-6 text-jomionstore-primary" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{asset.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{asset.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">{asset.format}</Badge>
                          <Button size="sm" variant="outline">
                            <Download className="w-3 h-3 mr-1" />
                            Télécharger
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Contact Press */}
        <Card className="mt-16 bg-gradient-to-r from-jomionstore-primary to-orange-600 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              Contact Presse
            </h3>
            <p className="text-orange-100 mb-6">
              Pour toute demande d'interview, d'information ou de ressources presse
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-white text-jomionstore-primary hover:bg-gray-100">
                <Mail className="w-4 h-4 mr-2" />
                presse@jomionstore.com
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-jomionstore-primary">
                <Phone className="w-4 h-4 mr-2" />
                +229 97 12 34 56
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}