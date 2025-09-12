'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { WishlistService, WishlistItem } from '@/lib/services';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';

export default function WishlistPage() {
  const { user, loading } = useAuth();
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    if (!user?.id) return;

    try {
      const response = await WishlistService.getByUser(user.id);
      if (response.success && response.data) {
        setWishlistItems(response.data.data); // response.data est PaginatedResponse
      } else {
        console.error('Error fetching wishlist:', response.error);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    if (!user?.id) return;

    try {
      const response = await WishlistService.removeById(user.id, itemId);
      if (response.success) {
        setWishlistItems(items => items.filter(item => item.id !== itemId));
      } else {
        console.error('Error removing from wishlist:', response.error);
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const handleAddToCart = async (product: WishlistItem['product']) => {
    if (product) {
      await addToCart(
        product.id,
        product.name,
        product.price,
        1
      );
    }
  };

  if (loading || wishlistLoading) {
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
            <p className="mb-4">Vous devez être connecté pour voir votre wishlist.</p>
            <Link href="/auth/login">
              <Button>Se connecter</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-primary">Accueil</Link>
          <span>/</span>
          <Link href="/account" className="hover:text-primary">Mon compte</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Ma wishlist</span>
        </nav>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Ma liste de souhaits</h1>
            <Link href="/">
              <Button>Continuer mes achats</Button>
            </Link>
          </div>

          {wishlistItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Votre wishlist est vide</h3>
                <p className="text-gray-600 mb-6">
                  Ajoutez des produits à votre liste de souhaits pour les retrouver facilement.
                </p>
                <Link href="/">
                  <Button>Découvrir nos produits</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item) => (
                <Card key={item.id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="relative mb-4">
                      <Link href={`/product/${item.product?.slug}`}>
                        <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
                          {item.product?.images?.[0] ? (
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package className="w-12 h-12" />
                            </div>
                          )}
                        </div>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                        onClick={() => removeFromWishlist(item.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Link href={`/product/${item.product?.slug}`}>
                        <h3 className="font-medium text-sm line-clamp-2 hover:text-primary">
                          {item.product?.name}
                        </h3>
                      </Link>

                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-primary">
                          {item.product?.price.toLocaleString()} FCFA
                        </span>
                        {item.product?.compare_price && (
                          <span className="text-sm text-gray-500 line-through">
                            {item.product.compare_price.toLocaleString()} FCFA
                          </span>
                        )}
                      </div>

                      <Button
                        onClick={() => handleAddToCart(item.product)}
                        className="w-full"
                        size="sm"
                        disabled={item.product?.status !== 'active'}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Ajouter au panier
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}