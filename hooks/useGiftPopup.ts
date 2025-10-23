'use client';

import { useState, useEffect } from 'react';

interface GiftPopupState {
  isVisible: boolean;
  hasSeenPopup: boolean;
  showPopup: () => void;
  hidePopup: () => void;
  shouldShowPopup: () => boolean;
  isHolidaySeason: boolean;
}

export function useGiftPopup(): GiftPopupState {
  const [isVisible, setIsVisible] = useState(false);
  const [hasSeenPopup, setHasSeenPopup] = useState(false);
  const [isHolidaySeason, setIsHolidaySeason] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Vérifier si c'est la période de fêtes (décembre-janvier)
      const now = new Date();
      const month = now.getMonth() + 1; // 0-11 -> 1-12
      const isHoliday = month === 12 || month === 1;
      setIsHolidaySeason(isHoliday);

      // Vérifier si l'utilisateur a déjà vu le pop-up de cadeau cette semaine
      const seen = localStorage.getItem('gift-popup-seen');
      const seenDate = localStorage.getItem('gift-popup-date');
      
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
    if (!hasSeenPopup && isHolidaySeason) {
      // Afficher le pop-up après 45 secondes
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 45000);

      return () => clearTimeout(timer);
    }
  }, [hasSeenPopup, isHolidaySeason]);

  const showPopup = () => setIsVisible(true);
  
  const hidePopup = () => {
    setIsVisible(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gift-popup-seen', 'true');
      localStorage.setItem('gift-popup-date', new Date().toISOString());
      setHasSeenPopup(true);
    }
  };
  
  const shouldShowPopup = () => !hasSeenPopup && !isVisible && isHolidaySeason;

  return { isVisible, hasSeenPopup, showPopup, hidePopup, shouldShowPopup, isHolidaySeason };
}