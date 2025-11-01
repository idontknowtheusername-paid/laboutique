'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, Smartphone, ArrowLeft } from 'lucide-react';

export default function LygosCheckoutPageSimple() {
    const params = useParams();
    const router = useRouter();
    const [message, setMessage] = useState('Initialisation du paiement...');

    const gatewayId = params.gateway_id as string;

    useEffect(() => {
        console.log('[Lygos Simple] 🚀 Gateway ID:', gatewayId);

        if (!gatewayId) {
            setMessage('ID de passerelle manquant');
            return;
        }

        // Simuler un délai puis afficher les options
        const timer = setTimeout(() => {
            setMessage('Choisissez votre méthode de paiement');
        }, 2000);

        return () => clearTimeout(timer);
    }, [gatewayId]);

    const handleLygosRedirect = () => {
        // Redirection manuelle vers Lygos
        const lygosUrl = `https://checkout.lygosapp.com/${gatewayId}`;
        console.log('[Lygos Simple] 🔗 Redirection vers:', lygosUrl);
        window.location.href = lygosUrl;
    };

    const handleBackToStore = () => {
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        Paiement Lygos
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                    <p className="text-gray-600">{message}</p>

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

                    <div className="space-y-3">
                        <Button
                            onClick={handleLygosRedirect}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            Continuer vers Lygos
                        </Button>

                        <Button
                            onClick={handleBackToStore}
                            variant="outline"
                            className="w-full"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Retour à la boutique
                        </Button>
                    </div>

                    <p className="text-xs text-gray-400">
                        Passerelle: {gatewayId}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}