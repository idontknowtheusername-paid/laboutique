"use client";

import React from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { OrdersService, Order, PaginatedResponse } from '@/lib/services';

export default function InvoicesPage() {
  const { user } = useAuth();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  React.useEffect(() => {
    (async () => {
      if (!user?.id) return;
      const res: PaginatedResponse<Order> = await OrdersService.getByUser(user.id, { page, limit: 10 });
      setOrders(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
    })();
  }, [user?.id, page]);

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('fr-FR');

  return (
    <ProtectedRoute>
      <div>
        <div className="py-2">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <a href="/" className="hover:text-jomiastore-primary">Accueil</a>
            <span>/</span>
            <a href="/account" className="hover:text-jomiastore-primary">Mon compte</a>
            <span>/</span>
            <span className="text-gray-900 font-medium">Mes factures</span>
          </nav>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><FileText className="w-5 h-5 mr-2"/>Historique des factures</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-sm text-gray-500">Aucune commande pour l'instant.</div>
              ) : (
                <div className="space-y-3">
                  {orders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary">#{o.order_number}</Badge>
                        <div className="text-sm text-gray-600">{formatDate(o.created_at)}</div>
                        <div className="font-semibold">{o.total_amount} {o.currency}</div>
                      </div>
                      <a href={`/api/orders/${o.id}/invoice`} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2"/>Télécharger</Button>
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center mt-6 gap-2">
                  <Button variant="outline" size="sm" onClick={()=>setPage(Math.max(1, page-1))} disabled={page===1}>Précédent</Button>
                  <span className="text-sm">Page {page} / {totalPages}</span>
                  <Button variant="outline" size="sm" onClick={()=>setPage(Math.min(totalPages, page+1))} disabled={page===totalPages}>Suivant</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}

