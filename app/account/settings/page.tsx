"use client";

import React from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Settings, User, Bell, Shield, Globe, Trash2,
  ChevronRight, MapPin, CreditCard, FileText, Heart,
  Lock, Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Breadcrumb } from '@/components/ui/breadcrumb';

export default function SettingsPage() {
  const { user, profile } = useAuth();
  const [privacySettings, setPrivacySettings] = React.useState({
    dataSharing: true,
    publicProfile: false,
    analytics: true
  });

  const handleDeleteAccount = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) return;
    console.log('Account deletion requested');
  };

  const settingsLinks = [
    { icon: User, title: 'Profil', description: 'Modifier vos informations personnelles', href: '/account/profile', color: 'bg-blue-100 text-blue-600' },
    { icon: Lock, title: 'Sécurité', description: 'Mot de passe et authentification 2FA', href: '/account/security', color: 'bg-purple-100 text-purple-600' },
    { icon: Bell, title: 'Notifications', description: 'Gérer vos préférences de notification', href: '/account/notifications', color: 'bg-orange-100 text-orange-600' },
    { icon: MapPin, title: 'Adresses', description: 'Gérer vos adresses de livraison', href: '/account/addresses', color: 'bg-green-100 text-green-600' },
    { icon: CreditCard, title: 'Paiement', description: 'Moyens de paiement enregistrés', href: '/account/payment-methods', color: 'bg-indigo-100 text-indigo-600' },
    { icon: FileText, title: 'Factures', description: 'Historique de vos factures', href: '/account/invoices', color: 'bg-gray-100 text-gray-600' },
  ];

  return (
    <ProtectedRoute>
      <div>
        <Breadcrumb items={[{ label: 'Paramètres' }]} />

        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Paramètres</h1>
            <p className="text-sm text-gray-600 mt-1">Gérez votre compte et vos préférences</p>
          </div>

          {/* Account Summary */}
          <Card className="bg-gradient-to-r from-jomionstore-primary/10 to-orange-50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-jomionstore-primary flex items-center justify-center text-white text-xl font-bold">
                  {profile?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-lg">
                    {profile?.first_name && profile?.last_name
                      ? `${profile.first_name} ${profile.last_name}`
                      : user?.email?.split('@')[0]}
                  </div>
                  <div className="text-sm text-gray-600">{user?.email}</div>
                  <Badge variant="outline" className="mt-1 text-xs">
                    Membre depuis {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                      : 'récemment'}
                  </Badge>
                </div>
                <Link href="/account/profile">
                  <Button variant="outline" size="sm">Modifier</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Settings Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Paramètres du compte</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {settingsLinks.map((item, idx) => (
                  <Link key={idx} href={item.href}>
                    <div className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.title}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Eye className="w-5 h-5" />
                Confidentialité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium text-sm">Partage de données</div>
                  <div className="text-xs text-gray-500">Améliorer votre expérience avec des recommandations</div>
                </div>
                <Switch
                  checked={privacySettings.dataSharing}
                  onCheckedChange={(v) => setPrivacySettings(p => ({ ...p, dataSharing: v }))}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium text-sm">Profil public</div>
                  <div className="text-xs text-gray-500">Permettre aux autres de voir votre profil</div>
                </div>
                <Switch
                  checked={privacySettings.publicProfile}
                  onCheckedChange={(v) => setPrivacySettings(p => ({ ...p, publicProfile: v }))}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium text-sm">Analytics</div>
                  <div className="text-xs text-gray-500">Nous aider à améliorer le site</div>
                </div>
                <Switch
                  checked={privacySettings.analytics}
                  onCheckedChange={(v) => setPrivacySettings(p => ({ ...p, analytics: v }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Language & Region */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="w-5 h-5" />
                Langue et région
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Langue</label>
                  <select className="w-full p-2 border rounded-md text-sm">
                    <option value="fr">🇫🇷 Français</option>
                    <option value="en">🇬🇧 English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Devise</label>
                  <select className="w-full p-2 border rounded-md text-sm">
                    <option value="XOF">XOF (Franc CFA)</option>
                    <option value="EUR">EUR (Euro)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 text-base">
                <Trash2 className="w-5 h-5" />
                Zone dangereuse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="font-medium text-red-800 text-sm">Supprimer le compte</div>
                <div className="text-xs text-red-600 mt-1">
                  Cette action est irréversible. Toutes vos données, commandes et historique seront définitivement supprimés.
                </div>
                <Button
                  variant="destructive" 
                  size="sm"
                  className="mt-3"
                  onClick={handleDeleteAccount}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer mon compte
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
