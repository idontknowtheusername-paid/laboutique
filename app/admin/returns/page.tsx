'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Package, DollarSign, Clock, CheckCircle, XCircle, AlertTriangle, FileText, Truck, CreditCard } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminToolbar from '@/components/admin/AdminToolbar';

interface ReturnRequest {
  id: string;
  order_id: string;
  customer_name: string;
  customer_email: string;
  product_name: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  refund_amount: number;
  return_type: 'refund' | 'exchange' | 'store_credit';
  created_at: string;
  processed_at?: string;
  tracking_number?: string;
  notes?: string;
}

export default function AdminReturnsPage() {
  const [loading, setLoading] = React.useState(true);
  const [returns, setReturns] = React.useState<ReturnRequest[]>([]);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [typeFilter, setTypeFilter] = React.useState<string>('all');

  React.useEffect(() => {
    loadReturns();
  }, []);

  const loadReturns = async () => {
    setLoading(true);
    try {
      // Simuler des demandes de retour
      const mockReturns: ReturnRequest[] = [
        {
          id: '1',
          order_id: 'ORD-12345',
          customer_name: 'Jean Dupont',
          customer_email: 'jean@example.com',
          product_name: 'iPhone 15 Pro Max',
          reason: 'Produit défectueux',
          status: 'pending',
          refund_amount: 850000,
          return_type: 'refund',
          created_at: '2024-01-15T10:30:00Z',
          notes: 'Écran fissuré à la réception'
        },
        {
          id: '2',
          order_id: 'ORD-12346',
          customer_name: 'Marie Martin',
          customer_email: 'marie@example.com',
          product_name: 'Samsung Galaxy S24',
          reason: 'Mauvaise taille',
          status: 'approved',
          refund_amount: 750000,
          return_type: 'exchange',
          created_at: '2024-01-14T14:20:00Z',
          processed_at: '2024-01-14T16:00:00Z',
          tracking_number: 'RET-789456'
        },
        {
          id: '3',
          order_id: 'ORD-12347',
          customer_name: 'Pierre Durand',
          customer_email: 'pierre@example.com',
          product_name: 'MacBook Pro M3',
          reason: 'Changement d\'avis',
          status: 'completed',
          refund_amount: 2500000,
          return_type: 'store_credit',
          created_at: '2024-01-13T09:15:00Z',
          processed_at: '2024-01-13T11:30:00Z'
        }
      ];
      setReturns(mockReturns);
    } catch (error) {
      console.error('Erreur lors du chargement des retours:', error);
    } finally {
      setLoading(false);
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
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Exporter
            </Button>
            <Button className="bg-jomiastore-primary hover:bg-blue-700">
              <Package className="w-4 h-4 mr-2" />
              Nouveau retour
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
                            <Button variant="ghost" size="sm">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <XCircle className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <FileText className="w-4 h-4" />
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  Remboursements ce mois
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">2,450,000 FCFA</div>
                <p className="text-sm text-gray-500">+12% vs mois dernier</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-500" />
                  Demandes en attente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">8</div>
                <p className="text-sm text-gray-500">-2 vs semaine dernière</p>
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
                <div className="text-3xl font-bold">3.2%</div>
                <p className="text-sm text-gray-500">-0.5% vs mois dernier</p>
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
                  <div className="flex items-center justify-between">
                    <span>Produit défectueux</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Mauvaise taille</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                      </div>
                      <span className="text-sm font-medium">30%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Changement d'avis</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Types de retour</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <span>Remboursement</span>
                    </div>
                    <span className="font-medium">60%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      <span>Échange</span>
                    </div>
                    <span className="font-medium">30%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span>Crédit magasin</span>
                    </div>
                    <span className="font-medium">10%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}