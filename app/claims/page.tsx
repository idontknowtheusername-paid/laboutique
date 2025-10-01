'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ClaimsPage() {
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-jomionstore-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-jomionstore-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Réclamations</span>
        </nav>

        <Card>
          <CardHeader>
            <CardTitle>Soumettre une réclamation</CardTitle>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <p className="text-center text-green-600">Réclamation envoyée. Nous revenons vers vous sous 48h.</p>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <Input required placeholder="Numéro de commande" />
                <Input required placeholder="Email" type="email" />
                <Textarea required rows={5} placeholder="Décrivez votre réclamation" />
                <Button type="submit">Envoyer</Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}




