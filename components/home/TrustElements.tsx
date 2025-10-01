'use client';

import React from 'react';
import { 
  Shield, 
  Truck, 
  RefreshCw, 
  Headphones, 
  Lock, 
  Award, 
  Clock, 
  Users,
  CheckCircle,
  Star
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const TrustElements = () => {
  const trustFeatures = [
    {
      icon: Shield,
      title: "Paiement sécurisé",
      description: "SSL 256-bit",
      color: "text-green-500",
      bgColor: "bg-green-50",
      details: "Vos données sont protégées par un cryptage de niveau bancaire"
    },
    {
      icon: Truck,
      title: "Livraison rapide",
      description: "24h à Cotonou",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      details: "Livraison gratuite pour toute commande supérieure à 50,000 F"
    },
    {
      icon: RefreshCw,
      title: "Retour facile",
      description: "30 jours",
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      details: "Retour gratuit et remboursement sous 48h"
    },
    {
      icon: Headphones,
      title: "Support 24/7",
      description: "Chat en direct",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      details: "Notre équipe vous accompagne à tout moment"
    },
    {
      icon: Award,
      title: "Produits authentiques",
      description: "Garantie officielle",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
      details: "Tous nos produits sont 100% authentiques avec garantie constructeur"
    },
    {
      icon: Users,
      title: "500K+ clients",
      description: "Satisfaits",
      color: "text-indigo-500",
      bgColor: "bg-indigo-50",
      details: "Rejoignez notre communauté de clients satisfaits"
    }
  ];

  const stats = [
    { number: "500K+", label: "Clients satisfaits", icon: Users },
    { number: "50K+", label: "Produits disponibles", icon: Award },
    { number: "1,200+", label: "Vendeurs partenaires", icon: Star },
    { number: "15+", label: "Villes desservies", icon: Truck }
  ];

  const certifications = [
    { name: "SSL Certifié", icon: Lock },
    { name: "PCI DSS", icon: Shield },
    { name: "ISO 27001", icon: Award },
    { name: "Trustpilot", icon: Star }
  ];

  return (
    <div className="bg-white">
      {/* Main Trust Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir JomionStore ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nous nous engageons à vous offrir la meilleure expérience d'achat en ligne au Bénin
            </p>
          </div>

          {/* Trust Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {trustFeatures.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm font-medium text-jomionstore-primary mb-2">
                        {feature.description}
                      </p>
                      <p className="text-sm text-gray-600">
                        {feature.details}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats Section */}
          <div className="bg-gradient-to-r from-jomionstore-primary to-blue-600 rounded-2xl p-8 md:p-12 text-white">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold mb-2">
                JomionStore en chiffres
              </h3>
              <p className="text-blue-100">
                Des résultats qui parlent d'eux-mêmes
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-8 h-8" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold mb-2">
                    {stat.number}
                  </div>
                  <div className="text-blue-100 text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certifications Bar */}
      <section className="py-8 bg-gray-50 border-t">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <h4 className="font-semibold text-gray-900 mb-2">
                Certifications et Sécurité
              </h4>
              <p className="text-sm text-gray-600">
                Votre confiance est notre priorité
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6">
              {certifications.map((cert, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-jomionstore-primary rounded-full flex items-center justify-center">
                    <cert.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {cert.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-12 bg-white">
        <div className="container">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Ce que disent nos clients
            </h3>
            <p className="text-gray-600">
              Plus de 10,000 avis clients vérifiés
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Marie K.",
                location: "Cotonou",
                rating: 5,
                comment: "Service exceptionnel ! Livraison rapide et produits de qualité. Je recommande vivement JomionStore."
              },
              {
                name: "Jean-Baptiste A.",
                location: "Porto-Novo",
                rating: 5,
                comment: "La meilleure plateforme e-commerce du Bénin. Interface intuitive et paiement sécurisé."
              },
              {
                name: "Fatou S.",
                location: "Parakou",
                rating: 5,
                comment: "Excellent rapport qualité-prix. Le support client est très réactif et professionnel."
              }
            ].map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 text-sm">
                    "{testimonial.comment}"
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-jomionstore-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {testimonial.location}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default TrustElements;