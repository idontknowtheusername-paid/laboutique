'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageSquare, 
  Headphones,
  Send,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

const contactInfo = [
  {
    icon: MapPin,
    title: 'Adresse',
    details: ['Quartier Ganhi, Cotonou', 'République du Bénin'],
    color: 'text-jomionstore-primary'
  },
  {
    icon: Phone,
    title: 'Téléphone',
    details: ['+229 01 64 35 40 89'],
    color: 'text-jomionstore-secondary'
  },
  {
    icon: Mail,
    title: 'Email',
    details: ['contact@jomionstore.com', 'info@jomionstore.com'],
    color: 'text-jomionstore-accent'
  },
  {
    icon: Clock,
    title: 'Horaires',
    details: ['Lun - Ven: 8h - 18h', 'Sam: 9h - 16h'],
    color: 'text-green-600'
  }
];

const supportOptions = [
  {
    icon: MessageSquare,
    title: 'Chat en direct',
    description: 'Discutez avec notre équipe support (redirige vers le formulaire)',
    action: 'Démarrer le chat',
    available: true,
    onClick: () => {
      // Pour l'instant, rediriger vers le formulaire de contact
      // TODO: Intégrer un système de chat en temps réel
      document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
    }
  },
  {
    icon: Headphones,
    title: 'Support téléphonique',
    description: 'Appelez-nous pour une assistance immédiate',
    action: 'Appeler maintenant',
    available: true,
    href: 'tel:+2290164354089'
  },
  {
    icon: Mail,
    title: 'Email support',
    description: 'Envoyez-nous un email détaillé',
    action: 'Envoyer un email',
    available: true,
    href: 'mailto:contact@jomionstore.com?subject=Support Client'
  }
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation côté client
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      alert('Veuillez entrer une adresse email valide');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubmitted(true);
        
        // Reset form after 5 seconds
        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({
            name: '',
            email: '',
            phone: '',
            subject: '',
            category: '',
            message: ''
          });
        }, 5000);
      } else {
        alert(data.error || 'Erreur lors de l\'envoi du message');
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
      alert('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-jomionstore-background">
      <Header />
      <CategoryMenu />
      
      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-jomionstore-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Contact</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Contactez-nous
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Notre équipe est là pour vous aider. N'hésitez pas à nous contacter pour toute question ou assistance.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactInfo.map((info, index) => {
            const IconComponent = info.icon;
            return (
              <Card key={index} className="text-center p-6 hover-lift">
                <CardContent className="space-y-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto bg-gray-100`}>
                    <IconComponent className={`w-8 h-8 ${info.color}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">{info.title}</h3>
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-sm text-gray-600">{detail}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card id="contact-form">
            <CardHeader>
              <CardTitle className="text-2xl">Envoyez-nous un message</CardTitle>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Message envoyé avec succès !
                  </h3>
                  <p className="text-gray-600">
                    Nous vous répondrons dans les plus brefs délais.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom complet *
                      </label>
                      <Input
                        required
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Votre nom complet"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <Input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+229 01 64 35 40 89"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Catégorie *
                      </label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">Question générale</SelectItem>
                          <SelectItem value="order">Commande</SelectItem>
                          <SelectItem value="payment">Paiement</SelectItem>
                          <SelectItem value="delivery">Livraison</SelectItem>
                          <SelectItem value="return">Retour/Remboursement</SelectItem>
                          <SelectItem value="vendor">Devenir vendeur</SelectItem>
                          <SelectItem value="technical">Problème technique</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sujet *
                    </label>
                    <Input
                      required
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="Résumé de votre demande"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <Textarea
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Décrivez votre demande en détail..."
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-jomionstore-primary hover:bg-orange-700 h-12"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Envoyer le message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Support Options & Map */}
          <div className="space-y-8">
            {/* Support Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Autres moyens de contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {supportOptions.map((option, index) => {
                  const IconComponent = option.icon;
                  return (
                    <div key={index} className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-12 h-12 bg-jomionstore-primary/10 rounded-full flex items-center justify-center mr-4">
                        <IconComponent className="w-6 h-6 text-jomionstore-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{option.title}</h3>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                      {option.href ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          asChild
                        >
                          <a href={option.href} className="flex items-center">
                            {option.action}
                          </a>
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={option.onClick}
                        >
                          {option.action}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* FAQ Link */}
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="font-bold text-gray-900 mb-2">Questions fréquentes</h3>
                <p className="text-gray-600 mb-4">
                  Consultez notre FAQ pour des réponses rapides aux questions courantes.
                </p>
                <Link href="/faq">
                  <Button variant="outline" className="w-full">
                    Voir la FAQ
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card>
              <CardHeader>
                <CardTitle>Horaires d'ouverture</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Lundi - Vendredi</span>
                  <span className="font-medium">8h00 - 18h00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Samedi</span>
                  <span className="font-medium">9h00 - 16h00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dimanche</span>
                  <span className="font-medium text-red-600">Fermé</span>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600">
                    <strong>Support d'urgence:</strong> Disponible 24h/7j pour les problèmes critiques
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Notre localisation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-200 h-64 md:h-96 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-jomionstore-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">JomionStore Headquarters</h3>
                  <p className="text-gray-600">Quartier Ganhi, Cotonou, Bénin</p>
                  <Button 
                    className="mt-4 bg-jomionstore-primary hover:bg-orange-700"
                    asChild
                  >
                    <a 
                      href="https://www.google.com/maps/search/Quartier+Ganhi,+Cotonou,+Bénin" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Voir sur Google Maps
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}