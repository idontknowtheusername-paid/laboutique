"use client";

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet as WalletIcon, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AccountService, WalletTransaction } from '@/lib/services/account.service';

export default function WalletPage() {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [balance, setBalance] = React.useState(0);
  const [currency, setCurrency] = React.useState('XOF');
  const [transactions, setTransactions] = React.useState<WalletTransaction[]>([]);

  React.useEffect(() => {
    (async () => {
      if (!user?.id) return;
      setLoading(true);
      const res = await AccountService.getWallet(user.id);
      if (res.success && res.data) {
        setBalance(res.data.balance);
        setCurrency(res.data.currency);
        setTransactions(res.data.transactions);
      }
      setLoading(false);
    })();
  }, [user?.id]);

  const formatPrice = (price: number) => new Intl.NumberFormat('fr-BJ', { style: 'currency', currency, minimumFractionDigits: 0 }).format(price);

  return (
    <ProtectedRoute>
      <div>
        <div className="py-2">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <a href="/" className="hover:text-jomionstore-primary">Accueil</a>
            <span>/</span>
            <a href="/account" className="hover:text-jomionstore-primary">Mon compte</a>
            <span>/</span>
            <span className="text-gray-900 font-medium">Mon wallet</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <CardTitle className="flex items-center"><WalletIcon className="w-5 h-5 mr-2"/>Solde</CardTitle>
                  <Badge variant="secondary" className="text-lg w-fit">{loading ? '...' : formatPrice(balance)}</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="w-full"><ArrowDownToLine className="w-4 h-4 mr-1 sm:mr-2" /><span className="text-xs sm:text-sm">Recharger</span></Button>
                    <Button variant="outline" size="sm" className="w-full"><ArrowUpFromLine className="w-4 h-4 mr-1 sm:mr-2" /><span className="text-xs sm:text-sm">Retirer</span></Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Historique</CardTitle>
                </CardHeader>
                <CardContent>
                  {transactions.length === 0 ? (
                    <div className="text-sm text-gray-500">Aucune transaction</div>
                  ) : (
                    <div className="space-y-3">
                      {transactions.map((t) => (
                        <div key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-md gap-2">
                          <div>
                            <div className="font-medium text-sm">{t.type === 'topup' ? 'Rechargement' : t.type === 'refund' ? 'Remboursement' : 'Achat'}</div>
                            <div className="text-xs text-gray-600">{t.reference || ''} • {t.created_at ? new Date(t.created_at).toLocaleString('fr-FR') : ''}</div>
                          </div>
                          <div className={`font-semibold text-sm ${t.type === 'purchase' ? 'text-red-600' : 'text-green-600'}`}>
                            {t.type === 'purchase' ? '-' : '+'}{formatPrice(t.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>À savoir</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 space-y-2">
                  <p>Les remboursements de retours peuvent être crédités ici.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

