# 🛍️ AJOUTER DES PRODUITS TEMPORAIRES

## 🎯 **OBJECTIF**
Ajouter rapidement quelques produits dans votre base Supabase pour tester le frontend connecté.

## 🚀 **MÉTHODE 1 : Script SQL (RECOMMANDÉ)**

### Étapes :
1. **Aller sur [supabase.com](https://supabase.com)**
2. **Ouvrir votre projet**
3. **Aller dans "SQL Editor"**
4. **Créer une nouvelle query**
5. **Copier tout le contenu** de `scripts/sample-products.sql`
6. **Cliquer sur "Run"**

### Résultat attendu :
```
✅ 4 catégories ajoutées
✅ 3 vendeurs ajoutés  
✅ 8 produits ajoutés
✅ 3 bannières ajoutées
```

## 🚀 **MÉTHODE 2 : Script Node.js**

### Si vous préférez utiliser un script :

```bash
# Avec vos clés en paramètres
node scripts/add-products-manual.js "https://votre-projet.supabase.co" "votre_anon_key"

# Ou si .env.local est configuré
node scripts/add-products-manual.js
```

## 📦 **PRODUITS QUI SERONT AJOUTÉS**

### 📱 **Électronique (4 produits)**
- iPhone 15 Pro Max 256GB (850 000 FCFA) ⭐ **Vedette**
- MacBook Air M3 13" (1 200 000 FCFA) ⭐ **Vedette** 
- Samsung Galaxy S24 Ultra (780 000 FCFA)
- AirPods Pro 2ème génération (140 000 FCFA)

### 👗 **Mode & Beauté (2 produits)**
- Robe Élégante Africaine (45 000 FCFA) ⭐ **Vedette**
- Costume Homme Élégant (120 000 FCFA)

### 🏠 **Maison & Jardin (1 produit)**
- Canapé 3 Places Moderne (280 000 FCFA) ⭐ **Vedette**

### 🏃 **Sport & Loisirs (1 produit)**
- Ensemble Fitness Homme (35 000 FCFA)

## ✅ **APRÈS L'AJOUT**

### Tester que ça marche :
```bash
# Démarrer l'application
npm run dev

# Aller sur http://localhost:3000
```

### Ce que vous devriez voir :
- ✅ **Page d'accueil** : Vrais produits au lieu de mock data
- ✅ **Produits en vedette** : 4 produits marqués comme "featured"
- ✅ **Flash Sales** : Produits avec compare_price (en promotion)
- ✅ **Catégories** : 4 catégories avec compteurs de produits
- ✅ **Navigation** : Menu catégories fonctionnel

## 🔧 **DÉPANNAGE**

### Problème : "Aucun produit affiché"
```sql
-- Vérifier dans Supabase SQL Editor :
SELECT COUNT(*) FROM products WHERE status = 'active';
SELECT COUNT(*) FROM categories WHERE status = 'active';
```

### Problème : "Erreur de connexion"
- Vérifiez vos clés dans `.env.local`
- Redémarrez `npm run dev`

## 🎉 **RÉSULTAT FINAL**

Une fois les produits ajoutés, votre frontend sera **100% connecté au backend** avec de vraies données !

Plus de mock data - tout vient de Supabase ! 🚀