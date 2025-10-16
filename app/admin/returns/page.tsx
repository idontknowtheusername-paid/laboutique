'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Package, DollarSign, Clock, CheckCircle, XCircle, AlertTriangle, FileText, Truck, CreditCard, RefreshCw, Eye, Edit, Trash2 } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminToolbar from '@/components/admin/AdminToolbar';
import { ReturnsService, ReturnRequest, ReturnStats } from '@/lib/services/returns.service';
import { useToast } from '@/components/admin/Toast';
import { useConfirmation } from '@/components/admin/ConfirmationDialog';


export default function AdminReturnsPage() {
  const [loading, setLoading] = React.useState(true);
  const [returns, setReturns] = React.useState<ReturnRequest[]>([]);
  const [stats, setStats] = React.useState<ReturnStats | null>(null);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [typeFilter, setTypeFilter] = React.useState<string>('all');
  const { success, error, info } = useToast();
  const { confirm, ConfirmationComponent } = useConfirmation();

  React.useEffect(() => {
    loadReturns();
    loadStats();
  }, [search, statusFilter, typeFilter]);

  const loadReturns = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await ReturnsService.getAll({
        status: statusFilter === 'all' ? undefined : statusFilter as any,
        return_type: typeFilter === 'all' ? undefined : typeFilter as any,
        search: search || undefined
      }, { page: 1, limit: 100 });

      if (result.success && result.data) {
        setReturns(result.data);
        success('Données chargées', `${result.data.length} demandes de retour chargées`);
      } else {
        error('Erreur de chargement', result.error || 'Impossible de charger les demandes de retour');
        setReturns([]);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des retours:', err);
      error('Erreur inattendue', 'Une erreur est survenue lors du chargement des demandes');
      setReturns([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter, success, error]);

  const loadStats = async () => {
    try {
      const result = await ReturnsService.getStats();
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
    }
  };

  const handleDeleteReturn = async (returnId: string, orderId: string) => {
    confirm(
      'Supprimer la demande',
      `Êtes-vous sûr de vouloir supprimer la demande de retour pour la commande ${orderId} ? Cette action est irréversible.`,
      async () => {
        try {
          const result = await ReturnsService.delete(returnId);
          if (result.success) {
            success('Demande supprimée', 'La demande de retour a été supprimée avec succès');
            loadReturns();
            loadStats();
          } else {
            error('Erreur de suppression', result.error || 'Impossible de supprimer la demande');
          }
        } catch (err) {
          error('Erreur inattendue', 'Une erreur est survenue lors de la suppression');
        }
      }
    );
  };

  // Test de connexion à la base de données
  const testDatabaseConnection = async () => {
    try {
      const result = await ReturnsService.getStats();
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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'refund': return <CreditCard className="w-4 h-4" />;
      case 'exchange': return <ArrowLeft className="w-4 h-4" />;
      case 'store_credit': return <DollarSign className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('fr-BJ', {
    style: 'currency', currency: 'XOF', minimumFractionDigits: 0,
  }).format(price);

  const filteredReturns = returns.filter(returnRequest => {
    const matchesSearch = returnRequest.order_id.toLowerCase().includes(search.toLowerCase()) ||
                         returnRequest.customer_name.toLowerCase().includes(search.toLowerCase()) ||
                         returnRequest.product_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || returnRequest.status === statusFilter;
    const matchesType = typeFilter === 'all' || returnRequest.return_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Retours et remboursements"
        subtitle="Gestion des demandes de retour et remboursements"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={testDatabaseConnection}>
              🔍 Test DB
            </Button>
            <Button variant="outline" onClick={loadReturns} disabled={loading}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Rafraîchir
            </Button>
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="returns" className="space-y-6">
        <TabsList>
          <TabsTrigger value="returns">Demandes de retour</TabsTrigger>
          <TabsTrigger value="refunds">Remboursements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="returns">
          <Card>
            <CardContent className="p-0">
              <AdminToolbar>
                <div className="relative w-full md:w-72">
                  <Input
                    placeholder="Rechercher par commande, client ou produit"
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
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="approved">Approuvées</SelectItem>
                    <SelectItem value="processing">En cours</SelectItem>
                    <SelectItem value="completed">Terminées</SelectItem>
                    <SelectItem value="rejected">Rejetées</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="refund">Remboursement</SelectItem>
                    <SelectItem value="exchange">Échange</SelectItem>
                    <SelectItem value="store_credit">Crédit magasin</SelectItem>
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
              <CardTitle>Demandes de retour ({filteredReturns.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Demande
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReturns.map((returnRequest) => (
                      <tr key={returnRequest.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium">#{returnRequest.id}</div>
                            <div className="text-sm text-gray-500">{returnRequest.order_id}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium">{returnRequest.customer_name}</div>
                            <div className="text-sm text-gray-500">{returnRequest.customer_email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="max-w-xs truncate">{returnRequest.product_name}</div>
                          <div className="text-sm text-gray-500">{returnRequest.reason}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(returnRequest.return_type)}
                            <span className="capitalize">{returnRequest.return_type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {formatPrice(returnRequest.refund_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(returnRequest.status)}
                            <Badge className={getStatusColor(returnRequest.status)}>
                              {returnRequest.status}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(returnRequest.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => window.location.href = `/admin/returns/${returnRequest.id}`}
                              title="Voir les détails"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => window.location.href = `/admin/returns/${returnRequest.id}`}
                              title="Modifier la demande"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600"
                              onClick={() => handleDeleteReturn(returnRequest.id, returnRequest.order_id)}
                              title="Supprimer la demande"
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

        <TabsContent value="refunds">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  Total remboursé
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats?.total_refunded ? new Intl.NumberFormat('fr-BJ', {
                    style: 'currency',
                    currency: 'XOF',
                    minimumFractionDigits: 0,
                  }).format(stats.total_refunded) : '0 FCFA'}
                </div>
                <p className="text-sm text-gray-500">Montant total remboursé</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-orange-500" />
                  Demandes en attente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.pending_returns || 0}</div>
                <p className="text-sm text-gray-500">En attente de traitement</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Demandes terminées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.completed_returns || 0}</div>
                <p className="text-sm text-gray-500">Traitement terminé</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Taux de retour
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats?.return_rate ? Math.round(stats.return_rate * 100) / 100 : 0}%
                </div>
                <p className="text-sm text-gray-500">Pourcentage de retours</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Remboursements récents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {returns.filter(r => r.status === 'completed').map((returnRequest) => (
                  <div key={returnRequest.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{returnRequest.customer_name}</div>
                        <div className="text-sm text-gray-500">{returnRequest.product_name}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(returnRequest.processed_at!).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        {formatPrice(returnRequest.refund_amount)}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {returnRequest.return_type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Raisons de retour</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.top_reasons && stats.top_reasons.length > 0 ? (
                    stats.top_reasons.map((reason, index) => (
                      <div key={reason.reason} className="flex items-center justify-between">
                        <span className="truncate">{reason.reason}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                index === 0 ? 'bg-red-500' : 
                                index === 1 ? 'bg-yellow-500' : 
                                'bg-blue-500'
                              }`}
                              style={{ width: `${reason.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{Math.round(reason.percentage)}%</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>Aucune donnée disponible</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Types de retour</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.return_types && stats.return_types.length > 0 ? (
                    stats.return_types.map((type, index) => (
                      <div key={type.type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {type.type === 'refund' && <CreditCard className="w-4 h-4" />}
                          {type.type === 'exchange' && <ArrowLeft className="w-4 h-4" />}
                          {type.type === 'store_credit' && <DollarSign className="w-4 h-4" />}
                          <span className="capitalize">{type.type}</span>
                        </div>
                        <span className="font-medium">{Math.round(type.percentage)}%</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>Aucune donnée disponible</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Statistiques générales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Total des demandes</span>
                    <span className="font-bold text-lg">{stats?.total_returns || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Temps de traitement moyen</span>
                    <span className="font-bold text-lg">
                      {stats?.average_processing_time ? Math.round(stats.average_processing_time) : 0} jours
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Taux de retour</span>
                    <span className="font-bold text-lg">
                      {stats?.return_rate ? Math.round(stats.return_rate * 100) / 100 : 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Demandes en attente</span>
                    <span className="font-bold text-lg text-yellow-600">{stats?.pending_returns || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <ConfirmationComponent />
    </div>
  );
}