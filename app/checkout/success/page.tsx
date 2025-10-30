'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Page de redirection - Le fournisseur redirige maintenant vers /checkout/callback
 * Cette page redirige automatiquement pour compatibilité
 */
export default function CheckoutSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers la nouvelle page de callback
    router.replace('/checkout/callback' + window.location.search);
  }, [router]);

  return (
    <div className="min-h-screen bg-jomionstore-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-jomionstore-primary animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Redirection...</p>
      </div>
    </div>
  );
}


