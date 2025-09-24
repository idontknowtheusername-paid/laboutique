# Guide de Configuration Rapide

## Étapes à suivre maintenant

### 1. Configurer Supabase (OBLIGATOIRE)

1. **Aller sur [supabase.com](https://supabase.com)**
2. **Se connecter à ton projet** (gfhuotmjoiyhtllsmnwy)
3. **Aller dans "SQL Editor"** (dans la sidebar)
4. **Créer une nouvelle query**
5. **Copier tout le contenu** de `docs//supabase-setup.sql`
6. **Coller et exécuter** le script
7. **Vérifier qu'il n'y a pas d'erreurs**
8. **Optionnel : Ajouter des données de test**,
   - Créer une nouvelle query 
   - Copier le contenu de `docs/test-data.sql`
   - Exécuter pour avoir des produits de démonstration

### 2. Tester la configuration

```bash
# Installer les dépendances si nécessaire
npm install

# Tester la connexion Supabase
node scripts/test-supabase.js

# Démarrer le serveur de développement
npm run dev
```

### 3. Tester l'authentification

1. **Aller sur** http://localhost:3000/auth/register
2. **Créer un compte** avec un vrai email
3. **Vérifier l'email** de confirmation (check spam)
4. **Se connecter** sur /auth/login
5. **Vérifier** que le header affiche ton nom

### 4. Vérifier les données de test

1. **Page d'accueil** : doit afficher les produits de test ,
2. **Catégories** : doit avoir Électronique, Mode, etc.
3. **Recherche** : doit fonctionner avec "iPhone"

## En cas de problème

### Erreur "relation does not exist"
- Le script SQL n'a pas été exécuté
- Retourner à l'étape 1

### Erreur de connexion
- Vérifier les clés dans `.env.local`
- Vérifier que le projet Supabase est actif

### Problème d'authentification
- Vérifier que RLS est activé
- Vérifier les policies dans Supabase

## Prochaines phases

Une fois que tout fonctionne :
- ✅ Phase 0 : Configuration (TERMINÉE)
- 🚀 Phase 1 : Authentification complète
- 📦 Phase 2 : Catalogue produits dynamique
- 🔍 Phase 3 : Recherche
- 🛒 Phase 4 : Panier et wishlist

## Support

Si tu as des erreurs, partage-moi :
1. Le message d'erreur exact
2. Le résultat de `node scripts/test-supabase.js`
3. Une capture d'écran si nécessaire