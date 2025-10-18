'use client';

import React from 'react';
import { Phone } from 'lucide-react';

export default function CallToActionSection() {
  return (
    <section className="bg-orange-500 text-white py-3 px-4 w-full fixed top-16 left-0 right-0 z-[60]">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-center gap-2 text-center">
          <Phone className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm sm:text-base font-medium">
            Appelez pour commander : <span className="font-bold text-base sm:text-lg">+229 XX XX XX XX</span>
          </span>
        </div>
      </div>
    </section>
  );
}