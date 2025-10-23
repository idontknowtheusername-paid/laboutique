'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import DiscountPopup from './DiscountPopup';
import FlashSalePopup from './FlashSalePopup';
import FreeShippingPopup from './FreeShippingPopup';
import GiftPopup from './GiftPopup';
import { useDiscountPopup } from '@/hooks/useDiscountPopup';
import { useFlashSalePopup } from '@/hooks/useFlashSalePopup';
import { useFreeShippingPopup } from '@/hooks/useFreeShippingPopup';
import { useGiftPopup } from '@/hooks/useGiftPopup';

export default function PopupManager() {
  const pathname = usePathname();
  
  // Hooks pour chaque pop-up
  const discountPopup = useDiscountPopup();
  const flashSalePopup = useFlashSalePopup();
  const freeShippingPopup = useFreeShippingPopup();
  const giftPopup = useGiftPopup();

  // Simuler un panier pour le pop-up de livraison gratuite
  // En production, cela viendrait du contexte du panier
  const mockCartTotal = 35000; // 35 000 F

  useEffect(() => {
    // Vérifier le total du panier pour le pop-up de livraison gratuite
    freeShippingPopup.checkCartTotal(mockCartTotal);
  }, [freeShippingPopup]);

  // Déterminer quels pop-ups peuvent s'afficher selon la page
  const isHomePage = pathname === '/';
  const isProductPage = pathname.startsWith('/products/');
  const isCheckoutPage = pathname.startsWith('/checkout');

  // Logique de priorité des pop-ups
  const getVisiblePopups = () => {
    const visiblePopups = [];

    // 1. Pop-up de réduction (toutes pages sauf checkout)
    if (!isCheckoutPage && discountPopup.isVisible) {
      visiblePopups.push({
        component: <DiscountPopup key="discount" onClose={discountPopup.hidePopup} />,
        priority: 1
      });
    }

    // 2. Pop-up vente flash (page d'accueil uniquement)
    if (isHomePage && flashSalePopup.isVisible) {
      visiblePopups.push({
        component: <FlashSalePopup key="flash-sale" onClose={flashSalePopup.hidePopup} />,
        priority: 2
      });
    }

    // 3. Pop-up livraison gratuite (toutes pages sauf checkout)
    if (!isCheckoutPage && freeShippingPopup.isVisible) {
      visiblePopups.push({
        component: <FreeShippingPopup key="free-shipping" onClose={freeShippingPopup.hidePopup} cartTotal={mockCartTotal} />,
        priority: 3
      });
    }

    // 4. Pop-up cadeau (pages produits uniquement)
    if (isProductPage && giftPopup.isVisible) {
      visiblePopups.push({
        component: <GiftPopup key="gift" onClose={giftPopup.hidePopup} />,
        priority: 4
      });
    }

    // Trier par priorité et retourner le premier
    return visiblePopups.sort((a, b) => a.priority - b.priority);
  };

  const visiblePopups = getVisiblePopups();

  // Afficher seulement le pop-up de plus haute priorité
  if (visiblePopups.length === 0) {
    return null;
  }

  return (
    <>
      {visiblePopups[0].component}
    </>
  );
}