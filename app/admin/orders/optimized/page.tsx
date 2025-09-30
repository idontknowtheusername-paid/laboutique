'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, Search, Eye, Edit, RefreshCw } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminToolbar from '@/components/admin/AdminToolbar';
import MobileOptimizedTable from '@/components/admin/MobileOptimizedTable';
import Pagination from '@/components/admin/Pagination';
import { useCachedPaginatedData, CACHE_KEYS } from '@/lib/hooks/useCache';
import { useToast } from '@/components/admin/Toast';
import { useConfirmation } from '@/components/admin/ConfirmationDialog';
import { KeyboardShortcuts } from '@/components/admin/AccessibilityEnhancer';
import { OrdersService, Order } from '@/lib/services/orders.service';

export default function OptimizedOrdersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  const { success, error } = useToast();
  const { confirm, ConfirmationComponent } = useConfirmation();

  // Raccourcis clavier
  const shortcuts = {
    'k': () => setSearch(''),
    'r': () => refetch(),
    'n': () => window.location.href = '/admin/orders/new',
    'e': () => setStatus('all')
  };

  // Cache des données avec React Query
  const {
    data: orders,
    total,
    isLoading,
    isError,
    refetch
  } = useCachedPaginatedData<Order>(
    [...CACHE_KEYS.ORDERS, search, status],
    async (page, limit) => {
      const res = await OrdersService.getRecent(limit);
      if (res.success && res.data) {
        // Filtrer les données côté client pour la démo
        let filteredData = res.data;
        
        if (search) {
          filteredData = filteredData.filter(order => 
            order.order_number?.toLowerCase().includes(search.toLowerCase()) ||
            order.user?.email?.toLowerCase().includes(search.toLowerCase())
          );
        }
        
        if (status !== 'all') {
          filteredData = filteredData.filter(order => order.status === status);
        }
        
        return {
          data: filteredData.slice((page - 1) * limit, page * limit),
          total: filteredData.length,
          page,
          limit
        };
      }
      throw new Error('Erreur lors du chargement des commandes');
    },
    page,
    itemsPerPage,
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Actions pour les commandes
  const handleViewOrder = (orderId: string) => {
    window.location.href = `/admin/orders/${orderId}`;
  };

  const handleEditOrder = (orderId: string) => {
    window.location.href = `/admin/orders/${orderId}/edit`;
  };

  const handleDeleteOrder = (orderId: string) => {
    confirm(
      'Supprimer la commande',
      'Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.',
      () => {
        // Logique de suppression
        success('Commande supprimée avec succès');
        refetch();
      },
      'destructive'
    );
  };

  // Configuration des colonnes pour la table
  const columns = [
    {
      key: 'order_number' as keyof Order,
      label: 'Numéro',
      render: (value: any, row: Order) => (
        <div className="font-medium">
          {row.order_number || `#${row.id.slice(0, 8)}`}
        </div>
      ),
      mobile: true,
      searchable: true,
      sortable: true
    },
    {
      key: 'user' as keyof Order,
      label: 'Client',
      render: (value: any, row: Order) => (
        <div>
          <div className="font-medium">
            {row.user?.first_name} {row.user?.last_name}
          </div>
          <div className="text-sm text-gray-500">{row.user?.email}</div>
        </div>
      ),
      mobile: true,
      searchable: true
    },
    {
      key: 'status' as keyof Order,
      label: 'Statut',
      render: (value: any, row: Order) => {
        const getStatusColor = (status: string) => {
          switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-indigo-100 text-indigo-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
          }
        };
        
        return (
          <Badge className={getStatusColor(row.status)}>
            {row.status}
          </Badge>
        );
      },
      mobile: true,
      sortable: true
    },
    {
      key: 'total_amount' as keyof Order,
      label: 'Montant',
      render: (value: any, row: Order) => (
        <div className="font-medium">
          {new Intl.NumberFormat('fr-BJ', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
          }).format(row.total_amount)}
        </div>
      ),
      mobile: false,
      sortable: true
    },
    {
      key: 'created_at' as keyof Order,
      label: 'Date',
      render: (value: any, row: Order) => (
        <div className="text-sm">
          {new Date(row.created_at).toLocaleDateString('fr-FR')}
        </div>
      ),
      mobile: false,
      sortable: true
    }
  ];

  // Actions pour la table
  const actions = [
    {
      label: 'Voir les détails',
      icon: <Eye className="w-4 h-4" />,
      onClick: (row: Order) => handleViewOrder(row.id),
      mobile: true
    },
    {
      label: 'Modifier la commande',
      icon: <Edit className="w-4 h-4" />,
      onClick: (row: Order) => handleEditOrder(row.id),
      mobile: true
    },
    {
      label: 'Supprimer la commande',
      icon: <RefreshCw className="w-4 h-4" />,
      onClick: (row: Order) => handleDeleteOrder(row.id),
      variant: 'destructive' as const,
      mobile: false
    }
  ];

  if (isError) {
    return (
      <div className="min-h-screen bg-jomiastore-background flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur de chargement</h2>
            <p className="text-gray-600 mb-4">Impossible de charger les commandes</p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <KeyboardShortcuts shortcuts={shortcuts}>
      <div className="space-y-6">
        <AdminPageHeader
          title="Commandes optimisées"
          subtitle="Gestion des commandes avec cache et pagination"
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
              <Button className="bg-jomiastore-primary hover:bg-blue-700">
                Nouvelle commande
              </Button>
            </div>
          }
        />

        <Card>
          <CardContent className="p-0">
            <AdminToolbar>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  className="pl-10"
                  placeholder="Rechercher une commande"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="processing">En cours</SelectItem>
                  <SelectItem value="shipped">Expédiée</SelectItem>
                  <SelectItem value="delivered">Livrée</SelectItem>
                  <SelectItem value="cancelled">Annulée</SelectItem>
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
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Actualiser
                </Button>
              </div>
            </AdminToolbar>
          </CardContent>
        </Card>

        <MobileOptimizedTable
          data={orders || []}
          columns={columns}
          actions={actions}
          searchable={true}
          sortable={true}
          filterable={true}
          loading={isLoading}
          emptyMessage="Aucune commande trouvée"
        />

        {total > 0 && (
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(total / itemsPerPage)}
            totalItems={total}
            itemsPerPage={itemsPerPage}
            onPageChange={setPage}
            onItemsPerPageChange={setItemsPerPage}
            showItemsPerPage={true}
            showInfo={true}
          />
        )}

        <ConfirmationComponent />
      </div>
    </KeyboardShortcuts>
  );
}