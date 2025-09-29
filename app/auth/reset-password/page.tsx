'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password === confirm) setDone(true);
  };

  return (
    <div className="min-h-screen bg-jomiastore-background flex items-center">
      <div className="container py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Réinitialiser le mot de passe</CardTitle>
            </CardHeader>
            <CardContent>
              {done ? (
                <p className="text-gray-700">Votre mot de passe a été mis à jour.</p>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nouveau mot de passe</label>
                    <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Confirmer le mot de passe</label>
                    <Input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="********" />
                  </div>
                  <Button type="submit" className="w-full bg-jomiastore-primary hover:bg-blue-700">Mettre à jour</Button>
                </form>
              )}
              <p className="text-sm text-gray-600 mt-4 text-center">
                <Link href="/auth/login" className="text-jomiastore-primary hover:underline">Se connecter</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


