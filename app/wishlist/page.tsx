'use client';

import { useEffect } from 'react';

export default function WishlistRedirect() {
  useEffect(() => {
    window.location.replace('/account/wishlist');
  }, []);

  return null;
}


