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
        
        console.log('🧪 TestProducts - Starting load...');
        
        // Test simple - récupérer tous les produits actifs
        const response = await ProductsService.getAll(
          { status: 'active' },
          { limit: 5 }
        );

        console.log('🧪 TestProducts - Response:', response);

        if (response.success && response.data) {
          const productsData = (response.data as any).data || [];
          console.log('🧪 TestProducts - Products data:', productsData);
          setProducts(productsData);
        } else {
          console.error('🧪 TestProducts - Error:', response.error);
        }
      } catch (err) {
        console.error('🧪 TestProducts - Exception:', err);
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