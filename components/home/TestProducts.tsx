'use client';

import React, { useState, useEffect } from 'react';
import { Product, ProductsService } from '@/lib/services';

export default function TestProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        
        // Test simple - récupérer tous les produits actifs
        const response = await ProductsService.getAll(
          { status: 'active' },
          { limit: 5 }
        );

        if (response.success && response.data) {
          setProducts((response.data as any).data || []);
        }
      } catch (err) {
        console.error('Test error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return <div>Chargement test...</div>;
  }

  return (
    <div style={{ padding: '20px', border: '2px solid red', margin: '20px' }}>
      <h3>TEST PRODUITS ({products.length} trouvés)</h3>
      {products.map((product) => (
        <div key={product.id} style={{ margin: '10px 0', padding: '10px', background: '#f0f0f0' }}>
          <strong>{product.name}</strong> - {product.price} XOF
          <br />
          Catégorie: {product.category?.name || 'N/A'}
        </div>
      ))}
    </div>
  );
}