'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  Share2, 
  ArrowLeft,
  Star,
  Eye,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

const wishlistProducts = [
  {
    id: 'w1',
    name: 'iPhone 15 Pro Max 256GB',
    slug: 'iphone-15-pro-max-256gb',
    image: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 850000,
    comparePrice: 950000,
    rating: 4.8,
    reviews: 324,
    vendor: 'Apple Store',
    category: 'Smartphones',
    inStock: true,
    discount: 11,
    addedDate: '2024-01-15'
  },
  {
    id: 'w2',
    name: 'Samsung Galaxy S24 Ultra',
    slug: 'samsung-galaxy-s24-ultra',
    image: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 780000,
    comparePrice: 890000,
    rating: 4.6,
    reviews: 256,
    vendor: 'Samsung Official',
    category: 'Smartphones',
    inStock: true,
    discount: 12,
    addedDate: '2024-01-10'
  },
  {
    id: 'w3',
    name: 'MacBook Air M3 13"',
    slug: 'macbook-air-m3-13',
    image: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 720000,
    comparePrice: 850000,
    rating: 4.9,
    reviews: 189,
    vendor: 'Apple Store',
    category: 'Ordinateurs',
    inStock: false,
    discount: 15,
    addedDate: '2024-01-08'
  }
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-BJ', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(price);
};

export default function AccountWishlistPage() {
  const [products, setProducts] = useState(wishlistProducts);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const removeFromWishlist = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
    setSelectedItems(selectedItems.filter(id => id !== productId));
  };

  const toggleSelection = (productId: string) => {
    setSelectedItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const addSelectedToCart = () => {
    // TODO: Add to cart logic
    console.log('Adding to cart:', selectedItems);
  };

  const shareWishlist = () => {
    // TODO: Share functionality
    console.log('Sharing wishlist');
  };

  return (
    <div className="min-h-screen bg-beshop-background">
      <Header />
      <CategoryMenu />
      
      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-beshop-primary">Accueil</Link>
          <span>/</span>
          <Link href="/account" className="hover:text-beshop-primary">Mon compte</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Ma liste de souhaits</span>
        </nav>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/account">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au compte
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ma liste de souhaits</h1>
              <p className="text-gray-600">{products.length} produit{products.length > 1 ? 's' : ''} sauvegardé{products.length > 1 ? 's' : ''}</p>
            </div>
          </div>
          
          {products.length > 0 && (
            <div className="flex space-x-3">
              <Button variant="outline" onClick={shareWishlist}>
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
              {selectedItems.length > 0 && (
                <Button className="bg-beshop-primary hover:bg-blue-700">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Ajouter au panier ({selectedItems.length})
                </Button>
              )}
            </div>
          )}
        </div>

        {products.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Votre liste de souhaits est vide
              </h3>
              <p className="text-gray-600 mb-6">
                Découvrez nos produits et ajoutez vos favoris à votre liste de souhaits
              </p>
              <Link href="/">
                <Button className="bg-beshop-primary hover:bg-blue-700">
                  Découvrir nos produits
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="group hover-lift transition-all duration-200">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  
                  {/* Discount Badge */}
                  {product.discount && (
                    <Badge className="absolute top-3 left-3 bg-red-500 text-white">
                      -{product.discount}%
                    </Badge>
                  )}
                  
                  {/* Stock Status */}
                  {!product.inStock && (
                    <Badge className="absolute top-3 right-3 bg-gray-500 text-white">
                      Rupture
                    </Badge>
                  )}
                  
                  {/* Quick Actions */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex flex-col space-y-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
                        onClick={() => removeFromWishlist(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Product Info */}
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600">{product.vendor}</p>
                    </div>
                    
                    {/* Rating */}
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(product.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {product.rating} ({product.reviews})
                      </span>
                    </div>
                    
                    {/* Price */}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-beshop-primary">
                          {formatPrice(product.price)}
                        </span>
                        {product.comparePrice && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.comparePrice)}
                          </span>
                        )}
                      </div>
                      {product.discount && (
                        <p className="text-xs text-green-600">
                          Vous économisez {formatPrice(product.comparePrice! - product.price)}
                        </p>
                      )}
                    </div>
                    
                    {/* Added Date */}
                    <p className="text-xs text-gray-500">
                      Ajouté le {new Date(product.addedDate).toLocaleDateString('fr-FR')}
                    </p>
                    
                    {/* Actions */}
                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => toggleSelection(product.id)}
                      >
                        {selectedItems.includes(product.id) ? (
                          <>
                            <Eye className="w-4 h-4 mr-1" />
                            Sélectionné
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-1" />
                            Sélectionner
                          </>
                        )}
                      </Button>
                      
                      <Link href={`/product/${product.slug}`} className="flex-1">
                        <Button size="sm" className="w-full">
                          Voir
                        </Button>
                      </Link>
                    </div>
                    
                    {/* Add to Cart */}
                    {product.inStock ? (
                      <Button 
                        className="w-full bg-beshop-primary hover:bg-blue-700"
                        onClick={() => console.log('Add to cart:', product.id)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Ajouter au panier
                      </Button>
                    ) : (
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 bg-gray-50 rounded-lg py-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>Produit en rupture de stock</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Continue Shopping */}
        {products.length > 0 && (
          <div className="text-center mt-12">
            <Link href="/">
              <Button variant="outline" size="lg">
                Découvrir plus de produits
              </Button>
            </Link>
        </div>
        )}
      </div>

      <Footer />
    </div>
  );
}


