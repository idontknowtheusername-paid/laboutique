# 🚀 Plan d'Implémentation OAuth Dropship

## ✅ Décision Validée

**Votre app = Drop Shipping → On utilise les APIs Dropship**

---

## 📋 Plan d'Implémentation (2-3 jours)

### **Phase 1 : Service OAuth** ⏰ 4-6h

**Fichiers à créer :**

1. `lib/services/aliexpress-oauth.service.ts`
   - Générer authorization URL
   - Échanger code contre access_token
   - Refresh token automatique
   - Stocker/récupérer tokens

2. `lib/types/aliexpress-oauth.ts`
   - Interfaces TypeScript pour OAuth

---

### **Phase 2 : Routes API** ⏰ 2-3h

**Fichiers à créer/modifier :**

1. `app/api/aliexpress/auth/route.ts`
   - Redirect vers AliExpress pour autorisation

2. `app/api/aliexpress/callback/route.ts` (déjà existant, à compléter)
   - Recevoir authorization code
   - Échanger contre token
   - Stocker en base
   - Redirect vers admin

---

### **Phase 3 : Base de Données** ⏰ 1h

**Table Supabase :**

```sql
CREATE TABLE aliexpress_oauth_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP NOT NULL,
  token_type TEXT DEFAULT 'Bearer',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### **Phase 4 : Refactor API Service** ⏰ 4-6h

**Modifier :**

1. `lib/services/aliexpress-api.service.ts`
   - Remplacer `aliexpress.affiliate.*` par `aliexpress.ds.*`
   - Ajouter gestion access_token
   - Méthodes :
     - `aliexpress.ds.product.get` (au lieu de affiliate.productdetail.get)
     - `aliexpress.ds.recommend.feed.get` (recommandations)
     - `aliexpress.ds.order.create` (créer commandes)

---

### **Phase 5 : UI & UX** ⏰ 2h

**Créer :**

1. Page admin pour autoriser l'app
2. Indicateur si token valide/expiré
3. Bouton "Re-autoriser" si besoin

---

### **Phase 6 : Tests** ⏰ 2-3h

1. Test flux OAuth complet
2. Test refresh token
3. Test import produit
4. Test erreurs

---

## 🔑 Flux OAuth Dropship

```
┌─────────────────────────────────────────────────┐
│ 1. Admin clique "Autoriser AliExpress"         │
│    → GET /api/aliexpress/auth                  │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ 2. Redirect vers AliExpress                     │
│    URL: https://api.aliexpress.com/oauth/...   │
│    Params: app_key, redirect_uri, state        │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ 3. User accepte sur AliExpress                  │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ 4. AliExpress redirect vers callback           │
│    → GET /api/aliexpress/callback              │
│    Params: code, state                          │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ 5. Échanger code contre access_token            │
│    POST https://api.aliexpress.com/oauth/token  │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ 6. Stocker tokens en base Supabase             │
│    INSERT INTO aliexpress_oauth_tokens          │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ 7. Redirect admin vers dashboard               │
│    ✅ App autorisée !                           │
└─────────────────────────────────────────────────┘
```

---

## 📊 Différences Affiliate vs Dropship

### **Avant (Affiliate) :**
```typescript
// Signature simple
const params = {
  app_key: '520312',
  method: 'aliexpress.affiliate.productdetail.get',
  product_ids: '1234567890',
  tracking_id: 'xxxx', // ← Requis
  timestamp: Date.now(),
  sign_method: 'md5'
};
params.sign = generateMD5(params);

fetch(`https://api-sg.aliexpress.com/sync?${params}`);
```

### **Après (Dropship) :**
```typescript
// OAuth avec access_token
const token = await getAccessToken(); // ← De la base

const params = {
  app_key: '520312',
  method: 'aliexpress.ds.product.get',
  access_token: token, // ← Token OAuth
  product_id: '1234567890',
  timestamp: Date.now(),
  sign_method: 'md5'
};
params.sign = generateMD5(params);

fetch(`https://api-sg.aliexpress.com/sync?${params}`);
```

---

## 🔧 Variables d'Environnement

### **Ajouter dans `.env.local` :**

```bash
# AliExpress OAuth
ALIEXPRESS_APP_KEY=520312
ALIEXPRESS_APP_SECRET=vfuE366X5RPk9BghoOcGTk3nGfcncvOe
ALIEXPRESS_REDIRECT_URI=https://laboutique-seven.vercel.app/api/aliexpress/callback

# Supabase (pour stocker tokens)
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## ✅ Avantages Dropship

1. ✅ Utilise vos permissions actuelles
2. ✅ Pas besoin de Tracking ID
3. ✅ Gestion complète des commandes (future feature)
4. ✅ Conforme à votre type d'app

---

## 📅 Timeline

| Phase | Durée | Status |
|-------|-------|--------|
| 1. Service OAuth | 4-6h | ⏳ À faire |
| 2. Routes API | 2-3h | ⏳ À faire |
| 3. Base de données | 1h | ⏳ À faire |
| 4. Refactor API | 4-6h | ⏳ À faire |
| 5. UI/UX | 2h | ⏳ À faire |
| 6. Tests | 2-3h | ⏳ À faire |
| **TOTAL** | **15-21h** | **2-3 jours** |

---

## 🎯 Prochaines Étapes

1. ✅ Créer service OAuth
2. ✅ Créer routes auth/callback
3. ✅ Créer migration Supabase
4. ✅ Refactorer API service
5. ✅ Tester
6. ✅ Déployer

---

**Date début : 2025-10-11**
**Date fin estimée : 2025-10-13**
**Status : 🚀 Démarrage**
