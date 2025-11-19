// Script d'enregistrement du Service Worker avec force update
(function() {
  'use strict';

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      // Désinscrire tous les anciens SW d'abord
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        const unregisterPromises = registrations.map(reg => {
          console.log('[SW Register] Unregistering old SW:', reg.scope);
          return reg.unregister();
        });

        // Après avoir désinscrit les anciens, enregistrer le nouveau
        Promise.all(unregisterPromises).then(function() {
          console.log('[SW Register] All old SWs unregistered, registering new one...');
          
          navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none' // Ne jamais utiliser le cache HTTP pour le SW
          })
          .then(function(registration) {
            console.log('[SW Register] Service Worker registered successfully:', registration.scope);
            
            // Forcer la vérification de mise à jour immédiatement
            registration.update();
            
            // Vérifier les mises à jour toutes les 60 secondes
            setInterval(function() {
              registration.update();
            }, 60000);

            // Gérer les mises à jour
            registration.addEventListener('updatefound', function() {
              const newWorker = registration.installing;
              console.log('[SW Register] New Service Worker found!');
              
              newWorker.addEventListener('statechange', function() {
                console.log('[SW Register] New SW state:', newWorker.state);
                
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[SW Register] New SW installed, prompting user to update...');
                  // Le composant ServiceWorkerUpdater gérera l'affichage
                }
              });
            });
          })
          .catch(function(error) {
            console.error('[SW Register] Service Worker registration failed:', error);
          });
        });
      }).catch(function(error) {
        console.error('[SW Register] Error getting registrations:', error);
        
        // En cas d'erreur, essayer quand même d'enregistrer le nouveau SW
        navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none'
        }).catch(function(err) {
          console.error('[SW Register] Fallback registration failed:', err);
        });
      });
    });

    // Nettoyer tous les caches au chargement (force refresh)
    if ('caches' in window) {
      caches.keys().then(function(names) {
        // Supprimer les anciens caches (v1.x, v2.x)
        names.forEach(function(name) {
          if (name.startsWith('jomionstore-') && !name.includes('v3.0.0')) {
            console.log('[SW Register] Deleting old cache:', name);
            caches.delete(name);
          }
        });
      });
    }
  }
})();
