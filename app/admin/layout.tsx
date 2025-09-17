'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Bell, LayoutGrid, Users, ShoppingCart, Package, Shield, Megaphone, Settings, Flag } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const nav = [
    { href: '/admin/dashboard', label: "Dashboard", icon: LayoutGrid },
    { href: '/admin/users', label: "Utilisateurs", icon: Users },
    { href: '/admin/orders', label: "Commandes", icon: ShoppingCart },
    { href: '/admin/products', label: "Produits", icon: Package },
    { href: '/admin/moderation', label: "Modération", icon: Flag },
    { href: '/admin/articles', label: "Articles", icon: Megaphone },
    { href: '/admin/settings', label: "Paramètres", icon: Settings },
  ];

  return (
      <div className="min-h-screen bg-beshop-background">
        <header className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-beshop-primary to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <div>
                <h1 className="text-lg font-bold">Admin – La Boutique B</h1>
                <p className="text-xs text-gray-500">Panneau d'administration</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" /> Notifications
              </Button>
              <div className="w-8 h-8 bg-beshop-primary rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">A</span>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3">
            <nav className="bg-white border rounded-lg p-2">
              {nav.map((item) => {
                const Icon = item.icon;
                const active = pathname?.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-50 ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}>
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <main className="lg:col-span-9">
            {children}
          </main>
        </div>
      </div>
  );
}

