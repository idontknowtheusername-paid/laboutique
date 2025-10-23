'use client';

import { useState, useEffect } from 'react';

interface FlashSalePopupState {
  isVisible: boolean;
  hasSeenPopup: boolean;
  showPopup: () => void;
  hidePopup: () => void;
  shouldShowPopup: () => boolean;
  isFlashSaleActive: boolean;
}

export function useFlashSalePopup(): FlashSalePopupState {
  const [isVisible, setIsVisible] = useState(false);
  const [hasSeenPopup, setHasSeenPopup] = useState(false);
  const [isFlashSaleActive, setIsFlashSaleActive] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Vérifier si une vente flash est active (variable d'environnement ou API)
      const flashSaleActive = process.env.NEXT_PUBLIC_FLASH_SALE_ACTIVE === 'true';
      setIsFlashSaleActive(flashSaleActive);

      // Vérifier si l'utilisateur a déjà vu le pop-up de vente flash aujourd'hui
      const seen = localStorage.getItem('flash-sale-popup-seen');
      const seenDate = localStorage.getItem('flash-sale-popup-date');
      
      if (seen === 'true' && seenDate) {
        const lastSeen = new Date(seenDate);
        const now = new Date();
        const isSameDay = lastSeen.toDateString() === now.toDateString();
        
        if (isSameDay) {
          setHasSeenPopup(true);
        } else {
          setHasSeenPopup(false);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!hasSeenPopup && isFlashSaleActive) {
      // Afficher le pop-up après 30 secondes
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [hasSeenPopup, isFlashSaleActive]);

  const showPopup = () => setIsVisible(true);
  
  const hidePopup = () => {
    setIsVisible(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('flash-sale-popup-seen', 'true');
      localStorage.setItem('flash-sale-popup-date', new Date().toISOString());
      setHasSeenPopup(true);
    }
  };
  
  const shouldShowPopup = () => !hasSeenPopup && !isVisible && isFlashSaleActive;

  return { isVisible, hasSeenPopup, showPopup, hidePopup, shouldShowPopup, isFlashSaleActive };
}