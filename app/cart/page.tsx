'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Tag, Truck, Shield } from 'lucide-react';
import Link from 'next/link';

// Mock cart data
const cartItems = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max 256GB',
    image: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=200',
    price: 850000,
    originalPrice: 950000,
    quantity: 1,
    vendor: 'Apple Store',
    inStock: true,
    discount: 11
  },
  {
    id: '2',
    name: 'AirPods Pro 2ème génération',
    image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=200',
    price: 140000,
    originalPrice: 180000,
    quantity: 2,
    vendor: 'Apple Store',
    inStock: true,
    discount: 22
  },
  {
    id: '3',
    name: 'MacBook Air M3 13"',
    image: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=200',
    price: 720000,
    originalPrice: 850000,
    quantity: 1,
    vendor: 'Apple Store',
    inStock: false,
    discount: 15
  }
];

export default function CartPage() {
  const [items, setItems] = useState(cartItems);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-BJ', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setItems(items.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const savings = items.reduce((sum, item) => sum + ((item.originalPrice - item.price) * item.quantity), 0);
  const shipping = subtotal > 50000 ? 0 : 2000;
  const promoDiscount = promoApplied ? subtotal * 0.05 : 0;
  const total = subtotal + shipping - promoDiscount;

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === 'beshop5') {
      setPromoApplied(true);
    }
  };

  return (
    <div className="min-h-screen bg-beshop-background">
      <Header />
      <CategoryMenu />
      
      <div className="container py-4 md:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-beshop-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Panier</span>
        </nav>

        {items.length === 0 ? (
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
              <Button className="bg-beshop-primary hover:bg-blue-700">
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
                  Mon Panier ({items.length} articles)
                </h1>
                <Link href="/">
                  <Button variant="outline" className="flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Continuer mes achats
                  </Button>
                </Link>
              </div>

              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <div className="w-full sm:w-24 h-48 sm:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 line-clamp-2">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Vendu par {item.vendor}
                            </p>
                            {!item.inStock && (
                              <Badge variant="destructive" className="mt-1">
                                Rupture de stock
                              </Badge>
                            )}
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 self-start"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          {/* Price */}
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-lg text-beshop-primary">
                                {formatPrice(item.price)}
                              </span>
                              {item.originalPrice > item.price && (
                                <span className="text-sm text-gray-500 line-through">
                                  {formatPrice(item.originalPrice)}
                                </span>
                              )}
                              {item.discount && (
                                <Badge className="bg-red-500 text-white text-xs">
                                  -{item.discount}%
                                </Badge>
                              )}
                            </div>
                            {item.originalPrice > item.price && (
                              <p className="text-xs text-green-600">
                                Vous économisez {formatPrice(item.originalPrice - item.price)}
                              </p>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center border rounded-lg">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1 || !item.inStock}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={!item.inStock}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            <span className="text-sm font-medium">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                  {promoApplied && (
                    <div className="flex items-center text-green-600 text-sm">
                      <Tag className="w-4 h-4 mr-1" />
                      Code BESHOP5 appliqué (-5%)
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Résumé de la commande</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Sous-total</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {savings > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Économies</span>
                        <span>-{formatPrice(savings)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Livraison</span>
                      <span className={shipping === 0 ? 'text-green-600' : ''}>
                        {shipping === 0 ? 'Gratuite' : formatPrice(shipping)}
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
                    <span className="text-beshop-primary">{formatPrice(total)}</span>
                  </div>

                  <Link href="/checkout">
                    <Button className="w-full bg-beshop-primary hover:bg-blue-700 h-12 text-lg">
                      Passer la commande
                    </Button>
                  </Link>

                  {/* Trust Badges */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="flex items-center text-sm text-gray-600">
                      <Truck className="w-4 h-4 mr-2 text-beshop-secondary" />
                      <span>Livraison rapide</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Shield className="w-4 h-4 mr-2 text-beshop-secondary" />
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