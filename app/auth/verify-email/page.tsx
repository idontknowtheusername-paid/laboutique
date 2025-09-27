'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-jomiastore-background flex items-center">
      <div className="container py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Vérifiez votre email</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">Un lien de vérification vous a été envoyé. Veuillez vérifier votre boîte mail.</p>
              <p className="text-sm text-gray-600 mt-4">
                <Link href="/auth/login" className="text-jomiastore-primary hover:underline">Se connecter</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


