"use client";
import React from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { Package, Heart, CreditCard, MapPin, Bell, Settings, TicketPercent, Wallet, Shield, FileText } from 'lucide-react';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { href: '/account', label: 'Tableau de bord', icon: Settings },
    { href: '/account/orders', label: 'Commandes', icon: Package },
    { href: '/account/returns', label: 'Retours', icon: FileText },
    { href: '/account/coupons', label: 'Coupons', icon: TicketPercent },
    { href: '/account/wallet', label: 'Wallet', icon: Wallet },
    { href: '/account/points', label: 'Points', icon: Shield },
    { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
    { href: '/account/payment-methods', label: 'Paiements', icon: CreditCard },
    { href: '/account/addresses', label: 'Adresses', icon: MapPin },
    { href: '/account/notifications', label: 'Notifications', icon: Bell },
    { href: '/account/invoices', label: 'Factures', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-jomiastore-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        <nav className="w-full overflow-x-auto no-scrollbar">
          <ul className="flex items-center gap-2 md:gap-3 pb-4 border-b">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-700 hover:text-jomiastore-primary hover:bg-white border border-transparent hover:border-jomiastore-primary/20"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="pt-6">
          {children}
        </div>
      </div>

      <Footer />
    </div>
  );
}

