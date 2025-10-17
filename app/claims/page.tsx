'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  FileText, 
  Mail, 
  Phone,
  MessageSquare,
  Info,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function ClaimsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [claimType, setClaimType] = useState('');
  const [formData, setFormData] = useState({
    orderNumber: '',
    name: '',
    email: '',
    phone: '',
    description: '',
    desiredSolution: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claimNumber, setClaimNumber] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation côté client
    if (!formData.orderNumber || !claimType || !formData.name || !formData.email || !formData.description || !formData.desiredSolution) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      alert('Veuillez entrer une adresse email valide');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          claimType
        }),
      });

      const data = await response.json();

      if (data.success) {
        setClaimNumber(data.claimNumber);
        setSubmitted(true);
        
        // Reset form after 10 seconds
        setTimeout(() => {
          setSubmitted(false);
          setFormData({
            orderNumber: '',
            name: '',
            email: '',
            phone: '',
            description: '',
            desiredSolution: ''
          });
          setClaimType('');
          setClaimNumber('');
        }, 10000);
      } else {
        alert(data.error || 'Erreur lors de l\'enregistrement de la réclamation');
      }
    } catch (error) {
      console.error('Erreur envoi réclamation:', error);
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
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-jomionstore-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Réclamations</span>
        </nav>

        <div className="mb-6">
          <Badge className="bg-jomionstore-primary mb-3">Service Client</Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Réclamations & Litiges</h1>
          <p className="text-gray-600 text-lg">
            Vous rencontrez un problème ? Nous sommes là pour vous aider à le résoudre rapidement.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-jomionstore-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-6 h-6 text-jomionstore-primary" />
                  Soumettre une réclamation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-green-900 mb-2">Réclamation envoyée !</h3>
                    <p className="text-gray-700 mb-4">
                      Votre réclamation a bien été enregistrée. Numéro de suivi : <strong>#{claimNumber}</strong>
                    </p>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                      <p className="text-sm text-gray-700">
                        ⏱️ <strong>Délai de réponse :</strong> Sous 48h ouvrées<br />
                        📧 Un email de confirmation a été envoyé<br />
                        📍 Suivez votre réclamation dans <strong>Mon compte → Mes réclamations</strong>
                      </p>
                    </div>
                    <Button onClick={() => setSubmitted(false)}>Nouvelle réclamation</Button>
                  </div>
                ) : (
                  <form onSubmit={submit} className="space-y-4">
                    <Alert className="border-orange-200 bg-orange-50">
                      <Info className="w-4 h-4 text-orange-600" />
                      <AlertDescription>
                        <strong>💡 Avant de soumettre :</strong> Vérifiez si votre question n'a pas déjà une réponse dans notre{' '}
                        <Link href="/faq" className="text-jomionstore-primary hover:underline font-semibold">FAQ</Link> ou notre{' '}
                        <Link href="/help" className="text-jomionstore-primary hover:underline font-semibold">Centre d'aide</Link>.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Numéro de commande <span className="text-red-600">*</span>
                        </label>
                        <Input 
                          required 
                          value={formData.orderNumber}
                          onChange={(e) => handleInputChange('orderNumber', e.target.value)}
                          placeholder="Ex: CMD123456789" 
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Type de réclamation <span className="text-red-600">*</span>
                        </label>
                        <Select required onValueChange={setClaimType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="delivery">🚚 Problème de livraison</SelectItem>
                            <SelectItem value="product">📦 Produit défectueux/non conforme</SelectItem>
                            <SelectItem value="payment">💳 Problème de paiement</SelectItem>
                            <SelectItem value="refund">💰 Retour/Remboursement</SelectItem>
                            <SelectItem value="vendor">🏪 Litige avec un vendeur</SelectItem>
                            <SelectItem value="other">❓ Autre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Votre nom complet <span className="text-red-600">*</span>
                        </label>
                        <Input 
                          required 
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Ex: Jean Dupont" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email <span className="text-red-600">*</span>
                        </label>
                        <Input 
                          required 
                          type="email" 
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="votre@email.com" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone <span className="text-red-600">*</span>
                      </label>
                      <Input 
                        required 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+229 XX XX XX XX" 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description détaillée du problème <span className="text-red-600">*</span>
                      </label>
                      <Textarea 
                        required 
                        rows={6} 
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Décrivez votre problème en détail : Que s'est-il passé ? Quand ? Qu'attendez-vous comme solution ?"
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Plus votre description est précise, plus nous pourrons vous aider rapidement.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pièces jointes (optionnel)
                      </label>
                      <Input 
                        type="file" 
                        accept="image/*,.pdf"
                        multiple
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        📎 Photos du produit, capture d'écran du paiement, etc. (Max 5 Mo par fichier)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Solution souhaitée <span className="text-red-600">*</span>
                      </label>
                      <Select 
                        required 
                        value={formData.desiredSolution}
                        onValueChange={(value) => handleInputChange('desiredSolution', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Que souhaitez-vous ?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="refund">💰 Remboursement intégral</SelectItem>
                          <SelectItem value="replacement">🔄 Remplacement du produit</SelectItem>
                          <SelectItem value="repair">🔧 Réparation</SelectItem>
                          <SelectItem value="partial-refund">💵 Remboursement partiel</SelectItem>
                          <SelectItem value="explanation">💬 Explication/Justification</SelectItem>
                          <SelectItem value="other">❓ Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={isSubmitting}
                    >
                      <MessageSquare className="w-5 h-5 mr-2" />
                      {isSubmitting ? 'Envoi en cours...' : 'Envoyer la réclamation'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Guide résolution */}
            <Card>
              <CardHeader>
                <CardTitle>🔍 Comment nous traitons votre réclamation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-jomionstore-primary text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                    <div>
                      <h5 className="font-semibold">Réception & Analyse (24h)</h5>
                      <p className="text-sm text-gray-600">Votre réclamation est enregistrée et assignée à un agent spécialisé.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-jomionstore-primary text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                    <div>
                      <h5 className="font-semibold">Investigation (24-48h)</h5>
                      <p className="text-sm text-gray-600">Nous vérifions votre commande, contactons le vendeur si nécessaire.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-jomionstore-primary text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                    <div>
                      <h5 className="font-semibold">Proposition de solution (48-72h)</h5>
                      <p className="text-sm text-gray-600">Nous vous proposons une solution (remboursement, remplacement, etc.).</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">✓</div>
                    <div>
                      <h5 className="font-semibold text-green-700">Résolution</h5>
                      <p className="text-sm text-gray-600">Dès acceptation, nous mettons en œuvre la solution (sous 7 jours max).</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Délais */}
            <Card className="border-green-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="w-5 h-5 text-green-600" />
                  Délais de traitement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-green-50 p-3 rounded border border-green-200">
                  <p className="font-semibold text-green-900 mb-1">⚡ Réponse initiale</p>
                  <p className="text-2xl font-bold text-green-700">48h</p>
                  <p className="text-xs text-gray-600">Jours ouvrés</p>
                </div>
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <p className="font-semibold text-blue-900 mb-1">🔍 Résolution complète</p>
                  <p className="text-2xl font-bold text-blue-700">3-7 jours</p>
                  <p className="text-xs text-gray-600">Selon complexité</p>
                </div>
              </CardContent>
            </Card>

            {/* Contact urgent */}
            <Card className="border-red-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Problème urgent ?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-700">
                  Pour les problèmes nécessitant une intervention immédiate, contactez-nous directement :
                </p>
                <div className="bg-white p-3 rounded-lg border space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-jomionstore-primary" />
                    <a href="tel:+2290164354089" className="text-jomionstore-primary hover:underline font-semibold">
                      +229 01 64 35 40 89
                    </a>
                  </div>
                  <p className="text-xs text-gray-600">Lun-Sam : 8h-20h</p>
                </div>
                <div className="bg-white p-3 rounded-lg border space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-jomionstore-primary" />
                    <a href="mailto:contact@jomionstore.com" className="text-jomionstore-primary hover:underline font-semibold text-sm">
                      contact@jomionstore.com
                    </a>
                  </div>
                  <p className="text-xs text-gray-600">Réponse sous 2h (urgent)</p>
                </div>
              </CardContent>
            </Card>

            {/* Types réclamations courantes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📋 Réclamations fréquentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-jomionstore-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Produit défectueux</p>
                      <p className="text-xs text-gray-600">Remplacement ou remboursement</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-jomionstore-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Retard de livraison</p>
                      <p className="text-xs text-gray-600">Suivi et compensation possible</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-jomionstore-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Produit non conforme</p>
                      <p className="text-xs text-gray-600">Retour gratuit + remboursement</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-jomionstore-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Problème paiement</p>
                      <p className="text-xs text-gray-600">Vérification et régularisation</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ressources */}
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300">
              <CardHeader>
                <CardTitle className="text-lg">📚 Ressources utiles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/faq" className="block text-sm text-jomionstore-primary hover:underline font-semibold">
                  → Questions fréquentes (FAQ)
                </Link>
                <Link href="/shipping-returns" className="block text-sm text-jomionstore-primary hover:underline font-semibold">
                  → Politique de retours
                </Link>
                <Link href="/warranty" className="block text-sm text-jomionstore-primary hover:underline font-semibold">
                  → Garanties produits
                </Link>
                <Link href="/help" className="block text-sm text-jomionstore-primary hover:underline font-semibold">
                  → Centre d'aide
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
