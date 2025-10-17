'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Store, Upload, Shield, TrendingUp, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

export default function VendorRegisterPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-jomionstore-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-jomionstore-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Devenir vendeur</span>
        </nav>

        {/* Hero */}
        <div className="text-center mb-10">
          <Badge className="bg-jomionstore-primary/10 text-jomionstore-primary mb-3">Centre Commercial Digital</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Ouvrez votre boutique</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Rejoignez des milliers de vendeurs et développez votre activité sur JomionStore, le centre commercial digital du Bénin.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Informations vendeur</CardTitle>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="text-center py-10">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Demande envoyée !</h3>
                  <p className="text-gray-600">Notre équipe vous contactera sous 48 heures.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la boutique *</label>
                      <Input required placeholder="Ex: Apple Store Official" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <Input required type="email" placeholder="contact@boutique.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                      <Input required placeholder="01 64 35 40 89" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ville *</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cotonou">Cotonou</SelectItem>
                          <SelectItem value="porto-novo">Porto-Novo</SelectItem>
                          <SelectItem value="parakou">Parakou</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie principale *</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electronics">Électronique</SelectItem>
                        <SelectItem value="fashion">Mode</SelectItem>
                        <SelectItem value="home">Maison & Jardin</SelectItem>
                        <SelectItem value="beauty">Beauté & Santé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea className="w-full p-3 border rounded-lg" rows={4} placeholder="Présentez votre boutique..." />
                  </div>

                  <Button type="submit" className="w-full bg-jomionstore-primary hover:bg-orange-700 h-12">Soumettre ma demande</Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Benefits */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <Store className="w-5 h-5 text-jomionstore-primary" />
                  <p className="text-sm text-gray-700">Boutique personnalisée et outils professionnels</p>
                </div>
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-jomionstore-primary" />
                  <p className="text-sm text-gray-700">Accès à 500K+ clients potentiels</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-jomionstore-primary" />
                  <p className="text-sm text-gray-700">Paiements sécurisés et protection vendeur</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Déjà inscrit ?</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href="/vendor/dashboard">
                  <Button variant="outline" className="w-full">Accéder au dashboard</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Besoin d'aide ?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600">
                  Des questions sur l'inscription vendeur ?
                </p>
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="w-4 h-4 text-jomionstore-primary" />
                  <a href="mailto:hub@jomionstore.com" className="text-jomionstore-primary hover:underline">
                    hub@jomionstore.com
                  </a>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="w-4 h-4 text-jomionstore-primary" />
                  <a href="tel:0164354089" className="text-jomionstore-primary hover:underline">
                    01 64 35 40 89
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}




