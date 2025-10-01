'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Tag, Truck, Shield, AlertCircle, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { CartService } from '@/lib/services/cart.service';

export default function CartPage() {
  const {
    cartItems,
    cartSummary,
    loading,
    syncing,
    error,
    localChanges,
    updateQuantity,
    removeFromCart,
    retryLastOperation,
    resolveConflict
  } = useCart();
  const { user } = useAuth();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [couponMsg, setCouponMsg] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-BJ', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Enhanced quantity update with loading state
  const handleQuantityUpdate = async (itemId: string, newQuantity: number) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await updateQuantity(itemId, newQuantity);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  // Enhanced remove with loading state
  const handleRemoveItem = async (itemId: string) => {
    setRemovingItems(prev => new Set(prev).add(itemId));
    try {
      await removeFromCart(itemId);
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  // Use cart summary if available, otherwise calculate locally
  const subtotal = cartSummary?.subtotal || cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );
  const taxAmount = cartSummary?.tax_amount || 0;
  const shipping = cartSummary?.shipping_amount || (subtotal > 50000 ? 0 : 2000);
  const promoDiscount = promoApplied ? subtotal * 0.05 : 0;
  const total = cartSummary?.total_amount || (subtotal + taxAmount + shipping - promoDiscount);

  const applyPromoCode = async () => {
    setCouponMsg(null);
    if (!user?.id) return;
    const res = await CartService.applyCoupon(user.id, promoCode.trim());
    if (res.success && res.data) {
      setPromoApplied(true);
      setCouponMsg(`Coupon appliqué: -${res.data.discountAmount} FCFA`);
    } else {
      setCouponMsg(res.error || 'Coupon invalide');
    }
  };

  return (
    <div className="min-h-screen bg-jomionstore-background">
      <Header />
      <CategoryMenu />

      <div className="container py-4 md:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-jomionstore-primary">
            Accueil
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Panier</span>
        </nav>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <div>
                  <h3 className="font-medium text-red-800">
                    {error.type === 'conflict' ? 'Conflit de panier détecté' : 'Erreur'}
                  </h3>
                  <p className="text-sm text-red-600">{error.message}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                {error.type === 'conflict' ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resolveConflict('local')}
                      disabled={syncing}
                    >
                      Garder local
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resolveConflict('remote')}
                      disabled={syncing}
                    >
                      Garder distant
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => resolveConflict('merge')}
                      disabled={syncing}
                    >
                      Fusionner
                    </Button>
                  </>
                ) : error.retryable ? (
                  <Button
                    size="sm"
                    onClick={retryLastOperation}
                    disabled={loading || syncing}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Réessayer
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Sync Status */}
        {(syncing || localChanges) && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              {syncing ? (
                <>
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mr-2" />
                  <span className="text-sm text-blue-700">Synchronisation en cours...</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-blue-500 mr-2" />
                  <span className="text-sm text-blue-700">
                    Modifications locales non synchronisées
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {loading && cartItems.length === 0 ? (
          /* Loading State */
          <div className="text-center py-12">
            <div className="w-16 h-16 animate-spin rounded-full border-4 border-jomionstore-primary border-t-transparent mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">
              Chargement de votre panier...
            </h2>
          </div>
        ) : cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-12">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Votre panier est vide
            </h2>
            <p className="text-gray-600 mb-8">
              Découvrez nos produits et ajoutez-les à votre panier
            </p>
            <Link href="/">
              <Button className="bg-jomionstore-primary hover:bg-blue-700">
                Continuer mes achats
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Mon Panier ({cartItems.length} articles)
                </h1>
                <Link href="/">
                  <Button variant="outline" className="flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Continuer mes achats
                  </Button>
                </Link>
              </div>

                  {cartItems.map((item) => {
                    const isUpdating = updatingItems.has(item.id);
                    const isRemoving = removingItems.has(item.id);
                    const hasError = error?.itemId === item.id;

                    return (
                      <Card key={item.id} className={`overflow-hidden transition-opacity ${isRemoving ? 'opacity-50' : ''}`}>
                        <CardContent className="p-4 md:p-6">
                          <div className="flex flex-col sm:flex-row gap-4">
                            {/* Product Image */}
                            <div className="w-full sm:w-24 h-48 sm:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                              <Image
                                src={item.product?.images?.[0] || "/placeholder.jpg"}
                                alt={item.product?.name || "Produit"}
                                fill
                                sizes="96px"
                                className="object-cover"
                              />
                              {(isUpdating || isRemoving) && (
                                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                                  <div className="w-6 h-6 animate-spin rounded-full border-2 border-jomionstore-primary border-t-transparent" />
                                </div>
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 space-y-2">
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                                    {item.product?.name || 'Produit indisponible'}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    Vendu par{" "}
                                    {item.product?.vendor?.name || "JomionStore"}
                                  </p>
                                  {!item.product && (
                                    <p className="text-xs text-red-500 mt-1">
                                      Ce produit n'est plus disponible
                                    </p>
                                  )}
                                </div>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveItem(item.id)}
                                  disabled={isRemoving || isUpdating}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 self-start"
                                >
                                  {isRemoving ? (
                                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                                  ) : (
                                      <Trash2 className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>

                              {/* Error Message */}
                              {hasError && (
                                <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                                  {error.message}
                                  {error.retryable && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={retryLastOperation}
                                      className="ml-2 h-6 px-2 text-red-600"
                                    >
                                      Réessayer
                                    </Button>
                                  )}
                                </div>
                              )}

                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                {/* Price */}
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-bold text-lg text-jomionstore-primary">
                                      {formatPrice(item.product?.price || 0)}
                                    </span>
                                    {item.product?.compare_price && item.product.compare_price > item.product.price && (
                                      <span className="text-sm text-gray-500 line-through">
                                        {formatPrice(item.product.compare_price)}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Quantity Controls */}
                                <div className="flex items-center space-x-3">
                                  <div className="flex items-center border rounded-lg">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                                      disabled={item.quantity <= 1 || isUpdating || isRemoving || !item.product}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </Button>
                                    <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center relative">
                                      {item.quantity}
                                      {isUpdating && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                                          <div className="w-3 h-3 animate-spin rounded-full border border-jomionstore-primary border-t-transparent" />
                                        </div>
                                      )}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                                      disabled={isUpdating || isRemoving || !item.product}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                  </div>
                                  <span className="text-sm font-medium">
                                    {formatPrice((item.product?.price || 0) * item.quantity)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Promo Code */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Tag className="w-5 h-5 mr-2" />
                    Code promo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Entrez votre code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={promoApplied}
                    />
                    <Button
                      onClick={applyPromoCode}
                      disabled={promoApplied || !promoCode}
                      variant="outline"
                    >
                      Appliquer
                    </Button>
                  </div>
                  {couponMsg && (
                    <div className={`flex items-center text-sm ${promoApplied ? 'text-green-600' : 'text-red-600'}`}>
                      <Tag className="w-4 h-4 mr-1" />
                      {couponMsg}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Résumé de la commande
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Sous-total</span>
                          <span className={loading || syncing ? 'opacity-50' : ''}>
                            {loading || syncing ? (
                              <div className="w-16 h-4 bg-gray-200 animate-pulse rounded" />
                            ) : (
                              formatPrice(subtotal)
                            )}
                          </span>
                    </div>
                        {taxAmount > 0 && (
                          <div className="flex justify-between">
                            <span>TVA (18%)</span>
                            <span className={loading || syncing ? 'opacity-50' : ''}>
                              {loading || syncing ? (
                                <div className="w-12 h-4 bg-gray-200 animate-pulse rounded" />
                              ) : (
                                formatPrice(taxAmount)
                              )}
                            </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Livraison</span>
                          <span className={`${shipping === 0 ? "text-green-600" : ""} ${loading || syncing ? 'opacity-50' : ''}`}>
                            {loading || syncing ? (
                              <div className="w-16 h-4 bg-gray-200 animate-pulse rounded" />
                            ) : shipping === 0 ? (
                              "Gratuite"
                            ) : (
                              formatPrice(shipping)
                            )}
                      </span>
                    </div>
                    {promoApplied && (
                      <div className="flex justify-between text-green-600">
                        <span>Réduction promo</span>
                        <span>-{formatPrice(promoDiscount)}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                        <span className={`text-jomionstore-primary ${loading || syncing ? 'opacity-50' : ''}`}>
                          {loading || syncing ? (
                            <div className="w-20 h-6 bg-gray-200 animate-pulse rounded" />
                          ) : (
                            formatPrice(total)
                          )}
                    </span>
                  </div>

                      {/* Sync Warning */}
                      {localChanges && !syncing && (
                        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                          <AlertCircle className="w-4 h-4 inline mr-1" />
                          Modifications non synchronisées
                        </div>
                      )}

                  <Link href="/checkout">
                        <Button
                          className="w-full bg-jomionstore-primary hover:bg-blue-700 h-12 text-lg"
                          disabled={loading || syncing || cartItems.length === 0 || error?.type === 'conflict'}
                        >
                          {loading || syncing ? (
                            <>
                              <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                              Chargement...
                            </>
                          ) : (
                            'Passer la commande'
                          )}
                    </Button>
                  </Link>

                  {/* Trust Badges */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="flex items-center text-sm text-gray-600">
                      <Truck className="w-4 h-4 mr-2 text-jomionstore-secondary" />
                      <span>Livraison rapide</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Shield className="w-4 h-4 mr-2 text-jomionstore-secondary" />
                      <span>Paiement sécurisé</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}