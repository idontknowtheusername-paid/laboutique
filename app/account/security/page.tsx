"use client";

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Smartphone, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function SecurityPage() {
  const { user, signOut } = useAuth();
  const [password, setPassword] = React.useState('');
  const [twoFAEnabled, setTwoFAEnabled] = React.useState(false);
  const [devices, setDevices] = React.useState<Array<{ id: string; device: string; lastActive: string }>>([
    // Placeholder devices
  ]);

  return (
    <ProtectedRoute>
      <div>
        <div className="py-2">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <a href="/" className="hover:text-jomiastore-primary">Accueil</a>
            <span>/</span>
            <a href="/account" className="hover:text-jomiastore-primary">Mon compte</a>
            <span>/</span>
            <span className="text-gray-900 font-medium">Sécurité</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Password */}
              <Card>
                <CardHeader>
                  <CardTitle>Changer le mot de passe</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input type="password" placeholder="Nouveau mot de passe" value={password} onChange={(e)=>setPassword(e.target.value)} />
                  <Button disabled>Mettre à jour</Button>
                  <div className="text-xs text-gray-500">Intégration backend à brancher (Supabase Auth update).</div>
                </CardContent>
              </Card>

              {/* 2FA */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><Shield className="w-5 h-5 mr-2"/>Authentification à deux facteurs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={twoFAEnabled} onChange={(e)=>setTwoFAEnabled(e.target.checked)} />
                    <span>Activer 2FA (TOTP)</span>
                  </div>
                  <div className="text-xs text-gray-500">Interface prête; nécessite génération/validation TOTP côté serveur.</div>
                </CardContent>
              </Card>

              {/* Devices/Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><Smartphone className="w-5 h-5 mr-2"/>Appareils connectés</CardTitle>
                </CardHeader>
                <CardContent>
                  {devices.length === 0 ? (
                    <div className="text-sm text-gray-500">Aucun appareil listé.</div>
                  ) : (
                    <div className="space-y-3">
                      {devices.map((d) => (
                        <div key={d.id} className="flex items-center justify-between p-3 border rounded-md">
                          <div>
                            <div className="font-medium">{d.device}</div>
                            <div className="text-xs text-gray-600">Dernière activité: {d.lastActive}</div>
                          </div>
                          <Button variant="outline" size="sm"><LogOut className="w-4 h-4 mr-2"/>Déconnecter</Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Conseils</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 space-y-2">
                  <p>Utilisez un mot de passe fort et unique pour votre compte.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

