'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuthService } from '@/lib/services';
import { showSuccessToast, showErrorToast } from '@/components/ui/enhanced-toast';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    if (!email) {
      setEmailError('L\'email est requis');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Format d\'email invalide');
      return;
    }

    setLoading(true);
    setError('');
    setEmailError('');

    try {
      const result = await AuthService.resetPassword(email);

      if (result.success) {
        setSent(true);
        showSuccessToast('Email de réinitialisation envoyé !');
      } else {
        setError(result.error || 'Erreur lors de l\'envoi de l\'email');
      }
    } catch (error) {
      setError('Une erreur inattendue est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);

    try {
      const result = await AuthService.resetPassword(email);

      if (result.success) {
        showSuccessToast('Email renvoyé !');
      } else {
        showErrorToast(result.error || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      showErrorToast('Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-jomiastore-background flex items-center">
      <div className="container py-8">
        {/* breadcrumb removed on auth pages */}

        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Link href="/auth/login" className="mr-3 p-1 hover:bg-gray-100 rounded">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                Mot de passe oublié
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {sent ? (
                <div className="text-center space-y-4">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900">Email envoyé !</h3>
                      <p className="text-sm text-gray-600">
                        Nous avons envoyé un lien de réinitialisation à <strong>{email}</strong>
                      </p>
                    </div>
                  </div>

                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Cliquez sur le lien dans l'email pour réinitialiser votre mot de passe.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <Button
                      onClick={handleResend}
                      variant="outline"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Envoi...
                        </>
                      ) : (
                        'Renvoyer l\'email'
                      )}
                    </Button>

                    <Button asChild className="w-full">
                      <Link href="/auth/login">Retour à la connexion</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                  <>
                    <div className="text-center space-y-2">
                      <p className="text-gray-600">
                        Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                      </p>
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Adresse email</label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="vous@exemple.com"
                          className={emailError ? 'border-red-500' : ''}
                          disabled={loading}
                        />
                        {emailError && (
                          <p className="text-sm text-red-600 mt-1">{emailError}</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-jomiastore-primary hover:bg-blue-700"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Envoi...
                          </>
                        ) : (
                          'Envoyer le lien'
                        )}
                      </Button>
                    </form>
                  </>
              )}

              <p className="text-sm text-gray-600 text-center">
                <Link href="/auth/login" className="text-jomiastore-primary hover:underline flex items-center justify-center">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Retour à la connexion
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


