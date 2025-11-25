"use client";

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tag, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CartService } from '@/lib/services/cart.service';

export default function CouponsPage() {
  const { user } = useAuth();
  const [code, setCode] = React.useState("");
  const [applying, setApplying] = React.useState(false);
  const [result, setResult] = React.useState<{ success: boolean; message: string; discount?: number } | null>(null);

  const handleApply = async () => {
    if (!user?.id || !code.trim()) return;
    setApplying(true);
    setResult(null);
    try {
      const res = await CartService.applyCoupon(user.id, code.trim());
      if (res.success && res.data) {
        setResult({ success: true, message: 'Coupon appliqué', discount: res.data.discountAmount });
      } else {
        setResult({ success: false, message: res.error || 'Coupon invalide' });
      }
    } finally {
      setApplying(false);
    }
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
            <span className="text-gray-900 font-medium">Mes coupons</span>
          </nav>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Tag className="w-5 h-5 mr-2"/>Appliquer un coupon</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Entrez votre code" value={code} onChange={(e)=>setCode(e.target.value)} />
                <Button onClick={handleApply} disabled={applying || !code.trim()} variant="outline">Appliquer</Button>
              </div>
              {result && (
                <div className={`flex items-center gap-2 text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                  {result.success ? <Check className="w-4 h-4"/> : <X className="w-4 h-4"/>}
                  <span>{result.message}{result.discount ? ` (-${result.discount} FCFA)` : ''}</span>
                </div>
              )}
              <div className="text-xs text-gray-500">La réduction sera appliquée lors du paiement si le coupon est valide.</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}

