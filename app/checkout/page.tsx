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
import { CreditCard, Truck, ShieldCheck, CheckCircle, Smartphone, Globe, Zap, ShoppingCart, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';

const formatPrice = (price: number) => new Intl.NumberFormat('fr-BJ', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(price);

type PaymentMethod = 'checkout';

export default function CheckoutPage() {
  const [placed, setPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('checkout');
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // ✅ UTILISER LE VRAI PANIER
  const { cartItems, cartSummary, loading: cartLoading } = useCart();

  useEffect(() => {
    // ✅ CORRECTION : Éviter la boucle infinie d'authentification
    if (typeof window !== 'undefined' && user === null && !authLoading) {
      // Seulement rediriger si on est sûr que l'utilisateur n'est pas connecté
      // et que le chargement d'authentification est terminé
      console.log('[Checkout] 🔒 Utilisateur non connecté, redirection...');
      router.replace('/auth/login?redirect=/checkout');
    }
  }, [user, authLoading, router]); // Utiliser authLoading

  // Rediriger si le panier est vide - TEMPORAIREMENT DÉSACTIVÉ
  // useEffect(() => {
  //   if (!cartLoading && cartItems && cartItems.length === 0) {
  //     router.replace('/cart');
  //   }
  // }, [cartItems, cartLoading, router]);

  // ✅ CALCULER LES TOTAUX DEPUIS LE VRAI PANIER
  const subtotal = cartSummary?.subtotal || 0;
  const shipping = cartSummary?.shipping_amount || 0;
  const total = cartSummary?.total_amount || 0;

  // États pour le formulaire avec validation
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    email: user?.email || '',
  });

  // États pour les erreurs de validation
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  // Fonctions de validation
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) return 'Le prénom est obligatoire';
        if (value.trim().length < 2) return 'Le prénom doit contenir au moins 2 caractères';
        if (!/^[a-zA-ZÀ-ÿ\s-']+$/.test(value.trim())) return 'Le prénom ne doit contenir que des lettres';
        return '';

      case 'lastName':
        if (!value.trim()) return 'Le nom est obligatoire';
        if (value.trim().length < 2) return 'Le nom doit contenir au moins 2 caractères';
        if (!/^[a-zA-ZÀ-ÿ\s-']+$/.test(value.trim())) return 'Le nom ne doit contenir que des lettres';
        return '';

      case 'address':
        if (!value.trim()) return 'L\'adresse est obligatoire';
        if (value.trim().length < 5) return 'L\'adresse doit contenir au moins 5 caractères';
        return '';

      case 'city':
        if (!value.trim()) return 'La ville est obligatoire';
        if (value.trim().length < 2) return 'La ville doit contenir au moins 2 caractères';
        if (!/^[a-zA-ZÀ-ÿ\s-']+$/.test(value.trim())) return 'La ville ne doit contenir que des lettres';
        return '';

      case 'phone':
        if (!value.trim()) return 'Le téléphone est obligatoire';
        // Accepter différents formats internationaux
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,15}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) return 'Format de téléphone invalide (8-15 chiffres)';
        return '';

      case 'email':
        if (!value.trim()) return 'L\'email est obligatoire';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) return 'Format d\'email invalide';
        return '';

      default:
        return '';
    }
  };

  // Fonction pour mettre à jour un champ avec validation
  const updateField = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    // Valider le champ en temps réel
    const error = validateField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  // Validation complète du formulaire
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    Object.keys(formData).forEach(key => {
      if (key !== 'postalCode') { // Code postal optionnel
        const error = validateField(key, formData[key as keyof typeof formData]);
        if (error) errors[key] = error;
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const placeOrderCheckout = async (itemsToUse: any[]) => {
    try {
      console.log('[Checkout Debug] 🔄 Début placeOrderCheckout...');

      console.log('[Checkout Debug] 📦 Items à utiliser:', itemsToUse.length, 'items');

      const payload = {
        user_id: user?.id,
        items: itemsToUse.map(item => ({
          product_id: item.product_id,
          vendor_id: item.product?.vendor_id || item.product?.vendor?.id || 'default',
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
      };

      console.log('[Checkout Debug] 📤 Payload envoyé:', JSON.stringify(payload, null, 2));

      console.log('[Checkout Debug] 🌐 Envoi requête vers /api/checkout...');

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('[Checkout Debug] 📥 Réponse reçue, status:', res.status);

      const json = await res.json();

      console.log('[Checkout Debug] 📋 Réponse serveur complète:', json);
      console.log('[Checkout Debug] 🔍 Analyse de la réponse:', {
        success: json.success,
        has_payment_url: !!json.payment_url,
        payment_url_value: json.payment_url,
        has_gateway_id: !!json.gateway_id,
        gateway_id_value: json.gateway_id
      });

      if (!res.ok) {
        console.error('[Checkout Debug] Erreur serveur:', json);
        throw new Error(json.error || 'Échec de l\'initialisation du paiement');
      }

      // ✅ REDIRECTION DIRECTE vers la plateforme Lygos
      if (json.success && json.payment_url) {
        console.log('[Checkout Debug] 🔗 URL Lygos reçue:', json.payment_url);
        console.log('[Checkout Debug] 🚀 Redirection DIRECTE vers Lygos...');

        // Redirection directe vers la plateforme de paiement Lygos
        window.location.href = json.payment_url;
        return;
      }

      // Si pas d'URL de paiement
      console.error('[Checkout Debug] ❌ Aucune URL de paiement disponible:', json);
      throw new Error('Impossible de récupérer l\'URL de paiement Lygos');

      setPlaced(true);
    } catch (error: any) {
      throw error;
    }
  };



  const placeOrder = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    console.log('[Checkout Debug] 🚀 Début du processus de commande...');

    // Validation complète du formulaire
    if (!validateForm()) {
      console.error('[Checkout Debug] ❌ Validation formulaire échouée');
      setErrorMsg('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    // Validation du panier - avec fallback temporaire
    let itemsToUse = cartItems;
    if (!cartItems || cartItems.length === 0) {
      console.warn('[Checkout Debug] ⚠️ Panier vide, utilisation panier de test');

      // Panier de test temporaire
      itemsToUse = [{
        id: 'test-item-1',
        user_id: user?.id || '',
        product_id: '406473d0-89fa-42c1-b1f6-96329b2cac19', // ID produit existant
        quantity: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        product: {
          id: '406473d0-89fa-42c1-b1f6-96329b2cac19',
          name: 'Produit de test',
          slug: 'produit-de-test',
          price: 25000,
          status: 'active',
          quantity: 999,
          track_quantity: false,
          vendor_id: 'default'
        }
      }];
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      console.log('[Checkout Debug] 📋 Items du panier:', cartItems);
      console.log('[Checkout Debug] 👤 Données formulaire:', formData);
      console.log('[Checkout Debug] 🆔 User ID:', user?.id);
      console.log('[Checkout Debug] 👤 User complet:', user);

      await placeOrderCheckout(itemsToUse);

      console.log('[Checkout Debug] ✅ Commande réussie !');

    } catch (err) {
      console.error('[Checkout Debug] ❌ Erreur checkout:', err);
      console.error('[Checkout Debug] 💥 Stack trace:', (err as Error)?.stack);

      // Afficher l'erreur à l'utilisateur aussi
      alert(`ERREUR DEBUG: ${(err as Error)?.message}`);

      setErrorMsg((err as Error)?.message || 'Le paiement a échoué. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ PROTECTION : Afficher un loader pendant l'authentification
  if (authLoading) {
    return (
      <div className="min-h-screen bg-jomionstore-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-jomionstore-primary" />
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // ✅ PROTECTION : Ne pas afficher la page si pas d'utilisateur
  if (!user) {
    return (
      <div className="min-h-screen bg-jomionstore-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirection vers la connexion...</p>
        </div>
      </div>
    );
  }

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
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Nom *"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                    <Input
                      className="md:col-span-2"
                      placeholder="Adresse *"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Ville *"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Code postal"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    />
                    <Input
                      className="md:col-span-2"
                      placeholder="Téléphone * (ex: 22967307747)"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                    <Input
                      className="md:col-span-2"
                      type="email"
                      placeholder="Email *"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                    {/* Option 1: Checkout */}
                    <div className={`relative flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'checkout'
                      ? 'border-jomionstore-primary bg-orange-50'
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
                            Redirection vers page sécurisée Lygos
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                                  <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded border border-orange-200">📱 Mobile Money</span>
                          </div>
                        </Label>
                      </div>
                      {paymentMethod === 'checkout' && (
                        <Zap className="w-5 h-5 text-jomionstore-primary absolute top-4 right-4" />
                      )}
                    </div>


                  </RadioGroup>

                  {/* Info message based on selection */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-jomionstore-secondary mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-gray-700">
                              <p>Vous serez redirigé vers la plateforme Lygos pour effectuer votre paiement Mobile Money en toute sécurité.</p>
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
                type="button"
                disabled={loading}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  placeOrder(e);
                }}
                className="w-full bg-jomionstore-primary hover:bg-orange-700 h-12 text-base font-semibold"
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Redirection vers Lygos...
                  </>
                ) : (
                  <>
                            Payer maintenant
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
