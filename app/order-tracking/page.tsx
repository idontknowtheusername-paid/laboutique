'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin,
  Search,
  Info,
  AlertCircle,
  Phone,
  Mail,
  ArrowRight,
  Box,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

export default function OrderTrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<{
    orderId: string;
    orderNumber: string;
    trackingNumber: string;
    status: string;
    currentStep: number;
    orderDate: string;
    estimatedDelivery: string;
    deliveryDate?: string;
    address: string;
    totalAmount: number;
    trackingEvents: Array<{
      id: number;
      status: string;
      label: string;
      description: string;
      timestamp: string;
      location: string;
    }>;
    customerName: string;
  } | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState('');

  const trackByNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingNumber) {
      setError('Veuillez entrer un code de suivi');
      return;
    }

    setIsTracking(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`/api/orders/track?tracking=${encodeURIComponent(trackingNumber)}`);
      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'Commande non trouvée');
      }
    } catch (error) {
      console.error('Erreur suivi:', error);
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsTracking(false);
    }
  };

  const trackByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderNumber || !email) {
      setError('Veuillez entrer le numéro de commande et l\'email');
      return;
    }

    setIsTracking(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`/api/orders/track?order=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`);
      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'Commande non trouvée');
      }
    } catch (error) {
      console.error('Erreur suivi:', error);
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsTracking(false);
    }
  };

  const getStatusDetails = (status: string) => {
    const statuses: Record<string, { label: string; color: string; icon: JSX.Element }> = {
      confirmed: { label: 'Confirmée', color: 'bg-blue-600', icon: <CheckCircle className="w-5 h-5" /> },
      preparing: { label: 'En préparation', color: 'bg-yellow-600', icon: <Box className="w-5 h-5" /> },
      shipped: { label: 'Expédiée', color: 'bg-purple-600', icon: <Package className="w-5 h-5" /> },
      en_transit: { label: 'En transit', color: 'bg-orange-600', icon: <Truck className="w-5 h-5" /> },
      delivered: { label: 'Livrée', color: 'bg-green-600', icon: <CheckCircle className="w-5 h-5" /> }
    };
    return statuses[status] || statuses.confirmed;
  };

  const steps = [
    { id: 1, label: 'Confirmée', icon: CheckCircle },
    { id: 2, label: 'Préparation', icon: Box },
    { id: 3, label: 'Expédiée', icon: Package },
    { id: 4, label: 'En transit', icon: Truck },
    { id: 5, label: 'Livrée', icon: MapPin }
  ];

  return (
    <div className="min-h-screen bg-jomionstore-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-jomionstore-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Suivi de commande</span>
        </nav>

        <div className="mb-6">
          <Badge className="bg-jomionstore-primary mb-3">Tracking en temps réel</Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Suivre ma commande</h1>
          <p className="text-gray-600 text-lg">
            Suivez votre colis en temps réel depuis la préparation jusqu'à la livraison.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-jomionstore-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-6 h-6 text-jomionstore-primary" />
                  Rechercher votre commande
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="tracking" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="tracking">Code de suivi</TabsTrigger>
                    <TabsTrigger value="order">N° de commande + Email</TabsTrigger>
                  </TabsList>

                  <TabsContent value="tracking">
                    <form onSubmit={trackByNumber} className="space-y-4">
                      <Alert className="border-blue-200 bg-blue-50">
                        <Info className="w-4 h-4 text-blue-600" />
                        <AlertDescription>
                          <strong>📦 Code de suivi :</strong> Vous avez reçu ce code par email après l'expédition de votre commande (ex: TRK123456789).
                        </AlertDescription>
                      </Alert>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Code de suivi <span className="text-red-600">*</span>
                        </label>
                        <div className="flex gap-2">
                          <Input 
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            placeholder="Ex: TRK123456789" 
                            required 
                            className="flex-1"
                          />
                          <Button type="submit" size="lg" disabled={isTracking}>
                            <Search className="w-5 h-5 mr-2" />
                            {isTracking ? 'Recherche...' : 'Suivre'}
                          </Button>
                        </div>
                      </div>
                    </form>
                  </TabsContent>

                  <TabsContent value="order">
                    <form onSubmit={trackByEmail} className="space-y-4">
                      <Alert className="border-orange-200 bg-orange-50">
                        <Info className="w-4 h-4 text-orange-600" />
                        <AlertDescription>
                          <strong>📧 N° de commande :</strong> Trouvez-le dans l'email de confirmation de votre achat (ex: CMD123456789).
                        </AlertDescription>
                      </Alert>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Numéro de commande <span className="text-red-600">*</span>
                        </label>
                        <Input 
                          value={orderNumber}
                          onChange={(e) => setOrderNumber(e.target.value)}
                          placeholder="Ex: CMD123456789" 
                          required 
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email de commande <span className="text-red-600">*</span>
                        </label>
                        <div className="flex gap-2">
                          <Input 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            placeholder="votre@email.com" 
                            required 
                            className="flex-1"
                          />
                          <Button type="submit" size="lg" disabled={isTracking}>
                            <Search className="w-5 h-5 mr-2" />
                            {isTracking ? 'Recherche...' : 'Suivre'}
                          </Button>
                        </div>
                      </div>
                    </form>
                  </TabsContent>
                </Tabs>
                
                {/* Messages d'erreur */}
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">Erreur</span>
                    </div>
                    <p className="text-red-600 mt-1">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Résultat du suivi */}
            {result && (
              <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-green-100">
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-6 h-6 text-green-700" />
                        Statut de votre commande
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Commande: <strong>{result.orderNumber}</strong> | 
                        Suivi: <strong>{result.trackingNumber}</strong>
                      </p>
                    </div>
                    <Badge className={`${getStatusDetails(result.status).color} text-white text-base px-4 py-2`}>
                      {getStatusDetails(result.status).icon}
                      <span className="ml-2">{getStatusDetails(result.status).label}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Informations clés */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <p className="text-xs text-gray-600">Date de commande</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{result.orderDate}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <p className="text-xs text-gray-600">Livraison estimée</p>
                      </div>
                      <p className="text-lg font-bold text-green-700">{result.estimatedDelivery}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-gray-600" />
                        <p className="text-xs text-gray-600">Destination</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{result.address}</p>
                    </div>
                  </div>

                  {/* Timeline visuelle */}
                  <div className="bg-white p-6 rounded-lg border">
                    <h4 className="font-semibold mb-6">Étapes de livraison</h4>
                    <div className="relative">
                      {/* Ligne de progression */}
                      <div className="absolute top-5 left-0 w-full h-1 bg-gray-200">
                        <div 
                          className="h-full bg-green-600 transition-all duration-500"
                          style={{ width: `${((result.currentStep - 1) / (steps.length - 1)) * 100}%` }}
                        ></div>
                      </div>

                      {/* Étapes */}
                      <div className="relative flex justify-between">
                        {steps.map((step, index) => {
                          const isCompleted = step.id <= result.currentStep;
                          const isCurrent = step.id === result.currentStep;
                          const Icon = step.icon;

                          return (
                            <div key={step.id} className="flex flex-col items-center">
                              <div 
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white ${
                                  isCompleted ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                                } ${isCurrent ? 'ring-4 ring-green-200 scale-110' : ''} transition-all duration-300`}
                              >
                                <Icon className="w-5 h-5" />
                              </div>
                              <p className={`text-xs mt-2 text-center ${isCompleted ? 'font-semibold text-gray-900' : 'text-gray-500'} hidden md:block`}>
                                {step.label}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Mobile labels */}
                    <div className="md:hidden mt-4">
                      <p className="text-sm text-center">
                        <strong>Étape actuelle :</strong> {steps.find(s => s.id === result.currentStep)?.label}
                      </p>
                    </div>
                  </div>

                  {/* Historique détaillé */}
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-semibold mb-3">📍 Historique de suivi</h4>
                    <div className="space-y-3">
                      {result.trackingEvents
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        .map((event, index) => {
                          const eventDate = new Date(event.timestamp);
                          const isLast = index === result.trackingEvents.length - 1;
                          
                          return (
                            <div key={event.id} className={`flex gap-3 ${!isLast ? 'pb-3 border-b' : ''}`}>
                              <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-1.5 ${
                                event.status === 'delivered' ? 'bg-green-600' :
                                event.status === 'in_transit' ? 'bg-orange-600' :
                                event.status === 'shipped' ? 'bg-purple-600' :
                                event.status === 'processing' ? 'bg-yellow-600' :
                                'bg-blue-600'
                              }`}></div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold">{event.label}</p>
                                <p className="text-xs text-gray-600">{event.description}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {eventDate.toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  })}, {eventDate.toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                                {event.location && (
                                  <p className="text-xs text-gray-500">📍 {event.location}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <AlertDescription>
                      <strong>✅ Tout va bien !</strong> Votre commande suit son cours normal. Vous recevrez un SMS et un email dès que le livreur sera en route.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {/* Exemple de codes */}
            {!result && (
              <Card>
                <CardHeader>
                  <CardTitle>💡 Exemples de codes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded border">
                    <p className="text-sm font-semibold mb-1">Code de suivi (Tracking)</p>
                    <p className="text-xs text-gray-600 font-mono">TRK123456789, TRACK987654321</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border">
                    <p className="text-sm font-semibold mb-1">Numéro de commande</p>
                    <p className="text-xs text-gray-600 font-mono">CMD123456789, ORD987654321</p>
                  </div>
                  <p className="text-xs text-gray-600">
                    💬 <strong>Vous ne trouvez pas votre code ?</strong> Vérifiez vos emails (y compris spam) ou{' '}
                    <Link href="/contact" className="text-jomionstore-primary hover:underline font-semibold">contactez-nous</Link>.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statuts possibles */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📊 Statuts possibles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="font-semibold">Confirmée</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                  <span className="font-semibold">En préparation</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                  <span className="font-semibold">Expédiée</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                  <span className="font-semibold">En transit</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="font-semibold">Livrée</span>
                </div>
              </CardContent>
            </Card>

            {/* Délais moyens */}
            <Card className="border-green-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="w-5 h-5 text-green-600" />
                  Délais moyens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-green-50 p-3 rounded border border-green-200">
                  <p className="font-semibold text-green-900 mb-1">Cotonou</p>
                  <p className="text-2xl font-bold text-green-700">24-48h</p>
                </div>
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <p className="font-semibold text-blue-900 mb-1">Autres villes</p>
                  <p className="text-2xl font-bold text-blue-700">2-4 jours</p>
                </div>
                <p className="text-xs text-gray-600">
                  ⏱️ Délais indicatifs hors week-end et jours fériés
                </p>
              </CardContent>
            </Card>

            {/* Problème ? */}
            <Card className="border-red-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Problème de livraison ?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-700">
                  Votre colis est en retard ou bloqué ?
                </p>
                <div className="bg-white p-3 rounded-lg border space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-jomionstore-primary" />
                    <a href="tel:+2290164354089" className="text-jomionstore-primary hover:underline font-semibold">
                      +229 01 64 35 40 89
                    </a>
                  </div>
                  <p className="text-xs text-gray-600">Support livraison</p>
                </div>
                <div className="bg-white p-3 rounded-lg border space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-jomionstore-primary" />
                    <a href="mailto:contact@jomionstore.com" className="text-jomionstore-primary hover:underline font-semibold text-sm">
                      contact@jomionstore.com
                    </a>
                  </div>
                  <p className="text-xs text-gray-600">Réponse sous 2h</p>
                </div>
              </CardContent>
            </Card>

            {/* Liens utiles */}
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300">
              <CardHeader>
                <CardTitle className="text-lg">📚 Liens utiles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/shipping-returns" className="flex items-center gap-2 text-sm text-jomionstore-primary hover:underline font-semibold">
                  <ArrowRight className="w-4 h-4" />
                  Politique de livraison
                </Link>
                <Link href="/claims" className="flex items-center gap-2 text-sm text-jomionstore-primary hover:underline font-semibold">
                  <ArrowRight className="w-4 h-4" />
                  Déposer une réclamation
                </Link>
                <Link href="/faq" className="flex items-center gap-2 text-sm text-jomionstore-primary hover:underline font-semibold">
                  <ArrowRight className="w-4 h-4" />
                  Questions fréquentes
                </Link>
                <Link href="/contact" className="flex items-center gap-2 text-sm text-jomionstore-primary hover:underline font-semibold">
                  <ArrowRight className="w-4 h-4" />
                  Nous contacter
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
