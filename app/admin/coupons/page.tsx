'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Edit, Trash2, Copy, Eye, Calendar, Percent, DollarSign, Users, Target, RefreshCw } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminToolbar from '@/components/admin/AdminToolbar';
import { CouponsService, Coupon, CouponStats } from '@/lib/services/coupons.service';
import { useToast } from '@/components/admin/Toast';
import { useConfirmation } from '@/components/admin/ConfirmationDialog';


export default function AdminCouponsPage() {
  const [loading, setLoading] = React.useState(true);
  const [coupons, setCoupons] = React.useState<Coupon[]>([]);
  const [stats, setStats] = React.useState<CouponStats | null>(null);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [typeFilter, setTypeFilter] = React.useState<string>('all');
  const { success, error, info } = useToast();
  const { confirm, ConfirmationComponent } = useConfirmation();

  const loadCoupons = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await CouponsService.getAll({
        status: statusFilter === 'all' ? undefined : statusFilter as any,
        type: typeFilter === 'all' ? undefined : typeFilter as any,
        search: search || undefined
      }, { page: 1, limit: 100 });

      if (result.success && result.data) {
        setCoupons(result.data);
        success('Données chargées', `${result.data.length} coupons chargés`);
      } else {
        error('Erreur de chargement', result.error || 'Impossible de charger les coupons');
        setCoupons([]);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des coupons:', err);
      error('Erreur inattendue', 'Une erreur est survenue lors du chargement des coupons');
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter, success, error]);

  React.useEffect(() => {
    loadCoupons();
    loadStats();
  }, [loadCoupons]);

  const loadStats = async () => {
    try {
      const result = await CouponsService.getStats();
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
    }
  };

  const handleDeleteCoupon = async (couponId: string, couponCode: string) => {
    confirm(
      'Supprimer le coupon',
      `Êtes-vous sûr de vouloir supprimer le coupon ${couponCode} ? Cette action est irréversible.`,
      async () => {
        try {
          const result = await CouponsService.delete(couponId);
          if (result.success) {
            success('Coupon supprimé', `Le coupon ${couponCode} a été supprimé avec succès`);
            loadCoupons();
            loadStats();
          } else {
            error('Erreur de suppression', result.error || 'Impossible de supprimer le coupon');
          }
        } catch (err) {
          error('Erreur inattendue', 'Une erreur est survenue lors de la suppression du coupon');
        }
      },
      'destructive'
    );
  };

  const handleDuplicateCoupon = async (coupon: Coupon) => {
    try {
      const duplicateData = {
        code: `${coupon.code}_COPY`,
        name: `${coupon.name} (Copie)`,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value,
        min_amount: coupon.min_amount,
        max_discount: coupon.max_discount,
        usage_limit: coupon.usage_limit,
        status: 'inactive' as const,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      const result = await CouponsService.create(duplicateData);
      if (result.success && result.data) {
        success('Coupon dupliqué', `Le coupon ${duplicateData.code} a été créé avec succès`);
        loadCoupons();
        loadStats();
      } else {
        error('Erreur de duplication', result.error || 'Impossible de dupliquer le coupon');
      }
    } catch (err) {
      error('Erreur inattendue', 'Une erreur est survenue lors de la duplication du coupon');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    success('Code copié', `Le code ${code} a été copié dans le presse-papiers`);
  };

  // Test de connexion à la base de données
  const testDatabaseConnection = async () => {
    try {
      const result = await CouponsService.getStats();
      if (result.success) {
        success('Connexion réussie', 'La base de données est accessible');
      } else {
        error('Erreur de connexion', result.error || 'Impossible de se connecter à la base');
      }
    } catch (err) {
      error('Erreur de connexion', 'Impossible de se connecter à la base de données');
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
            <Button variant="outline" onClick={testDatabaseConnection}>
              🔍 Test DB
            </Button>
            <Button variant="outline" onClick={loadCoupons} disabled={loading}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Rafraîchir
            </Button>
            <Button 
              className="bg-jomiastore-primary hover:bg-blue-700"
              onClick={() => window.location.href = '/admin/coupons/new'}
            >
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
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleCopyCode(coupon.code)}
                              title="Copier le code"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDuplicateCoupon(coupon)}
                              title="Dupliquer le coupon"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => window.location.href = `/admin/coupons/${coupon.id}/edit`}
                              title="Modifier le coupon"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600"
                              onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                              title="Supprimer le coupon"
                            >
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Total coupons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.total_coupons || 0}</div>
                <p className="text-sm text-gray-500">Coupons créés</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Coupons actifs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.active_coupons || 0}</div>
                <p className="text-sm text-gray-500">En cours d'utilisation</p>
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
                <div className="text-3xl font-bold">
                  {stats?.total_discount ? new Intl.NumberFormat('fr-BJ', {
                    style: 'currency',
                    currency: 'XOF',
                    minimumFractionDigits: 0,
                  }).format(stats.total_discount) : '0 FCFA'}
                </div>
                <p className="text-sm text-gray-500">Total des réductions</p>
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
                <div className="text-3xl font-bold">
                  {stats?.average_usage_rate ? Math.round(stats.average_usage_rate) : 0}%
                </div>
                <p className="text-sm text-gray-500">Utilisation moyenne</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <ConfirmationComponent />
    </div>
  );
}