'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, MessageCircle, Truck, Shield, RefreshCw, CreditCard } from 'lucide-react';
import Link from 'next/link';

const topics = [
  { icon: Truck, title: 'Livraison', desc: 'Délais, zones, suivi des colis', href: '#delivery' },
  { icon: CreditCard, title: 'Paiement', desc: 'Moyens de paiement, sécurité', href: '#payment' },
  { icon: RefreshCw, title: 'Retours', desc: 'Retour et remboursement', href: '#returns' },
  { icon: Shield, title: 'Sécurité', desc: 'Protection des données', href: '#security' },
];

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-jomionstore-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-jomionstore-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Centre d'aide</span>
        </nav>

        {/* Hero */}
        <div className="text-center mb-10">
          <Badge className="bg-jomionstore-primary/10 text-jomionstore-primary mb-3">Assistance</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Comment pouvons-nous vous aider ?</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Recherchez une question ou explorez les catégories pour trouver rapidement des réponses.</p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Input placeholder="Rechercher une question (ex: livraison Cotonou)" className="h-12 pl-12" />
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <Link href="/faq">
              <Button className="absolute right-2 top-1/2 -translate-y-1/2 h-9">FAQ</Button>
            </Link>
          </div>
        </div>

        {/* Topics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {topics.map((t, i) => {
            const Icon = t.icon;
            return (
              <Link key={i} href={t.href}>
                <Card className="hover-lift cursor-pointer">
                  <CardContent className="p-6 space-y-3">
                    <div className="w-12 h-12 bg-jomionstore-primary/10 rounded-full flex items-center justify-center">
                      <Icon className="w-6 h-6 text-jomionstore-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{t.title}</h3>
                      <p className="text-sm text-gray-600">{t.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick answers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card id="delivery">
            <CardHeader>
              <CardTitle>Livraison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-gray-700">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Délais de livraison</h4>
                <p>Cotonou: 24-48h. Villes principales: 2-4 jours. Autres zones: 3-7 jours.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Frais</h4>
                <p>Gratuits au-delà de 50 000 XOF. Sinon à partir de 2 000 XOF.</p>
              </div>
            </CardContent>
          </Card>

          <Card id="payment">
            <CardHeader>
              <CardTitle>Paiement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-gray-700">
              <p>Cartes bancaires, Mobile Money, virement. Toutes les transactions sont sécurisées.</p>
            </CardContent>
          </Card>

          <Card id="returns">
            <CardHeader>
              <CardTitle>Retours & Remboursements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-gray-700">
              <p>Retour sous 30 jours pour produits non utilisés dans l'emballage d'origine.</p>
            </CardContent>
          </Card>
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <Link href="/contact">
            <Button className="bg-jomionstore-primary hover:bg-orange-700">
              <MessageCircle className="w-4 h-4 mr-2" /> Contacter le support
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}




