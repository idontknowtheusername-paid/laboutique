# 🚀 DÉMARRAGE RAPIDE - La Boutique B

## ⚡ CONNEXION FRONTEND-BACKEND EN 5 ÉTAPES

### 1️⃣ **CONFIGURER SUPABASE** (5 min)

1. **Aller sur [supabase.com](https://supabase.com)**
2. **Créer un nouveau projet** ou utiliser un existant
3. **Copier les clés** dans Settings > API
4. **Modifier `.env.local`** :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2️⃣ **INITIALISER LA BASE DE DONNÉES** (3 min)

1. **Aller dans SQL Editor** sur Supabase
2. **Créer une nouvelle query**
3. **Copier-coller** tout le contenu de `docs/supabase-setup.sql`
4. **Exécuter** le script
5. **Optionnel** : Exécuter aussi `docs/test-data.sql` pour avoir des données de test

### 3️⃣ **TESTER LA CONNEXION** (1 min)

```bash
# Tester la connexion Supabase
node scripts/test-full-connection.js
```

**Résultat attendu :** ✅ Toutes les vérifications passent

### 4️⃣ **DÉMARRER L'APPLICATION** (1 min)

```bash
# Démarrer le serveur de développement
npm run dev
```

**Aller sur :** http://localhost:3000

### 5️⃣ **VÉRIFIER LA CONNEXION** (2 min)

✅ **Page d'accueil** : Produits chargés depuis Supabase (pas de mock)
✅ **Menu catégories** : Catégories depuis la base de données
✅ **Recherche** : Fonctionne avec la base
✅ **Authentification** : Login/register fonctionnels
✅ **Panier/Wishlist** : Synchronisés avec le backend

---

## 🔧 **RÉSOLUTION DE PROBLÈMES**

### Problème : "Aucun produit affiché"
```bash
# Vérifier la connexion
node scripts/test-full-connection.js

# Ajouter des données de test
# → Exécuter docs/test-data.sql dans Supabase
```

### Problème : "Erreur de connexion"
```bash
# Vérifier les variables d'environnement
cat .env.local

# Vérifier que Supabase est accessible
curl -I https://votre-projet.supabase.co
```

### Problème : "Tables n'existent pas"
```bash
# Réexécuter le script de setup
# → Copier docs/supabase-setup.sql dans SQL Editor Supabase
```

---

## 📊 **APRÈS LA CONFIGURATION**

### ✅ **CE QUI FONCTIONNE**
- Page d'accueil avec vrais produits
- Navigation par catégories
- Recherche et filtres
- Authentification complète
- Panier et wishlist
- Gestion des commandes

### 🎯 **PROCHAINES ÉTAPES**
1. Ajouter plus de produits via l'interface admin
2. Configurer les paiements (Stripe)
3. Personnaliser les catégories et images
4. Tester toutes les fonctionnalités

---

## 🆘 **BESOIN D'AIDE ?**

- **Documentation Supabase** : [docs.supabase.com](https://docs.supabase.com)
- **Logs de debug** : Ouvrir la console navigateur (F12)
- **Logs serveur** : Vérifier la console où `npm run dev` tourne

**🎉 Une fois ces étapes terminées, votre frontend sera 100% connecté au backend !**