'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle, XCircle, Package, Truck, CreditCard, DollarSign, Clock, User, Mail, Phone, MapPin } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { ReturnsService, ReturnRequest } from '@/lib/services/returns.service';
import { useToast } from '@/components/admin/Toast';
import { useConfirmation } from '@/components/admin/ConfirmationDialog';

export default function AdminReturnDetailPage() {
  const params = useParams();
  const router = useRouter();
  const returnId = Array.isArray(params?.id) ? params?.id[0] : (params as any)?.id;
  const { success, error } = useToast();
  const { confirm, ConfirmationComponent } = useConfirmation();
  const [loading, setLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState(false);
  const [returnRequest, setReturnRequest] = React.useState<ReturnRequest | null>(null);
  const [adminNotes, setAdminNotes] = React.useState('');
  const [trackingNumber, setTrackingNumber] = React.useState('');

  React.useEffect(() => {
    loadReturn();
  }, [returnId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadReturn = async () => {
    setLoading(true);
    try {
      const result = await ReturnsService.getById(returnId);
      if (result.success && result.data) {
        setReturnRequest(result.data);
        setAdminNotes(result.data.admin_notes || '');
        setTrackingNumber(result.data.tracking_number || '');
      } else {
        error('Erreur de chargement', result.error || 'Impossible de charger la demande de retour');
        router.push('/admin/returns');
      }
    } catch (err) {
      error('Erreur inattendue', 'Une erreur est survenue lors du chargement de la demande');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!returnRequest) return;

    confirm(
      'Approuver la demande',
      `Êtes-vous sûr de vouloir approuver cette demande de retour ?`,
      async () => {
        setUpdating(true);
        try {
          const result = await ReturnsService.approve(returnRequest.id, adminNotes, trackingNumber);
          if (result.success && result.data) {
            setReturnRequest(result.data);
            success('Demande approuvée', 'La demande de retour a été approuvée avec succès');
          } else {
            error('Erreur d\'approbation', result.error || 'Impossible d\'approuver la demande');
          }
        } catch (err) {
          error('Erreur inattendue', 'Une erreur est survenue lors de l\'approbation');
        } finally {
          setUpdating(false);
        }
      }
    );
  };

  const handleReject = async () => {
    if (!returnRequest) return;

    confirm(
      'Rejeter la demande',
      `Êtes-vous sûr de vouloir rejeter cette demande de retour ?`,
      async () => {
        setUpdating(true);
        try {
          const result = await ReturnsService.reject(returnRequest.id, adminNotes);
          if (result.success && result.data) {
            setReturnRequest(result.data);
            success('Demande rejetée', 'La demande de retour a été rejetée');
          } else {
            error('Erreur de rejet', result.error || 'Impossible de rejeter la demande');
          }
        } catch (err) {
          error('Erreur inattendue', 'Une erreur est survenue lors du rejet');
        } finally {
          setUpdating(false);
        }
      }
    );
  };

  const handleComplete = async () => {
    if (!returnRequest) return;

    confirm(
      'Marquer comme terminé',
      `Êtes-vous sûr de vouloir marquer cette demande comme terminée ?`,
      async () => {
        setUpdating(true);
        try {
          const result = await ReturnsService.complete(returnRequest.id, adminNotes);
          if (result.success && result.data) {
            setReturnRequest(result.data);
            success('Demande terminée', 'La demande de retour a été marquée comme terminée');
          } else {
            error('Erreur de finalisation', result.error || 'Impossible de finaliser la demande');
          }
        } catch (err) {
          error('Erreur inattendue', 'Une erreur est survenue lors de la finalisation');
        } finally {
          setUpdating(false);
        }
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-orange-100 text-orange-800';
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
      case 'exchange': return <Package className="w-4 h-4" />;
      case 'store_credit': return <DollarSign className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('fr-BJ', {
    style: 'currency', currency: 'XOF', minimumFractionDigits: 0,
  }).format(price);

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Détail de la demande"
          subtitle="Chargement..."
        />
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-jomionstore-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de la demande...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!returnRequest) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Demande non trouvée"
          subtitle="La demande de retour demandée n'existe pas"
        />
        <Card>
          <CardContent className="p-8 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Demande non trouvée</h3>
            <p className="text-gray-600 mb-4">La demande de retour que vous recherchez n'existe pas ou a été supprimée.</p>
            <Button onClick={() => router.push('/admin/returns')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à la liste
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`Demande #${returnRequest.id}`}
        subtitle={`Commande ${returnRequest.order_id} - ${returnRequest.customer_name}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(returnRequest.status)}
                Informations de la demande
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Statut</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getStatusColor(returnRequest.status)}>
                      {returnRequest.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Type de retour</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getTypeIcon(returnRequest.return_type)}
                    <span className="capitalize">{returnRequest.return_type}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Montant du remboursement</Label>
                  <div className="text-lg font-semibold mt-1">
                    {formatPrice(returnRequest.refund_amount)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Date de création</Label>
                  <div className="mt-1">
                    {new Date(returnRequest.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Raison du retour</Label>
                <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  {returnRequest.reason}
                </div>
              </div>

              {returnRequest.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Notes du client</Label>
                  <div className="mt-1 p-3 bg-orange-50 rounded-lg">
                    {returnRequest.notes}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Informations produit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Nom du produit</Label>
                  <div className="mt-1 font-medium">{returnRequest.product_name}</div>
                </div>
                {returnRequest.product_sku && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">SKU</Label>
                    <div className="mt-1 text-sm text-gray-600">{returnRequest.product_sku}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informations client
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Nom</Label>
                  <div className="mt-1 font-medium">{returnRequest.customer_name}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <div className="mt-1 text-sm text-gray-600">{returnRequest.customer_email}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions et notes */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {returnRequest.status === 'pending' && (
                <>
                  <Button 
                    onClick={handleApprove} 
                    disabled={updating}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approuver
                  </Button>
                  <Button 
                    onClick={handleReject} 
                    disabled={updating}
                    variant="destructive"
                    className="w-full"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejeter
                  </Button>
                </>
              )}

              {returnRequest.status === 'approved' && (
                <Button 
                  onClick={handleComplete} 
                  disabled={updating}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Marquer comme terminé
                </Button>
              )}

              {returnRequest.status === 'completed' && (
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-800">Demande terminée</p>
                  {returnRequest.processed_at && (
                    <p className="text-xs text-green-600 mt-1">
                      {new Date(returnRequest.processed_at).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes administratives</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="admin-notes">Notes</Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Ajouter des notes pour cette demande..."
                  rows={4}
                />
              </div>

              {returnRequest.status === 'approved' && (
                <div>
                  <Label htmlFor="tracking">Numéro de suivi</Label>
                  <Input
                    id="tracking"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Numéro de suivi..."
                  />
                </div>
              )}

              {returnRequest.admin_notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Notes actuelles</Label>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                    {returnRequest.admin_notes}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmationComponent />
    </div>
  );
}