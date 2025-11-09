'use client';

import Link from 'next/link';
import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-jomionstore-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <WifiOff className="w-24 h-24 mx-auto text-gray-400 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Vous êtes hors ligne
          </h1>
          <p className="text-gray-600">
            Vérifiez votre connexion internet et réessayez
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => window.location.reload()}
            className="w-full bg-jomionstore-primary hover:bg-orange-700"
          >
            Réessayer
          </Button>
          
          <Link href="/">
            <Button variant="outline" className="w-full">
              Retour à l'accueil
            </Button>
          </Link>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 Astuce: Certaines pages que vous avez visitées sont disponibles hors ligne
          </p>
        </div>
      </div>
    </div>
  );
}
