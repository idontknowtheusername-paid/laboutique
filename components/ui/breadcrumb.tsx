import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav 
      className={cn(
        "flex items-center space-x-1 text-xs text-gray-500 mb-4",
        className
      )}
      aria-label="Breadcrumb"
    >
      <Link 
        href="/" 
        className="flex items-center hover:text-jomionstore-primary transition-colors"
        aria-label="Accueil"
      >
        <Home className="w-3 h-3" />
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          {item.href ? (
            <Link 
              href={item.href}
              className="hover:text-jomionstore-primary transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-700 font-medium">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

// Hook pour générer automatiquement les breadcrumbs
export function useBreadcrumb() {
  const generateBreadcrumb = (currentPage: string): BreadcrumbItem[] => {
    const baseItems: BreadcrumbItem[] = [
      { label: 'Mon compte', href: '/account' }
    ];

    const pageLabels: Record<string, string> = {
      'orders': 'Commandes',
      'returns': 'Retours & Remboursements',
      'coupons': 'Coupons',
      'wallet': 'Wallet',
      'points': 'Points de fidélité',
      'wishlist': 'Liste de souhaits',
      'payment-methods': 'Moyens de paiement',
      'addresses': 'Adresses',
      'notifications': 'Notifications',
      'invoices': 'Factures',
      'security': 'Sécurité',
      'settings': 'Paramètres',
      'profile': 'Profil',
      'recent': 'Récemment consultés'
    };

    if (currentPage !== 'account') {
      baseItems.push({
        label: pageLabels[currentPage] || currentPage,
        href: undefined // Dernier élément non cliquable
      });
    }

    return baseItems;
  };

  return { generateBreadcrumb };
}