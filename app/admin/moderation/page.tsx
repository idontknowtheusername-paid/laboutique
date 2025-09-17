'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductsService } from '@/lib/services/products.service';
import { ReviewsService } from '@/lib/services/reviews.service';
import { VendorsService } from '@/lib/services/vendors.service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X } from 'lucide-react';

export default function AdminModerationPage() {
  const [pendingProducts, setPendingProducts] = React.useState<any[]>([]);
  const [flaggedReviews, setFlaggedReviews] = React.useState<any[]>([]);
  const [pendingVendors, setPendingVendors] = React.useState<any[]>([]);

  React.useEffect(() => {
    (async () => {
      // Placeholder fetches; adapt to backend filters if available
      const prodRes = await ProductsService.getNew(200);
      if (prodRes.success && prodRes.data) setPendingProducts(prodRes.data.filter((p: any) => p.status === 'pending'));

      const revRes = await ReviewsService.getFlagged?.();
      if (revRes?.success && revRes.data) setFlaggedReviews(revRes.data);

      const vendRes = await VendorsService.getPending?.();
      if (vendRes?.success && vendRes.data) setPendingVendors(vendRes.data);
    })();
  }, []);

  return (
    <ProtectedRoute requireAuth={true} requireRole="admin">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Modération</h1>

        <Tabs defaultValue="products" className="space-y-4">
          <TabsList>
            <TabsTrigger value="products">Produits en attente</TabsTrigger>
            <TabsTrigger value="reviews">Avis signalés</TabsTrigger>
            <TabsTrigger value="vendors">Vendeurs à approuver</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Produits en attente ({pendingProducts.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingProducts.map((p) => (
                  <div key={p.id} className="p-4 border rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.id}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-500">En attente</Badge>
                      <Button size="sm" className="bg-green-600"><Check className="w-4 h-4 mr-1"/>Approuver</Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200"><X className="w-4 h-4 mr-1"/>Refuser</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Avis signalés ({flaggedReviews.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {flaggedReviews.map((r) => (
                  <div key={r.id} className="p-4 border rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-medium">{r.title || 'Avis'}</div>
                      <div className="text-xs text-gray-500">{r.id}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-600">Signalé</Badge>
                      <Button size="sm" className="bg-green-600"><Check className="w-4 h-4 mr-1"/>Garder</Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200"><X className="w-4 h-4 mr-1"/>Supprimer</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendors">
            <Card>
              <CardHeader>
                <CardTitle>Vendeurs à approuver ({pendingVendors.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingVendors.map((v) => (
                  <div key={v.id} className="p-4 border rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-medium">{v.name}</div>
                      <div className="text-xs text-gray-500">{v.id}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-500">En attente</Badge>
                      <Button size="sm" className="bg-green-600"><Check className="w-4 h-4 mr-1"/>Approuver</Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200"><X className="w-4 h-4 mr-1"/>Refuser</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}

