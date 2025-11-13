'use client';

import { useState, useEffect, useCallback } from 'react';

export type PopupType = 
  | 'welcome'
  | 'flash-sale'
  | 'free-shipping'
  | 'discount'
  | 'newsletter'
  | 'gift'
  | 'exit-intent';

export type PopupPriority = 1 | 2 | 3 | 4 | 5;

interface PopupConfig {
  type: PopupType;
  priority: PopupPriority;
  delay: number; // en millisecondes
  condition: () => boolean;
  frequency: number; // en jours (0 = une seule fois)
}

interface PopupState {
  currentPopup: PopupType | null;
  hasShownPopupThisSession: boolean;
  canShowPopup: (type: PopupType) => boolean;
  requestPopup: (type: PopupType) => void;
  closePopup: () => void;
  isFirstVisit: boolean;
}

const STORAGE_KEY = 'jomionstore_popup_manager';
const SESSION_KEY = 'jomionstore_popup_session';

export function usePopupManager(): PopupState {
  const [currentPopup, setCurrentPopup] = useState<PopupType | null>(null);
  const [hasShownPopupThisSession, setHasShownPopupThisSession] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [popupQueue, setPopupQueue] = useState<PopupType[]>([]);

  // Vérifier si c'est la première visite
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasVisited = localStorage.getItem('jomionstore_has_visited');
      if (!hasVisited) {
        setIsFirstVisit(true);
        localStorage.setItem('jomionstore_has_visited', 'true');
      }

      // Vérifier si on a déjà montré un pop-up cette session
      const sessionPopup = sessionStorage.getItem(SESSION_KEY);
      if (sessionPopup) {
        setHasShownPopupThisSession(true);
      }
    }
  }, []);

  // Vérifier si un pop-up peut être affiché
  const canShowPopup = useCallback((type: PopupType): boolean => {
    if (typeof window === 'undefined') return false;

    // Règle 1 : Un seul pop-up par session (sauf Cookie Banner)
    if (hasShownPopupThisSession) return false;

    // Règle 2 : Vérifier la fréquence d'affichage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        const lastShown = data[type];
        
        if (lastShown) {
          const lastDate = new Date(lastShown);
          const now = new Date();
          const daysSince = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          
          // Fréquences par type
          const frequencies: Record<PopupType, number> = {
            'welcome': 0, // Une seule fois
            'flash-sale': 1, // 1 jour
            'free-shipping': 0, // Par session
            'discount': 7, // 7 jours
            'newsletter': 14, // 14 jours
            'gift': 7, // 7 jours
            'exit-intent': 3, // 3 jours
          };
          
          if (daysSince < frequencies[type]) {
            return false;
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du pop-up:', error);
    }

    return true;
  }, [hasShownPopupThisSession]);

  // Demander l'affichage d'un pop-up
  const requestPopup = useCallback((type: PopupType) => {
    if (!canShowPopup(type)) return;
    
    // Ajouter à la queue si pas déjà présent
    setPopupQueue(prev => {
      if (prev.includes(type)) return prev;
      return [...prev, type];
    });
  }, [canShowPopup]);

  // Traiter la queue de pop-ups (afficher le plus prioritaire)
  useEffect(() => {
    if (popupQueue.length === 0 || currentPopup !== null || hasShownPopupThisSession) {
      return;
    }

    // Priorités des pop-ups
    const priorities: Record<PopupType, PopupPriority> = {
      'flash-sale': 1,
      'free-shipping': 2,
      'discount': 3,
      'newsletter': 4,
      'gift': 5,
      'welcome': 1,
      'exit-intent': 1,
    };

    // Trier par priorité
    const sorted = [...popupQueue].sort((a, b) => priorities[a] - priorities[b]);
    const nextPopup = sorted[0];

    // Délais par type
    const delays: Record<PopupType, number> = {
      'welcome': 30000, // 30s
      'flash-sale': 20000, // 20s
      'free-shipping': 0, // Immédiat (déclenché par action)
      'discount': 45000, // 45s
      'newsletter': 60000, // 60s
      'gift': 90000, // 90s
      'exit-intent': 0, // Immédiat (déclenché par action)
    };

    const timer = setTimeout(() => {
      setCurrentPopup(nextPopup);
      setHasShownPopupThisSession(true);
      
      // Sauvegarder dans sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(SESSION_KEY, nextPopup);
      }
    }, delays[nextPopup]);

    return () => clearTimeout(timer);
  }, [popupQueue, currentPopup, hasShownPopupThisSession]);

  // Fermer le pop-up
  const closePopup = useCallback(() => {
    if (currentPopup && typeof window !== 'undefined') {
      try {
        // Sauvegarder la date d'affichage
        const stored = localStorage.getItem(STORAGE_KEY);
        const data = stored ? JSON.parse(stored) : {};
        data[currentPopup] = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du pop-up:', error);
      }
    }
    
    setCurrentPopup(null);
    // Retirer de la queue
    setPopupQueue(prev => prev.filter(p => p !== currentPopup));
  }, [currentPopup]);

  return {
    currentPopup,
    hasShownPopupThisSession,
    canShowPopup,
    requestPopup,
    closePopup,
    isFirstVisit,
  };
}
