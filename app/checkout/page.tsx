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

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          items: cartSummary.map(i => ({ product_id: i.id, vendor_id: 'default', quantity: i.qty, price: i.price })),
          customer: {
            name: 'Client',
            email: 'client@example.com',
            phone: '+22900000000',
            shipping_address: {},
          }
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Checkout failed');
      if (json.payment_url) {
        window.location.href = json.payment_url;
        return;
      }
      setPlaced(true);
    } catch (err) {
      console.error(err);
      setErrorMsg((err as Error)?.message || 'Le paiement a échoué. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-beshop-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-beshop-primary">Accueil</Link>
          <span>/</span>
          <Link href="/cart" className="hover:text-beshop-primary">Panier</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Paiement</span>
        </nav>

        {placed ? (
          <div className="text-center py-16">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Commande confirmée !</h2>
            <p className="text-gray-600 mb-6">Merci pour votre achat. Vous recevrez un email de confirmation sous peu.</p>
            <Link href="/">
              <Button className="bg-beshop-primary hover:bg-blue-700">Retour à l'accueil</Button>
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
                    <Input placeholder="Prénom *" required />
                    <Input placeholder="Nom *" required />
                    <Input className="md:col-span-2" placeholder="Adresse *" required />
                    <Input placeholder="Ville *" required />
                    <Input placeholder="Code postal" />
                    <Input className="md:col-span-2" placeholder="Téléphone *" required />
                    <Input className="md:col-span-2" type="email" placeholder="Email *" required />
                  </form>
                </CardContent>
              </Card>

              {/* Payment (hosted by FedaPay) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><CreditCard className="w-5 h-5 mr-2" /> Paiement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-700">
                    Vous serez redirigé vers la page sécurisée de FedaPay pour renseigner vos informations et finaliser le paiement.
                  </div>
                  <div className="text-sm text-gray-600 flex items-center">
                    <ShieldCheck className="w-4 h-4 mr-2 text-beshop-secondary" /> Paiement sécurisé • Chiffré
                  </div>
                  {errorMsg ? (
                    <div className="text-sm text-red-600">{errorMsg}</div>
                  ) : null}
                </CardContent>
              </Card>

              <Button disabled={loading} onClick={placeOrder} className="w-full bg-beshop-primary hover:bg-blue-700 h-12">{loading ? 'Redirection...' : 'Confirmer et payer'}</Button>
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
                    <span className="text-beshop-primary">{formatPrice(total)}</span>
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




