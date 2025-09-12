'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                const { data, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('Error during auth callback:', error);
                    router.push('/auth/login?error=callback_error');
                    return;
                }

                if (data.session) {
                    // Rediriger vers la page d'accueil ou la page demandée
                    const redirectTo = new URLSearchParams(window.location.search).get('redirect_to') || '/';
                    router.push(redirectTo);
                } else {
                    router.push('/auth/login');
                }
            } catch (error) {
                console.error('Unexpected error during auth callback:', error);
                router.push('/auth/login?error=unexpected_error');
            }
        };

        handleAuthCallback();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Connexion en cours...</p>
            </div>
        </div>
    );
}