'use client';

import { useState, useEffect } from 'react';

interface FreeShippingPopupState {
  isVisible: boolean;
  shouldShow: boolean;
  showPopup: () => void;
  hidePopup: () => void;
  checkCartTotal: (total: number) => void;
}

export function useFreeShippingPopup(): FreeShippingPopupState {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const [hasShownThisSession, setHasShownThisSession] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Vérifier si le pop-up a déjà été montré cette session
      const shown = sessionStorage.getItem('free-shipping-popup-shown');
      if (shown === 'true') {
        setHasShownThisSession(true);
      }
    }
  }, []);

  const checkCartTotal = (total: number) => {
    // Afficher le pop-up si le panier est entre 20k et 49k F et qu'on ne l'a pas encore montré
    if (total >= 20000 && total < 50000 && !hasShownThisSession) {
      setShouldShow(true);
      setIsVisible(true);
    }
  };

  const showPopup = () => {
    if (!hasShownThisSession) {
      setIsVisible(true);
      setShouldShow(true);
    }
  };
  
  const hidePopup = () => {
    setIsVisible(false);
    setShouldShow(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('free-shipping-popup-shown', 'true');
      setHasShownThisSession(true);
    }
  };

  return { isVisible, shouldShow, showPopup, hidePopup, checkCartTotal };
}