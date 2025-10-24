'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, CheckCircle, AlertCircle, Gift, Star, Shield, Truck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import SimpleSupportWidget from '@/components/support/SimpleSupportWidget';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const mistralApiKey = process.env.NEXT_PUBLIC_MISTRAL_API_KEY || '';

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      router.push('/account/wishlist');
    } else {
      router.push('/auth/login');
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setSubscriptionStatus('error');
      setErrorMessage('Veuillez entrer une adresse email valide');
      return;
    }

    setIsSubscribing(true);
    setSubscriptionStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setSubscriptionStatus('success');
        setEmail('');
        toast({
          title: "Abonnement réussi !",
          description: data.message,
        });
      } else {
        setSubscriptionStatus('error');
        setErrorMessage(data.error || 'Erreur lors de l\'abonnement');
        toast({
          title: "Erreur d'abonnement",
          description: data.error || 'Une erreur est survenue',
        });
      }
    } catch (error) {
      setSubscriptionStatus('error');
      setErrorMessage('Erreur de connexion');
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter au serveur",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <>
      <footer className="bg-gray-900 text-white">
      {/* Newsletter Section - Intégrée au footer */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 py-12">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Mail className="w-8 h-8 text-orange-400" />
                <h3 className="text-2xl md:text-3xl font-bold text-white">
                  Restez informé de nos offres
                </h3>
              </div>
              <p className="text-gray-300 text-lg mb-2">
                Recevez des offres exclusives, codes promo et nouveautés
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Gift className="w-4 h-4 text-orange-400" />
                  <span>Codes promo exclusifs</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-orange-400" />
                  <span>Nouveautés en avant-première</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-orange-400" />
                  <span>Pas de spam, désabonnement facile</span>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleNewsletterSubmit} className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input 
                    type="email" 
                    placeholder="Entrez votre adresse email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white text-gray-900 h-12 text-base border-0 focus:ring-2 focus:ring-orange-400" 
                    disabled={isSubscribing}
                    required
                  />
                </div>
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 h-12 px-8 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                  disabled={isSubscribing}
                >
                  {isSubscribing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Abonnement...</span>
                    </>
                  ) : (
                    <>
                      <span>S'abonner</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
              
              {/* Status Messages */}
              {subscriptionStatus === 'success' && (
                <div className="mt-4 flex items-center justify-center gap-2 text-green-300 text-sm bg-green-900/20 rounded-lg p-3">
                  <CheckCircle className="w-5 h-5" />
                  <span>Abonnement réussi ! Vérifiez votre email pour confirmer.</span>
                </div>
              )}
              
              {subscriptionStatus === 'error' && (
                <div className="mt-4 flex items-center justify-center gap-2 text-red-300 text-sm bg-red-900/20 rounded-lg p-3">
                  <AlertCircle className="w-5 h-5" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Footer Links - Amélioré */}
      <div className="py-12 bg-gray-900">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand - Amélioré */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Image 
                  src="/images/logo-header.png" 
                  alt="JomionStore" 
                  width={40}
                  height={40}
                  className="h-10 w-auto"
                  sizes="40px" 
                />
                <div>
                  <span className="text-xl font-bold text-white">JomionStore</span>
                  <p className="text-sm text-gray-400">Centre commercial digital du Bénin</p>
                </div>
              </div>
              
              <p className="text-gray-300 text-sm leading-relaxed">
                Votre destination shopping en ligne au Bénin. Des milliers de produits authentiques 
                avec livraison rapide et service client exceptionnel.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-300">
                  <MapPin className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  <span className="text-sm">Cotonou, Bénin</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <Phone className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  <span className="text-sm">+229 01 64 35 40 89</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <Mail className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  <span className="text-sm">contact@jomionstore.com</span>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-2">
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="border-gray-600 text-gray-300 hover:border-orange-400 hover:text-orange-400 hover:bg-orange-400/10 transition-all duration-300"
                  asChild
                >
                  <Link href="https://facebook.com/jomionstore" target="_blank" rel="noopener noreferrer" aria-label="Suivez-nous sur Facebook">
                    <Facebook className="w-5 h-5" />
                  </Link>
                </Button>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="border-gray-600 text-gray-300 hover:border-orange-400 hover:text-orange-400 hover:bg-orange-400/10 transition-all duration-300"
                  asChild
                >
                  <Link href="https://twitter.com/jomionstore" target="_blank" rel="noopener noreferrer" aria-label="Suivez-nous sur Twitter">
                    <Twitter className="w-5 h-5" />
                  </Link>
                </Button>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="border-gray-600 text-gray-300 hover:border-orange-400 hover:text-orange-400 hover:bg-orange-400/10 transition-all duration-300"
                  asChild
                >
                  <Link href="https://instagram.com/jomionstore" target="_blank" rel="noopener noreferrer" aria-label="Suivez-nous sur Instagram">
                    <Instagram className="w-5 h-5" />
                  </Link>
                </Button>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="border-gray-600 text-gray-300 hover:border-orange-400 hover:text-orange-400 hover:bg-orange-400/10 transition-all duration-300"
                  asChild
                >
                  <Link href="https://youtube.com/@jomionstore" target="_blank" rel="noopener noreferrer" aria-label="Suivez-nous sur YouTube">
                    <Youtube className="w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Shopping */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-400" />
                Shopping
              </h4>
              <nav className="space-y-3">
                <Link href="/categories" className="block text-gray-300 hover:text-orange-400 transition-colors duration-200 text-sm">
                  Toutes les catégories
                </Link>
                <Link href="/search" className="block text-gray-300 hover:text-orange-400 transition-colors duration-200 text-sm">
                  Recherche avancée
                </Link>
                <Link href="/flash-sales" className="block text-gray-300 hover:text-orange-400 transition-colors duration-200 text-sm">
                  Ventes flash
                </Link>
                <Link href="/#trending-products" className="block text-gray-300 hover:text-orange-400 transition-colors duration-200 text-sm">
                  Nouveautés
                </Link>
                <Link href="/#best-sellers" className="block text-gray-300 hover:text-orange-400 transition-colors duration-200 text-sm">
                  Meilleures ventes
                </Link>
                <button 
                  onClick={handleWishlistClick}
                  className="block text-gray-300 hover:text-orange-400 transition-colors duration-200 text-sm text-left"
                >
                  Ma liste de souhaits
                </button>
              </nav>
            </div>

            {/* Service Client */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-400" />
                Service Client
              </h4>
              <nav className="space-y-3">
                <Link href="/help" className="block text-gray-300 hover:text-orange-400 transition-colors duration-200 text-sm">
                  Centre d'aide
                </Link>
                <Link href="/shipping-returns" className="block text-gray-300 hover:text-orange-400 transition-colors duration-200 text-sm">
                  Livraison & Retours
                </Link>
                <Link href="/order-tracking" className="block text-gray-300 hover:text-orange-400 transition-colors duration-200 text-sm">
                  Suivi de commande
                </Link>
                <Link href="/warranty" className="block text-gray-300 hover:text-orange-400 transition-colors duration-200 text-sm">
                  Garantie produits
                </Link>
                <Link href="/contact" className="block text-gray-300 hover:text-orange-400 transition-colors duration-200 text-sm">
                  Nous contacter
                </Link>
                <Link href="/faq" className="block text-gray-300 hover:text-orange-400 transition-colors duration-200 text-sm">
                  FAQ
                </Link>
                <Link href="/cookies" className="block text-gray-300 hover:text-orange-400 transition-colors duration-200 text-sm">
                  Gestion des cookies
                </Link>
              </nav>
            </div>

            {/* Entreprise */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-orange-400" />
                Entreprise
              </h4>
              <nav className="space-y-3">
                <Link href="/about" className="block text-gray-300 hover:text-orange-400 transition-colors duration-200 text-sm">
                  À propos de nous
                </Link>
                <Link href="/blog" className="block text-gray-300 hover:text-orange-400 transition-colors duration-200 text-sm">
                  Blog & Actualités
                </Link>
                <Link href="/careers" className="block text-gray-300 hover:text-orange-400 transition-colors duration-200 text-sm">
                  Rejoignez-nous
                </Link>
                <Link href="/press" className="block text-gray-300 hover:text-orange-400 transition-colors duration-200 text-sm">
                  Presse
                </Link>
                <Link href="/terms" className="block text-gray-300 hover:text-orange-400 transition-colors duration-200 text-sm">
                  Conditions d'utilisation
                </Link>
                <Link href="/privacy" className="block text-gray-300 hover:text-orange-400 transition-colors duration-200 text-sm">
                  Politique de confidentialité
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Amélioré */}
      <div className="border-t border-gray-700 bg-gray-800">
        <div className="container py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 text-sm text-gray-400">
              <p>© {new Date().getFullYear()} JomionStore</p>
              <span className="hidden sm:inline">•</span>
              <p>Fait avec ❤️ au Bénin</p>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">Moyens de paiement acceptés :</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded text-white text-[10px] flex items-center justify-center font-bold shadow-sm">
                  VISA
                </div>
                <div className="w-8 h-6 bg-gradient-to-r from-red-600 to-red-800 rounded text-white text-[10px] flex items-center justify-center font-bold shadow-sm">
                  MC
                </div>
                <div className="w-8 h-6 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded text-white text-[10px] flex items-center justify-center font-bold shadow-sm">
                  MTN
                </div>
                <div className="w-8 h-6 bg-gradient-to-r from-red-500 to-red-700 rounded text-white text-[10px] flex items-center justify-center font-bold shadow-sm">
                  AIR
                </div>
                <div className="w-8 h-6 bg-gradient-to-r from-green-600 to-green-800 rounded text-white text-[10px] flex items-center justify-center font-bold shadow-sm">
                  MOOV
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <Link href="/terms" className="hover:text-orange-400 transition-colors">
                Conditions
              </Link>
              <Link href="/privacy" className="hover:text-orange-400 transition-colors">
                Confidentialité
              </Link>
              <Link href="/cookies" className="hover:text-orange-400 transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
    
    {/* Support Widget */}
    {mistralApiKey && <SimpleSupportWidget mistralApiKey={mistralApiKey} />}
    </>
  );
};

export default Footer;