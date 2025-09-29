"use client";

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Plus, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AccountService, AddressRecord } from '@/lib/services/account.service';

export default function AddressesPage() {
  const { user } = useAuth();
  const [adding, setAdding] = React.useState(false);
  const [addresses, setAddresses] = React.useState<AddressRecord[]>([]);
  const [form, setForm] = React.useState({ full_name: '', phone: '', address_line: '', city: '', country: 'Bénin' });
  const [editingId, setEditingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      if (!user?.id) return;
      const res = await AccountService.getAddresses(user.id);
      if (res.success && res.data) setAddresses(res.data);
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
            <span className="text-gray-900 font-medium">Adresses</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>Mes adresses</CardTitle>
                  <Button onClick={() => setAdding(v => !v)} className="bg-jomiastore-primary hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" /> Ajouter une adresse
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {adding && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                      <div>
                        <label className="block text-sm mb-2">Nom complet</label>
                        <Input placeholder="Prénom NOM" value={form.full_name} onChange={(e)=>setForm(f=>({...f, full_name: e.target.value}))} />
                      </div>
                      <div>
                        <label className="block text-sm mb-2">Téléphone</label>
                        <Input placeholder="+229 ..." value={form.phone} onChange={(e)=>setForm(f=>({...f, phone: e.target.value}))} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm mb-2">Adresse</label>
                        <Input placeholder="Rue, quartier..." value={form.address_line} onChange={(e)=>setForm(f=>({...f, address_line: e.target.value}))} />
                      </div>
                      <div>
                        <label className="block text-sm mb-2">Ville</label>
                        <Input placeholder="Cotonou" value={form.city} onChange={(e)=>setForm(f=>({...f, city: e.target.value}))} />
                      </div>
                      <div>
                        <label className="block text-sm mb-2">Pays</label>
                        <Input placeholder="Bénin" value={form.country} onChange={(e)=>setForm(f=>({...f, country: e.target.value}))} />
                      </div>
                      <div className="md:col-span-2 flex gap-3">
                        <Button className="bg-jomiastore-primary hover:bg-blue-700" onClick={async ()=>{
                          if (!user?.id) return;
                          const res = await AccountService.addAddress(user.id, form as any);
                          if (res.success && res.data) {
                            setAddresses(a => [res.data as AddressRecord, ...a]);
                            setAdding(false);
                            setForm({ full_name: '', phone: '', address_line: '', city: '', country: 'Bénin' });
                          }
                        }}>Enregistrer</Button>
                        <Button variant="outline" onClick={() => setAdding(false)}>Annuler</Button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map(addr => (
                      <div key={addr.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-jomiastore-primary text-white flex items-center justify-center"><MapPin className="w-5 h-5"/></div>
                            <div>
                              <div className="font-medium">{addr.full_name}</div>
                              <div className="text-xs text-gray-600">{addr.address_line}, {addr.city}, {addr.country}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!addr.is_default && <Button variant="outline" onClick={async ()=>{
                              if (!user?.id) return;
                              const res = await AccountService.setDefaultAddress(user.id, addr.id);
                              if (res.success) {
                                const reload = await AccountService.getAddresses(user.id);
                                if (reload.success && reload.data) setAddresses(reload.data);
                              }
                            }}>Définir par défaut</Button>}
                            <Button variant="outline"><Pencil className="w-4 h-4"/></Button>
                            <Button variant="outline" className="text-red-600" onClick={async ()=>{
                              const res = await AccountService.deleteAddress(addr.id);
                              if (res.success) setAddresses(a => a.filter(x => x.id !== addr.id));
                            }}><Trash2 className="w-4 h-4"/></Button>
                          </div>
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
                  <CardTitle>Conseils</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 space-y-2">
                  <p>Ajoutez plusieurs adresses pour faciliter vos livraisons.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

