'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: plug to real auth (supabase/next-auth)
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="min-h-screen bg-beshop-background flex items-center">
      <div className="container py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-beshop-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Créer un compte</span>
        </nav>

        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Créer un compte</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Prénom</label>
                    <Input required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Votre prénom" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nom</label>
                    <Input required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Votre nom" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mot de passe</label>
                  <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" />
                </div>
                <Button type="submit" className="w-full bg-beshop-primary hover:bg-blue-700" disabled={loading}>
                  {loading ? 'Création...' : 'Créer un compte'}
                </Button>
              </form>
              <p className="text-sm text-gray-600 mt-4 text-center">
                Déjà un compte ? <Link href="/auth/login" className="text-beshop-primary hover:underline">Se connecter</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


