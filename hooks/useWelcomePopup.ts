'use client';

import { useState, useEffect } from 'react';

interface WelcomePopupState {
  isVisible: boolean;
  isFirstVisit: boolean;
  showPopup: () => void;
  hidePopup: () => void;
  shouldShowPopup: () => boolean;
}

export function useWelcomePopup(): WelcomePopupState {
  const [isVisible, setIsVisible] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Vérifier si c'est la première visite
      const hasVisited = localStorage.getItem('has-visited-jomionstore');
      
      if (!hasVisited) {
        setIsFirstVisit(true);
        // Marquer comme visité
        localStorage.setItem('has-visited-jomionstore', 'true');
        localStorage.setItem('first-visit-date', new Date().toISOString());
      }
    }
  }, []);

  useEffect(() => {
    if (isFirstVisit) {
      // Afficher le pop-up de bienvenue après 30 secondes pour les nouveaux visiteurs
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [isFirstVisit]);

  const showPopup = () => setIsVisible(true);
  
  const hidePopup = () => {
    setIsVisible(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('welcome-popup-seen', 'true');
      localStorage.setItem('welcome-popup-date', new Date().toISOString());
    }
  };
  
  const shouldShowPopup = () => isFirstVisit && !isVisible;

  return { isVisible, isFirstVisit, showPopup, hidePopup, shouldShowPopup };
}
