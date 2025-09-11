import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-beshop-primary py-12">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">
              Restez informé de nos dernières offres
            </h3>
            <p className="text-blue-100 mb-6">
              Abonnez-vous à notre newsletter et recevez des offres exclusives directement dans votre boîte mail
            </p>
            <div className="flex flex-col sm:flex-row max-w-md mx-auto space-y-3 sm:space-y-0 sm:space-x-3">
              <Input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 bg-white text-gray-900"
              />
              <Button className="bg-beshop-secondary hover:bg-orange-600 px-8">
                S'abonner
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Be Shop</h2>
                  <p className="text-sm text-gray-400">Elite Shopping Experience</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Be Shop est la première plateforme e-commerce premium du Bénin, offrant une expérience d'achat exceptionnelle avec des produits authentiques et un service client de qualité.
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="w-4 h-4 text-beshop-secondary" />
                  <span>Cotonou, Bénin</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="w-4 h-4 text-beshop-secondary" />
                  <span>+229 XX XX XX XX</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="w-4 h-4 text-beshop-secondary" />
                  <span>contact@beshop.bj</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Liens rapides</h4>
              <nav className="space-y-2">
                <Link href="/about" className="block text-gray-300 hover:text-white transition-colors">
                  À propos de nous
                </Link>
                <Link href="/contact" className="block text-gray-300 hover:text-white transition-colors">
                  Nous contacter
                </Link>
                <Link href="/careers" className="block text-gray-300 hover:text-white transition-colors">
                  Carrières
                </Link>
                <Link href="/blog" className="block text-gray-300 hover:text-white transition-colors">
                  Blog
                </Link>
                <Link href="/press" className="block text-gray-300 hover:text-white transition-colors">
                  Presse
                </Link>
                <Link href="/investors" className="block text-gray-300 hover:text-white transition-colors">
                  Investisseurs
                </Link>
              </nav>
            </div>

            {/* Customer Service */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Service client</h4>
              <nav className="space-y-2">
                <Link href="/help" className="block text-gray-300 hover:text-white transition-colors">
                  Centre d'aide
                </Link>
                <Link href="/shipping" className="block text-gray-300 hover:text-white transition-colors">
                  Livraison & Retours
                </Link>
                <Link href="/size-guide" className="block text-gray-300 hover:text-white transition-colors">
                  Guide des tailles
                </Link>
                <Link href="/track" className="block text-gray-300 hover:text-white transition-colors">
                  Suivi de commande
                </Link>
                <Link href="/warranty" className="block text-gray-300 hover:text-white transition-colors">
                  Garantie
                </Link>
                <Link href="/complaints" className="block text-gray-300 hover:text-white transition-colors">
                  Réclamations
                </Link>
              </nav>
            </div>

            {/* Legal & Social */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Légal & Social</h4>
              <nav className="space-y-2">
                <Link href="/terms" className="block text-gray-300 hover:text-white transition-colors">
                  Conditions d'utilisation
                </Link>
                <Link href="/privacy" className="block text-gray-300 hover:text-white transition-colors">
                  Politique de confidentialité
                </Link>
                <Link href="/cookies" className="block text-gray-300 hover:text-white transition-colors">
                  Politique de cookies
                </Link>
                <Link href="/vendor-terms" className="block text-gray-300 hover:text-white transition-colors">
                  Conditions vendeurs
                </Link>
              </nav>
              
              {/* Social Media */}
              <div className="pt-4">
                <h5 className="font-medium mb-3">Suivez-nous</h5>
                <div className="flex space-x-3">
                  <Button size="icon" variant="outline" className="border-gray-600 hover:border-beshop-secondary hover:text-beshop-secondary">
                    <Facebook className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="outline" className="border-gray-600 hover:border-beshop-secondary hover:text-beshop-secondary">
                    <Twitter className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="outline" className="border-gray-600 hover:border-beshop-secondary hover:text-beshop-secondary">
                    <Instagram className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="outline" className="border-gray-600 hover:border-beshop-secondary hover:text-beshop-secondary">
                    <Youtube className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods & Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              <p className="text-sm text-gray-400">
                © 2024 Be Shop. Tous droits réservés.
              </p>
              <div className="hidden md:flex items-center space-x-4 text-xs text-gray-500">
                <span>Fait avec ❤️ au Bénin</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">Nous acceptons:</span>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                  VISA
                </div>
                <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">
                  MC
                </div>
                <div className="w-8 h-5 bg-yellow-500 rounded text-white text-xs flex items-center justify-center font-bold">
                  MTN
                </div>
                <div className="w-8 h-5 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">
                  AIR
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;