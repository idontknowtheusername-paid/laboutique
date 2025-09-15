'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { AuthService } from '@/lib/services';
import { showSuccessToast, showErrorToast } from '@/components/ui/enhanced-toast';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle, CheckCircle, Loader2, Mail } from 'lucide-react';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Field-specific errors
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    phone?: string;
    terms?: string;
  }>({});

  const { signUp, user, error: authError, clearError } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  // Clear errors when inputs change
  useEffect(() => {
    if (authError) {
      clearError();
    }
    setError('');
    setFieldErrors({});
  }, [firstName, lastName, email, password, confirmPassword, phone, authError, clearError]);

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^(\+229|00229)?[0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateForm = () => {
    const errors: typeof fieldErrors = {};
    let isValid = true;

    // First name validation
    if (!firstName.trim()) {
      errors.firstName = 'Le prénom est requis';
      isValid = false;
    } else if (firstName.trim().length < 2) {
      errors.firstName = 'Le prénom doit contenir au moins 2 caractères';
      isValid = false;
    }

    // Last name validation
    if (!lastName.trim()) {
      errors.lastName = 'Le nom est requis';
      isValid = false;
    } else if (lastName.trim().length < 2) {
      errors.lastName = 'Le nom doit contenir au moins 2 caractères';
      isValid = false;
    }

    // Email validation
    if (!email) {
      errors.email = 'L\'email est requis';
      isValid = false;
    } else if (!validateEmail(email)) {
      errors.email = 'Format d\'email invalide';
      isValid = false;
    }

    // Password validation
    if (!password) {
      errors.password = 'Le mot de passe est requis';
      isValid = false;
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.length) {
        errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
        isValid = false;
      } else if (!passwordValidation.uppercase || !passwordValidation.lowercase || !passwordValidation.number) {
        errors.password = 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre';
        isValid = false;
      }
    }

    // Confirm password validation
    if (!confirmPassword) {
      errors.confirmPassword = 'Veuillez confirmer votre mot de passe';
      isValid = false;
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
      isValid = false;
    }

    // Phone validation (optional but if provided must be valid)
    if (phone && !validatePhone(phone)) {
      errors.phone = 'Format de téléphone invalide (ex: +229 12345678)';
      isValid = false;
    }

    // Terms validation
    if (!acceptTerms) {
      errors.terms = 'Vous devez accepter les conditions d\'utilisation';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await signUp(email, password, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim() || undefined
      });

      if (result.success) {
        setSuccess(true);
        setEmailSent(true);
        showSuccessToast('Compte créé avec succès ! Vérifiez votre email.');
      } else {
        setError(result.error || 'Erreur lors de l\'inscription');
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
        showErrorToast(result.error || `Erreur lors de l'inscription avec ${provider}`);
      }
    } catch (error) {
      showErrorToast(`Erreur lors de l'inscription avec ${provider}`);
    } finally {
      setSocialLoading(null);
    }
  };

  const handleResendEmail = async () => {
    setResendLoading(true);

    try {
      const result = await AuthService.resendVerificationEmail(email);

      if (result.success) {
        showSuccessToast('Email de vérification renvoyé !');
      } else {
        showErrorToast(result.error || 'Erreur lors de l\'envoi de l\'email');
      }
    } catch (error) {
      showErrorToast('Erreur lors de l\'envoi de l\'email');
    } finally {
      setResendLoading(false);
    }
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
            <CardContent className="space-y-6">
              {success ? (
                <div className="text-center space-y-4">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <Mail className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900">Vérifiez votre email</h3>
                      <p className="text-sm text-gray-600">
                        Nous avons envoyé un lien de vérification à <strong>{email}</strong>
                      </p>
                    </div>
                  </div>

                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Cliquez sur le lien dans l'email pour activer votre compte.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <Button
                      onClick={handleResendEmail}
                      variant="outline"
                      className="w-full"
                      disabled={resendLoading}
                    >
                      {resendLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Envoi...
                        </>
                      ) : (
                        'Renvoyer l\'email'
                      )}
                    </Button>

                    <Button onClick={() => router.push('/auth/login')} className="w-full">
                      Aller à la connexion
                    </Button>
                  </div>
                </div>
              ) : (
                  <>
                    {/* Social Registration Buttons */}
                    <div className="space-y-3">
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
                        S'inscrire avec Google
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
                        S'inscrire avec Facebook
                      </Button>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Ou</span>
                      </div>
                    </div>

                    {/* Error Display */}
                    {(error || authError) && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {error || authError?.message}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Registration Form */}
                    <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                          <label className="block text-sm font-medium mb-2">Prénom *</label>
                          <Input
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Votre prénom"
                            className={fieldErrors.firstName ? 'border-red-500' : ''}
                            disabled={loading}
                          />
                          {fieldErrors.firstName && (
                            <p className="text-sm text-red-600 mt-1">{fieldErrors.firstName}</p>
                          )}
                      </div>
                      <div>
                          <label className="block text-sm font-medium mb-2">Nom *</label>
                          <Input
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Votre nom"
                            className={fieldErrors.lastName ? 'border-red-500' : ''}
                            disabled={loading}
                          />
                          {fieldErrors.lastName && (
                            <p className="text-sm text-red-600 mt-1">{fieldErrors.lastName}</p>
                          )}
                      </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Email *</label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="vous@exemple.com"
                          className={fieldErrors.email ? 'border-red-500' : ''}
                          disabled={loading}
                        />
                        {fieldErrors.email && (
                          <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Téléphone</label>
                        <Input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+229 12 34 56 78"
                          className={fieldErrors.phone ? 'border-red-500' : ''}
                          disabled={loading}
                        />
                        {fieldErrors.phone && (
                          <p className="text-sm text-red-600 mt-1">{fieldErrors.phone}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Mot de passe *</label>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            className={fieldErrors.password ? 'border-red-500 pr-10' : 'pr-10'}
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
                        {fieldErrors.password && (
                          <p className="text-sm text-red-600 mt-1">{fieldErrors.password}</p>
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
                            className={fieldErrors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
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
                        {fieldErrors.confirmPassword && (
                          <p className="text-sm text-red-600 mt-1">{fieldErrors.confirmPassword}</p>
                        )}
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="terms"
                          checked={acceptTerms}
                          onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                          className={fieldErrors.terms ? 'border-red-500' : ''}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="terms"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            J'accepte les{' '}
                            <Link href="/terms" className="text-beshop-primary hover:underline">
                              conditions d'utilisation
                            </Link>{' '}
                            et la{' '}
                            <Link href="/privacy" className="text-beshop-primary hover:underline">
                              politique de confidentialité
                            </Link>
                          </label>
                          {fieldErrors.terms && (
                            <p className="text-sm text-red-600">{fieldErrors.terms}</p>
                          )}
                        </div>
                    </div>

                      <Button
                        type="submit"
                        className="w-full bg-beshop-primary hover:bg-blue-700"
                        disabled={loading || socialLoading !== null}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Création...
                          </>
                        ) : (
                          'Créer un compte'
                        )}
                    </Button>
                  </form>
                  </>
              )}

              <p className="text-sm text-gray-600 text-center">
                Déjà un compte ? <Link href="/auth/login" className="text-beshop-primary hover:underline">Se connecter</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


