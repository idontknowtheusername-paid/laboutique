'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function TestCheckoutSimple() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testCheckout = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log('🧪 Test checkout simple...');

      // Récupérer un vrai produit d'abord
      console.log('🔍 Récupération d\'un produit réel...');

      const productsRes = await fetch('/api/products?limit=1');
      const productsData = await productsRes.json();

      if (!productsData.success || !productsData.data || productsData.data.length === 0) {
        throw new Error('Aucun produit trouvé dans la base');
      }

      const product = productsData.data[0];
      console.log('✅ Produit trouvé:', product.name, product.id);

      // Générer un UUID valide pour le test
      const testUserId = crypto.randomUUID();
      console.log('🆔 UUID généré pour test:', testUserId);

      const payload = {
        user_id: testUserId,
        items: [
          {
            product_id: product.id,
            vendor_id: product.vendor_id || 'default',
            quantity: 1,
            price: product.price
          }
        ],
        customer: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '+22967000000',
          address: 'Test Address',
          city: 'Cotonou',
          country: 'Benin',
          postalCode: '229'
        }
      };

      console.log('📤 Payload:', payload);

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      console.log('📥 Réponse:', json);
      console.log('📊 Status:', res.status);

      setResult({
        status: res.status,
        ok: res.ok,
        data: json,
        debug_info: json.debug || null
      });

    } catch (error) {
      console.error('❌ Erreur:', error);
      setResult({
        error: (error as Error).message || 'Erreur inconnue'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">🧪 Test Checkout Simple</h1>

        <Button
          onClick={testCheckout}
          disabled={loading}
          className="mb-6"
        >
          {loading ? 'Test en cours...' : 'Tester l\'API Checkout'}
        </Button>

        {result && (
          <div className="bg-white p-4 rounded-lg border">
            <h2 className="font-bold mb-2">Résultat :</h2>
            <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}