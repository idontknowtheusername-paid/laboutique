# Fix Reviews Rating - Colonnes manquantes

## Problème
Lors de la création d'un avis, l'erreur suivante se produit :
```
column "average_rating" of relation "products" does not exist
```

## Cause
Le trigger `update_product_ratings()` essaie de mettre à jour les colonnes `average_rating` et `reviews_count` dans la table `products`, mais ces colonnes n'existent pas.

## Solution

### Étape 1 : Appliquer la migration SQL

Ouvre l'éditeur SQL de Supabase et exécute le fichier `apply-rating-migration.sql` :

1. Va sur https://supabase.com/dashboard/project/[TON_PROJECT_ID]/sql
2. Copie le contenu du fichier `apply-rating-migration.sql`
3. Colle-le dans l'éditeur SQL
4. Clique sur "Run" pour exécuter

### Étape 2 : Vérifier que ça fonctionne

Après avoir exécuté la migration, vérifie que :

1. Les colonnes ont été ajoutées :
```sql
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'products' 
  AND column_name IN ('average_rating', 'reviews_count');
```

2. Les index ont été créés :
```sql
SELECT indexname 
FROM pg_indexes
WHERE tablename = 'products' 
  AND indexname LIKE 'idx_products_%rating%';
```

3. Essaie de créer un avis depuis l'interface - ça devrait fonctionner maintenant !

## Ce qui a été ajouté

### Colonnes dans `products`
- `average_rating` : DECIMAL(3,2) - Note moyenne (0-5)
- `reviews_count` : INTEGER - Nombre total d'avis

### Index pour la performance
- `idx_products_average_rating` - Pour trier par note
- `idx_products_reviews_count` - Pour trier par popularité

### Mise à jour automatique
Les triggers existants mettront automatiquement à jour ces colonnes quand :
- Un avis est créé
- Un avis est modifié
- Un avis est supprimé

## Test

Pour tester que tout fonctionne :

1. Va sur une page produit
2. Clique sur l'onglet "Avis"
3. Remplis le formulaire d'avis
4. Soumets l'avis
5. Vérifie que :
   - L'avis apparaît dans la liste
   - La note moyenne du produit est mise à jour
   - Le nombre d'avis est correct

## Fichiers modifiés

- ✅ `supabase/migrations/20251127_add_rating_columns_to_products.sql` - Migration créée
- ✅ `apply-rating-migration.sql` - Script d'application rapide
- ℹ️ `app/api/reviews/route.ts` - Aucune modification nécessaire (le code est correct)
