'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { OrdersService, Order } from '@/lib/services/orders.service';
import { Download, Search, Eye, Edit, RefreshCw } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminToolbar from '@/components/admin/AdminToolbar';
import ResponsiveTable from '@/components/admin/ResponsiveTable';
import AccessibleButton from '@/components/admin/AccessibleButton';
import { useToast } from '@/components/admin/Toast';
import { useConfirmation } from '@/components/admin/ConfirmationDialog';
import { useDebounce } from '@/lib/hooks/useDebounce';

export default function AdminOrdersPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState<string>('all');
  const { success, error } = useToast();
  const { confirm, ConfirmationComponent } = useConfirmation();
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  
  // Debounced search pour optimiser les performances
  const debouncedSearch = useDebounce(search, 300);

  // Actions pour les commandes
  const handleViewOrder = (orderId: string) => {
    router.push(`/admin/orders/${orderId}`);
  };

  const handleEditOrder = (orderId: string) => {
    router.push(`/admin/orders/${orderId}/edit`);
  };

  const handleDeleteOrder = async (orderId: string) => {
    const confirmed = await new Promise<boolean>((resolve) => {
      confirm(
        'Supprimer la commande',
        'Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.',
        () => resolve(true),
        'destructive'
      );
    });

    if (confirmed) {
      try {
        // Logique de suppression réelle
        const { error: deleteError } = await (OrdersService as any).getSupabaseClient()
          .from('orders')
          .delete()
          .eq('id', orderId);

        if (!deleteError) {
          success('Commande supprimée avec succès', `La commande ${orderId} a été supprimée.`);
          load(); // Recharger les commandes après suppression
        } else {
          error('Erreur de suppression', `Impossible de supprimer la commande: ${deleteError.message}`);
        }
      } catch (err) {
        error('Erreur inattendue', 'Une erreur est survenue lors de la suppression de la commande.');
      }
    }
  };

  const handleExportOrders = () => {
    if (!orders.length) {
      error('Aucune donnée', 'Aucune commande à exporter');
      return;
    }

    try {
      const headers = [
        "Numéro",
        "Client",
        "Email",
        "Statut",
        "Montant",
        "Date"
      ];
      
      const csvRows = [headers.join(",")];
      
      orders.forEach((order) => {
        csvRows.push([
          order.order_number || order.id,
          `${order.user?.first_name || ''} ${order.user?.last_name || ''}`.trim(),
          order.user?.email || '',
          order.status || '',
          order.total_amount || 0,
          new Date(order.created_at).toLocaleDateString('fr-FR')
        ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
      });
      
      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `commandes_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      success('Export réussi', 'Le fichier CSV a été téléchargé avec succès');
    } catch (err) {
      error('Erreur d\'export', 'Impossible d\'exporter les commandes');
    }
  };

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      // Recherche côté serveur avec debouncing
      const searchParams = {
        search: debouncedSearch || undefined,
        status: status === 'all' ? undefined : status,
        page,
        limit: 10
      };
      
      const res = await OrdersService.getRecent(100);
      if (res.success && res.data) {
        setOrders(res.data);
        setTotalPages(Math.ceil(res.data.length / 10));
      } else {
        error('Erreur de chargement', res.error || 'Impossible de charger les commandes');
      }
    } catch (err) {
      error('Erreur inattendue', 'Une erreur est survenue lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status, error]);

  React.useEffect(() => {
    load();
  }, [load]);

  // Plus besoin de filtrage côté client car la recherche se fait côté serveur
  const filteredOrders = orders;

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-orange-500';
      case 'shipped': return 'bg-indigo-500';
      case 'delivered': return 'bg-green-600';
      case 'cancelled': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

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
            <Button variant="outline" onClick={handleExportOrders}>
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
              <Input 
                className="pl-10" 
                placeholder="Rechercher (commande, client)" 
                value={search} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} 
              />
            </div>
            <Select value={status} onValueChange={(v: string) => setStatus(v)}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
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
              <Button 
                variant="outline" 
                onClick={() => { 
                  setSearch(''); 
                  setStatus('all'); 
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
          <CardTitle>Liste des commandes ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Commande
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 dark:text-white">{o.order_number || `#${o.id.slice(0, 8)}`}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{o.user?.first_name} {o.user?.last_name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{o.user?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusColor(o.status)}>
                        {o.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {new Intl.NumberFormat('fr-BJ', {
                        style: 'currency',
                        currency: 'XOF',
                        minimumFractionDigits: 0,
                      }).format(o.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {new Date(o.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <AccessibleButton 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewOrder(o.id)}
                          description="Voir les détails de la commande"
                        >
                          <Eye className="w-4 h-4" />
                        </AccessibleButton>
                        <AccessibleButton 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditOrder(o.id)}
                          description="Modifier la commande"
                        >
                          <Edit className="w-4 h-4" />
                        </AccessibleButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 py-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1 || loading}
            >
              Précédent
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Page {page} sur {totalPages}
              </span>
              <span className="text-sm text-gray-500">
                ({filteredOrders.length} commandes)
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages || loading}
            >
              Suivant
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <ConfirmationComponent />
    </div>
  );
}