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
    // Cette page ne devrait plus être utilisée avec la nouvelle config Lygos
    // Rediriger vers la vraie URL Lygos
    const redirectToLygos = () => {
      try {
        // Construire l'URL Lygos directement
        const lygosUrl = `https://pay.lygosapp.com/checkout/${gateway_id}`;
        console.log('[Redirect] Redirection vers Lygos:', lygosUrl);

        // Redirection immédiate
        window.location.href = lygosUrl;
      } catch (err) {
        console.error('[Redirect] Erreur:', err);
        setError('Cette page n\'est plus utilisée. Retournez au checkout.');
        setLoading(false);
      }
    };

    // Délai court pour afficher le message puis rediriger
    const timer = setTimeout(redirectToLygos, 2000);
    return () => clearTimeout(timer);
  }, [gateway_id]);

  const handlePaymentMethod = async (method: 'mobile_money' | 'card') => {
    try {
      setLoading(true);

      // Appeler notre API pour initier le paiement avec la méthode choisie
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gateway_id,
          payment_method: method
        })
      });

      const result = await response.json();

      if (result.success && result.payment_url) {
        // Rediriger vers l'URL de paiement fournie par Lygos
        window.location.href = result.payment_url;
      } else {
        setError(result.error || 'Erreur lors de l\'initialisation du paiement');
        setLoading(false);
      }
    } catch (err) {
      console.error('Erreur paiement:', err);
      setError('Erreur de connexion. Veuillez réessayer.');
      setLoading(false);
    }
  };

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
            <p className="text-gray-600">Redirection vers la plateforme sécurisée Lygos...</p>
            
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

            <div id="lygos-payment-container" className="mt-6 min-h-[600px] border border-gray-200 rounded-lg overflow-hidden">
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Chargement du widget de paiement Lygos...
              </div>
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
            <CardTitle className="text-red-600">Erreur de Paiement</CardTitle>
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
                <Link href="/checkout">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour au checkout
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Finaliser votre paiement</h1>
            <p className="text-gray-600">Choisissez votre mode de paiement sur la plateforme sécurisée Lygos</p>
          </div>

          {/* Payment Widget */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Paiement Sécurisé Lygos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div id="lygos-payment-container" className="min-h-[600px] border border-gray-200 rounded-lg overflow-hidden bg-white">
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Redirection en cours...</h3>
                  <p className="text-gray-600 mb-4">Vous allez être redirigé vers la plateforme sécurisée Lygos</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Carte bancaire
                    </div>
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      Mobile Money
                    </div>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="mt-4 text-center space-y-2">
                <p className="text-xs text-gray-500">
                  Gateway: <code className="bg-gray-100 px-2 py-1 rounded">{gateway_id}</code>
                </p>
                {orderId && (
                  <p className="text-xs text-gray-500">
                    Commande: <code className="bg-gray-100 px-2 py-1 rounded">{orderId}</code>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Back Button */}
          <div className="text-center mt-6">
            <Button asChild variant="outline">
              <Link href="/checkout">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au checkout
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}