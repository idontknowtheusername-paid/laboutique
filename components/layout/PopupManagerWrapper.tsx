'use client';

import dynamic from 'next/dynamic';

// Lazy load popup managers côté client pour améliorer INP
const PopupManager = dynamic(() => import('./PopupManager'), {
  ssr: false,
  loading: () => null
});

const NewsletterPopupManager = dynamic(() => import('./NewsletterPopupManager'), {
  ssr: false,
  loading: () => null
});

export default function PopupManagerWrapper() {
  return (
    <>
      <NewsletterPopupManager />
      <PopupManager />
    </>
  );
}
