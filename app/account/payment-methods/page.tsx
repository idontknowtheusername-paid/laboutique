'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreditCard, Plus, Trash2, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AccountService, PaymentMethod } from '@/lib/services/account.service';

export default function PaymentMethodsPage() {
  const { user } = useAuth();
  const [adding, setAdding] = React.useState(false);
  const [methods, setMethods] = React.useState<PaymentMethod[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({ holder_name: '', brand: 'Visa', last4: '4242', exp_month: 8, exp_year: 2027 });

  React.useEffect(() => {
    (async () => {
      if (!user?.id) return;
      const res = await AccountService.getPaymentMethods(user.id);
      if (res.success && res.data) setMethods(res.data);
    })();
  }, [user?.id]);
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-jomiastore-background">
        <Header />
        <CategoryMenu />
        <div className="container py-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <a href="/" className="hover:text-jomiastore-primary">Accueil</a>
            <span>/</span>
            <a href="/account" className="hover:text-jomiastore-primary">Mon compte</a>
            <span>/</span>
            <span className="text-gray-900 font-medium">Moyens de paiement</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>Moyens de paiement</CardTitle>
                  <Button onClick={() => setAdding(v => !v)} className="bg-jomiastore-primary hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" /> Ajouter une carte
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {adding && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                      <div>
                        <label className="block text-sm mb-2">Numéro de carte</label>
                        <Input placeholder="4242 4242 4242 4242" />
                      </div>
                      <div>
                        <label className="block text-sm mb-2">Nom sur la carte</label>
                        <Input placeholder="NOM PRÉNOM" value={form.holder_name} onChange={(e) => setForm(f => ({...f, holder_name: e.target.value}))} />
                      </div>
                      <div>
                        <label className="block text-sm mb-2">Expiration</label>
                        <Input placeholder="MM/AA" value={`${form.exp_month}/${String(form.exp_year).toString().slice(2)}`} onChange={() => {}} />
                      </div>
                      <div>
                        <label className="block text-sm mb-2">CVC</label>
                        <Input placeholder="123" />
                      </div>
                      <div className="md:col-span-2 flex gap-3">
                        <Button disabled={saving} className="bg-jomiastore-primary hover:bg-blue-700" onClick={async () => {
                          if (!user?.id) return;
                          setSaving(true);
                          const res = await AccountService.addPaymentMethod(user.id, form as any);
                          setSaving(false);
                          if (res.success && res.data) {
                            setMethods(m => [res.data as PaymentMethod, ...m]);
                            setAdding(false);
                          }
                        }}>Enregistrer</Button>
                        <Button variant="outline" onClick={() => setAdding(false)}>Annuler</Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {methods.map(pm => (
                      <div key={pm.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-jomiastore-primary text-white flex items-center justify-center"><CreditCard className="w-5 h-5"/></div>
                          <div>
                            <div className="font-medium">{pm.brand || 'Carte'} se terminant par {pm.last4 || '****'}</div>
                            <div className="text-xs text-gray-600">Expire {pm.exp_month}/{pm.exp_year} • Titulaire: {pm.holder_name || '—'}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!pm.is_default && <Button variant="outline" onClick={async () => {
                            if (!user?.id) return;
                            const res = await AccountService.setDefaultPaymentMethod(user.id, pm.id);
                            if (res.success) {
                              const reload = await AccountService.getPaymentMethods(user.id);
                              if (reload.success && reload.data) setMethods(reload.data);
                            }
                          }}>Définir par défaut</Button>}
                          <Button variant="outline" className="text-red-600" onClick={async () => {
                            const res = await AccountService.deletePaymentMethod(pm.id);
                            if (res.success) setMethods(m => m.filter(x => x.id !== pm.id));
                          }}><Trash2 className="w-4 h-4"/></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Sécurité</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-center gap-2"><Shield className="w-4 h-4"/> Paiements chiffrés</div>
                  <div className="flex items-center gap-2"><Shield className="w-4 h-4"/> 3D Secure</div>
                  <div className="flex items-center gap-2"><Shield className="w-4 h-4"/> Cartes et Mobile Money</div>
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

