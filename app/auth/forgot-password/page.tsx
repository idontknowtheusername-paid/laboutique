'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-beshop-background flex items-center">
      <div className="container py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Mot de passe oublié</CardTitle>
            </CardHeader>
            <CardContent>
              {sent ? (
                <p className="text-gray-700">Un lien de réinitialisation a été envoyé à {email}.</p>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
                  </div>
                  <Button type="submit" className="w-full bg-beshop-primary hover:bg-blue-700">Envoyer le lien</Button>
                </form>
              )}
              <p className="text-sm text-gray-600 mt-4 text-center">
                <Link href="/auth/login" className="text-beshop-primary hover:underline">Retour à la connexion</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


