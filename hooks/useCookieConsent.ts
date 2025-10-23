'use client';

import { useState, useEffect } from 'react';

export type CookieConsent = {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
};

export type CookieConsentStatus = 'pending' | 'accepted' | 'rejected' | 'customized';

const DEFAULT_CONSENT: CookieConsent = {
  essential: true, // Toujours true (obligatoire)
  functional: false,
  analytics: false,
  marketing: false,
  timestamp: Date.now()
};

const STORAGE_KEY = 'jomionstore_cookie_consent';

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent>(DEFAULT_CONSENT);
  const [status, setStatus] = useState<CookieConsentStatus>('pending');
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger les préférences au montage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedConsent = JSON.parse(stored);
        setConsent(parsedConsent);
        setStatus('accepted'); // Si stocké, c'est qu'on a déjà donné son accord
      }
    } catch (error) {
      console.warn('Erreur lors du chargement des préférences cookies:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sauvegarder les préférences
  const saveConsent = (newConsent: Partial<CookieConsent>) => {
    const updatedConsent: CookieConsent = {
      ...consent,
      ...newConsent,
      essential: true, // Toujours true
      timestamp: Date.now()
    };
    
    setConsent(updatedConsent);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConsent));
      setStatus('accepted');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des préférences cookies:', error);
    }
  };

  // Accepter tous les cookies
  const acceptAll = () => {
    saveConsent({
      essential: true,
      functional: true,
      analytics: true,
      marketing: true
    });
  };

  // Refuser tous les cookies non essentiels
  const rejectAll = () => {
    saveConsent({
      essential: true,
      functional: false,
      analytics: false,
      marketing: false
    });
  };

  // Personnaliser les préférences
  const customize = (preferences: Partial<CookieConsent>) => {
    saveConsent(preferences);
  };

  // Réinitialiser les préférences
  const reset = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setConsent(DEFAULT_CONSENT);
      setStatus('pending');
    } catch (error) {
      console.error('Erreur lors de la réinitialisation des préférences cookies:', error);
    }
  };

  // Vérifier si un type de cookie est accepté
  const hasConsent = (type: keyof Omit<CookieConsent, 'timestamp'>) => {
    return consent[type];
  };

  // Vérifier si on a déjà donné son consentement
  const hasGivenConsent = status !== 'pending';

  return {
    consent,
    status,
    isLoaded,
    acceptAll,
    rejectAll,
    customize,
    reset,
    hasConsent,
    hasGivenConsent
  };
}