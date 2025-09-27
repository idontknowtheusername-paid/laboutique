'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SettingsService } from '@/lib/services/settings.service';
import { Badge } from '@/components/ui/badge';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function AdminSettingsPage() {
  const [saving, setSaving] = React.useState(false);
  const [values, setValues] = React.useState<Record<string, any>>({});

  React.useEffect(() => {
    (async () => {
      const res = await SettingsService.getAll();
      if (res.success && res.data) setValues(res.data as Record<string, any>);
    })();
  }, []);

  async function saveGroup(prefix: string, entries: Array<[string, any]>) {
    setSaving(true);
    await SettingsService.upsertMany(entries.map(([k, v]) => ({ group: prefix as any, key: k, value: v })));
    setSaving(false);
  }

  const get = (k: string, fallback: any = '') => values[k] ?? fallback;
  const set = (k: string, v: any) => setValues((s) => ({ ...s, [k]: v }));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Paramètres"
        subtitle="Configuration de l'application"
        actions={
          <Badge className={saving ? "bg-yellow-600" : "bg-green-600"}>
            {saving ? "Enregistrement..." : "Synchronisé"}
          </Badge>
        }
      />

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="flex flex-wrap gap-2 mt-4 mb-6">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="appearance">Apparence</TabsTrigger>
          <TabsTrigger value="orders">Commandes</TabsTrigger>
          <TabsTrigger value="payments">Paiements & Expédition</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Général</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Nom du site</label>
                <Input
                  value={get("general.site_name", "La Boutique B")}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    set("general.site_name", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Email de contact</label>
                <Input
                  value={get("general.contact_email", "contact@example.com")}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    set("general.contact_email", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Devise par défaut</label>
                <Select
                  value={get("general.currency", "XOF")}
                  onValueChange={(v: string) => set("general.currency", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Devise" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="XOF">XOF</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button
                  className="bg-jomiastore-primary hover:bg-blue-700"
                  onClick={() =>
                    saveGroup("general", [
                      ["site_name", get("general.site_name")],
                      ["contact_email", get("general.contact_email")],
                      ["currency", get("general.currency")],
                    ])
                  }
                >
                  Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Apparence</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Couleur primaire</label>
                <Input
                  value={get("appearance.primary_color", "#1E40AF")}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    set("appearance.primary_color", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Logo URL</label>
                <Input
                  value={get("appearance.logo_url", "")}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    set("appearance.logo_url", e.target.value)
                  }
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button
                  className="bg-jomiastore-primary hover:bg-blue-700"
                  onClick={() =>
                    saveGroup("appearance", [
                      ["primary_color", get("appearance.primary_color")],
                      ["logo_url", get("appearance.logo_url")],
                    ])
                  }
                >
                  Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Commandes</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">
                  Délai d'annulation (minutes)
                </label>
                <Input
                  type="number"
                  value={get("orders.cancel_window_min", 15)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    set("orders.cancel_window_min", Number(e.target.value))
                  }
                />
              </div>
              <div>
                <label className="block text-sm mb-2">
                  Email notifications
                </label>
                <Select
                  value={String(get("orders.email_notifications", "true"))}
                  onValueChange={(v: string) =>
                    set("orders.email_notifications", v === "true")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Oui/Non" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Activées</SelectItem>
                    <SelectItem value="false">Désactivées</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button
                  className="bg-jomiastore-primary hover:bg-blue-700"
                  onClick={() =>
                    saveGroup("orders", [
                      ["cancel_window_min", get("orders.cancel_window_min")],
                      [
                        "email_notifications",
                        get("orders.email_notifications"),
                      ],
                    ])
                  }
                >
                  Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Paiements & Expédition</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">
                  Frais de service (%)
                </label>
                <Input
                  type="number"
                  value={get("payments.service_fee_pct", 2)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    set("payments.service_fee_pct", Number(e.target.value))
                  }
                />
              </div>
              <div>
                <label className="block text-sm mb-2">
                  Transporteur par défaut
                </label>
                <Input
                  value={get("shipping.default_carrier", "Local Express")}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    set("shipping.default_carrier", e.target.value)
                  }
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button
                  className="bg-jomiastore-primary hover:bg-blue-700"
                  onClick={() =>
                    SettingsService.upsertMany([
                      {
                        group: "payments",
                        key: "service_fee_pct",
                        value: get("payments.service_fee_pct"),
                      },
                      {
                        group: "shipping",
                        key: "default_carrier",
                        value: get("shipping.default_carrier"),
                      },
                    ])
                  }
                >
                  Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">
                  2FA requis pour admin
                </label>
                <Select
                  value={String(get("security.require_admin_2fa", "false"))}
                  onValueChange={(v: string) =>
                    set("security.require_admin_2fa", v === "true")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Oui/Non" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Oui</SelectItem>
                    <SelectItem value="false">Non</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm mb-2">
                  Tentatives max de login
                </label>
                <Input
                  type="number"
                  value={get("security.max_login_attempts", 5)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    set("security.max_login_attempts", Number(e.target.value))
                  }
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button
                  className="bg-jomiastore-primary hover:bg-blue-700"
                  onClick={() =>
                    saveGroup("security", [
                      ["require_admin_2fa", get("security.require_admin_2fa")],
                      [
                        "max_login_attempts",
                        get("security.max_login_attempts"),
                      ],
                    ])
                  }
                >
                  Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Mode maintenance</label>
                <Select
                  value={String(get("maintenance.enabled", "false"))}
                  onValueChange={(v: string) =>
                    set("maintenance.enabled", v === "true")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Oui/Non" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Activé</SelectItem>
                    <SelectItem value="false">Désactivé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm mb-2">
                  Message maintenance
                </label>
                <Input
                  value={get(
                    "maintenance.message",
                    "Le site est en maintenance."
                  )}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    set("maintenance.message", e.target.value)
                  }
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button
                  className="bg-jomiastore-primary hover:bg-blue-700"
                  onClick={() =>
                    saveGroup("maintenance", [
                      ["enabled", get("maintenance.enabled")],
                      ["message", get("maintenance.message")],
                    ])
                  }
                >
                  Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

