"use client";

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Pencil, Trash2, Phone, User, Home, X, Check, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AccountService, AddressRecord } from '@/lib/services/account.service';
import { Breadcrumb } from '@/components/ui/breadcrumb';

interface ExtendedAddress extends AddressRecord {
  delivery_method?: 'standard' | 'express';
  delivery_instructions?: string;
}

interface FormData {
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  country: string;
  delivery_method: 'standard' | 'express';
  delivery_instructions: string;
}

export default function AddressesPage() {
  const { user } = useAuth();
  const [adding, setAdding] = React.useState(false);
  const [addresses, setAddresses] = React.useState<ExtendedAddress[]>([]);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const emptyForm: FormData = { full_name: '', phone: '', address_line: '', city: '', country: 'Bénin', delivery_method: 'standard', delivery_instructions: '' };
  const [form, setForm] = React.useState(emptyForm);

  const loadAddresses = React.useCallback(async () => {
    if (!user?.id) return;
    const res = await AccountService.getAddresses(user.id);
    if (res.success && res.data) setAddresses(res.data as ExtendedAddress[]);
  }, [user?.id]);

  React.useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const handleSave = async () => {
    if (!user?.id) return;
    if (!form.full_name.trim() || !form.address_line.trim()) {
      setError('Nom et adresse sont obligatoires');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (editingId) {
        // Update existing
        console.log('Updating address:', editingId, form);
        const res = await AccountService.updateAddress(editingId, form);
        console.log('Update result:', res);
        if (res.success) {
          await loadAddresses();
          setEditingId(null);
          setForm(emptyForm);
        } else {
          setError(res.error || 'Erreur lors de la mise à jour');
        }
      } else {
        // Create new
        console.log('Creating address:', form);
        const res = await AccountService.addAddress(user.id, form);
        console.log('Create result:', res);
        if (res.success && res.data) {
          setAddresses(a => [res.data as ExtendedAddress, ...a]);
          setAdding(false);
          setForm(emptyForm);
        } else {
          setError(res.error || 'Erreur lors de l\'enregistrement');
        }
      }
    } catch (err) {
      console.error('Error saving address:', err);
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (addr: ExtendedAddress) => {
    setForm({
      full_name: addr.full_name || '',
      phone: addr.phone || '',
      address_line: addr.address_line || '',
      city: addr.city || '',
      country: addr.country || 'Bénin',
      delivery_method: addr.delivery_method || 'standard',
      delivery_instructions: addr.delivery_instructions || ''
    });
    setEditingId(addr.id);
    setAdding(false);
  };

  const handleCancel = () => {
    setAdding(false);
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette adresse ?')) return;
    const res = await AccountService.deleteAddress(id);
    if (res.success) setAddresses(a => a.filter(x => x.id !== id));
  };

  const handleSetDefault = async (id: string) => {
    if (!user?.id) return;
    const res = await AccountService.setDefaultAddress(user.id, id);
    if (res.success) await loadAddresses();
  };

  const isFormOpen = adding || editingId !== null;

  return (
    <ProtectedRoute>
      <div>
        <Breadcrumb items={[{ label: 'Adresses' }]} />

        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Mes adresses</h1>
              <p className="text-sm text-gray-600 mt-1">{addresses.length} adresse(s) enregistrée(s)</p>
            </div>
            {!isFormOpen && (
              <Button onClick={() => setAdding(true)} className="bg-jomionstore-primary hover:bg-orange-700">
                <Plus className="w-4 h-4 mr-2" /> Nouvelle adresse
              </Button>
            )}
          </div>

          {/* Form */}
          {isFormOpen && (
            <Card className="border-jomionstore-primary border-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{editingId ? 'Modifier l\'adresse' : 'Nouvelle adresse'}</span>
                  <Button variant="ghost" size="sm" onClick={handleCancel}><X className="w-4 h-4" /></Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nom complet *</label>
                    <Input
                      placeholder="Jean DUPONT"
                      value={form.full_name}
                      onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Téléphone</label>
                    <Input
                      placeholder="+229 97 00 00 00"
                      value={form.phone}
                      onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Adresse complète *</label>
                  <Input
                    placeholder="Rue, quartier, repère..."
                    value={form.address_line}
                    onChange={(e) => setForm(f => ({ ...f, address_line: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Ville</label>
                    <Input
                      placeholder="Cotonou"
                      value={form.city}
                      onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Pays</label>
                    <select
                      className="w-full p-2 border rounded-md text-sm"
                      value={form.country}
                      onChange={(e) => setForm(f => ({ ...f, country: e.target.value }))}
                    >
                      <option value="Bénin">Bénin</option>
                      <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                      <option value="Togo">Togo</option>
                      <option value="Sénégal">Sénégal</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mode de livraison préféré</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={form.delivery_method === 'standard'}
                        onChange={() => setForm(f => ({ ...f, delivery_method: 'standard' }))}
                      />
                      <span className="text-sm">Standard (2-5 jours)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={form.delivery_method === 'express'}
                        onChange={() => setForm(f => ({ ...f, delivery_method: 'express' }))}
                      />
                      <span className="text-sm">Express (1-2 jours)</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Instructions de livraison</label>
                  <Input
                    placeholder="Ex: Sonner 2 fois, laisser au gardien..."
                    value={form.delivery_instructions}
                    onChange={(e) => setForm(f => ({ ...f, delivery_instructions: e.target.value }))}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-jomionstore-primary hover:bg-orange-700"
                  >
                    {loading ? 'Enregistrement...' : (editingId ? 'Mettre à jour' : 'Enregistrer')}
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>Annuler</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Addresses List */}
          {addresses.length === 0 && !isFormOpen ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">Aucune adresse enregistrée</h3>
                <p className="text-sm text-gray-600 mb-4">Ajoutez une adresse pour faciliter vos livraisons</p>
                <Button onClick={() => setAdding(true)} className="bg-jomionstore-primary hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" /> Ajouter une adresse
                </Button>
              </CardContent>
            </Card>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map(addr => (
                  <Card key={addr.id} className={`relative ${addr.is_default ? 'border-jomionstore-primary border-2' : ''}`}>
                    {addr.is_default && (
                      <Badge className="absolute -top-2 -right-2 bg-jomionstore-primary">
                        <Star className="w-3 h-3 mr-1" /> Par défaut
                      </Badge>
                    )}
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-jomionstore-primary/10 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5 text-jomionstore-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-semibold truncate">{addr.full_name}</span>
                          </div>
                          {addr.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span>{addr.phone}</span>
                          </div>
                          )}
                          <div className="flex items-start gap-2 text-sm text-gray-600">
                            <Home className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span>{addr.address_line}, {addr.city}, {addr.country}</span>
                        </div>
                          {addr.delivery_method && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              {addr.delivery_method === 'express' ? '🚀 Express' : '📦 Standard'}
                            </Badge>
                          )}
                          {addr.delivery_instructions && (
                            <p className="text-xs text-gray-500 mt-2 italic">"{addr.delivery_instructions}"</p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                        {!addr.is_default && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => handleSetDefault(addr.id)}
                          >
                            <Check className="w-3 h-3 mr-1" /> Par défaut
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(addr)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(addr.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
