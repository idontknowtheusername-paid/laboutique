'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuthService } from '@/lib/services';
import { showSuccessToast, showErrorToast } from '@/components/ui/enhanced-toast';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';

function ResetPasswordPageContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();

  // Vérifier si on a les paramètres nécessaires et valider la session
  useEffect(() => {
    const checkResetToken = async () => {
      try {
        const result = await AuthService.handlePasswordResetFromUrl();
        
        if (!result.success || !result.data?.isValid) {
          setError(result.data?.error || 'Lien de réinitialisation invalide ou expiré');
        }
      } catch (error) {
        setError('Erreur lors de la vérification du lien de réinitialisation');
      }
    };

    checkResetToken();
  }, [searchParams]);

  // Validation du mot de passe
  const validatePassword = (password: string) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  };

  // Validation du formulaire
  const validateForm = () => {
    let isValid = true;
    setPasswordError('');
    setConfirmPasswordError('');

    if (!password) {
      setPasswordError('Le mot de passe est requis');
      isValid = false;
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.length) {
        setPasswordError('Le mot de passe doit contenir au moins 8 caractères');
        isValid = false;
      } else if (!passwordValidation.uppercase || !passwordValidation.lowercase || !passwordValidation.number) {
        setPasswordError('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre');
        isValid = false;
      }
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Veuillez confirmer votre mot de passe');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Les mots de passe ne correspondent pas');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await AuthService.confirmPasswordReset(password);

      if (result.success) {
        setSuccess(true);
        showSuccessToast('Mot de passe mis à jour avec succès !');
        
        // Rediriger vers la connexion après 2 secondes
        setTimeout(() => {
          router.push('/auth/login?message=password-reset-success');
        }, 2000);
      } else {
        setError(result.error || 'Erreur lors de la mise à jour du mot de passe');
        showErrorToast(result.error || 'Erreur lors de la mise à jour du mot de passe');
      }
    } catch (error) {
      setError('Une erreur inattendue est survenue');
      showErrorToast('Une erreur inattendue est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-jomionstore-background flex items-center">
      <div className="container py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Link href="/auth/login" className="mr-3 p-1 hover:bg-gray-100 rounded">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                Réinitialiser le mot de passe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {success ? (
                <div className="text-center space-y-4">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900">Mot de passe mis à jour !</h3>
                      <p className="text-sm text-gray-600">
                        Votre mot de passe a été réinitialisé avec succès.
                      </p>
                    </div>
                  </div>

                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Vous allez être redirigé vers la page de connexion.
                    </AlertDescription>
                  </Alert>

                  <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : (
                <>
                  {/* Error Display */}
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Reset Password Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nouveau mot de passe *</label>
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
                      {password && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-gray-600">Le mot de passe doit contenir :</p>
                          <div className="grid grid-cols-2 gap-1 text-xs">
                            <div className={`flex items-center ${validatePassword(password).length ? 'text-green-600' : 'text-gray-400'}`}>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              8+ caractères
                            </div>
                            <div className={`flex items-center ${validatePassword(password).uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Majuscule
                            </div>
                            <div className={`flex items-center ${validatePassword(password).lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Minuscule
                            </div>
                            <div className={`flex items-center ${validatePassword(password).number ? 'text-green-600' : 'text-gray-400'}`}>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Chiffre
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Confirmer le mot de passe *</label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="********"
                          className={confirmPasswordError ? 'border-red-500 pr-10' : 'pr-10'}
                          disabled={loading}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {confirmPasswordError && (
                        <p className="text-sm text-red-600 mt-1">{confirmPasswordError}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-jomionstore-primary hover:bg-orange-700"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Mise à jour...
                        </>
                      ) : (
                        'Mettre à jour le mot de passe'
                      )}
                    </Button>
                  </form>
                </>
              )}

              <p className="text-sm text-gray-600 text-center">
                <Link href="/auth/login" className="text-jomionstore-primary hover:underline flex items-center justify-center">
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



export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-jomionstore-background flex items-center justify-center">Chargement...</div>}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
