'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, Smartphone, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

export default function LygosCheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
    const [error, setError] = useState<string | null>(null);
    const [paymentData, setPaymentData] = useState<any>(null);

    const gatewayId = params.gateway_id as string;
    const orderId = searchParams.get('order_id');

    useEffect(() => {
        if (!gatewayId) {
            setError('ID de passerelle manquant');
            setLoading(false);
            return;
        }

        // Vérifier le statut du paiement auprès de Lygos
        const checkPaymentStatus = async () => {
            try {
                const response = await fetch('/api/payment/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        gateway_id: gatewayId,
                        order_id: orderId
                    })
                });

                const result = await response.json();

                if (result.success) {
                    setPaymentData(result);

                    if (result.is_successful) {
                        setPaymentStatus('success');
                    } else if (result.is_failed) {
                        setPaymentStatus('failed');
                    } else {
                        // Paiement encore en cours, continuer à vérifier
                        setTimeout(checkPaymentStatus, 3000);
                        return;
                    }
                } else {
                    // Si pas encore de statut, intégrer le widget Lygos
                    await initializeLygosWidget();
                }
            } catch (err) {
                console.error('Erreur vérification paiement:', err);
                await initializeLygosWidget();
            } finally {
                setLoading(false);
            }
        };

        checkPaymentStatus();
    }, [gatewayId, orderId]);

    const initializeLygosWidget = async () => {
        try {
            // Intégrer le widget Lygos ici
            // Pour l'instant, rediriger vers l'URL de paiement Lygos réelle
            const lygosPaymentUrl = `https://pay.lygosapp.com/gateway/${gatewayId}`;

            // Créer un iframe ou rediriger directement
            window.location.href = lygosPaymentUrl;

        } catch (err) {
            console.error('Erreur initialisation widget Lygos:', err);
            setError('Impossible de charger le système de paiement');
            setLoading(false);
        }
    };

    const handleReturnToStore = () => {
        router.push('/');
    };

    const handleViewOrder = () => {
        if (orderId) {
            router.push(`/account/orders/${orderId}`);
        } else {
            router.push('/account/orders');
        }
    };

    const handleRetryPayment = () => {
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="flex items-center justify-center gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                            Initialisation du paiement
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-gray-600">
                            Redirection vers la plateforme de paiement Lygos...
                        </p>
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
                        <p className="text-xs text-gray-400">
                            Passerelle: {gatewayId}
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="flex items-center justify-center gap-2 text-red-600">
                            <XCircle className="w-6 h-6" />
                            Erreur de paiement
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-gray-600">{error}</p>
                        <div className="space-y-2">
                            <Button onClick={handleRetryPayment} className="w-full">
                                Réessayer le paiement
                            </Button>
                            <Button onClick={handleReturnToStore} variant="outline" className="w-full">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Retour à la boutique
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (paymentStatus === 'success') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="flex items-center justify-center gap-2 text-green-600">
                            <CheckCircle className="w-6 h-6" />
                            Paiement réussi !
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-gray-600">
                            Votre paiement a été traité avec succès. Vous recevrez un email de confirmation sous peu.
                        </p>
                        {paymentData?.amount && (
                            <div className="bg-green-50 p-3 rounded-lg">
                                <p className="text-sm text-green-800">
                                    Montant payé : {new Intl.NumberFormat('fr-BJ', {
                                        style: 'currency',
                                        currency: 'XOF'
                                    }).format(paymentData.amount)}
                                </p>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Button onClick={handleViewOrder} className="w-full">
                                Voir ma commande
                            </Button>
                            <Button onClick={handleReturnToStore} variant="outline" className="w-full">
                                Continuer mes achats
                            </Button>
                        </div>
                        <p className="text-xs text-gray-400">
                            Référence: {gatewayId}
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (paymentStatus === 'failed') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="flex items-center justify-center gap-2 text-red-600">
                            <XCircle className="w-6 h-6" />
                            Paiement échoué
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-gray-600">
                            {paymentData?.message || 'Le paiement n\'a pas pu être traité. Veuillez réessayer.'}
                        </p>
                        <div className="space-y-2">
                            <Button onClick={handleRetryPayment} className="w-full">
                                Réessayer le paiement
                            </Button>
                            <Button onClick={handleReturnToStore} variant="outline" className="w-full">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Retour à la boutique
                            </Button>
                        </div>
                        <p className="text-xs text-gray-400">
                            Référence: {gatewayId}
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // État par défaut - ne devrait pas arriver
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle>Chargement...</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                </CardContent>
            </Card>
        </div>
    );
}
