'use client';

import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VendorsService } from '@/lib/services/vendors.service';

interface VendorSelectorProps {
  value?: string;
  onChange: (vendorId: string) => void;
  placeholder?: string;
}

export function VendorSelector({ value, onChange, placeholder = "Sélectionner un vendeur" }: VendorSelectorProps) {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadVendors = async () => {
      try {
        setLoading(true);
        const result = await VendorsService.getAll();
        if (result.success && result.data) {
          setVendors(result.data.items || []);
        } else {
          setError('Erreur lors du chargement des vendeurs');
        }
      } catch (err) {
        setError('Erreur lors du chargement des vendeurs');
        console.error('Erreur chargement vendeurs:', err);
      } finally {
        setLoading(false);
      }
    };

    loadVendors();
  }, []);

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Chargement des vendeurs..." />
        </SelectTrigger>
      </Select>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600">
        {error}
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {vendors.length === 0 ? (
          <SelectItem value="" disabled>
            Aucun vendeur disponible
          </SelectItem>
        ) : (
          vendors.map((vendor) => (
            <SelectItem key={vendor.id} value={vendor.id}>
              {vendor.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}