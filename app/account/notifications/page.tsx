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
import { useAuth } from '@/contexts/AuthContext';
import { AccountService, NotificationPrefs } from '@/lib/services/account.service';
import { Breadcrumb } from '@/components/ui/breadcrumb';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [prefs, setPrefs] = React.useState<NotificationPrefs | null>(null);

  React.useEffect(() => {
    (async () => {
      if (!user?.id) return;
      const res = await AccountService.getNotificationPrefs(user.id);
      if (res.success) setPrefs(res.data as NotificationPrefs);
    })();
  }, [user?.id]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-jomionstore-background">
        <Header />
        <CategoryMenu />
        <div className="container py-8">
          <Breadcrumb items={[{ label: 'Notifications' }]} />

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
                    <Switch checked={!!prefs?.email_orders} onCheckedChange={(v) => setPrefs(p => (p ? { ...p, email_orders: !!v } : p))} />
                  </div>
                  <div className="p-4 border rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4"/>
                      <div>
                        <div className="font-medium">Emails - Promotions</div>
                        <div className="text-xs text-gray-600">Offres, coupons, recommandations</div>
                      </div>
                    </div>
                    <Switch checked={!!prefs?.email_promos} onCheckedChange={(v) => setPrefs(p => (p ? { ...p, email_promos: !!v } : p))} />
                  </div>
                  <div className="p-4 border rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-4 h-4"/>
                      <div>
                        <div className="font-medium">SMS - Commandes</div>
                        <div className="text-xs text-gray-600">Mises à jour expédition</div>
                      </div>
                    </div>
                    <Switch checked={!!prefs?.sms_orders} onCheckedChange={(v) => setPrefs(p => (p ? { ...p, sms_orders: !!v } : p))} />
                  </div>
                  <div className="p-4 border rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-4 h-4"/>
                      <div>
                        <div className="font-medium">SMS - Promotions</div>
                        <div className="text-xs text-gray-600">Offres et alertes</div>
                      </div>
                    </div>
                    <Switch checked={!!prefs?.sms_promos} onCheckedChange={(v) => setPrefs(p => (p ? { ...p, sms_promos: !!v } : p))} />
                  </div>
                  <div className="p-4 border rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="w-4 h-4"/>
                      <div>
                        <div className="font-medium">Notifications push</div>
                        <div className="text-xs text-gray-600">Mises à jour en temps réel</div>
                      </div>
                    </div>
                    <Switch checked={!!prefs?.push_all} onCheckedChange={(v) => setPrefs(p => (p ? { ...p, push_all: !!v } : p))} />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button disabled={!prefs} className="bg-jomionstore-primary hover:bg-blue-700" onClick={async ()=>{
                      if (!user?.id || !prefs) return;
                      await AccountService.upsertNotificationPrefs(user.id, prefs);
                    }}>Enregistrer</Button>
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

