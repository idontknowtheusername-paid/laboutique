'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import DiscountPopup from './DiscountPopup';
import FlashSalePopup from './FlashSalePopup';
import FreeShippingPopup from './FreeShippingPopup';
import GiftPopup from './GiftPopup';
import WelcomePopup from './WelcomePopup';
import { useDiscountPopup } from '@/hooks/useDiscountPopup';
import { useFlashSalePopup } from '@/hooks/useFlashSalePopup';
import { useFreeShippingPopup } from '@/hooks/useFreeShippingPopup';
import { useGiftPopup } from '@/hooks/useGiftPopup';
import { useWelcomePopup } from '@/hooks/useWelcomePopup';

export default function PopupManager() {
  const pathname = usePathname();
  
  // Hooks pour chaque pop-up
  const welcomePopup = useWelcomePopup();
  const discountPopup = useDiscountPopup();
  const flashSalePopup = useFlashSalePopup();
  const freeShippingPopup = useFreeShippingPopup();
  const giftPopup = useGiftPopup();

  // Tracker pour s'assurer qu'un seul popup s'affiche par session
  const [hasShownPopupThisSession, setHasShownPopupThisSession] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const shown = sessionStorage.getItem('popup-shown-this-session');
      if (shown === 'true') {
        setHasShownPopupThisSession(true);
      }
    }
  }, []);

  // Simuler un panier pour le pop-up de livraison gratuite
  // En production, cela viendrait du contexte du panier
  const [mockCartTotal, setMockCartTotal] = useState(0);

  useEffect(() => {
    // Simuler l'ajout d'articles au panier après 3 secondes
    // Cela simule un comportement plus réaliste
    const timer = setTimeout(() => {
      setMockCartTotal(15000); // 15 000 F (déclenche le pop-up)
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Vérifier le total du panier pour le pop-up de livraison gratuite
    if (mockCartTotal > 0) {
      freeShippingPopup.checkCartTotal(mockCartTotal);
    }
  }, [mockCartTotal, freeShippingPopup]);

  // Déterminer quels pop-ups peuvent s'afficher selon la page
  const isHomePage = pathname === '/';
  const isProductPage = pathname.startsWith('/products/');
  const isCheckoutPage = pathname.startsWith('/checkout');

  // Fonction pour marquer qu'un popup a été affiché
  const markPopupShown = () => {
    setHasShownPopupThisSession(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('popup-shown-this-session', 'true');
    }
  };

  // Wrapper pour les callbacks onClose
  const createCloseHandler = (originalClose: () => void) => {
    return () => {
      markPopupShown();
      originalClose();
    };
  };

  // Logique de priorité des pop-ups avec système "un seul par session"
  const getVisiblePopup = () => {
    // Si un popup a déjà été affiché cette session, ne rien montrer
    if (hasShownPopupThisSession) {
      return null;
    }

    // PRIORITÉ 0: Pop-up de bienvenue (nouveaux visiteurs uniquement)
    if (welcomePopup.isVisible && welcomePopup.isFirstVisit) {
      return <WelcomePopup key="welcome" onClose={createCloseHandler(welcomePopup.hidePopup)} />;
    }

    // PRIORITÉ 1: Pop-up vente flash (si active - haute priorité)
    if (isHomePage && flashSalePopup.isVisible && flashSalePopup.isFlashSaleActive) {
      return <FlashSalePopup key="flash-sale" onClose={createCloseHandler(flashSalePopup.hidePopup)} />;
    }

    // PRIORITÉ 2: Pop-up livraison gratuite (contexte panier)
    if (!isCheckoutPage && freeShippingPopup.isVisible) {
      return <FreeShippingPopup key="free-shipping" onClose={createCloseHandler(freeShippingPopup.hidePopup)} cartTotal={mockCartTotal} />;
    }

    // PRIORITÉ 3: Pop-up de réduction (toutes pages sauf checkout)
    if (!isCheckoutPage && discountPopup.isVisible) {
      return <DiscountPopup key="discount" onClose={createCloseHandler(discountPopup.hidePopup)} />;
    }

    // PRIORITÉ 4: Pop-up cadeau (période fêtes uniquement)
    if (isProductPage && giftPopup.isVisible && giftPopup.isHolidaySeason) {
      return <GiftPopup key="gift" onClose={createCloseHandler(giftPopup.hidePopup)} />;
    }

    return null;
  };

  const visiblePopup = getVisiblePopup();

  // Afficher seulement le pop-up de plus haute priorité
  if (!visiblePopup) {
    return null;
  }

  return <>{visiblePopup}</>;
}