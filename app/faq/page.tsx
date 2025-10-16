'use client';
export const revalidate = 300;

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import Link from 'next/link';

const faqs = [
  { q: 'Quels sont les délais de livraison ?', a: "Cotonou: 24-48h. Villes principales: 2-4 jours. Autres zones: 3-7 jours." },
  { q: 'Quels moyens de paiement acceptez-vous ?', a: 'Cartes bancaires, Mobile Money et virement bancaire.' },
  { q: 'Comment suivre ma commande ?', a: 'Rendez-vous dans Mon compte > Mes commandes pour voir le statut et le suivi.' },
  { q: 'Comment retourner un produit ?', a: "Vous disposez de 30 jours pour retourner un produit non utilisé dans son emballage d'origine." },
  { q: 'Mes données sont-elles sécurisées ?', a: 'Nous utilisons le chiffrement TLS et respectons les meilleures pratiques de sécurité.' },
];

export default function FAQPage() {
  const [term, setTerm] = useState('');
  const filtered = faqs.filter(f => f.q.toLowerCase().includes(term.toLowerCase()));

  return (
    <div className="min-h-screen bg-jomionstore-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-jomionstore-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">FAQ</span>
        </nav>

        {/* Hero */}
        <div className="text-center mb-10">
          <Badge className="bg-jomionstore-primary/10 text-jomionstore-primary mb-3">Questions fréquentes</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">FAQ</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Trouvez rapidement des réponses aux questions les plus courantes.</p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Rechercher dans la FAQ" className="h-12 pl-12" />
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {(filtered.length > 0 ? filtered : faqs).map((f, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`}>
                  <AccordionTrigger>{f.q}</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-700">{f.a}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <div className="text-center mt-10">
          <p className="text-gray-600 mb-4">Vous n'avez pas trouvé votre réponse ?</p>
          <Link href="/contact">
            <Button className="bg-jomionstore-primary hover:bg-orange-700">Contacter le support</Button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}




