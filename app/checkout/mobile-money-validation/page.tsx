'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Smartphone, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function MobileMoneyValidationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [status, setStatus] = useState<'checking' | 'success' | 'failed' | 'pending'>('checking');
  const [message, setMessage] = useState('Vérification du paiement en cours...');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [transref, setTransref] = useState<string | null>(null);
  const [checkCount, setCheckCount] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  const MAX_AUTO_CHECKS = 20; // 20 vérifications = ~2 minutes
  const CHECK_INTERVAL = 6000; // Vérifier toutes les 6 secondes

  const verifyPayment = useCallback(async (isManual = false) => {
    try {
      setIsChecking(true);
      
      const urlTransref = searchParams.get('transref');
      const urlOrderId = searchParams.get('order_id');

      if (!urlTransref) {
        setStatus('failed');
        setMessage('Référence de transaction manquante');
        return;
      }

      setTransref(urlTransref);
      setOrderId(urlOrderId);

      if (!isManual) {
        console.log(`[MM Validation] Vérification automatique #${checkCount + 1}:`, urlTransref);
      } else {
        console.log('[MM Validation] Vérification manuelle:', urlTransref);
      }

      const response = await fetch('/api/payment/verify-mobile-money', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transref: urlTransref,
          order_id: urlOrderId
        })
      });

      const data = await response.json();

      console.log('[MM Validation] Réponse:', data);

      if (!response.ok) {
        if (!isManual && checkCount < MAX_AUTO_CHECKS) {
          // Continuer les vérifications auto en cas d'erreur
          setCheckCount(prev => prev + 1);
          return;
        }
        throw new Error(data.error || 'Erreur lors de la vérification');
      }

      if (data.is_successful) {
        setStatus('success');
        setMessage(data.message || 'Paiement réussi ! Votre commande a été confirmée.');
      } else if (data.is_failed) {
        setStatus('failed');
        setMessage(data.message || 'Le paiement a échoué.');
      } else if (data.is_pending) {
        setStatus('pending');
        setMessage(data.message || 'Paiement en attente. Vérifiez votre téléphone.');
        
        // Continuer les vérifications automatiques
        if (!isManual && checkCount < MAX_AUTO_CHECKS) {
          setCheckCount(prev => prev + 1);
        }
      } else {
        setStatus('pending');
        setMessage('Vérification en cours...');
        
        if (!isManual && checkCount < MAX_AUTO_CHECKS) {
          setCheckCount(prev => prev + 1);
        }
      }

    } catch (error: any) {
      console.error('[MM Validation] Erreur:', error);
      
      if (!isManual && checkCount < MAX_AUTO_CHECKS) {
        setMessage('Vérification en cours...');
        setCheckCount(prev => prev + 1);
      } else {
        setStatus('failed');
        setMessage(error.message || 'Une erreur est survenue');
      }
    } finally {
      setIsChecking(false);
    }
  }, [searchParams, checkCount]);

  // Vérification initiale
  useEffect(() => {
    verifyPayment(false);
  }, [verifyPayment]);

  // Vérifications automatiques périodiques
  useEffect(() => {
    if (status === 'pending' && checkCount < MAX_AUTO_CHECKS) {
      const timer = setTimeout(() => {
        verifyPayment(false);
      }, CHECK_INTERVAL);

      return () => clearTimeout(timer);
    }
  }, [status, checkCount, verifyPayment]);

  const handleManualCheck = () => {
    verifyPayment(true);
  };

  return (
    <div className="min-h-screen bg-jomionstore-background flex items-center justify-center p-4">
      <div className="container max-w-lg">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {status === 'checking' && 'Vérification en cours...'}
              {status === 'success' && '✅ Paiement réussi !'}
              {status === 'failed' && '❌ Paiement échoué'}
              {status === 'pending' && '⏳ En attente de validation'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Icône de statut */}
            <div className="flex justify-center">
              {status === 'checking' && (
                <Loader2 className="w-16 h-16 text-orange-500 animate-spin" />
              )}
              {status === 'success' && (
                <CheckCircle className="w-16 h-16 text-green-500" />
              )}
              {status === 'failed' && (
                <XCircle className="w-16 h-16 text-red-500" />
              )}
              {status === 'pending' && (
                <Smartphone className="w-16 h-16 text-orange-500 animate-pulse" />
              )}
            </div>

            {/* Message */}
            <div className="text-center">
              <p className="text-gray-700 text-lg mb-2">{message}</p>
              
              {status === 'pending' && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Vérifiez votre téléphone et validez le paiement.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Vérification automatique... ({checkCount + 1}/{MAX_AUTO_CHECKS})</span>
                  </div>
                </div>
              )}
            </div>

            {/* Référence de transaction */}
            {transref && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Référence de transaction :</p>
                <p className="text-sm font-mono font-semibold text-gray-900 break-all">{transref}</p>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex flex-col gap-3">
              {status === 'pending' && (
                <Button 
                  onClick={handleManualCheck}
                  disabled={isChecking}
                  variant="outline"
                  className="w-full"
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Vérification...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Vérifier maintenant
                    </>
                  )}
                </Button>
              )}

              {status === 'success' && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href={orderId ? `/account/orders/${orderId}` : '/account/orders'} className="flex-1">
                    <Button className="w-full bg-jomionstore-primary hover:bg-orange-700">
                      Voir ma commande
                    </Button>
                  </Link>
                  <Link href="/" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Continuer mes achats
                    </Button>
                  </Link>
                </div>
              )}

              {status === 'failed' && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/checkout" className="flex-1">
                    <Button className="w-full bg-jomionstore-primary hover:bg-orange-700">
                      Réessayer
                    </Button>
                  </Link>
                  <Link href="/cart" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Retour au panier
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Instructions pour Mobile Money */}
            {status === 'pending' && (
              <div className="border-t pt-4 space-y-2">
                <h4 className="font-semibold text-sm text-gray-900">Instructions :</h4>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Vous allez recevoir une notification sur votre téléphone</li>
                  <li>Saisissez votre code PIN Mobile Money</li>
                  <li>Validez le paiement</li>
                  <li>Attendez la confirmation (automatique)</li>
                </ol>
              </div>
            )}

            {/* Aide */}
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 text-center">
                Besoin d'aide ?{' '}
                <Link href="/contact" className="text-jomionstore-primary hover:underline">
                  Contactez-nous
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
