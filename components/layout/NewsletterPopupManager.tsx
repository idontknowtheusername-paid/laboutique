'use client';

import React from 'react';
import NewsletterPopup from './NewsletterPopup';
import { useNewsletterPopup } from '@/hooks/useNewsletterPopup';

export default function NewsletterPopupManager() {
  const { isVisible, hidePopup } = useNewsletterPopup();

  if (!isVisible) {
    return null;
  }

  return <NewsletterPopup onClose={hidePopup} />;
}
