'use client';

import { useState, useEffect } from 'react';

interface NewsletterPopupState {
  isVisible: boolean;
  hasSeenPopup: boolean;
  showPopup: () => void;
  hidePopup: () => void;
  shouldShowPopup: () => boolean;
}

export function useNewsletterPopup(): NewsletterPopupState {
  const [isVisible, setIsVisible] = useState(false);
  const [hasSeenPopup, setHasSeenPopup] = useState(false);

  // Vérifier si l'utilisateur a déjà vu le pop-up
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('newsletter-popup-seen');
      const seenDate = localStorage.getItem('newsletter-popup-date');
      
      if (seen === 'true' && seenDate) {
        const lastSeen = new Date(seenDate);
        const now = new Date();
        const daysSinceLastSeen = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24));
        
        // Afficher le pop-up si ça fait plus de 2 jours
        if (daysSinceLastSeen >= 2) {
          setHasSeenPopup(false);
        } else {
          setHasSeenPopup(true);
        }
      }
    }
  }, []);

  // Afficher le pop-up après un délai si l'utilisateur ne l'a pas encore vu
  useEffect(() => {
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 15000); // Afficher après 15 secondes

      return () => clearTimeout(timer);
    }
  }, [hasSeenPopup]);

  const showPopup = () => {
    setIsVisible(true);
  };

  const hidePopup = () => {
    setIsVisible(false);
    
    // Marquer comme vu et sauvegarder la date
    if (typeof window !== 'undefined') {
      localStorage.setItem('newsletter-popup-seen', 'true');
      localStorage.setItem('newsletter-popup-date', new Date().toISOString());
      setHasSeenPopup(true);
    }
  };

  const shouldShowPopup = () => {
    return !hasSeenPopup && !isVisible;
  };

  return {
    isVisible,
    hasSeenPopup,
    showPopup,
    hidePopup,
    shouldShowPopup
  };
}
