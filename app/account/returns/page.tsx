'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Package, Upload, FileText } from 'lucide-react';

export default function ReturnsPage() {
  const [creating, setCreating] = React.useState(false);
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
            <span className="text-gray-900 font-medium">Retours & Remboursements</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>Retours</CardTitle>
                  <Button onClick={() => setCreating(v => !v)} className="bg-beshop-primary hover:bg-blue-700">
                    Créer une demande
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {creating && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                      <div>
                        <label className="block text-sm mb-2">Numéro de commande</label>
                        <Input placeholder="#ORD-..." />
                      </div>
                      <div>
                        <label className="block text-sm mb-2">Produit</label>
                        <Input placeholder="Nom du produit" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm mb-2">Motif</label>
                        <Textarea rows={3} placeholder="Expliquez la raison du retour" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm mb-2">Preuve (photo)</label>
                        <div className="flex items-center gap-3">
                          <Button variant="outline"><Upload className="w-4 h-4 mr-2"/>Téléverser</Button>
                          <span className="text-xs text-gray-600">PNG/JPG, max 5 Mo</span>
                        </div>
                      </div>
                      <div className="md:col-span-2 flex gap-3">
                        <Button className="bg-beshop-primary hover:bg-blue-700">Soumettre</Button>
                        <Button variant="outline" onClick={() => setCreating(false)}>Annuler</Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {[1,2].map(i => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-beshop-primary text-white flex items-center justify-center"><Package className="w-5 h-5"/></div>
                          <div>
                            <div className="font-medium">Retour #{i}</div>
                            <div className="text-xs text-gray-600">Commande #ORD-1234 • Statut: En cours</div>
                          </div>
                        </div>
                        <Button variant="outline"><FileText className="w-4 h-4 mr-2"/>Détails</Button>
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
        <Footer />
      </div>
    </ProtectedRoute>
  );
}

