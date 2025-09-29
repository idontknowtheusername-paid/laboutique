'use client';

import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategoriesService } from '@/lib/services/categories.service';

interface CategorySelectorProps {
  value?: string;
  onChange: (categoryId: string) => void;
  placeholder?: string;
}

export function CategorySelector({ value, onChange, placeholder = "Sélectionner une catégorie" }: CategorySelectorProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const result = await CategoriesService.getAll();
        if (result.success && result.data) {
          setCategories(result.data || []);
        } else {
          setError('Erreur lors du chargement des catégories');
        }
      } catch (err) {
        setError('Erreur lors du chargement des catégories');
        console.error('Erreur chargement catégories:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger className="cursor-not-allowed">
          <SelectValue placeholder="Chargement des catégories..." />
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
    <Select value={value} onValueChange={onChange} aria-label="Sélectionner une catégorie">
      <SelectTrigger className="cursor-pointer">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="cursor-pointer">
        {categories.length === 0 ? (
          <SelectItem value="" disabled>
            Aucune catégorie disponible
          </SelectItem>
        ) : (
          categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}