"use client";

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Package, Upload, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AccountService, ReturnRequest } from '@/lib/services/account.service';
import { useSearchParams } from 'next/navigation';
import { Breadcrumb } from '@/components/ui/breadcrumb';

export default function ReturnsPage() {
  const { user } = useAuth();
  const [creating, setCreating] = React.useState(false);
  const [returns, setReturns] = React.useState<ReturnRequest[]>([]);
  const searchParams = useSearchParams();
  const initialOrderId = searchParams?.get('order') || '';
  const [form, setForm] = React.useState({ order_id: initialOrderId, product_name: '', reason: '' });
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      if (!user?.id) return;
      const res = await AccountService.getReturnRequests(user.id);
      if (res.success && res.data) setReturns(res.data);
    })();
  }, [user?.id]);
  return (
    <ProtectedRoute>
      <div>
        <div className="py-2">
          <Breadcrumb items={[{ label: 'Retours & Remboursements' }]} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>Retours</CardTitle>
                  <Button onClick={() => setCreating(v => !v)} className="bg-jomionstore-primary hover:bg-blue-700">
                    Créer une demande
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {creating && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                      <div>
                        <label className="block text-sm mb-2">ID de commande</label>
                        <Input placeholder="id de la commande" value={form.order_id} onChange={(e)=>setForm(f=>({...f, order_id: e.target.value}))} />
                      </div>
                      <div>
                        <label className="block text-sm mb-2">Produit</label>
                        <Input placeholder="Nom du produit" value={form.product_name} onChange={(e)=>setForm(f=>({...f, product_name: e.target.value}))} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm mb-2">Motif</label>
                        <Textarea rows={3} placeholder="Expliquez la raison du retour" value={form.reason} onChange={(e)=>setForm(f=>({...f, reason: e.target.value}))} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm mb-2">Preuve (photo)</label>
                        <div className="flex items-center gap-3">
                          <Button variant="outline"><Upload className="w-4 h-4 mr-2"/>Téléverser</Button>
                          <span className="text-xs text-gray-600">PNG/JPG, max 5 Mo</span>
                        </div>
                      </div>
                      <div className="md:col-span-2 flex gap-3">
                        <Button className="bg-jomionstore-primary hover:bg-blue-700" onClick={async ()=>{
                          if (!user?.id) return;
                          const res = await AccountService.createReturnRequest(user.id, form as any);
                          if (res.success && res.data) {
                            setReturns(r => [res.data as ReturnRequest, ...r]);
                            setCreating(false);
                            setForm({ order_id: initialOrderId, product_name: '', reason: '' });
                          }
                        }}>Soumettre</Button>
                        <Button variant="outline" onClick={() => setCreating(false)}>Annuler</Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {returns.map(rr => (
                      <div key={rr.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-jomionstore-primary text-white flex items-center justify-center"><Package className="w-5 h-5"/></div>
                            <div>
                              <div className="font-medium">Retour #{rr.id}</div>
                              <div className="text-xs text-gray-600">Commande {rr.order_id} • Statut: {rr.status}</div>
                            </div>
                          </div>
                          <Button variant="outline" onClick={()=> setExpandedId(expandedId === rr.id ? null : rr.id)}>
                            <FileText className="w-4 h-4 mr-2"/>Détails
                          </Button>
                        </div>
                        {expandedId === rr.id && (
                          <div className="mt-3 text-sm text-gray-700">
                            {rr.product_name && <div><span className="text-gray-500">Produit:</span> {rr.product_name}</div>}
                            {rr.reason && <div className="mt-1"><span className="text-gray-500">Motif:</span> {rr.reason}</div>}
                            <div className="mt-1"><span className="text-gray-500">Créé le:</span> {rr.created_at ? new Date(rr.created_at).toLocaleString('fr-FR') : '-'}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Politique de retour</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 space-y-2">
                  <p>Vous disposez de 14 jours après la livraison pour effectuer une demande de retour.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

