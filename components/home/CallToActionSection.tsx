'use client';

import React from 'react';
import { Phone } from 'lucide-react';

export default function CallToActionSection() {
  return (
    <section className="bg-orange-500 text-white py-3 px-4 hidden md:block">
      <div className="container mx-auto">
        <div className="flex items-center justify-center gap-2 text-center">
          <Phone className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-medium">
            Appelez pour commander : <span className="font-bold">+229 XX XX XX XX</span>
          </span>
        </div>
      </div>
    </section>
  );
}