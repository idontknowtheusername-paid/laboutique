'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Clock, MapPin, Truck, Package, CheckCircle, AlertCircle } from 'lucide-react';

interface TrackingEvent {
  id: string;
  status: string;
  timestamp: Date;
  location?: string;
  description: string;
  estimatedDelivery?: Date;
}

interface OrderTrackingProps {
  orderId: string;
  currentStatus: string;
}

export default function OrderTracking({ orderId, currentStatus }: OrderTrackingProps) {
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLocation, setNewLocation] = useState('');

  useEffect(() => {
    loadTrackingEvents();
  }, [orderId]);

  const loadTrackingEvents = async () => {
    setLoading(true);
    try {
      // Simuler des événements de suivi
      const mockEvents: TrackingEvent[] = [
        {
          id: '1',
          status: 'pending',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 jours
          description: 'Commande reçue et en cours de traitement',
          location: 'Cotonou, Bénin'
        },
        {
          id: '2',
          status: 'processing',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 jour
          description: 'Commande en préparation',
          location: 'Entrepôt principal'
        },
        {
          id: '3',
          status: 'shipped',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 heures
          description: 'Commande expédiée',
          location: 'Centre de distribution',
          estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        }
      ];

      setTrackingEvents(mockEvents);
    } catch (error) {
      console.error('Erreur lors du chargement du suivi:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTrackingEvent = async () => {
    if (!newLocation.trim()) return;

    const newEvent: TrackingEvent = {
      id: Date.now().toString(),
      status: currentStatus,
      timestamp: new Date(),
      location: newLocation.trim(),
      description: `Mise à jour: ${newLocation}`,
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    };

    setTrackingEvents(prev => [newEvent, ...prev]);
    setNewLocation('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <Package className="w-5 h-5 text-orange-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-indigo-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Suivi de la commande</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jomionstore-primary"></div>
            <span className="ml-2">Chargement du suivi...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Suivi de la commande
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ajouter un événement de suivi */}
        <div className="flex gap-2">
          <Input
            placeholder="Ajouter une localisation..."
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTrackingEvent()}
          />
          <Button 
            onClick={addTrackingEvent}
            disabled={!newLocation.trim()}
          >
            Ajouter
          </Button>
        </div>

        {/* Timeline des événements */}
        <div className="space-y-4">
          {trackingEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Truck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun événement de suivi</p>
            </div>
          ) : (
            <div className="relative">
              {/* Ligne verticale */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              {trackingEvents.map((event, index) => (
                <div key={event.id} className="relative flex items-start gap-4 pb-6">
                  {/* Icône */}
                  <div className="relative z-10 flex-shrink-0 w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center">
                    {getStatusIcon(event.status)}
                  </div>
                  
                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {event.timestamp.toLocaleString('fr-FR')}
                      </span>
                    </div>
                    
                    <p className="font-medium text-gray-900 mb-1">
                      {event.description}
                    </p>
                    
                    {event.location && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    
                    {event.estimatedDelivery && (
                      <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Livraison estimée:</strong> {event.estimatedDelivery.toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statut actuel */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {getStatusIcon(currentStatus)}
            <span className="font-medium">Statut actuel:</span>
            <Badge className={getStatusColor(currentStatus)}>
              {currentStatus}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}