'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Truck, ShieldCheck, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

const cartSummary = [
  { id: '1', name: 'iPhone 15 Pro Max 256GB', price: 850000, qty: 1 },
  { id: '2', name: 'AirPods Pro 2', price: 140000, qty: 1 },
];

const formatPrice = (price: number) => new Intl.NumberFormat('fr-BJ', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(price);

export default function CheckoutPage() {
  const [placed, setPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Protéger la page checkout si non connecté
    if (typeof window !== 'undefined' && !user) {
      router.replace('/auth/login?redirect=/checkout');
    }
  }, [user, router]);

  const subtotal = cartSummary.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal > 50000 ? 0 : 2000;
  const total = subtotal + shipping;

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
      
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          items: cartSummary.map(i => ({ 
            product_id: i.id, 
            vendor_id: 'default', 
            quantity: i.qty, 
            price: i.price 
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
        console.log('Redirection vers Qosic:', json.payment_url);
        window.location.href = json.payment_url;
        return;
      }
      
      setPlaced(true);
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

        {placed ? (
          <div className="text-center py-16">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Commande confirmée !</h2>
            <p className="text-gray-600 mb-6">Merci pour votre achat. Vous recevrez un email de confirmation sous peu.</p>
            <Link href="/">
              <Button className="bg-jomionstore-primary hover:bg-blue-800">Retour à l'accueil</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Left: Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><Truck className="w-5 h-5 mr-2" /> Adresse de livraison</CardTitle>
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

              {/* Payment (hosted by Qosic) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><CreditCard className="w-5 h-5 mr-2" /> Paiement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-700">
                    Vous serez redirigé vers la page sécurisée de Qosic pour finaliser le paiement par Mobile Money ou Carte bancaire.
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ShieldCheck className="w-4 h-4 text-jomionstore-secondary" /> 
                    <span>Paiement sécurisé • Chiffré SSL</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">Mobile Money</span>
                    <span className="px-2 py-1 bg-green-50 text-green-700 rounded">Carte bancaire</span>
                  </div>
                  {errorMsg ? (
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                      {errorMsg}
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <Button disabled={loading} onClick={placeOrder} className="w-full bg-jomionstore-primary hover:bg-blue-800 h-12">{loading ? 'Redirection...' : 'Confirmer et payer'}</Button>
            </div>

            {/* Right: Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Résumé</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {cartSummary.map((it) => (
                      <div key={it.id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 line-clamp-1">{it.name} × {it.qty}</span>
                        <span className="text-sm font-medium">{formatPrice(it.price * it.qty)}</span>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Sous-total</span><span>{formatPrice(subtotal)}</span></div>
                    <div className="flex justify-between"><span>Livraison</span><span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'Gratuite' : formatPrice(shipping)}</span></div>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-jomionstore-primary">{formatPrice(total)}</span>
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




