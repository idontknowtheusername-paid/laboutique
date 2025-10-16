'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading');
  const [message, setMessage] = useState('Vérification du paiement en cours...');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [transref, setTransref] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Récupérer les paramètres de l'URL
        const urlTransref = searchParams.get('transref');
        const urlOrderId = searchParams.get('order_id');
        const urlStatus = searchParams.get('status');

        if (!urlTransref) {
          setStatus('failed');
          setMessage('Référence de transaction manquante');
          return;
        }

        setTransref(urlTransref);
        setOrderId(urlOrderId);

        console.log('[Callback] Paramètres reçus:', { urlTransref, urlOrderId, urlStatus });

        // Vérifier le statut côté serveur (sécurisé)
        const response = await fetch('/api/qosic/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transref: urlTransref,
            order_id: urlOrderId
          })
        });

        const data = await response.json();

        console.log('[Callback] Réponse vérification:', data);

        if (!response.ok) {
          throw new Error(data.error || 'Erreur lors de la vérification');
        }

        // Mettre à jour l'état selon le résultat
        if (data.is_successful) {
          setStatus('success');
          setMessage('Paiement réussi ! Votre commande a été confirmée.');
        } else if (data.is_failed) {
          setStatus('failed');
          setMessage(data.message || 'Le paiement a échoué. Veuillez réessayer.');
        } else if (data.is_pending) {
          setStatus('pending');
          setMessage('Paiement en cours de traitement. Vous recevrez une confirmation par email.');
        } else {
          setStatus('failed');
          setMessage('Statut de paiement inconnu');
        }

      } catch (error: any) {
        console.error('[Callback] Erreur:', error);
        setStatus('failed');
        setMessage(error.message || 'Une erreur est survenue lors de la vérification du paiement');
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-jomionstore-background flex items-center justify-center p-4">
      <div className="container max-w-lg">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {status === 'loading' && 'Vérification...'}
              {status === 'success' && 'Paiement réussi !'}
              {status === 'failed' && 'Paiement échoué'}
              {status === 'pending' && 'Paiement en attente'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Icône de statut */}
            <div className="flex justify-center">
              {status === 'loading' && (
                <Loader2 className="w-16 h-16 text-orange-500 animate-spin" />
              )}
              {status === 'success' && (
                <CheckCircle className="w-16 h-16 text-green-500" />
              )}
              {status === 'failed' && (
                <XCircle className="w-16 h-16 text-red-500" />
              )}
              {status === 'pending' && (
                <AlertCircle className="w-16 h-16 text-orange-500" />
              )}
            </div>

            {/* Message */}
            <p className="text-center text-gray-700 text-lg">
              {message}
            </p>

            {/* Référence de transaction */}
            {transref && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Référence de transaction :</p>
                <p className="text-sm font-mono font-semibold text-gray-900">{transref}</p>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {status === 'success' && (
                <>
                  <Link href={orderId ? `/account/orders/${orderId}` : '/account/orders'}>
                    <Button className="w-full sm:w-auto bg-jomionstore-primary hover:bg-orange-700">
                      Voir ma commande
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" className="w-full sm:w-auto">
                      Continuer mes achats
                    </Button>
                  </Link>
                </>
              )}

              {status === 'failed' && (
                <>
                  <Link href="/checkout">
                    <Button className="w-full sm:w-auto bg-jomionstore-primary hover:bg-orange-700">
                      Réessayer
                    </Button>
                  </Link>
                  <Link href="/cart">
                    <Button variant="outline" className="w-full sm:w-auto">
                      Retour au panier
                    </Button>
                  </Link>
                </>
              )}

              {status === 'pending' && (
                <>
                  <Link href="/account/orders">
                    <Button className="w-full sm:w-auto bg-jomionstore-primary hover:bg-orange-700">
                      Mes commandes
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" className="w-full sm:w-auto">
                      Accueil
                    </Button>
                  </Link>
                </>
              )}

              {status === 'loading' && (
                <p className="text-sm text-gray-500 text-center">
                  Veuillez patienter...
                </p>
              )}
            </div>

            {/* Aide */}
            {(status === 'failed' || status === 'pending') && (
              <div className="border-t pt-4 mt-4">
                <p className="text-sm text-gray-600 text-center">
                  Besoin d'aide ?{' '}
                  <Link href="/contact" className="text-jomionstore-primary hover:underline">
                    Contactez-nous
                  </Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
