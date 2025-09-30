'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductsService } from '@/lib/services/products.service';
import { ReviewsService } from '@/lib/services/reviews.service';
import { VendorsService } from '@/lib/services/vendors.service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, RefreshCw } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { useToast } from "@/components/ui/toast";

export default function AdminModerationPage() {
  const [pendingProducts, setPendingProducts] = React.useState<any[]>([]);
  const [flaggedReviews, setFlaggedReviews] = React.useState<any[]>([]);
  const [pendingVendors, setPendingVendors] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const { addToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const prodRes = await ProductsService.getNew(200);
      if (prodRes.success && prodRes.data) setPendingProducts(prodRes.data.filter((p: any) => p.status === 'pending'));

      const revRes = await ReviewsService.getFlagged();
      if (revRes.success && revRes.data) setFlaggedReviews(revRes.data);

      const vendRes = await VendorsService.getPending();
      if (vendRes.success && vendRes.data) setPendingVendors(vendRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  // Actions de modération pour les produits
  const handleApproveProduct = async (productId: string) => {
    try {
      const { error } = await (ProductsService as any).getSupabaseClient()
        .from('products')
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (!error) {
        setPendingProducts(prev => prev.filter(p => p.id !== productId));
        addToast({
          type: "success",
          title: "Produit approuvé",
          description: "Le produit a été approuvé et est maintenant visible.",
        });
      } else {
        addToast({
          type: "error",
          title: "Erreur",
          description: "Impossible d'approuver le produit.",
        });
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Erreur",
        description: "Erreur lors de l'approbation du produit.",
      });
    }
  };

  const handleRejectProduct = async (productId: string) => {
    try {
      const { error } = await (ProductsService as any).getSupabaseClient()
        .from('products')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (!error) {
        setPendingProducts(prev => prev.filter(p => p.id !== productId));
        addToast({
          type: "success",
          title: "Produit rejeté",
          description: "Le produit a été rejeté.",
        });
      } else {
        addToast({
          type: "error",
          title: "Erreur",
          description: "Impossible de rejeter le produit.",
        });
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Erreur",
        description: "Erreur lors du rejet du produit.",
      });
    }
  };

  // Actions de modération pour les avis
  const handleApproveReview = async (reviewId: string) => {
    try {
      const { error } = await (ReviewsService as any).getSupabaseClient()
        .from('reviews')
        .update({ 
          flagged: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (!error) {
        setFlaggedReviews(prev => prev.filter(r => r.id !== reviewId));
        addToast({
          type: "success",
          title: "Avis approuvé",
          description: "L'avis a été approuvé et reste visible.",
        });
      } else {
        addToast({
          type: "error",
          title: "Erreur",
          description: "Impossible d'approuver l'avis.",
        });
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Erreur",
        description: "Erreur lors de l'approbation de l'avis.",
      });
    }
  };

  const handleRejectReview = async (reviewId: string) => {
    try {
      const { error } = await (ReviewsService as any).getSupabaseClient()
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (!error) {
        setFlaggedReviews(prev => prev.filter(r => r.id !== reviewId));
        addToast({
          type: "success",
          title: "Avis supprimé",
          description: "L'avis a été supprimé.",
        });
      } else {
        addToast({
          type: "error",
          title: "Erreur",
          description: "Impossible de supprimer l'avis.",
        });
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Erreur",
        description: "Erreur lors de la suppression de l'avis.",
      });
    }
  };

  // Actions de modération pour les vendeurs
  const handleApproveVendor = async (vendorId: string) => {
    try {
      const { error } = await (VendorsService as any).getSupabaseClient()
        .from('profiles')
        .update({ 
          vendor_status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', vendorId);

      if (!error) {
        setPendingVendors(prev => prev.filter(v => v.id !== vendorId));
        addToast({
          type: "success",
          title: "Vendeur approuvé",
          description: "Le vendeur a été approuvé et peut maintenant vendre.",
        });
      } else {
        addToast({
          type: "error",
          title: "Erreur",
          description: "Impossible d'approuver le vendeur.",
        });
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Erreur",
        description: "Erreur lors de l'approbation du vendeur.",
      });
    }
  };

  const handleRejectVendor = async (vendorId: string) => {
    try {
      const { error } = await (VendorsService as any).getSupabaseClient()
        .from('profiles')
        .update({ 
          vendor_status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', vendorId);

      if (!error) {
        setPendingVendors(prev => prev.filter(v => v.id !== vendorId));
        addToast({
          type: "success",
          title: "Vendeur rejeté",
          description: "Le vendeur a été rejeté.",
        });
      } else {
        addToast({
          type: "error",
          title: "Erreur",
          description: "Impossible de rejeter le vendeur.",
        });
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Erreur",
        description: "Erreur lors du rejet du vendeur.",
      });
    }
  };

  return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Modération"
          subtitle="Contenus et éléments à approuver"
          actions={
            <Button variant="outline" onClick={loadData} disabled={loading}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {loading ? 'Chargement...' : 'Rafraîchir'}
            </Button>
          }
        />

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
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApproveProduct(p.id)}
                      >
                        <Check className="w-4 h-4 mr-1"/>
                        Approuver
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleRejectProduct(p.id)}
                      >
                        <X className="w-4 h-4 mr-1"/>
                        Refuser
                      </Button>
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
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApproveReview(r.id)}
                      >
                        <Check className="w-4 h-4 mr-1"/>
                        Garder
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleRejectReview(r.id)}
                      >
                        <X className="w-4 h-4 mr-1"/>
                        Supprimer
                      </Button>
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
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApproveVendor(v.id)}
                      >
                        <Check className="w-4 h-4 mr-1"/>
                        Approuver
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleRejectVendor(v.id)}
                      >
                        <X className="w-4 h-4 mr-1"/>
                        Refuser
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
}

