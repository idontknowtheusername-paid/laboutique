# 🔧 Configuration Supabase - JomionStore

## 📋 ÉTAPES POUR ACTIVER LE MODE RÉEL

### 1. **Obtenir vos clés Supabase**

1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous à votre projet
3. Allez dans **Settings** → **API**
4. Copiez les valeurs suivantes :
   - **Project URL** (ex: `https://xyz.supabase.co`)
   - **anon public** key (ex: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **service_role** key (ex: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 2. **Configurer le fichier .env.local**

Remplacez le contenu de `.env.local` par vos vraies valeurs :

```env
# Supabase Configuration (REMPLACEZ PAR VOS VRAIES VALEURS)
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon-publique
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_SERVICE_ROLE_KEY=votre-cle-service-role

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=JomionStore
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. **Exécuter les migrations**

1. Allez dans **SQL Editor** de Supabase
2. Exécutez les scripts dans l'ordre :
   - `scripts/1-newsletters-only.sql`
   - `scripts/2-contact-only.sql`
   - `scripts/3-claims-only.sql`

### 4. **Redémarrer le serveur**

```bash
# Arrêter le serveur actuel
pkill -f "next dev"

# Redémarrer avec les nouvelles variables
npm run dev
```

### 5. **Tester les APIs**

```bash
# Tester toutes les APIs
node test-apis.js
```

## ✅ **VÉRIFICATION**

Si tout fonctionne, vous devriez voir :
- ✅ Newsletter: OK
- ✅ Contact: OK  
- ✅ Claims: OK
- ✅ Tracking: OK

## 🚨 **EN CAS DE PROBLÈME**

### Erreur de connexion Supabase
- Vérifiez que vos clés sont correctes
- Vérifiez que votre projet Supabase est actif
- Vérifiez que les tables ont été créées

### Erreur de permissions
- Vérifiez que les politiques RLS sont correctes
- Vérifiez que votre service_role key a les bonnes permissions

### Erreur de compilation
- Vérifiez que toutes les dépendances sont installées
- Vérifiez que les types TypeScript sont corrects

## 🎯 **FONCTIONNALITÉS DISPONIBLES**

Une fois configuré, vous aurez :

### 📧 **Newsletter**
- Abonnement depuis le footer
- Désabonnement automatique
- Gestion des statuts (active, unsubscribed, bounced)

### 📞 **Contact**
- Formulaire de contact fonctionnel
- Sauvegarde en base de données
- Gestion des catégories et statuts

### 🛠️ **Réclamations**
- Système de réclamations complet
- Numéros de réclamation uniques
- Priorités et statuts de suivi

### 📦 **Suivi de commandes**
- Recherche par numéro de suivi
- Recherche par email + numéro de commande
- Historique détaillé des étapes

## 🎉 **FÉLICITATIONS !**

Votre application JomionStore est maintenant **100% fonctionnelle** avec une vraie base de données !