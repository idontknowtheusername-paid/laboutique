'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
  productName?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phoneNumber = '+2290164354089',
  message,
  productName
}) => {
  const handleClick = () => {
    const defaultMessage = productName 
      ? `Bonjour, je suis intéressé par le produit: ${productName}`
      : 'Bonjour, j\'ai une question sur un produit';
    
    const text = encodeURIComponent(message || defaultMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\+/g, '')}?text=${text}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
      aria-label="Contacter sur WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
      
      {/* Tooltip */}
      <span className="absolute right-16 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        Besoin d'aide ?
      </span>
      
      {/* Pulse animation */}
      <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20"></span>
    </button>
  );
};
