'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { OrdersService, Order } from '@/lib/services/orders.service';
import { Download, Search, Eye, Edit, RefreshCw } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminToolbar from '@/components/admin/AdminToolbar';

export default function AdminOrdersPage() {
  const [loading, setLoading] = React.useState(true);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState<string>('all');
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await OrdersService.getRecent(100);
    setLoading(false);
    if (res.success && res.data) {
      let list = res.data;
      if (search) {
        list = list.filter((o) =>
          o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
          `${o.user?.first_name || ''} ${o.user?.last_name || ''}`.toLowerCase().includes(search.toLowerCase())
        );
      }
      if (status !== 'all') {
        list = list.filter((o) => o.status?.toLowerCase() === status);
      }
      setOrders(list);
      setTotalPages(1);
    }
  }, [search, status]);

  React.useEffect(() => { load(); }, [load]);

  function getStatusColor(s?: string) {
    switch (s) {
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'shipped': return 'bg-indigo-500';
      case 'delivered': return 'bg-green-600';
      case 'cancelled': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  }

  return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Commandes"
          subtitle="Suivi des commandes et statuts"
          actions={(
            <>
              <Button variant="outline" onClick={load} disabled={loading}>
                <RefreshCw className="w-4 h-4 mr-2" /> Rafraîchir
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" /> Exporter
              </Button>
            </>
          )}
        />

        <Card>
          <CardContent className="p-0">
            <AdminToolbar>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input className="pl-10" placeholder="Rechercher (commande, client)" value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setSearch(e.target.value)} />
              </div>
              <Select value={status} onValueChange={(v: string)=>setStatus(v)}>
                <SelectTrigger className="w-56"><SelectValue placeholder="Statut" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="processing">En cours</SelectItem>
                  <SelectItem value="shipped">Expédiées</SelectItem>
                  <SelectItem value="delivered">Livrées</SelectItem>
                  <SelectItem value="cancelled">Annulées</SelectItem>
                </SelectContent>
              </Select>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" onClick={()=>{ setSearch(''); setStatus('all'); }}>Réinitialiser</Button>
              </div>
            </AdminToolbar>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commandes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{o.order_number || o.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{o.user?.first_name} {o.user?.last_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold">{new Intl.NumberFormat('fr-BJ', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(o.total_amount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><Badge className={getStatusColor(o.status)}>{o.status}</Badge></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(o.created_at).toLocaleDateString('fr-FR')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}

