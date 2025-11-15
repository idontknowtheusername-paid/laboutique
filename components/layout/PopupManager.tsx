'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { usePopupManager } from '@/hooks/usePopupManager';
import { useCart } from '@/contexts/CartContext';
import DiscountPopup from './DiscountPopup';
import FlashSalePopup from './FlashSalePopup';
import FreeShippingPopup from './FreeShippingPopup';
import GiftPopup from './GiftPopup';
import WelcomePopup from './WelcomePopup';

export default function PopupManager() {
  const pathname = usePathname();
  const { currentPopup, closePopup, requestPopup, isFirstVisit } = usePopupManager();
  const { cartSummary } = useCart();
  const total = cartSummary?.total_amount || 0;

  // Vérifier si une vente flash est active
  const isFlashSaleActive = process.env.NEXT_PUBLIC_FLASH_SALE_ACTIVE === 'true';

  // Vérifier si c'est la période de fêtes
  const now = new Date();
  const month = now.getMonth() + 1;
  const isHolidaySeason = month === 12 || month === 1;

  // Déterminer les pages
  const isHomePage = pathname === '/';
  const isProductPage = pathname.startsWith('/product/');
  const isCheckoutPage = pathname.startsWith('/checkout');

  // Demander les popups selon le contexte
  useEffect(() => {
    // Welcome popup pour nouveaux visiteurs
    if (isFirstVisit) {
      requestPopup('welcome');
    }

    // Flash sale popup sur la page d'accueil si actif
    if (isHomePage && isFlashSaleActive) {
      requestPopup('flash-sale');
    }

    // Discount popup sur toutes les pages sauf checkout
    if (!isCheckoutPage) {
      requestPopup('discount');
    }

    // Gift popup sur les pages produits pendant les fêtes
    if (isProductPage && isHolidaySeason) {
      requestPopup('gift');
    }
  }, [pathname, isFirstVisit, isFlashSaleActive, isHolidaySeason, isCheckoutPage, isHomePage, isProductPage, requestPopup]);

  // Free shipping popup basé sur le panier
  useEffect(() => {
    if (!isCheckoutPage && total > 0 && total < 25000) {
      requestPopup('free-shipping');
    }
  }, [total, isCheckoutPage, requestPopup]);

  // Rendu du popup actuel
  if (!currentPopup) return null;

  return (
    <>
      {currentPopup === 'welcome' && (
        <WelcomePopup onClose={closePopup} />
      )}
      {currentPopup === 'flash-sale' && (
        <FlashSalePopup onClose={closePopup} />
      )}
      {currentPopup === 'discount' && (
        <DiscountPopup onClose={closePopup} />
      )}
      {currentPopup === 'gift' && (
        <GiftPopup onClose={closePopup} />
      )}
      {currentPopup === 'free-shipping' && (
        <FreeShippingPopup onClose={closePopup} cartTotal={total} />
      )}
    </>
  );
}
