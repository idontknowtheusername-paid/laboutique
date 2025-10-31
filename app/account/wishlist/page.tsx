'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from "@/contexts/WishlistContext";
import { useSessionManager } from "@/hooks/useSessionManager";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Package,
  RefreshCw,
  AlertCircle,
  CheckSquare,
  Square,
} from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { ErrorState } from "@/components/ui/error-state";
import { WishlistSkeleton } from "@/components/ui/loading-skeleton";
import { useToast } from "@/components/ui/toast";

export default function WishlistPage() {
  const { user, loading } = useAuth();
  const { addToCart } = useCart();
  const {
    wishlistItems,
    loading: wishlistLoading,
    error: wishlistError,
    removeById,
    clearWishlist,
    refreshWishlist,
    retryLastOperation,
    moveToCart,
  } = useWishlist();
  const { addToast } = useToast();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize session manager for this protected page
  useSessionManager({
    autoRefresh: true,
    redirectOnExpiry: true,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-BJ", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    setSelectedItems((prev) =>
      checked ? [...prev, itemId] : prev.filter((id) => id !== itemId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(checked ? wishlistItems.map((item) => item.id) : []);
  };

  const handleRemoveSelected = async () => {
    if (selectedItems.length === 0) return;

    setIsProcessing(true);
    try {
      const promises = selectedItems.map((itemId) => removeById(itemId));
      await Promise.all(promises);
      setSelectedItems([]);

      addToast({
        type: "success",
        title: "Produits supprimés",
        description: `${selectedItems.length} produit(s) retiré(s) de votre wishlist`,
      });
    } catch (error) {
      console.error("Error removing selected items:", error);
      addToast({
        type: "error",
        title: "Erreur",
        description: "Impossible de supprimer certains produits",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMoveSelectedToCart = async () => {
    if (selectedItems.length === 0) return;

    setIsProcessing(true);
    try {
      const result = await moveToCart(selectedItems);
      setSelectedItems([]);

      if (result.moved > 0) {
        addToast({
          type: "success",
          title: "Produits ajoutés au panier",
          description: `${result.moved} produit(s) déplacé(s) vers votre panier`,
        });
      }

      if (result.errors.length > 0) {
        addToast({
          type: "warning",
          title: "Certains produits n'ont pas pu être ajoutés",
          description: `${result.errors.length} erreur(s) rencontrée(s)`,
        });
      }
    } catch (error) {
      console.error("Error moving items to cart:", error);
      addToast({
        type: "error",
        title: "Erreur",
        description: "Impossible de déplacer les produits vers le panier",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddToCart = async (product: any) => {
    if (product) {
      await addToCart(product.id, product.name, product.price, 1);
    }
  };

  const handleClearWishlist = async () => {
    if (wishlistItems.length === 0) return;

    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir vider votre wishlist ?"
    );
    if (!confirmed) return;

    setIsProcessing(true);
    try {
      await clearWishlist();
      setSelectedItems([]);
    } catch (error) {
      console.error("Error clearing wishlist:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="mb-4">
              Vous devez être connecté pour voir votre wishlist.
            </p>
            <Link href="/auth/login">
              <Button>Se connecter</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ProtectedRoute requireAuth={true} redirectTo="/auth/login">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container max-w-6xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
            <Link href="/" className="hover:text-jomionstore-primary">
              Accueil
            </Link>
            <span>/</span>
            <Link href="/account" className="hover:text-jomionstore-primary">
              Mon compte
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Ma wishlist</span>
          </nav>

          <div className="space-y-6">
            {/* Header with actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">Ma liste de souhaits</h1>
                {wishlistItems.length > 0 && (
                  <p className="text-gray-600 mt-1">
                    {wishlistItems.length} produit
                    {wishlistItems.length > 1 ? "s" : ""} dans votre liste
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {wishlistError && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={retryLastOperation}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Réessayer
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshWishlist}
                  disabled={wishlistLoading}
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${
                      wishlistLoading ? "animate-spin" : ""
                    }`}
                  />
                  Actualiser
                </Button>

                <Link href="/">
                  <Button>Continuer mes achats</Button>
                </Link>
              </div>
            </div>

            {/* Error State */}
            {wishlistError && wishlistItems.length === 0 && (
              <ErrorState
                type="generic"
                title="Erreur de chargement"
                message={wishlistError.message}
                onRetry={retryLastOperation}
              />
            )}

            {/* Loading State */}
            {wishlistLoading && wishlistItems.length === 0 && (
              <WishlistSkeleton count={8} />
            )}

            {/* Empty State */}
            {!wishlistLoading &&
              !wishlistError &&
              wishlistItems.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Votre wishlist est vide
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Ajoutez des produits à votre liste de souhaits pour les
                      retrouver facilement.
                    </p>
                    <Link href="/">
                      <Button>Découvrir nos produits</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}

            {/* Bulk Actions */}
            {wishlistItems.length > 0 && (
              <Card className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedItems.length === wishlistItems.length}
                        onCheckedChange={(v) => handleSelectAll(Boolean(v))}
                        id="select-all"
                      />
                      <label
                        htmlFor="select-all"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Tout sélectionner ({selectedItems.length}/
                        {wishlistItems.length})
                      </label>
                    </div>

                    {wishlistError && (
                      <div className="flex items-center gap-2 text-amber-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{wishlistError.message}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleMoveSelectedToCart}
                      disabled={selectedItems.length === 0 || isProcessing}
                      className="text-green-600 border-green-600 hover:bg-green-50"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Ajouter au panier ({selectedItems.length})
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveSelected}
                      disabled={selectedItems.length === 0 || isProcessing}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer ({selectedItems.length})
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearWishlist}
                      disabled={wishlistItems.length === 0 || isProcessing}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Vider la liste
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Products Grid */}
            {wishlistItems.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlistItems.map((item) => {
                  const product = item.product ?? null;

                  return (
                    <Card
                      key={item.id}
                      className="group hover:shadow-lg transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="relative mb-4">
                          {/* Selection checkbox */}
                          <div className="absolute top-2 left-2 z-10">
                            <Checkbox
                              checked={selectedItems.includes(item.id)}
                              onCheckedChange={(checked) =>
                                handleSelectItem(item.id, checked as boolean)
                              }
                              className="bg-white/90 border-2"
                            />
                          </div>

                          <Link
                            href={
                              product?.slug ? `/product/${product.slug}` : "/"
                            }
                          >
                            <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
                              {product?.images?.[0] ? (
                                <Image
                                  src={product?.images?.[0] ?? ""}
                                  alt={product?.name ?? "Product image"}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform"
                                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <Package className="w-12 h-12" />
                                </div>
                              )}
                            </div>
                          </Link>

                          {/* Remove button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                            onClick={() => removeById(item.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>

                          {/* Badges */}
                          <div className="absolute bottom-2 left-2">
                            {product?.status !== "active" && (
                              <Badge
                                variant="secondary"
                                className="bg-gray-500 text-white"
                              >
                                Indisponible
                              </Badge>
                            )}
                            {product?.compare_price &&
                              product.compare_price > (product.price ?? 0) && (
                                <Badge className="bg-red-500 text-white ml-1">
                                  -
                                  {Math.round(
                                    ((product.compare_price -
                                      (product.price ?? 0)) /
                                      product.compare_price) *
                                      100
                                  )}
                                  %
                                </Badge>
                              )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          {/* Vendor */}
                          {product?.vendor?.name && (
                            <p className="text-xs text-gray-500 uppercase tracking-wide truncate">
                              {product.vendor.name}
                            </p>
                          )}

                          {/* Product Name */}
                          <Link
                            href={
                              product?.slug ? `/product/${product.slug}` : "/"
                            }
                          >
                            <h3 className="font-medium text-sm line-clamp-2 hover:text-jomionstore-primary transition-colors min-h-[2.5rem]">
                              {product?.name}
                            </h3>
                          </Link>

                          {/* Price */}
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-jomionstore-primary">
                              {formatPrice(product?.price ?? 0)}
                            </span>
                            {product?.compare_price && (
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(product.compare_price)}
                              </span>
                            )}
                          </div>

                          {/* Stock Status (retiré car track_quantity/quantity non présents dans le type) */}

                          {/* Add to Cart Button */}
                          <Button
                            onClick={() => handleAddToCart(product)}
                            className="w-full bg-jomionstore-primary hover:bg-orange-700 text-white"
                            size="sm"
                            disabled={product?.status !== "active"}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {product?.status !== "active"
                              ? "Indisponible"
                              : "Ajouter au panier"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}