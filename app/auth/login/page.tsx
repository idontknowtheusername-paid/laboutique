'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { AuthService } from '@/lib/services';
import { showSuccessToast, showErrorToast } from '@/components/ui/enhanced-toast';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { signIn, user, error: authError, clearError, retry } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.push(redirectTo);
    }
  }, [user, router, redirectTo]);

  // Clear errors when inputs change
  useEffect(() => {
    if (authError) {
      clearError();
    }
    setError('');
    setEmailError('');
    setPasswordError('');
  }, [email, password, authError, clearError]);

  // Validate email format
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate form
  const validateForm = () => {
    let isValid = true;

    if (!email) {
      setEmailError('L\'email est requis');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Format d\'email invalide');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Le mot de passe est requis');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await signIn(email, password);

      if (result.success) {
        showSuccessToast('Connexion réussie !');
        try {
          const current = await AuthService.getCurrentUser();
          const role = current?.data?.profile?.role;
          if (role === 'admin') {
            router.push('/admin/dashboard');
          } else {
            router.push(redirectTo);
          }
        } catch (_) {
          router.push(redirectTo);
        }
      } else {
        setError(result.error || 'Erreur lors de la connexion');
      }
    } catch (error) {
      setError('Une erreur inattendue est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setSocialLoading(provider);

    try {
      const result = provider === 'google'
        ? await AuthService.signInWithGoogle()
        : await AuthService.signInWithFacebook();

      if (result.success && result.data?.url) {
        window.location.href = result.data.url;
      } else {
        showErrorToast(result.error || `Erreur lors de la connexion avec ${provider}`);
      }
    } catch (error) {
      showErrorToast(`Erreur lors de la connexion avec ${provider}`);
    } finally {
      setSocialLoading(null);
    }
  };

  const handleRetry = async () => {
    if (authError?.retryable) {
      await retry();
    }
  };

  return (
    <div className="min-h-screen bg-jomiastore-background flex items-center">
      <div className="container py-8">
        {/* breadcrumb removed on auth pages */}

        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Se connecter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">


              {/* Error Display */}
              {(error || authError) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>{error || authError?.message}</span>
                    {authError?.retryable && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRetry}
                        className="ml-2"
                      >
                        Réessayer
                      </Button>
                    )}
                  </AlertDescription>
                </Alert>
              )}


              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
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

                <div>
                  <label className="block text-sm font-medium mb-2">Mot de passe</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="********"
                      className={passwordError ? 'border-red-500 pr-10' : 'pr-10'}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-sm text-red-600 mt-1">{passwordError}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-jomiastore-primary hover:underline"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-jomiastore-primary hover:bg-blue-700"
                  disabled={loading || socialLoading !== null}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </Button>
              </form>

              <p className="text-sm text-gray-600 text-center">
                Pas de compte ? <Link href="/auth/register" className="text-jomiastore-primary hover:underline">Créer un compte</Link>
              </p>

              {/* Separator */}
              <div className="flex items-center gap-3 mt-6">
                <div className="h-px bg-gray-200 flex-1" />
                <span className="text-xs text-gray-500">OU</span>
                <div className="h-px bg-gray-200 flex-1" />
              </div>

              {/* Social Login Buttons (bottom) */}
              <div className="space-y-3 mt-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialLogin('google')}
                  disabled={loading || socialLoading !== null}
                >
                  {socialLoading === 'google' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  Continuer avec Google
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialLogin('facebook')}
                  disabled={loading || socialLoading !== null}
                >
                  {socialLoading === 'facebook' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  )}
                  Continuer avec Facebook
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


