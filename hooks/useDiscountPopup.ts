'use client';

import { useState, useEffect } from 'react';

interface DiscountPopupState {
  isVisible: boolean;
  hasSeenPopup: boolean;
  showPopup: () => void;
  hidePopup: () => void;
  shouldShowPopup: () => boolean;
}

export function useDiscountPopup(): DiscountPopupState {
  const [isVisible, setIsVisible] = useState(false);
  const [hasSeenPopup, setHasSeenPopup] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Vérifier si l'utilisateur a déjà vu le pop-up de réduction
      const seen = localStorage.getItem('discount-popup-seen');
      const seenDate = localStorage.getItem('discount-popup-date');
      
      if (seen === 'true' && seenDate) {
        const lastSeen = new Date(seenDate);
        const now = new Date();
        const daysSinceLastSeen = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24));
        
        // Afficher le pop-up si ça fait plus de 7 jours
        if (daysSinceLastSeen >= 7) {
          setHasSeenPopup(false);
        } else {
          setHasSeenPopup(true);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!hasSeenPopup) {
      // Afficher le pop-up après 45 secondes (optimisé pour meilleure UX)
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 45000);

      return () => clearTimeout(timer);
    }
  }, [hasSeenPopup]);

  const showPopup = () => setIsVisible(true);
  
  const hidePopup = () => {
    setIsVisible(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('discount-popup-seen', 'true');
      localStorage.setItem('discount-popup-date', new Date().toISOString());
      setHasSeenPopup(true);
    }
  };
  
  const shouldShowPopup = () => !hasSeenPopup && !isVisible;

  return { isVisible, hasSeenPopup, showPopup, hidePopup, shouldShowPopup };
}