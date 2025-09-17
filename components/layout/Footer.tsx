import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Compact Newsletter (2 cols on mobile) */}
      <div className="bg-beshop-primary py-6">
        <div className="container">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-center">
            <h3 className="col-span-2 sm:col-span-1 text-lg font-semibold text-white">
              Recevez nos offres
            </h3>
            <Input type="email" placeholder="Email" className="bg-white text-gray-900 h-10" />
            <Button className="bg-beshop-secondary hover:bg-orange-600 h-10">S'abonner</Button>
          </div>
        </div>
      </div>

      {/* Multi-columns even on mobile */}
      <div className="py-10">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">B</span>
                </div>
                <span className="font-semibold">Be Shop</span>
              </div>
              <div className="space-y-2 text-gray-300 text-xs">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-beshop-secondary" />
                  <span>Cotonou, Bénin</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-beshop-secondary" />
                  <span>+229 XX XX XX XX</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-beshop-secondary" />
                  <span>contact@beshop.bj</span>
                </div>
              </div>
              <div className="flex space-x-2 pt-1">
                <Button size="icon" variant="outline" className="border-gray-700 hover:border-beshop-secondary hover:text-beshop-secondary">
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="outline" className="border-gray-700 hover:border-beshop-secondary hover:text-beshop-secondary">
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="outline" className="border-gray-700 hover:border-beshop-secondary hover:text-beshop-secondary">
                  <Instagram className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="outline" className="border-gray-700 hover:border-beshop-secondary hover:text-beshop-secondary">
                  <Youtube className="w-4 h-4" />
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
              © {new Date().getFullYear()} Be Shop • Fait avec ❤️ au Bénin
            </p>
            <div className="flex items-center gap-2 justify-start md:justify-center">
              <span className="text-xs text-gray-400">Nous acceptons</span>
              <div className="flex items-center gap-2">
                <div className="w-7 h-5 bg-blue-600 rounded text-white text-[10px] flex items-center justify-center font-bold">VISA</div>
                <div className="w-7 h-5 bg-red-600 rounded text-white text-[10px] flex items-center justify-center font-bold">MC</div>
                <div className="w-7 h-5 bg-yellow-500 rounded text-white text-[10px] flex items-center justify-center font-bold">MTN</div>
                <div className="w-7 h-5 bg-red-500 rounded text-white text-[10px] flex items-center justify-center font-bold">AIR</div>
              </div>
            </div>
            <div className="hidden md:flex justify-end text-xs text-gray-500">
              <span>© Be Shop</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;