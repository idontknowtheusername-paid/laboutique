'use client';

import React from 'react';

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-beshop-background flex items-center justify-center">
      <div className="animate-pulse text-gray-500">Chargement...</div>
    </div>
  );
}


