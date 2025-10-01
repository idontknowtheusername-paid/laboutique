'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Calendar, 
  User, 
  ArrowRight, 
  TrendingUp,
  BookOpen,
  Lightbulb,
  Users
} from 'lucide-react';
import Link from 'next/link';

const blogPosts = [
  {
    id: 1,
    title: 'Tendances e-commerce 2025 au Bénin',
    excerpt: "Découvrez les tendances clés qui façonneront l'e-commerce au Bénin en 2025. Mobile-first, paiements digitaux et logistique locale.",
    content: 'Contenu complet de l\'article...',
    author: 'Équipe JomionStore',
    date: '2024-01-15',
    readTime: '5 min',
    category: 'Insights',
    categoryColor: 'bg-blue-500',
    image: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=800',
    featured: true,
    tags: ['E-commerce', 'Tendances', 'Bénin']
  },
  {
    id: 2,
    title: 'Guide complet : Choisir son smartphone en 2025',
    excerpt: 'Critères essentiels, comparatifs et conseils d\'experts pour faire le bon choix selon votre budget et vos besoins.',
    content: 'Contenu complet de l\'article...',
    author: 'Jean-Baptiste K.',
    date: '2024-01-12',
    readTime: '8 min',
    category: 'Guides',
    categoryColor: 'bg-green-500',
    image: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=800',
    featured: false,
    tags: ['Smartphone', 'Guide', 'Technologie']
  },
  {
    id: 3,
    title: 'JomionStore x Vendeurs : Meilleures pratiques 2025',
    excerpt: 'Optimisez vos ventes avec nos recommandations éprouvées. Photos, descriptions, prix et service client.',
    content: 'Contenu complet de l\'article...',
    author: 'Marie S.',
    date: '2024-01-10',
    readTime: '6 min',
    category: 'Vendeurs',
    categoryColor: 'bg-orange-500',
    image: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=800',
    featured: false,
    tags: ['Vente', 'Optimisation', 'Business']
  },
  {
    id: 4,
    title: 'Paiements digitaux au Bénin : État des lieux',
    excerpt: 'Mobile Money, cartes bancaires, crypto... Découvrez l\'évolution des moyens de paiement au Bénin.',
    content: 'Contenu complet de l\'article...',
    author: 'Koffi A.',
    date: '2024-01-08',
    readTime: '7 min',
    category: 'Finance',
    categoryColor: 'bg-purple-500',
    image: 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=800',
    featured: false,
    tags: ['Paiement', 'Digital', 'Finance']
  },
  {
    id: 5,
    title: 'Livraison express : Comment ça marche ?',
    excerpt: 'Découvrez notre réseau de livraison et les secrets d\'une logistique efficace au Bénin.',
    content: 'Contenu complet de l\'article...',
    author: 'Équipe JomionStore',
    date: '2024-01-05',
    readTime: '4 min',
    category: 'Logistique',
    categoryColor: 'bg-red-500',
    image: 'https://images.pexels.com/photos/4393021/pexels-photo-4393021.jpeg?auto=compress&cs=tinysrgb&w=800',
    featured: false,
    tags: ['Livraison', 'Logistique', 'Service']
  },
  {
    id: 6,
    title: 'Sécurité en ligne : Protégez vos achats',
    excerpt: 'Conseils pratiques pour acheter en toute sécurité sur JomionStore et éviter les arnaques.',
    content: 'Contenu complet de l\'article...',
    author: 'Équipe Sécurité',
    date: '2024-01-03',
    readTime: '5 min',
    category: 'Sécurité',
    categoryColor: 'bg-yellow-500',
    image: 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=800',
    featured: false,
    tags: ['Sécurité', 'Conseils', 'Protection']
  }
];

const categories = [
  { name: 'Tous', count: blogPosts.length, icon: BookOpen },
  { name: 'Insights', count: 1, icon: TrendingUp },
  { name: 'Guides', count: 1, icon: BookOpen },
  { name: 'Vendeurs', count: 1, icon: Users },
  { name: 'Finance', count: 1, icon: TrendingUp },
  { name: 'Logistique', count: 1, icon: TrendingUp },
  { name: 'Sécurité', count: 1, icon: Lightbulb }
];

// Component to handle client-side date formatting
function DateDisplay({ dateString }: { dateString: string }) {
  const [formattedDate, setFormattedDate] = useState(dateString);

  useEffect(() => {
    setFormattedDate(new Date(dateString).toLocaleDateString('fr-FR'));
  }, [dateString]);

  return <span>{formattedDate}</span>;
}

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'Tous' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-jomionstore-background">
        <div className="container py-8">
          <div className="text-center py-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-jomionstore-background">
      {/* Temporarily removed Header and CategoryMenu to test hydration */}
      {/* <Header />
      <CategoryMenu /> */}

      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-jomionstore-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Blog</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="bg-jomionstore-primary/10 text-jomionstore-primary mb-4 px-4 py-2">
            Actus & Guides
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Le blog JomionStore
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Articles, tutoriels et tendances pour mieux acheter et vendre au Bénin
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher un article..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.name}
                  variant={selectedCategory === category.name ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.name)}
                  className="flex items-center space-x-2"
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{category.name}</span>
                  <Badge variant="secondary" className="ml-1">
                    {category.count}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Featured Post */}
        {featuredPost && selectedCategory === 'Tous' && !searchQuery && (
          <Card className="mb-12 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div className="relative h-64 lg:h-auto">
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <Badge className={`absolute top-4 left-4 ${featuredPost.categoryColor} text-white`}>
                  {featuredPost.category}
                </Badge>
              </div>
              <CardContent className="p-8 flex flex-col justify-center">
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{featuredPost.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <DateDisplay dateString={featuredPost.date} />
                  </div>
                  <span>{featuredPost.readTime}</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {featuredPost.title}
                </h2>
                <p className="text-gray-600 mb-6">
                  {featuredPost.excerpt}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {featuredPost.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button className="bg-jomionstore-primary hover:bg-blue-700 w-fit">
                  Lire l'article
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </div>
          </Card>
        )}

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularPosts.map((post) => (
            <Card key={post.id} className="hover-lift overflow-hidden">
              <div className="relative h-48">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
                <Badge className={`absolute top-3 left-3 ${post.categoryColor} text-white`}>
                  {post.category}
                </Badge>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 text-xs text-gray-600 mb-3">
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <DateDisplay dateString={post.date} />
                  </div>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-3 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {post.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Lire l'article
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun article trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              Essayez de modifier vos critères de recherche
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Tous');
              }}
            >
              Voir tous les articles
            </Button>
          </div>
        )}

        {/* Newsletter CTA */}
        <Card className="mt-12 bg-gradient-to-r from-jomionstore-primary to-blue-600 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              Restez informé de nos derniers articles
            </h3>
            <p className="text-blue-100 mb-6">
              Recevez nos meilleurs conseils et tendances directement dans votre boîte mail
            </p>
            <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-3">
              <Input
                placeholder="Votre adresse email"
                className="flex-1 bg-white text-gray-900"
              />
              <Button className="bg-jomionstore-secondary hover:bg-orange-600">
                S'abonner
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* <Footer /> */}
    </div>
  );
}




