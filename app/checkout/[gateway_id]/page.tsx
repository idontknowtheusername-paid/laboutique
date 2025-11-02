'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, Smartphone, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface CheckoutPageProps {
  params: {
    gateway_id: string;
  };
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const { gateway_id } = params;
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simuler le chargement du widget Lygos
    const timer = setTimeout(() => {
      setLoading(false);
      
      // Si c'est un gateway de développement, afficher un message
      if (gateway_id.startsWith('dev-')) {
        setError('Gateway de développement - Paiement simulé');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [gateway_id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              Initialisation du paiement
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">Chargement du système de paiement Lygos...</p>
            
            <div className="flex justify-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CreditCard className="w-4 h-4" />
                Carte bancaire
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Smartphone className="w-4 h-4" />
                Mobile Money
              </div>
            </div>

            <div id="lygos-payment-container" className="mt-6 min-h-[300px] border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-gray-400 text-sm">Chargement du widget de paiement...</div>
            </div>

            <p className="text-xs text-gray-400">Passerelle: {gateway_id}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-orange-600">Mode Développement</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">{error}</p>
            <p className="text-sm text-gray-500">
              Gateway ID: <code className="bg-gray-100 px-2 py-1 rounded">{gateway_id}</code>
            </p>
            {orderId && (
              <p className="text-sm text-gray-500">
                Order ID: <code className="bg-gray-100 px-2 py-1 rounded">{orderId}</code>
              </p>
            )}
            
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour à l'accueil
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle>Paiement Lygos</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">Widget de paiement Lygos chargé</p>
          
          <div id="lygos-payment-widget" className="min-h-[400px] border border-gray-200 rounded-lg">
            {/* Le widget Lygos sera injecté ici */}
          </div>

          <p className="text-xs text-gray-400">Passerelle: {gateway_id}</p>
        </CardContent>
      </Card>
    </div>
  );
}