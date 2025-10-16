"use client";

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// import { Progress } from '@/components/ui/progress'; // Temporarily disabled due to build issue
import { Shield, Star, Gift, Crown, Trophy, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LoyaltyPoints {
  current: number;
  total: number;
  level: string;
  nextLevel: string;
  pointsToNext: number;
  benefits: string[];
}

interface LoyaltyTransaction {
  id: string;
  type: 'earned' | 'redeemed' | 'expired';
  amount: number;
  description: string;
  created_at: string;
}

export default function PointsPage() {
  const { user } = useAuth();
  const [points, setPoints] = React.useState<LoyaltyPoints | null>(null);
  const [transactions, setTransactions] = React.useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      if (!user?.id) return;
      setLoading(true);
      
      // Simulate API call - replace with real service
      try {
        // Mock data for now
        const mockPoints: LoyaltyPoints = {
          current: 1250,
          total: 2000,
          level: 'Gold',
          nextLevel: 'Platinum',
          pointsToNext: 750,
          benefits: [
            'Réduction 5% sur tous les achats',
            'Livraison gratuite',
            'Accès prioritaire aux ventes',
            'Support client prioritaire'
          ]
        };
        
        const mockTransactions: LoyaltyTransaction[] = [
          {
            id: '1',
            type: 'earned',
            amount: 100,
            description: 'Achat de 50€ - Commande #12345',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            type: 'earned',
            amount: 50,
            description: 'Achat de 25€ - Commande #12344',
            created_at: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: '3',
            type: 'redeemed',
            amount: -200,
            description: 'Échange contre réduction 10€',
            created_at: new Date(Date.now() - 172800000).toISOString()
          }
        ];
        
        setPoints(mockPoints);
        setTransactions(mockTransactions);
      } catch (error) {
        console.error('Error loading points:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'bronze': return <Shield className="w-6 h-6 text-orange-500" />;
      case 'silver': return <Star className="w-6 h-6 text-gray-400" />;
      case 'gold': return <Crown className="w-6 h-6 text-yellow-500" />;
      case 'platinum': return <Trophy className="w-6 h-6 text-purple-500" />;
      case 'diamond': return <Zap className="w-6 h-6 text-orange-500" />;
      default: return <Shield className="w-6 h-6 text-gray-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'bronze': return 'bg-orange-100 text-orange-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'platinum': return 'bg-purple-100 text-purple-800';
      case 'diamond': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <ProtectedRoute>
      <div>
        <div className="py-2">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <a href="/" className="hover:text-jomionstore-primary">Accueil</a>
            <span>/</span>
            <a href="/account" className="hover:text-jomionstore-primary">Mon compte</a>
            <span>/</span>
            <span className="text-gray-900 font-medium">Points de fidélité</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Points Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Mes points de fidélité
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jomionstore-primary mx-auto"></div>
                    </div>
                  ) : points ? (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getLevelIcon(points.level)}
                          <div>
                            <div className="font-semibold text-lg">{points.current} points</div>
                            <Badge className={getLevelColor(points.level)}>
                              {points.level}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Prochain niveau</div>
                          <div className="font-medium">{points.nextLevel}</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progression vers {points.nextLevel}</span>
                          <span>{points.pointsToNext} points restants</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-jomionstore-primary h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${points.pointsToNext > 0 ? (points.current / (points.current + points.pointsToNext)) * 100 : 100}%` 
                            }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-jomionstore-primary">{points.current}</div>
                          <div className="text-sm text-gray-600">Points actuels</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-600">{points.total}</div>
                          <div className="text-sm text-gray-600">Total gagné</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Aucune donnée de points disponible
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Benefits */}
              {points && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="w-5 h-5" />
                      Avantages {points.level}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {points.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle>Historique des points</CardTitle>
                </CardHeader>
                <CardContent>
                  {transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Aucune transaction de points
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              transaction.type === 'earned' ? 'bg-green-100' : 
                              transaction.type === 'redeemed' ? 'bg-blue-100' : 'bg-red-100'
                            }`}>
                              {transaction.type === 'earned' ? (
                                <Star className="w-4 h-4 text-green-600" />
                              ) : transaction.type === 'redeemed' ? (
                                <Gift className="w-4 h-4 text-orange-600" />
                              ) : (
                                <Shield className="w-4 h-4 text-red-600" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{transaction.description}</div>
                              <div className="text-xs text-gray-600">{formatDate(transaction.created_at)}</div>
                            </div>
                          </div>
                          <div className={`font-semibold ${
                            transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount} pts
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* How it works */}
              <Card>
                <CardHeader>
                  <CardTitle>Comment ça marche</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-jomionstore-primary text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <div>
                      <div className="font-medium">Gagnez des points</div>
                      <div>1 point = 1€ dépensé</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-jomionstore-primary text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <div>
                      <div className="font-medium">Montez de niveau</div>
                      <div>Plus vous achetez, plus vous gagnez d'avantages</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-jomionstore-primary text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <div>
                      <div className="font-medium">Échangez vos points</div>
                      <div>100 points = 1€ de réduction</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <Gift className="w-4 h-4 mr-2" />
                    Échanger des points
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Star className="w-4 h-4 mr-2" />
                    Voir les récompenses
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}