'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Eye, 
  RotateCcw, 
  Star, 
  Truck, 
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

const orders = [
  {
    id: '#ORD-12345',
    date: '2024-01-15',
    total: 850000,
    status: 'Livré',
    statusColor: 'bg-green-500',
    items: [
      {
        name: 'iPhone 15 Pro Max 256GB',
        image: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=100',
        quantity: 1,
        price: 850000
      }
    ],
    tracking: {
      current: 'Livré',
      steps: [
        { status: 'Commandé', date: '15 Jan', completed: true },
        { status: 'Confirmé', date: '15 Jan', completed: true },
        { status: 'Expédié', date: '16 Jan', completed: true },
        { status: 'En transit', date: '17 Jan', completed: true },
        { status: 'Livré', date: '18 Jan', completed: true }
      ]
    }
  },
  {
    id: '#ORD-12344',
    date: '2024-01-10',
    total: 140000,
    status: 'Expédié',
    statusColor: 'bg-blue-500',
    items: [
      {
        name: 'AirPods Pro 2ème génération',
        image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=100',
        quantity: 1,
        price: 140000
      }
    ],
    tracking: {
      current: 'En transit',
      steps: [
        { status: 'Commandé', date: '10 Jan', completed: true },
        { status: 'Confirmé', date: '10 Jan', completed: true },
        { status: 'Expédié', date: '11 Jan', completed: true },
        { status: 'En transit', date: '12 Jan', completed: true },
        { status: 'Livré', date: '', completed: false }
      ]
    }
  },
  {
    id: '#ORD-12343',
    date: '2024-01-05',
    total: 320000,
    status: 'Annulé',
    statusColor: 'bg-red-500',
    items: [
      {
        name: 'MacBook Air M3 13"',
        image: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=100',
        quantity: 1,
        price: 320000
      }
    ],
    tracking: {
      current: 'Annulé',
      steps: [
        { status: 'Commandé', date: '05 Jan', completed: true },
        { status: 'Confirmé', date: '05 Jan', completed: true },
        { status: 'Annulé', date: '06 Jan', completed: true }
      ]
    }
  }
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-BJ', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(price);
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Livré':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'Expédié':
      return <Truck className="w-5 h-5 text-blue-500" />;
    case 'En cours':
      return <Clock className="w-5 h-5 text-yellow-500" />;
    case 'Annulé':
      return <XCircle className="w-5 h-5 text-red-500" />;
    default:
      return <Package className="w-5 h-5 text-gray-500" />;
  }
};

export default function AccountOrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-beshop-background">
      <Header />
      <CategoryMenu />
      
      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-beshop-primary">Accueil</Link>
          <span>/</span>
          <Link href="/account" className="hover:text-beshop-primary">Mon compte</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Mes commandes</span>
        </nav>

        <div className="flex items-center space-x-4 mb-8">
          <Link href="/account">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au compte
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Mes commandes</h1>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Toutes ({orders.length})</TabsTrigger>
            <TabsTrigger value="delivered">Livrées (1)</TabsTrigger>
            <TabsTrigger value="shipped">Expédiées (1)</TabsTrigger>
            <TabsTrigger value="cancelled">Annulées (1)</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                  <div>
                          <CardTitle className="text-lg">{order.id}</CardTitle>
                          <p className="text-sm text-gray-600">Commandé le {order.date}</p>
                        </div>
                      </div>
                  </div>
                  <div className="text-right">
                      <div className="text-lg font-semibold">{formatPrice(order.total)}</div>
                      <Badge className={`${order.statusColor} text-white`}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{formatPrice(item.price)}</div>
                  </div>
                </div>
              ))}
                    </div>

                    {/* Order Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex space-x-3">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Voir les détails
                        </Button>
                        {order.status === 'Livré' && (
                          <>
                            <Button variant="outline" size="sm">
                              <Star className="w-4 h-4 mr-2" />
                              Noter
                            </Button>
                            <Button variant="outline" size="sm">
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Retourner
                            </Button>
                          </>
                        )}
                        {order.status === 'Expédié' && (
                          <Button variant="outline" size="sm">
                            <Truck className="w-4 h-4 mr-2" />
                            Suivre
                          </Button>
                        )}
                      </div>
                      <Button className="bg-beshop-primary hover:bg-blue-700">
                        Commander à nouveau
                      </Button>
                    </div>
                  </div>
            </CardContent>
          </Card>
            ))}
          </TabsContent>

          <TabsContent value="delivered">
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Commandes livrées
              </h3>
              <p className="text-gray-600">
                Vous avez 1 commande livrée
              </p>
            </div>
          </TabsContent>

          <TabsContent value="shipped">
            <div className="text-center py-12">
              <Truck className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Commandes expédiées
              </h3>
              <p className="text-gray-600">
                Vous avez 1 commande en cours de livraison
              </p>
            </div>
          </TabsContent>

          <TabsContent value="cancelled">
            <div className="text-center py-12">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Commandes annulées
              </h3>
              <p className="text-gray-600">
                Vous avez 1 commande annulée
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Continue Shopping */}
        <div className="text-center mt-12">
          <Link href="/">
            <Button variant="outline" size="lg">
              Continuer mes achats
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}


