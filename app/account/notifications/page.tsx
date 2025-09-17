'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, MessageSquare } from 'lucide-react';

export default function NotificationsPage() {
  const [prefs, setPrefs] = React.useState({
    emailOrders: true,
    emailPromos: false,
    smsOrders: false,
    smsPromos: false,
    pushAll: true,
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-beshop-background">
        <Header />
        <CategoryMenu />
        <div className="container py-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <a href="/" className="hover:text-beshop-primary">Accueil</a>
            <span>/</span>
            <a href="/account" className="hover:text-beshop-primary">Mon compte</a>
            <span>/</span>
            <span className="text-gray-900 font-medium">Notifications</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Préférences de notification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4"/>
                      <div>
                        <div className="font-medium">Emails - Commandes</div>
                        <div className="text-xs text-gray-600">Confirmations, expéditions, retours</div>
                      </div>
                    </div>
                    <Switch checked={prefs.emailOrders} onCheckedChange={(v) => setPrefs(p => ({...p, emailOrders: !!v}))} />
                  </div>
                  <div className="p-4 border rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4"/>
                      <div>
                        <div className="font-medium">Emails - Promotions</div>
                        <div className="text-xs text-gray-600">Offres, coupons, recommandations</div>
                      </div>
                    </div>
                    <Switch checked={prefs.emailPromos} onCheckedChange={(v) => setPrefs(p => ({...p, emailPromos: !!v}))} />
                  </div>
                  <div className="p-4 border rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-4 h-4"/>
                      <div>
                        <div className="font-medium">SMS - Commandes</div>
                        <div className="text-xs text-gray-600">Mises à jour expédition</div>
                      </div>
                    </div>
                    <Switch checked={prefs.smsOrders} onCheckedChange={(v) => setPrefs(p => ({...p, smsOrders: !!v}))} />
                  </div>
                  <div className="p-4 border rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-4 h-4"/>
                      <div>
                        <div className="font-medium">SMS - Promotions</div>
                        <div className="text-xs text-gray-600">Offres et alertes</div>
                      </div>
                    </div>
                    <Switch checked={prefs.smsPromos} onCheckedChange={(v) => setPrefs(p => ({...p, smsPromos: !!v}))} />
                  </div>
                  <div className="p-4 border rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="w-4 h-4"/>
                      <div>
                        <div className="font-medium">Notifications push</div>
                        <div className="text-xs text-gray-600">Mises à jour en temps réel</div>
                      </div>
                    </div>
                    <Switch checked={prefs.pushAll} onCheckedChange={(v) => setPrefs(p => ({...p, pushAll: !!v}))} />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button className="bg-beshop-primary hover:bg-blue-700">Enregistrer</Button>
                    <Button variant="outline">Réinitialiser</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Conseil</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600">Vous pouvez gérer vos consentements à tout moment.</CardContent>
              </Card>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}

