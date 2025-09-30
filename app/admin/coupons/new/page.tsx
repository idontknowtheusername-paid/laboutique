'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, X } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { CouponsService, CreateCouponData } from '@/lib/services/coupons.service';
import { useToast } from '@/components/admin/Toast';

export default function AdminNewCouponPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<CreateCouponData>({
    code: '',
    name: '',
    description: '',
    type: 'percentage',
    value: 0,
    min_amount: undefined,
    max_discount: undefined,
    usage_limit: undefined,
    status: 'active',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await CouponsService.create(formData);
      
      if (result.success && result.data) {
        success('Coupon créé', `Le coupon ${formData.code} a été créé avec succès`);
        router.push('/admin/coupons');
      } else {
        error('Erreur de création', result.error || 'Impossible de créer le coupon');
      }
    } catch (err) {
      error('Erreur inattendue', 'Une erreur est survenue lors de la création du coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateCouponData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code: result }));
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Nouveau coupon"
        subtitle="Créer un nouveau code de réduction"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </div>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations du coupon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code du coupon *</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                    placeholder="WELCOME10"
                    required
                  />
                  <Button type="button" variant="outline" onClick={generateRandomCode}>
                    Générer
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nom du coupon *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Bienvenue - 10%"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Description du coupon..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuration de la réduction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type de réduction *</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Pourcentage</SelectItem>
                    <SelectItem value="fixed">Montant fixe</SelectItem>
                    <SelectItem value="free_shipping">Livraison gratuite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Valeur *</Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || 0)}
                  placeholder={formData.type === 'percentage' ? '10' : '1000'}
                  min="0"
                  step={formData.type === 'percentage' ? '0.1' : '1'}
                  required
                />
                <p className="text-sm text-gray-500">
                  {formData.type === 'percentage' ? 'Pourcentage de réduction' : 
                   formData.type === 'fixed' ? 'Montant en FCFA' : 
                   'Pas de valeur pour la livraison gratuite'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_amount">Montant minimum (FCFA)</Label>
                <Input
                  id="min_amount"
                  type="number"
                  value={formData.min_amount || ''}
                  onChange={(e) => handleInputChange('min_amount', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="5000"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_discount">Réduction maximale (FCFA)</Label>
                <Input
                  id="max_discount"
                  type="number"
                  value={formData.max_discount || ''}
                  onChange={(e) => handleInputChange('max_discount', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="5000"
                  min="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Limites et dates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="usage_limit">Limite d'utilisation</Label>
                <Input
                  id="usage_limit"
                  type="number"
                  value={formData.usage_limit || ''}
                  onChange={(e) => handleInputChange('usage_limit', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="100"
                  min="1"
                />
                <p className="text-sm text-gray-500">Laisser vide pour illimité</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Date de début *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">Date de fin *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            <X className="w-4 h-4 mr-2" />
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Création...' : 'Créer le coupon'}
          </Button>
        </div>
      </form>
    </div>
  );
}