'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
// TODO: Import or define refreshUserStats if not present
// import { refreshUserStats } from '@/contexts/AuthContext';
const refreshUserStats = async () => {};
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { useSessionManager } from "@/hooks/useSessionManager";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Package, 
  Heart, 
  Settings, 
  Bell, 
  Shield, 
  CreditCard,
  MapPin,
  LogOut,
  Edit
} from 'lucide-react';
import Link from 'next/link';
import NextImage from 'next/image';

export default function AccountPage() {
  const {
    user,
    profile,
    userStats,
    signOut,
    loading,
    error,
    refreshProfile,
    statsLoading,
  } = useAuth();

  // Initialize session manager for this protected page
  useSessionManager({
    autoRefresh: true,
    redirectOnExpiry: true,
  });

  const [refreshing, setRefreshing] = React.useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleRefreshProfile = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshProfile(), refreshUserStats()]);
    } finally {
      setRefreshing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-BJ', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const menuItems = [
    {
      icon: Package,
      title: "Mes commandes",
      description: "Suivez vos commandes et historique",
      href: "/account/orders",
      badge: userStats?.totalOrders || 0,
    },
    {
      icon: Heart,
      title: "Ma liste de souhaits",
      description: "Produits sauvegardés",
      href: "/account/wishlist",
      badge: userStats?.wishlistItems || 0,
    },
    {
      icon: CreditCard,
      title: "Moyens de paiement",
      description: "Gérez vos cartes et comptes",
      href: "/account/payment-methods",
    },
    {
      icon: MapPin,
      title: "Adresses",
      description: "Livraison et facturation",
      href: "/account/addresses",
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Préférences de communication",
      href: "/account/notifications",
    },
    {
      icon: Settings,
      title: "Paramètres",
      description: "Compte et confidentialité",
      href: "/account/settings",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-beshop-primary" />
      </div>
    );
  }

  return (
    <ProtectedRoute requireAuth={true} redirectTo="/auth/login">
      <div className="min-h-screen bg-beshop-background">
        <Header />
        <CategoryMenu />

        <div className="container py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
            <Link href="/" className="hover:text-beshop-primary">
              Accueil
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Mon compte</span>
          </nav>

          {error && (
            <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded px-4 py-2">
              <AlertTriangle className="w-5 h-5" />
              <span>{error.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <div className="w-20 h-20 bg-beshop-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    {profile?.avatar_url ? (
                      <NextImage
                        src={profile.avatar_url}
                        alt="Avatar"
                        width={80}
                        height={80}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-white" />
                    )}
                  </div>
                  <CardTitle className="text-xl">
                    {profile?.first_name && profile?.last_name
                      ? `${profile.first_name} ${profile.last_name}`
                      : user?.email?.split("@")[0] || "Utilisateur"}
                  </CardTitle>
                  <p className="text-gray-600">{user?.email}</p>
                  <Badge variant="outline" className="w-fit mx-auto mt-2">
                    Membre depuis{" "}
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString(
                          "fr-FR",
                          { month: "long", year: "numeric" }
                        )
                      : "Récemment"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-4 right-4"
                    onClick={handleRefreshProfile}
                    disabled={refreshing || statsLoading}
                    title="Rafraîchir le profil"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${
                        refreshing || statsLoading ? "animate-spin" : ""
                      }`}
                    />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {statsLoading || refreshing ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-beshop-primary" />
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-beshop-primary">
                            {userStats?.totalOrders || 0}
                          </div>
                          <div className="text-sm text-gray-600">Commandes</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-beshop-primary">
                            {userStats?.reviewsCount || 0}
                          </div>
                          <div className="text-sm text-gray-600">
                            Avis donnés
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {formatPrice(userStats?.totalSpent || 0)}
                        </div>
                        <div className="text-sm text-gray-600">
                          Total dépensé
                        </div>
                      </div>
                    </>
                  )}
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/account/profile">
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier le profil
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-red-600 hover:text-red-700"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Se déconnecter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Menu Items */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {menuItems.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <Link key={index} href={item.href}>
                      <Card className="hover-lift transition-all duration-200 cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-beshop-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <IconComponent className="w-6 h-6 text-beshop-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-gray-900">
                                  {item.title}
                                </h3>
                                {item.badge && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {item.badge}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="text-lg">Actions rapides</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/order-tracking">
                      <Button
                        variant="outline"
                        className="w-full h-16 flex-col"
                      >
                        <Package className="w-5 h-5 mb-2" />
                        Suivre une commande
                      </Button>
                    </Link>
                    <Link href="/contact">
                      <Button
                        variant="outline"
                        className="w-full h-16 flex-col"
                      >
                        <Shield className="w-5 h-5 mb-2" />
                        Support client
                      </Button>
                    </Link>
                    <Link href="/help">
                      <Button
                        variant="outline"
                        className="w-full h-16 flex-col"
                      >
                        <Settings className="w-5 h-5 mb-2" />
                        Centre d'aide
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}


