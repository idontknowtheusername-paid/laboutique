'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, X } from 'lucide-react';

export default function ServiceWorkerUpdater() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Vérifier et forcer la mise à jour du SW
    const checkForUpdates = async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        
        if (reg) {
          setRegistration(reg);
          
          // Forcer la vérification de mise à jour
          await reg.update();
          
          // Écouter les nouvelles installations
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Nouveau SW disponible
                  setShowUpdate(true);
                }
              });
            }
          });

          // Si un SW est en attente, afficher la notification
          if (reg.waiting) {
            setShowUpdate(true);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du SW:', error);
      }
    };

    checkForUpdates();

    // Vérifier toutes les 30 secondes
    const interval = setInterval(checkForUpdates, 30000);

    // Écouter les messages du SW
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.action === 'cacheCleared') {
        window.location.reload();
      }
    });

    return () => clearInterval(interval);
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      // Dire au SW en attente de prendre le contrôle
      registration.waiting.postMessage({ action: 'skipWaiting' });
      
      // Recharger la page quand le nouveau SW prend le contrôle
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    } else {
      // Forcer le rechargement et vider le cache
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        }).then(() => {
          window.location.reload();
        });
      } else {
        window.location.reload();
      }
    }
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-bottom-5">
      <Alert className="bg-white shadow-lg border-2 border-jomionstore-primary">
        <RefreshCw className="h-4 w-4 text-jomionstore-primary" />
        <AlertDescription className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="font-semibold text-gray-900 mb-1">Mise à jour disponible</p>
            <p className="text-sm text-gray-600">
              Une nouvelle version de JomionStore est disponible. Actualisez pour profiter des dernières améliorations.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleUpdate}
              className="bg-jomionstore-primary hover:bg-orange-700"
            >
              Actualiser
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowUpdate(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
