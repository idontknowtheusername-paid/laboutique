'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Edit, Trash2, Copy, Eye, Calendar, Percent, DollarSign, Users, Target } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminToolbar from '@/components/admin/AdminToolbar';

interface Coupon {
  id: string;
  code: string;
  name: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  min_amount?: number;
  max_discount?: number;
  usage_limit?: number;
  used_count: number;
  status: 'active' | 'inactive' | 'expired';
  start_date: string;
  end_date: string;
  created_at: string;
}

export default function AdminCouponsPage() {
  const [loading, setLoading] = React.useState(true);
  const [coupons, setCoupons] = React.useState<Coupon[]>([]);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [typeFilter, setTypeFilter] = React.useState<string>('all');

  React.useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      // Simuler des coupons
      const mockCoupons: Coupon[] = [
        {
          id: '1',
          code: 'WELCOME10',
          name: 'Bienvenue - 10%',
          type: 'percentage',
          value: 10,
          min_amount: 5000,
          usage_limit: 100,
          used_count: 25,
          status: 'active',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          code: 'SAVE50',
          name: 'Économisez 50 FCFA',
          type: 'fixed',
          value: 50,
          min_amount: 1000,
          usage_limit: 50,
          used_count: 12,
          status: 'active',
          start_date: '2024-01-15',
          end_date: '2024-06-30',
          created_at: '2024-01-15T00:00:00Z'
        },
        {
          id: '3',
          code: 'FREESHIP',
          name: 'Livraison gratuite',
          type: 'free_shipping',
          value: 0,
          min_amount: 10000,
          usage_limit: 200,
          used_count: 45,
          status: 'active',
          start_date: '2024-02-01',
          end_date: '2024-12-31',
          created_at: '2024-02-01T00:00:00Z'
        }
      ];
      setCoupons(mockCoupons);
    } catch (error) {
      console.error('Erreur lors du chargement des coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage': return <Percent className="w-4 h-4" />;
      case 'fixed': return <DollarSign className="w-4 h-4" />;
      case 'free_shipping': return <Target className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const formatValue = (coupon: Coupon) => {
    switch (coupon.type) {
      case 'percentage':
        return `${coupon.value}%`;
      case 'fixed':
        return `${coupon.value} FCFA`;
      case 'free_shipping':
        return 'Livraison gratuite';
      default:
        return coupon.value.toString();
    }
  };

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(search.toLowerCase()) ||
                         coupon.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || coupon.status === statusFilter;
    const matchesType = typeFilter === 'all' || coupon.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Coupons et promotions"
        subtitle="Gestion des codes de réduction et offres spéciales"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Copy className="w-4 h-4 mr-2" />
              Dupliquer
            </Button>
            <Button className="bg-jomiastore-primary hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau coupon
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="coupons" className="space-y-6">
        <TabsList>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="coupons">
          <Card>
            <CardContent className="p-0">
              <AdminToolbar>
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    className="pl-10"
                    placeholder="Rechercher un coupon"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="active">Actifs</SelectItem>
                    <SelectItem value="inactive">Inactifs</SelectItem>
                    <SelectItem value="expired">Expirés</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="percentage">Pourcentage</SelectItem>
                    <SelectItem value="fixed">Montant fixe</SelectItem>
                    <SelectItem value="free_shipping">Livraison gratuite</SelectItem>
                  </SelectContent>
                </Select>
                <div className="ml-auto flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearch('');
                      setStatusFilter('all');
                      setTypeFilter('all');
                    }}
                  >
                    Réinitialiser
                  </Button>
                </div>
              </AdminToolbar>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Liste des coupons ({filteredCoupons.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Coupon
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valeur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilisation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expiration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCoupons.map((coupon) => (
                      <tr key={coupon.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium text-lg">{coupon.code}</div>
                            <div className="text-sm text-gray-500">{coupon.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(coupon.type)}
                            <span className="capitalize">{coupon.type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium">{formatValue(coupon)}</div>
                          {coupon.min_amount && (
                            <div className="text-xs text-gray-500">
                              Min: {coupon.min_amount.toLocaleString()} FCFA
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-jomiastore-primary h-2 rounded-full"
                                style={{ 
                                  width: `${(coupon.used_count / (coupon.usage_limit || 100)) * 100}%` 
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">
                              {coupon.used_count}/{coupon.usage_limit || '∞'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(coupon.status)}>
                            {coupon.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(coupon.end_date).toLocaleDateString('fr-FR')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promotions">
          <Card>
            <CardHeader>
              <CardTitle>Promotions actives</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune promotion active</p>
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer une promotion
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Coupons utilisés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">82</div>
                <p className="text-sm text-gray-500">+12% ce mois</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Économies clients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">125,000 FCFA</div>
                <p className="text-sm text-gray-500">+8% ce mois</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="w-5 h-5" />
                  Taux d'utilisation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">68%</div>
                <p className="text-sm text-gray-500">+5% ce mois</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}