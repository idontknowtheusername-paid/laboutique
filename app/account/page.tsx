'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Package, 
  Heart, 
  Settings, 
  Bell, 
  Shield, 
  CreditCard,
  MapPin,
  LogOut,
  Edit
} from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
  // Mock user data
  const user = {
    name: 'Jean-Baptiste K.',
    email: 'jean.baptiste@example.com',
    phone: '+229 97 12 34 56',
    memberSince: 'Janvier 2024',
    totalOrders: 12,
    totalSpent: 1250000,
    loyaltyPoints: 2500
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-BJ', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const menuItems = [
    {
      icon: Package,
      title: 'Mes commandes',
      description: 'Suivez vos commandes et historique',
      href: '/account/orders',
      badge: user.totalOrders
    },
    {
      icon: Heart,
      title: 'Ma liste de souhaits',
      description: 'Produits sauvegardés',
      href: '/account/wishlist',
      badge: '3'
    },
    {
      icon: CreditCard,
      title: 'Moyens de paiement',
      description: 'Gérez vos cartes et comptes',
      href: '/account/payment-methods'
    },
    {
      icon: MapPin,
      title: 'Adresses',
      description: 'Livraison et facturation',
      href: '/account/addresses'
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Préférences de communication',
      href: '/account/notifications'
    },
    {
      icon: Settings,
      title: 'Paramètres',
      description: 'Compte et confidentialité',
      href: '/account/settings'
    }
  ];

  return (
    <div className="min-h-screen bg-beshop-background">
      <Header />
      <CategoryMenu />
      
      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-beshop-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Mon compte</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-beshop-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-xl">{user.name}</CardTitle>
                <p className="text-gray-600">{user.email}</p>
                <Badge variant="outline" className="w-fit mx-auto mt-2">
                  Membre depuis {user.memberSince}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-beshop-primary">{user.totalOrders}</div>
                    <div className="text-sm text-gray-600">Commandes</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-beshop-primary">{user.loyaltyPoints}</div>
                    <div className="text-sm text-gray-600">Points fidélité</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{formatPrice(user.totalSpent)}</div>
                  <div className="text-sm text-gray-600">Total dépensé</div>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier le profil
                  </Button>
                  <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                    <LogOut className="w-4 h-4 mr-2" />
                    Se déconnecter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Menu Items */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menuItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <Link key={index} href={item.href}>
                    <Card className="hover-lift transition-all duration-200 cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-beshop-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <IconComponent className="w-6 h-6 text-beshop-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-gray-900">{item.title}</h3>
                              {item.badge && (
                                <Badge variant="secondary" className="text-xs">
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {/* Quick Actions */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-lg">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/order-tracking">
                    <Button variant="outline" className="w-full h-16 flex-col">
                      <Package className="w-5 h-5 mb-2" />
                      Suivre une commande
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline" className="w-full h-16 flex-col">
                      <Shield className="w-5 h-5 mb-2" />
                      Support client
                    </Button>
                  </Link>
                  <Link href="/help">
                    <Button variant="outline" className="w-full h-16 flex-col">
                      <Settings className="w-5 h-5 mb-2" />
                      Centre d'aide
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}


