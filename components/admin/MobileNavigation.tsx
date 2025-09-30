'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  X, 
  LayoutGrid, 
  Users, 
  ShoppingCart, 
  Package, 
  Megaphone, 
  Flag, 
  Settings, 
  Shield,
  Home,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  notificationCount?: number;
}

const mobileNavItems = [
  { href: '/admin/dashboard', label: "Dashboard", icon: LayoutGrid },
  { href: '/admin/users', label: "Utilisateurs", icon: Users },
  { href: '/admin/orders', label: "Commandes", icon: ShoppingCart },
  { href: '/admin/products', label: "Produits", icon: Package },
  { href: '/admin/coupons', label: "Coupons", icon: Megaphone },
  { href: '/admin/returns', label: "Retours", icon: Flag },
  { href: '/admin/analytics', label: "Analytics", icon: Settings },
  { href: '/admin/backup', label: "Backup", icon: Shield },
  { href: '/admin/moderation', label: "Modération", icon: Flag },
  { href: '/admin/articles', label: "Articles", icon: Megaphone },
  { href: '/admin/settings', label: "Paramètres", icon: Settings },
];

export default function MobileNavigation({ 
  currentPath, 
  onNavigate, 
  notificationCount = 0 
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = (path: string) => {
    onNavigate(path);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden"
          aria-label="Ouvrir le menu de navigation"
        >
          <Menu className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Navigation Admin</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              aria-label="Fermer le menu"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4" role="navigation" aria-label="Navigation principale">
            <ul className="space-y-2">
              {mobileNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.href;
                
                return (
                  <li key={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start",
                        isActive && "bg-jomiastore-primary text-white"
                      )}
                      onClick={() => handleNavigate(item.href)}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleNavigate('/')}
            >
              <Home className="w-4 h-4 mr-3" />
              Voir le site
            </Button>
            
            {notificationCount > 0 && (
              <Button
                variant="outline"
                className="w-full justify-start relative"
                onClick={() => handleNavigate('/admin/notifications')}
              >
                <Bell className="w-4 h-4 mr-3" />
                Notifications
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}