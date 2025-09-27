'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Bell, LayoutGrid, Users, ShoppingCart, Package, Shield, Megaphone, Settings, Flag, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [avatarInitial, setAvatarInitial] = useState<string>('A');
  const [adminName, setAdminName] = useState<string>('Admin');
  const [hasChecked, setHasChecked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return window.sessionStorage.getItem('adminAuthorized') === '1';
      } catch {}
    }
    return false;
  });
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return window.sessionStorage.getItem('adminAuthorized') === '1';
      } catch {}
    }
    return false;
  });

  useEffect(() => {
    if (loading) return;

    // No user -> redirect once
    if (!user) {
      setHasChecked(true);
      setIsAuthorized(false);
      if (typeof window !== 'undefined') {
        try { window.sessionStorage.removeItem('adminAuthorized'); } catch {}
      }
      router.replace('/auth/login?redirect=/admin/dashboard');
      return;
    }

    // User present but not admin -> redirect once
    if (profile && profile.role !== 'admin') {
      setHasChecked(true);
      setIsAuthorized(false);
      if (typeof window !== 'undefined') {
        try { window.sessionStorage.removeItem('adminAuthorized'); } catch {}
      }
      router.replace('/unauthorized');
      return;
    }

    // Authorized
    if (user && profile?.role === 'admin') {
      setIsAuthorized(true);
      setHasChecked(true);
      if (typeof window !== 'undefined') {
        try { window.sessionStorage.setItem('adminAuthorized', '1'); } catch {}
      }
      const first = profile.first_name?.trim();
      const last = profile.last_name?.trim();
      const email = profile.email?.trim();
      const initial = (first || email || 'A').charAt(0).toUpperCase();
      setAvatarInitial(initial);
      setAdminName(first && last ? `${first} ${last}` : (first || 'Admin'));
    }

    // If user exists but profile not yet loaded, allow rendering to avoid blocking navigation
    if (user && !profile) {
      setIsAuthorized(true);
      setHasChecked(true);
      if (typeof window !== 'undefined') {
        try { window.sessionStorage.setItem('adminAuthorized', '1'); } catch {}
      }
      const email = (user.email || 'admin').trim();
      setAvatarInitial(email.charAt(0).toUpperCase());
      setAdminName('Admin');
    }
  }, [loading, user, profile, router]);

  // Afficher un loader pendant la vérification
  if (!hasChecked) {
    return (
      <div className="min-h-screen bg-jomiastore-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-jomiastore-primary to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <p className="text-gray-600">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  const nav = [
    { href: '/admin/dashboard', label: "Dashboard", icon: LayoutGrid },
    { href: '/admin/users', label: "Utilisateurs", icon: Users },
    { href: '/admin/orders', label: "Commandes", icon: ShoppingCart },
    { href: '/admin/products', label: "Produits", icon: Package },
    { href: '/admin/moderation', label: "Modération", icon: Flag },
    { href: '/admin/articles', label: "Articles", icon: Megaphone },
    { href: '/admin/settings', label: "Paramètres", icon: Settings },
  ];

  const externalLinks = [
    { href: '/', label: "Voir le site", icon: Home, external: true },
  ];


  return (
      <div className="min-h-screen bg-jomiastore-background">
        <header className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="mr-2">
                    <span className="sr-only">Ouvrir le menu</span>
                    ☰
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Menu d'administration</SheetTitle>
                </SheetHeader>
                  <div className="p-4 flex items-center gap-3 border-b">
                    <div className="w-8 h-8 bg-gradient-to-r from-jomiastore-primary to-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">B</span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold">Admin – La Boutique B</div>
                      <div className="text-xs text-gray-500">Panneau d'administration</div>
                    </div>
                  </div>
                  <nav className="p-2">
                    {nav.map((item) => {
                      const Icon = item.icon;
                      const active = pathname?.startsWith(item.href);
                      return (
                        <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-50 ${active ? 'bg-gray-100 text-gray-900 border border-gray-200' : 'text-gray-700'}`}>
                          <Icon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      );
                    })}
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {externalLinks.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link 
                            key={item.href} 
                            href={item.href} 
                            target={item.external ? "_blank" : undefined}
                            rel={item.external ? "noopener noreferrer" : undefined}
                            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-50 text-gray-700"
                          >
                            <Icon className="w-4 h-4" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
              <div>
                <h1 className="text-lg font-bold">Admin – La Boutique B</h1>
                <p className="text-xs text-gray-500">Panneau d'administration</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" /> Notifications
              </Button>
              <div className="w-8 h-8 bg-jomiastore-primary rounded-full flex items-center justify-center" title={adminName}>
                <span className="text-white font-medium text-sm">{avatarInitial}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <main>
            {children}
          </main>
        </div>
      </div>
  );
}

