'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();

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
          variant: "destructive",
        });
      }
    } catch (error) {
      setSubscriptionStatus('error');
      setErrorMessage('Erreur de connexion');
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter au serveur",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Compact Newsletter (2 cols on mobile) */}
      <div className="bg-jomionstore-primary py-6">
        <div className="container">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-center">
            <h3 className="col-span-2 sm:col-span-1 text-lg font-semibold text-white">
              Recevez nos offres
            </h3>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2 col-span-2 sm:col-span-2">
              <Input 
                type="email" 
                placeholder="Votre email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white text-gray-900 h-10 flex-1" 
                disabled={isSubscribing}
                required
              />
              <Button 
                type="submit"
                className="bg-jomionstore-secondary hover:bg-orange-600 h-10 px-6"
                disabled={isSubscribing}
              >
                {isSubscribing ? '...' : 'S\'abonner'}
              </Button>
            </form>
          </div>
          
          {/* Status Messages */}
          {subscriptionStatus === 'success' && (
            <div className="mt-3 flex items-center gap-2 text-green-200 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Abonnement réussi ! Vérifiez votre email.</span>
            </div>
          )}
          
          {subscriptionStatus === 'error' && (
            <div className="mt-3 flex items-center gap-2 text-red-200 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Multi-columns even on mobile */}
      <div className="py-10">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="relative h-8 w-8">
                  <Image src="/logo-mono.svg" alt="JomionStore" fill className="object-contain" sizes="32px" />
                </span>
                <span className="font-semibold">JomionStore</span>
              </div>
              <div className="space-y-2 text-gray-300 text-xs">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-jomionstore-secondary" />
                  <span>Cotonou, Bénin</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-jomionstore-secondary" />
                  <span>+229 01 64 35 40 89</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-jomionstore-secondary" />
                  <span>contact@jomionstore.com</span>
                </div>
              </div>
              <div className="flex space-x-2 pt-1">
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="border-gray-700 text-gray-300 hover:border-jomionstore-primary hover:text-jomionstore-primary hover:bg-jomionstore-primary/10 transition-colors"
                  asChild
                >
                  <Link href="https://facebook.com/jomionstore" target="_blank" rel="noopener noreferrer" aria-label="Suivez-nous sur Facebook">
                    <Facebook className="w-4 h-4" />
                  </Link>
                </Button>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="border-gray-700 text-gray-300 hover:border-jomionstore-primary hover:text-jomionstore-primary hover:bg-jomionstore-primary/10 transition-colors"
                  asChild
                >
                  <Link href="https://twitter.com/jomionstore" target="_blank" rel="noopener noreferrer" aria-label="Suivez-nous sur Twitter">
                    <Twitter className="w-4 h-4" />
                  </Link>
                </Button>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="border-gray-700 text-gray-300 hover:border-jomionstore-primary hover:text-jomionstore-primary hover:bg-jomionstore-primary/10 transition-colors"
                  asChild
                >
                  <Link href="https://instagram.com/jomionstore" target="_blank" rel="noopener noreferrer" aria-label="Suivez-nous sur Instagram">
                    <Instagram className="w-4 h-4" />
                  </Link>
                </Button>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="border-gray-700 text-gray-300 hover:border-jomionstore-primary hover:text-jomionstore-primary hover:bg-jomionstore-primary/10 transition-colors"
                  asChild
                >
                  <Link href="https://youtube.com/@jomionstore" target="_blank" rel="noopener noreferrer" aria-label="Suivez-nous sur YouTube">
                    <Youtube className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Shop */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Boutique</h4>
              <nav className="grid grid-cols-2 gap-2 text-gray-300 text-xs">
                <Link href="/categories" className="hover:text-white">Catégories</Link>
                <Link href="/search" className="hover:text-white">Recherche</Link>
                <Link href="/help" className="hover:text-white">Aide</Link>
                <Link href="/shipping-returns" className="hover:text-white">Livraison</Link>
                <Link href="/order-tracking" className="hover:text-white">Suivi</Link>
                <Link href="/warranty" className="hover:text-white">Garantie</Link>
              </nav>
            </div>

            {/* Entreprise */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Entreprise</h4>
              <nav className="grid grid-cols-2 gap-2 text-gray-300 text-xs">
                <Link href="/about" className="hover:text-white">À propos</Link>
                <Link href="/press" className="hover:text-white">Presse</Link>
                <Link href="/careers" className="hover:text-white">Carrières</Link>
                <Link href="/blog" className="hover:text-white">Blog</Link>
                <Link href="/contact" className="hover:text-white">Contact</Link>
                <Link href="/investors" className="hover:text-white">Investisseurs</Link>
              </nav>
            </div>

            {/* Légal */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Légal</h4>
              <nav className="grid grid-cols-2 gap-2 text-gray-300 text-xs">
                <Link href="/terms" className="hover:text-white">Conditions</Link>
                <Link href="/privacy" className="hover:text-white">Confidentialité</Link>
                <Link href="/cookies" className="hover:text-white">Cookies</Link>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container py-5">
          <div className="grid grid-cols-2 md:grid-cols-3 items-center gap-3">
            <p className="col-span-2 md:col-span-1 text-xs text-gray-400">
              © {new Date().getFullYear()} JomionStore • Fait avec ❤️ au Bénin
            </p>
            <div className="flex items-center gap-2 justify-start md:justify-center">
              <span className="text-xs text-gray-400">Nous acceptons</span>
              <div className="flex items-center gap-2">
                <div className="w-7 h-5 bg-orange-600 rounded text-white text-[10px] flex items-center justify-center font-bold">VISA</div>
                <div className="w-7 h-5 bg-red-600 rounded text-white text-[10px] flex items-center justify-center font-bold">MC</div>
                <div className="w-7 h-5 bg-yellow-500 rounded text-white text-[10px] flex items-center justify-center font-bold">MTN</div>
                <div className="w-7 h-5 bg-red-500 rounded text-white text-[10px] flex items-center justify-center font-bold">AIR</div>
              </div>
            </div>
            <div className="hidden md:flex justify-end text-xs text-gray-500">
              <span>© JomionStore</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;