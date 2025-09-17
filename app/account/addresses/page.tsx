'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Plus, Pencil, Trash2 } from 'lucide-react';

export default function AddressesPage() {
  const [adding, setAdding] = React.useState(false);
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
            <span className="text-gray-900 font-medium">Adresses</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>Mes adresses</CardTitle>
                  <Button onClick={() => setAdding(v => !v)} className="bg-beshop-primary hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" /> Ajouter une adresse
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {adding && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                      <div>
                        <label className="block text-sm mb-2">Nom complet</label>
                        <Input placeholder="Prénom NOM" />
                      </div>
                      <div>
                        <label className="block text-sm mb-2">Téléphone</label>
                        <Input placeholder="+229 ..." />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm mb-2">Adresse</label>
                        <Input placeholder="Rue, quartier..." />
                      </div>
                      <div>
                        <label className="block text-sm mb-2">Ville</label>
                        <Input placeholder="Cotonou" />
                      </div>
                      <div>
                        <label className="block text-sm mb-2">Pays</label>
                        <Input placeholder="Bénin" />
                      </div>
                      <div className="md:col-span-2 flex gap-3">
                        <Button className="bg-beshop-primary hover:bg-blue-700">Enregistrer</Button>
                        <Button variant="outline" onClick={() => setAdding(false)}>Annuler</Button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1,2].map(i => (
                      <div key={i} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-beshop-primary text-white flex items-center justify-center"><MapPin className="w-5 h-5"/></div>
                            <div>
                              <div className="font-medium">Adresse {i}</div>
                              <div className="text-xs text-gray-600">Rue exemple, Cotonou, Bénin</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline"><Pencil className="w-4 h-4"/></Button>
                            <Button variant="outline" className="text-red-600"><Trash2 className="w-4 h-4"/></Button>
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
        <Footer />
      </div>
    </ProtectedRoute>
  );
}

