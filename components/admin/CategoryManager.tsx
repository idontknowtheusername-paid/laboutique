'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  Folder, 
  FolderOpen,
  Save,
  X,
  Search,
  Filter
} from 'lucide-react';
import { useToast } from '@/components/admin/Toast';

interface Category {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  icon?: string;
  color?: string;
  product_count?: number;
  children?: Category[];
  isExpanded?: boolean;
}

interface CategoryFormData {
  name: string;
  description: string;
  parent_id: string;
  icon: string;
  color: string;
}

const defaultIcons = [
  '📱', '💻', '🎧', '⌚', '📷', '🎮', '🔌', '💡',
  '👕', '👖', '👗', '👠', '👜', '💍', '⌚', '👓',
  '🏠', '🛏️', '🪑', '🛋️', '🍽️', '🛁', '🚿', '🧺',
  '💄', '🧴', '🧼', '🪒', '💅', '🧴', '🌸', '🌺',
  '🚗', '🚲', '✈️', '🚢', '🏃', '⚽', '🎾', '🏊',
  '📚', '✏️', '📝', '📊', '🎨', '🎭', '🎵', '🎸'
];

const defaultColors = [
  'bg-red-100 text-red-800',
  'bg-orange-100 text-orange-800',
  'bg-green-100 text-green-800',
  'bg-yellow-100 text-yellow-800',
  'bg-purple-100 text-purple-800',
  'bg-pink-100 text-pink-800',
  'bg-indigo-100 text-indigo-800',
  'bg-gray-100 text-gray-800'
];

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    parent_id: '',
    icon: '📁',
    color: 'bg-gray-100 text-gray-800'
  });
  const { success, error } = useToast();

  // Charger les catégories
  const loadCategories = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      const result = await response.json();
      
      if (result.success) {
        // Organiser les catégories en arborescence
        const categoryTree = buildCategoryTree(result.data);
        setCategories(categoryTree);
      } else {
        error('Erreur', result.error || 'Impossible de charger les catégories');
      }
    } catch (err) {
      error('Erreur', 'Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  }, [error]);

  // Construire l'arborescence des catégories
  const buildCategoryTree = (flatCategories: Category[]): Category[] => {
    const categoryMap = new Map<string, Category>();
    const rootCategories: Category[] = [];

    // Créer une map des catégories
    flatCategories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [], isExpanded: false });
    });

    // Construire l'arborescence
    flatCategories.forEach(cat => {
      const category = categoryMap.get(cat.id)!;
      if (cat.parent_id) {
        const parent = categoryMap.get(cat.parent_id);
        if (parent) {
          parent.children!.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    return rootCategories;
  };

  // Sauvegarder une catégorie
  const saveCategory = async () => {
    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (result.success) {
        success('Succès', editingCategory ? 'Catégorie mise à jour' : 'Catégorie créée');
        setIsDialogOpen(false);
        setEditingCategory(null);
        resetForm();
        loadCategories();
      } else {
        error('Erreur', result.error || 'Erreur lors de la sauvegarde');
      }
    } catch (err) {
      error('Erreur', 'Erreur lors de la sauvegarde');
    }
  };

  // Supprimer une catégorie
  const deleteCategory = async (categoryId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        success('Succès', 'Catégorie supprimée');
        loadCategories();
      } else {
        error('Erreur', result.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      error('Erreur', 'Erreur lors de la suppression');
    }
  };

  // Ouvrir le dialog d'édition
  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      parent_id: category.parent_id || '',
      icon: category.icon || '📁',
      color: category.color || 'bg-gray-100 text-gray-800'
    });
    setIsDialogOpen(true);
  };

  // Ouvrir le dialog de création
  const openCreateDialog = (parentId?: string) => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      parent_id: parentId || '',
      icon: '📁',
      color: 'bg-gray-100 text-gray-800'
    });
    setIsDialogOpen(true);
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      parent_id: '',
      icon: '📁',
      color: 'bg-gray-100 text-gray-800'
    });
  };

  // Toggle expansion d'une catégorie
  const toggleExpansion = (categoryId: string) => {
    setCategories(prev => 
      prev.map(cat => toggleCategoryExpansion(cat, categoryId))
    );
  };

  const toggleCategoryExpansion = (category: Category, targetId: string): Category => {
    if (category.id === targetId) {
      return { ...category, isExpanded: !category.isExpanded };
    }
    if (category.children) {
      return {
        ...category,
        children: category.children.map(child => toggleCategoryExpansion(child, targetId))
      };
    }
    return category;
  };

  // Filtrer les catégories
  const filteredCategories = categories.filter(category => 
    filterCategory(category, searchTerm.toLowerCase())
  );

  const filterCategory = (category: Category, term: string): boolean => {
    if (category.name.toLowerCase().includes(term) || 
        category.description?.toLowerCase().includes(term)) {
      return true;
    }
    if (category.children) {
      return category.children.some(child => filterCategory(child, term));
    }
    return false;
  };

  // Rendu récursif des catégories
  const renderCategory = (category: Category, level: number = 0) => (
    <div key={category.id} className="space-y-2">
      <div 
        className={`flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors ${
          level > 0 ? 'ml-6' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          {category.children && category.children.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleExpansion(category.id)}
              className="p-1 h-6 w-6"
            >
              {category.isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          )}
          
          <div className="flex items-center gap-2">
            <span className="text-lg">{category.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{category.name}</span>
                <Badge className={category.color}>
                  {category.product_count || 0} produits
                </Badge>
              </div>
              {category.description && (
                <p className="text-sm text-gray-500">{category.description}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openCreateDialog(category.id)}
            className="text-green-600 hover:text-green-800"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEditDialog(category)}
            className="text-orange-600 hover:text-orange-800"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteCategory(category.id)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {category.isExpanded && category.children && (
        <div className="space-y-2">
          {category.children.map(child => renderCategory(child, level + 1))}
        </div>
      )}
    </div>
  );

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jomionstore-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des catégories</h2>
          <p className="text-gray-600">Organisez vos produits par catégories</p>
        </div>
        <Button onClick={() => openCreateDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle catégorie
        </Button>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          className="pl-10"
          placeholder="Rechercher une catégorie..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Liste des catégories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="w-5 h-5" />
            Catégories ({filteredCategories.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCategories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'Aucune catégorie trouvée' : 'Aucune catégorie créée'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCategories.map(category => renderCategory(category))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de création/édition */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nom de la catégorie"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description de la catégorie"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="parent">Catégorie parente</Label>
              <select
                id="parent"
                value={formData.parent_id}
                onChange={(e) => setFormData(prev => ({ ...prev, parent_id: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Aucune (catégorie racine)</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <Label>Icône</Label>
              <div className="grid grid-cols-8 gap-2 mt-2">
                {defaultIcons.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setFormData(prev => ({ ...prev, icon }))}
                    className={`p-2 text-lg rounded border ${
                      formData.icon === icon ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <Label>Couleur</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {defaultColors.map(color => (
                  <button
                    key={color}
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`p-2 rounded border ${
                      formData.color === color ? 'border-orange-500' : 'border-gray-200'
                    }`}
                  >
                    <Badge className={color}>Test</Badge>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
              <Button onClick={saveCategory} disabled={!formData.name.trim()}>
                <Save className="w-4 h-4 mr-2" />
                {editingCategory ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}