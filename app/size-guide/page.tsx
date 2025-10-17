'use client';
export const revalidate = 300;

import React from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Ruler, Info } from 'lucide-react';
import Link from 'next/link';

export default function SizeGuidePage() {
  return (
    <div className="min-h-screen bg-jomionstore-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-jomionstore-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Guide des tailles</span>
        </nav>

        <div className="mb-6">
          <Badge className="bg-jomionstore-primary mb-3">Trouvez votre taille parfaite</Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Guide des tailles</h1>
          <p className="text-gray-600 text-lg">
            Consultez nos tableaux de correspondance pour choisir la bonne taille.
          </p>
        </div>

        <div className="space-y-6">
          {/* Comment mesurer */}
          <Card className="border-jomionstore-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="w-6 h-6 text-jomionstore-primary" />
                Comment prendre vos mesures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="border-orange-200 bg-orange-50 mb-4">
                <Info className="w-4 h-4 text-orange-600" />
                <AlertDescription>
                  Utilisez un mètre ruban souple et prenez vos mesures sur vous ou sur un vêtement qui vous va bien.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-semibold mb-2">📏 Tour de poitrine</h4>
                  <p className="text-sm text-gray-700">
                    Passez le mètre à l'endroit le plus fort de la poitrine, parallèle au sol.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-semibold mb-2">📏 Tour de taille</h4>
                  <p className="text-sm text-gray-700">
                    Mesurez au-dessus du nombril, à l'endroit le plus creux. Ne serrez pas.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-semibold mb-2">📏 Tour de hanches</h4>
                  <p className="text-sm text-gray-700">
                    Mesurez à l'endroit le plus fort des hanches et fesses, pieds joints.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vêtements Femmes */}
          <Card>
            <CardHeader>
              <CardTitle>👗 Vêtements Femmes</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left p-2">Taille</th>
                    <th className="text-left p-2">Poitrine (cm)</th>
                    <th className="text-left p-2">Taille (cm)</th>
                    <th className="text-left p-2">Hanches (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-gray-50"><td className="p-2 font-semibold">XS</td><td className="p-2">82-86</td><td className="p-2">64-68</td><td className="p-2">90-94</td></tr>
                  <tr className="border-b hover:bg-gray-50"><td className="p-2 font-semibold">S</td><td className="p-2">86-90</td><td className="p-2">68-72</td><td className="p-2">94-98</td></tr>
                  <tr className="border-b hover:bg-gray-50"><td className="p-2 font-semibold">M</td><td className="p-2">90-94</td><td className="p-2">72-76</td><td className="p-2">98-102</td></tr>
                  <tr className="border-b hover:bg-gray-50"><td className="p-2 font-semibold">L</td><td className="p-2">94-98</td><td className="p-2">76-80</td><td className="p-2">102-106</td></tr>
                  <tr className="border-b hover:bg-gray-50"><td className="p-2 font-semibold">XL</td><td className="p-2">98-104</td><td className="p-2">80-86</td><td className="p-2">106-112</td></tr>
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Vêtements Hommes */}
          <Card>
            <CardHeader>
              <CardTitle>👔 Vêtements Hommes</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left p-2">Taille</th>
                    <th className="text-left p-2">Poitrine (cm)</th>
                    <th className="text-left p-2">Taille (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-gray-50"><td className="p-2 font-semibold">S</td><td className="p-2">90-96</td><td className="p-2">78-84</td></tr>
                  <tr className="border-b hover:bg-gray-50"><td className="p-2 font-semibold">M</td><td className="p-2">96-102</td><td className="p-2">84-90</td></tr>
                  <tr className="border-b hover:bg-gray-50"><td className="p-2 font-semibold">L</td><td className="p-2">102-108</td><td className="p-2">90-96</td></tr>
                  <tr className="border-b hover:bg-gray-50"><td className="p-2 font-semibold">XL</td><td className="p-2">108-114</td><td className="p-2">96-102</td></tr>
                  <tr className="border-b hover:bg-gray-50"><td className="p-2 font-semibold">XXL</td><td className="p-2">114-122</td><td className="p-2">102-110</td></tr>
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Chaussures */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>👠 Chaussures Femmes</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left p-2">EU</th>
                      <th className="text-left p-2">US</th>
                      <th className="text-left p-2">UK</th>
                      <th className="text-left p-2">CM</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-gray-50"><td className="p-2 font-semibold">36</td><td className="p-2">6</td><td className="p-2">3.5</td><td className="p-2">22.7</td></tr>
                    <tr className="border-b hover:bg-gray-50"><td className="p-2 font-semibold">37</td><td className="p-2">7</td><td className="p-2">4.5</td><td className="p-2">23.3</td></tr>
                    <tr className="border-b hover:bg-gray-50"><td className="p-2 font-semibold">38</td><td className="p-2">8</td><td className="p-2">5.5</td><td className="p-2">24.0</td></tr>
                    <tr className="border-b hover:bg-gray-50"><td className="p-2 font-semibold">39</td><td className="p-2">9</td><td className="p-2">6.5</td><td className="p-2">24.7</td></tr>
                    <tr className="border-b hover:bg-gray-50"><td className="p-2 font-semibold">40</td><td className="p-2">10</td><td className="p-2">7</td><td className="p-2">25.3</td></tr>
                    <tr className="border-b hover:bg-gray-50"><td className="p-2 font-semibold">41</td><td className="p-2">11</td><td className="p-2">8</td><td className="p-2">26.0</td></tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>👞 Chaussures Hommes</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left p-2">EU</th>
                      <th className="text-left p-2">US</th>
                      <th className="text-left p-2">UK</th>
                      <th className="text-left p-2">CM</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-gray-50"><td className="p-2 font-semibold">40</td><td className="p-2">7</td><td className="p-2">6.5</td><td className="p-2">25.0</td></tr>
                    <tr className="border-b hover:bg-gray-50"><td className="p-2 font-semibold">41</td><td className="p-2">8</td><td className="p-2">7.5</td><td className="p-2">25.7</td></tr>
                    <tr className="border-b hover:bg-gray-50"><td className="p-2 font-semibold">42</td><td className="p-2">9</td><td className="p-2">8</td><td className="p-2">26.3</td></tr>
                    <tr className="border-b hover:bg-gray-50"><td className="p-2 font-semibold">43</td><td className="p-2">10</td><td className="p-2">9</td><td className="p-2">27.0</td></tr>
                    <tr className="border-b hover:bg-gray-50"><td className="p-2 font-semibold">44</td><td className="p-2">11</td><td className="p-2">10</td><td className="p-2">27.7</td></tr>
                    <tr className="border-b hover:bg-gray-50"><td className="p-2 font-semibold">45</td><td className="p-2">12</td><td className="p-2">11</td><td className="p-2">28.3</td></tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* Enfants */}
          <Card>
            <CardHeader>
              <CardTitle>👶 Vêtements Enfants</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left p-2">Âge</th>
                    <th className="text-left p-2">Hauteur (cm)</th>
                    <th className="text-left p-2">Poitrine (cm)</th>
                    <th className="text-left p-2">Taille FR</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-gray-50"><td className="p-2">2 ans</td><td className="p-2">86-92</td><td className="p-2">50-52</td><td className="p-2 font-semibold">2A</td></tr>
                  <tr className="border-b hover:bg-gray-50"><td className="p-2">4 ans</td><td className="p-2">98-104</td><td className="p-2">54-56</td><td className="p-2 font-semibold">4A</td></tr>
                  <tr className="border-b hover:bg-gray-50"><td className="p-2">6 ans</td><td className="p-2">110-116</td><td className="p-2">58-60</td><td className="p-2 font-semibold">6A</td></tr>
                  <tr className="border-b hover:bg-gray-50"><td className="p-2">8 ans</td><td className="p-2">116-128</td><td className="p-2">60-64</td><td className="p-2 font-semibold">8A</td></tr>
                  <tr className="border-b hover:bg-gray-50"><td className="p-2">10 ans</td><td className="p-2">128-140</td><td className="p-2">64-68</td><td className="p-2 font-semibold">10A</td></tr>
                  <tr className="border-b hover:bg-gray-50"><td className="p-2">12 ans</td><td className="p-2">140-152</td><td className="p-2">68-72</td><td className="p-2 font-semibold">12A</td></tr>
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Conseils */}
          <Card className="border-jomionstore-primary bg-jomionstore-primary/5">
            <CardHeader>
              <CardTitle>💡 Conseils</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-semibold mb-2">✅ À faire</h5>
                  <ul className="space-y-1 list-disc pl-5 text-gray-700">
                    <li>Mesurez-vous en sous-vêtements</li>
                    <li>Consultez les avis clients sur la taille</li>
                    <li>En cas de doute, prenez la taille au-dessus</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">❌ À éviter</h5>
                  <ul className="space-y-1 list-disc pl-5 text-gray-700">
                    <li>Se fier uniquement à votre taille habituelle</li>
                    <li>Ignorer les guides tailles des marques</li>
                    <li>Commander sans vérifier les mensurations</li>
                  </ul>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                💬 <strong>Besoin d'aide ?</strong> Contactez-nous : 
                <a href="tel:+2290164354089" className="text-jomionstore-primary hover:underline ml-1">+229 01 64 35 40 89</a> | 
                <a href="mailto:contact@jomionstore.com" className="text-jomionstore-primary hover:underline ml-1">contact@jomionstore.com</a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
