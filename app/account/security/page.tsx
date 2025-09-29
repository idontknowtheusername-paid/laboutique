"use client";

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Smartphone, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function SecurityPage() {
  const { user, updatePassword, mfaListFactors, mfaEnrollTotp, mfaVerifyEnrollment, mfaDisable, signOutOthers, signOutAll } = useAuth();
  const [password, setPassword] = React.useState('');
  const [pwdMsg, setPwdMsg] = React.useState<string | null>(null);
  const [twoFAEnabled, setTwoFAEnabled] = React.useState(false);
  const [enrollStep, setEnrollStep] = React.useState<'idle'|'qr'|'verify'>('idle');
  const [qrCode, setQrCode] = React.useState<string | undefined>(undefined);
  const [factorId, setFactorId] = React.useState<string | undefined>(undefined);
  const [totpCode, setTotpCode] = React.useState('');
  const [devices, setDevices] = React.useState<Array<{ id: string; device: string; lastActive: string }>>([]);

  React.useEffect(() => {
    (async () => {
      const { factors } = await mfaListFactors();
      const hasTotp = (factors || []).some((f: any) => f.factor_type === 'totp' && f.status === 'verified');
      setTwoFAEnabled(hasTotp);
    })();
  }, [user?.id]);

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
                  <Button onClick={async ()=>{
                    setPwdMsg(null);
                    const r = await updatePassword(password);
                    setPwdMsg(r.success ? 'Mot de passe mis à jour' : r.error || 'Erreur');
                  }}>Mettre à jour</Button>
                  {pwdMsg && (<div className="text-xs text-gray-600">{pwdMsg}</div>)}
                </CardContent>
              </Card>

              {/* 2FA */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><Shield className="w-5 h-5 mr-2"/>Authentification à deux facteurs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!twoFAEnabled ? (
                    <div className="space-y-3">
                      {enrollStep === 'idle' && (
                        <Button variant="outline" onClick={async ()=>{
                          const r = await mfaEnrollTotp();
                          if (r?.factorId) {
                            setFactorId(r.factorId);
                            setQrCode(r.qrCode);
                            setEnrollStep('qr');
                          }
                        }}>Activer 2FA</Button>
                      )}
                      {enrollStep !== 'idle' && qrCode && (
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600">Scannez ce QR Code dans Google Authenticator / Authy puis entrez le code à 6 chiffres.</div>
                          <div className="bg-white border rounded p-2 inline-block" dangerouslySetInnerHTML={{ __html: atob(qrCode.split(',')[1] || '') }} />
                          <Input placeholder="Code à 6 chiffres" value={totpCode} onChange={(e)=>setTotpCode(e.target.value)} />
                          <Button onClick={async ()=>{
                            if (!factorId) return;
                            const vr = await mfaVerifyEnrollment(factorId, totpCode);
                            if (vr.success) {
                              setTwoFAEnabled(true);
                              setEnrollStep('idle');
                            }
                          }}>Vérifier et activer</Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-sm text-green-700">2FA activée sur ce compte.</div>
                      <Button variant="outline" onClick={async ()=>{
                        const { factors } = await mfaListFactors();
                        const totp = (factors || []).find((f: any)=> f.factor_type==='totp' && f.status==='verified');
                        if (totp?.id) {
                          const r = await mfaDisable(totp.id);
                          if (r.success) setTwoFAEnabled(false);
                        }
                      }}>Désactiver 2FA</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Devices/Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><Smartphone className="w-5 h-5 mr-2"/>Appareils connectés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">Gérez vos sessions actives sur d’autres appareils.</div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={async ()=>{ await signOutOthers(); }}>Déconnecter les autres sessions</Button>
                      <Button variant="outline" size="sm" onClick={async ()=>{ await signOutAll(); }}>Déconnecter toutes les sessions</Button>
                    </div>
                  </div>
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

