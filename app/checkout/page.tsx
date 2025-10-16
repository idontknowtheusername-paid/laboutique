'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Truck, ShieldCheck, CheckCircle, Smartphone, Globe, Zap, ShoppingCart, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';

const formatPrice = (price: number) => new Intl.NumberFormat('fr-BJ', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(price);

type PaymentMethod = 'checkout' | 'mobile-money';

export default function CheckoutPage() {
  const [placed, setPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('checkout');
  const router = useRouter();
  const { user } = useAuth();
  
  // ✅ UTILISER LE VRAI PANIER
  const { cartItems, cartSummary, loading: cartLoading } = useCart();

  useEffect(() => {
    // Protéger la page checkout si non connecté
    if (typeof window !== 'undefined' && !user) {
      router.replace('/auth/login?redirect=/checkout');
    }
  }, [user, router]);

  // Rediriger si le panier est vide
  useEffect(() => {
    if (!cartLoading && cartItems && cartItems.length === 0) {
      router.replace('/cart');
    }
  }, [cartItems, cartLoading, router]);

  // ✅ CALCULER LES TOTAUX DEPUIS LE VRAI PANIER
  const subtotal = cartSummary?.subtotal || 0;
  const shipping = cartSummary?.shipping_amount || 0;
  const total = cartSummary?.total_amount || 0;

  // États pour le formulaire
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    email: user?.email || '',
  });

  const placeOrderCheckout = async () => {
    try {
      // ✅ Utiliser les vrais items du panier
      if (!cartItems || cartItems.length === 0) {
        throw new Error('Votre panier est vide');
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          items: cartItems.map(item => ({ 
            product_id: item.product_id, 
            vendor_id: 'default', 
            quantity: item.quantity, 
            price: item.product?.price || 0 
          })),
          customer: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            country: 'Benin',
            postalCode: formData.postalCode || '229',
            shipping_address: {
              address: formData.address,
              city: formData.city,
              country: 'Benin',
              postalCode: formData.postalCode || '229'
            }
          }
        })
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.error || 'Échec de l\'initialisation du paiement');
      }
      
      if (json.payment_url) {
        console.log('Redirection vers Qosic Checkout:', json.payment_url);
        window.location.href = json.payment_url;
        return;
      }
      
      setPlaced(true);
    } catch (error: any) {
      throw error;
    }
  };

  const placeOrderMobileMoney = async () => {
    try {
      // ✅ Utiliser les vrais items du panier
      if (!cartItems || cartItems.length === 0) {
        throw new Error('Votre panier est vide');
      }

      const res = await fetch('/api/checkout/mobile-money', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          items: cartItems.map(item => ({ 
            product_id: item.product_id, 
            vendor_id: 'default', 
            quantity: item.quantity, 
            price: item.product?.price || 0 
          })),
          customer: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            address: formData.address,
            city: formData.city,
            country: 'Benin',
            postalCode: formData.postalCode || '229',
            shipping_address: {
              address: formData.address,
              city: formData.city,
              country: 'Benin',
              postalCode: formData.postalCode || '229'
            }
          },
          phone: formData.phone
        })
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.error || 'Échec de l\'initialisation du paiement Mobile Money');
      }
      
      if (json.transref && json.order_id) {
        console.log('Redirection vers validation Mobile Money');
        router.push(`/checkout/mobile-money-validation?transref=${json.transref}&order_id=${json.order_id}`);
        return;
      }
      
      setPlaced(true);
    } catch (error: any) {
      throw error;
    }
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation du formulaire
    if (!formData.firstName || !formData.lastName || !formData.address || !formData.city || !formData.phone || !formData.email) {
      setErrorMsg('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      
      if (paymentMethod === 'checkout') {
        await placeOrderCheckout();
      } else {
        await placeOrderMobileMoney();
      }
      
    } catch (err) {
      console.error('Erreur checkout:', err);
      setErrorMsg((err as Error)?.message || 'Le paiement a échoué. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-jomionstore-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-jomionstore-primary">Accueil</Link>
          <span>/</span>
          <Link href="/cart" className="hover:text-jomionstore-primary">Panier</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Paiement</span>
        </nav>

        {/* Loading state */}
        {cartLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-jomionstore-primary animate-spin mb-4" />
            <p className="text-gray-600">Chargement du panier...</p>
          </div>
        ) : !cartItems || cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Votre panier est vide</h2>
            <p className="text-gray-600 mb-6">Ajoutez des produits à votre panier avant de passer au paiement</p>
            <Link href="/products">
              <Button className="bg-jomionstore-primary hover:bg-orange-700">
                Découvrir nos produits
              </Button>
            </Link>
          </div>
        ) : placed ? (
          <div className="text-center py-16">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Commande confirmée !</h2>
            <p className="text-gray-600 mb-6">Merci pour votre achat. Vous recevrez un email de confirmation sous peu.</p>
            <Link href="/">
              <Button className="bg-jomionstore-primary hover:bg-orange-700">Retour à l'accueil</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Left: Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="w-5 h-5 mr-2" /> Adresse de livraison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                      placeholder="Prénom *" 
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      required 
                    />
                    <Input 
                      placeholder="Nom *" 
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      required 
                    />
                    <Input 
                      className="md:col-span-2" 
                      placeholder="Adresse *" 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      required 
                    />
                    <Input 
                      placeholder="Ville *" 
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      required 
                    />
                    <Input 
                      placeholder="Code postal" 
                      value={formData.postalCode}
                      onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                    />
                    <Input 
                      className="md:col-span-2" 
                      placeholder="Téléphone * (ex: 22967307747)" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required 
                    />
                    <Input 
                      className="md:col-span-2" 
                      type="email" 
                      placeholder="Email *" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required 
                    />
                  </form>
                </CardContent>
              </Card>

              {/* Payment Method Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" /> Méthode de paiement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                    {/* Option 1: Checkout (Qosic) */}
                    <div className={`relative flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'checkout' 
                        ? 'border-jomionstore-primary bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`} onClick={() => setPaymentMethod('checkout')}>
                      <RadioGroupItem value="checkout" id="checkout" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="checkout" className="cursor-pointer">
                          <div className="flex items-center gap-2 mb-1">
                            <Globe className="w-5 h-5 text-jomionstore-primary" />
                            <span className="font-semibold text-gray-900">Paiement Checkout</span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Recommandé</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Redirection vers page sécurisée Qosic
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-orange-200">📱 Mobile Money</span>
                            <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-200">💳 Carte bancaire</span>
                          </div>
                        </Label>
                      </div>
                      {paymentMethod === 'checkout' && (
                        <Zap className="w-5 h-5 text-jomionstore-primary absolute top-4 right-4" />
                      )}
                    </div>

                    {/* Option 2: Mobile Money Direct */}
                    <div className={`relative flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'mobile-money' 
                        ? 'border-jomionstore-primary bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`} onClick={() => setPaymentMethod('mobile-money')}>
                      <RadioGroupItem value="mobile-money" id="mobile-money" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="mobile-money" className="cursor-pointer">
                          <div className="flex items-center gap-2 mb-1">
                            <Smartphone className="w-5 h-5 text-orange-600" />
                            <span className="font-semibold text-gray-900">Mobile Money Direct</span>
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Rapide</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Paiement direct depuis votre téléphone
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded border border-orange-200">MTN MoMo</span>
                            <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded border border-yellow-200">Moov Money</span>
                          </div>
                        </Label>
                      </div>
                      {paymentMethod === 'mobile-money' && (
                        <Zap className="w-5 h-5 text-jomionstore-primary absolute top-4 right-4" />
                      )}
                    </div>
                  </RadioGroup>

                  {/* Info message based on selection */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-jomionstore-secondary mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-gray-700">
                        {paymentMethod === 'checkout' ? (
                          <p>Vous serez redirigé vers la plateforme Qosic pour choisir votre mode de paiement (Mobile Money ou Carte bancaire) et finaliser la transaction en toute sécurité.</p>
                        ) : (
                          <p>Vous recevrez une notification sur votre téléphone pour valider le paiement. Assurez-vous que le numéro de téléphone ci-dessus est correct.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                      {errorMsg}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button 
                disabled={loading} 
                onClick={placeOrder} 
                className="w-full bg-jomionstore-primary hover:bg-orange-700 h-12 text-base font-semibold"
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    {paymentMethod === 'checkout' ? 'Redirection...' : 'Envoi de la demande...'}
                  </>
                ) : (
                  <>
                    {paymentMethod === 'checkout' ? '🔒 Payer en toute sécurité' : '📱 Payer par Mobile Money'}
                    <span className="ml-2">({formatPrice(total)})</span>
                  </>
                )}
              </Button>
            </div>

            {/* Right: Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Résumé ({cartItems?.length || 0} article{(cartItems?.length || 0) > 1 ? 's' : ''})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-jomionstore-primary" />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {cartItems?.map((item) => (
                          <div key={item.id} className="flex items-center justify-between gap-2">
                            <span className="text-sm text-gray-700 line-clamp-1 flex-1">
                              {item.product?.name || 'Produit'} × {item.quantity}
                            </span>
                            <span className="text-sm font-medium whitespace-nowrap">
                              {formatPrice((item.product?.price || 0) * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <Separator />
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Sous-total</span>
                          <span>{formatPrice(subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Livraison</span>
                          <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                            {shipping === 0 ? 'Gratuite ✨' : formatPrice(shipping)}
                          </span>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-jomionstore-primary">{formatPrice(total)}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Security badges */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span>Paiement 100% sécurisé</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span>Données chiffrées SSL</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span>Conforme PCI-DSS</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
