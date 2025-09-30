'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Bell, LayoutGrid, Users, ShoppingCart, Package, Shield, Megaphone, Settings, Flag, Home, FileText, RotateCcw, BarChart3, Database } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import NotificationCenter from '@/components/admin/NotificationCenter';
import { ThemeProvider } from '@/components/admin/ThemeProvider';
import { ToastProvider } from '@/components/admin/Toast';
import MobileNavigation from '@/components/admin/MobileNavigation';
import { SkipLinks } from '@/components/admin/SkipLink';
import { QuickThemeToggle } from '@/components/admin/ThemeToggle';
import { ScreenReaderAnnouncer } from '@/components/admin/AccessibilityEnhancer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();
  const [avatarInitial, setAvatarInitial] = useState<string>('A');
  const [adminName, setAdminName] = useState<string>('Admin');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [notificationCount, setNotificationCount] = useState<number>(0);
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

  // Check authorization on mount and when user/profile changes
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
    }
  }, [user, profile, loading, router]);

  // Show loading while checking auth
  if (loading || !hasChecked) {
    return (
      <div className="min-h-screen bg-jomiastore-background dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-jomiastore-primary to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized if not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-jomiastore-background dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-jomiastore-primary to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  const nav = [
    // SECTION PRINCIPALE - GESTION COMMERCIALE
    { href: '/admin/dashboard', label: "Dashboard", icon: LayoutGrid, section: "main" },
    { href: '/admin/orders', label: "Commandes", icon: ShoppingCart, section: "main" },
    { href: '/admin/products', label: "Produits", icon: Package, section: "main" },
    { href: '/admin/users', label: "Utilisateurs", icon: Users, section: "main" },
    
    // SECTION MARKETING & PROMOTIONS
    { href: '/admin/coupons', label: "Coupons", icon: Megaphone, section: "marketing" },
    { href: '/admin/articles', label: "Articles", icon: FileText, section: "marketing" },
    
    // SECTION SUPPORT & SERVICE CLIENT
    { href: '/admin/returns', label: "Retours", icon: RotateCcw, section: "support" },
    { href: '/admin/moderation', label: "Modération", icon: Shield, section: "support" },
    
    // SECTION ANALYTICS & TECHNIQUE
    { href: '/admin/analytics', label: "Analytics", icon: BarChart3, section: "technical" },
    { href: '/admin/backup', label: "Backup", icon: Database, section: "technical" },
    { href: '/admin/settings', label: "Paramètres", icon: Settings, section: "technical" },
  ];

  const externalLinks = [
    { href: '/', label: "Voir le site", icon: Home, external: true },
  ];

  return (
    <div className="min-h-screen bg-jomiastore-background dark:bg-gray-900">
      <SkipLinks />
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40" id="navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-jomiastore-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Admin Panel</span>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <MobileNavigation 
              currentPath={pathname}
              onNavigate={(path) => router.push(path)}
              notificationCount={notificationCount}
            />
          </div>

          {/* Desktop Right side */}
          <div className="hidden lg:flex items-center space-x-4">
            <QuickThemeToggle />
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowNotifications(true)}
              className="relative"
              aria-label={`Notifications ${notificationCount > 0 ? `(${notificationCount} nouvelles)` : ''}`}
            >
              <Bell className="w-4 h-4 mr-2" /> 
              Notifications
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </Button>

            {/* User menu */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{adminName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
              </div>
              <div className="w-8 h-8 bg-jomiastore-primary rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">{avatarInitial}</span>
              </div>
              <Button variant="outline" size="sm" onClick={signOut}>
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
          <div className="p-4">
            <nav className="space-y-1" role="navigation" aria-label="Navigation principale">
              {nav.map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const showSeparator = index > 0 && nav[index - 1].section !== item.section;
                const sectionLabels = {
                  main: "Gestion Commerciale",
                  marketing: "Marketing & Promotions", 
                  support: "Support Client",
                  technical: "Analytics & Technique"
                };
                
                return (
                  <React.Fragment key={item.href}>
                    {showSeparator && (
                      <div className="my-4">
                        <div className="px-3 py-1">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {sectionLabels[item.section as keyof typeof sectionLabels]}
                          </p>
                        </div>
                        <Separator />
                      </div>
                    )}
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-jomiastore-primary text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                      title={item.label}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  </React.Fragment>
                );
              })}
            </nav>

            <Separator className="my-4" />

            <nav className="space-y-2" role="navigation" aria-label="Liens externes">
              {externalLinks.map((item) => {
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <main id="main-content" role="main">
              {children}
            </main>
          </div>
        </div>
      </div>

      {/* Centre de notifications */}
      <NotificationCenter 
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
}

// Configuration React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (remplace cacheTime dans v5)
      refetchOnWindowFocus: false,
      retry: 2
    }
  }
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <AdminLayoutContent>
            <ScreenReaderAnnouncer />
            {children}
          </AdminLayoutContent>
        </ToastProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}