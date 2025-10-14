# 📋 Résumé des Corrections OAuth AliExpress

## ✅ Corrections Appliquées

### 🔧 Problème Principal Identifié

**Le bug :** La méthode `exchangeCodeForToken()` utilisait la mauvaise méthode de signature.

```typescript
// ❌ AVANT (INCORRECT)
params.sign_method = 'md5';
params.sign = this.generateSign(params); // Méthode pour Business APIs

// ✅ APRÈS (CORRECT)
params.sign_method = 'sha256';
params.sign = this.generateSystemSign(apiPath, params); // Méthode pour System APIs
```

**Explication :**
- `/auth/token/create` est une **System API** (comme `/auth/token/refresh`)
- Les System APIs nécessitent HMAC-SHA256 avec le chemin API
- Les Business APIs utilisent MD5 wrappé avec le secret

---

## 📝 Fichiers Modifiés

### 1. `lib/services/aliexpress-oauth.service.ts`

**Lignes 63-78 :** Méthode `exchangeCodeForToken()`
- ✅ Changé `sign_method` de `'md5'` à `'sha256'`
- ✅ Ajouté `apiPath = '/auth/token/create'`
- ✅ Utilisé `generateSystemSign(apiPath, params)` au lieu de `generateSign(params)`
- ✅ Supprimé paramètres inutiles : `format`, `v`, `method`

**Lignes 83-109 :** Logging amélioré
- ✅ Ajouté logs de la requête URL et paramètres
- ✅ Ajouté logs détaillés des headers de réponse
- ✅ Capture du header `X-Ca-Error-Message` (crucial pour debug)
- ✅ Capture du header `X-Ca-Signature-Headers`

**Lignes 172-181 :** Méthode `generateSystemSign()`
- ✅ Ajouté logs détaillés : API path, sorted keys, signString, signature
- ✅ Logs de l'app secret (premiers 10 caractères)

---

## 🧪 Nouvelles Routes de Test

### 1. `/api/aliexpress/test-improved-signature`
Tests 5 variantes de signature différentes pour comparaison.

### 2. `/api/aliexpress/test-live-variations?code=XXX`
**⭐ ROUTE PRINCIPALE DE TEST**
- Fait 3 vraies requêtes vers l'API AliExpress avec différentes variantes
- Capture les headers d'erreur de chaque tentative
- Indique quelle variante fonctionne

### 3. `/api/aliexpress/test-doc-example`
Valide que notre logique correspond à l'exemple de la documentation.

---

## 🎯 Procédure de Test Recommandée

### Étape 1 : Obtenir un Code OAuth

```
1. Ouvrir : https://laboutique-seven.vercel.app/api/aliexpress/auth
2. Autoriser l'application
3. INTERCEPTER l'URL de callback : 
   https://laboutique-seven.vercel.app/api/aliexpress/callback?code=XXXXX
4. Copier le code (expire après quelques minutes)
```

### Étape 2 : Tester avec la Nouvelle Route

```
Appeler : https://laboutique-seven.vercel.app/api/aliexpress/test-live-variations?code=XXXXX
```

Cette route va :
- ✅ Tester 3 variantes de signature
- ✅ Faire de vraies requêtes à l'API
- ✅ Capturer tous les headers d'erreur
- ✅ Indiquer quelle méthode fonctionne

### Étape 3 : Analyser les Résultats

**Si une variante réussit (status 200) :**
- ✅ Le problème est résolu !
- Vérifier quelle variante a fonctionné
- Si ce n'est pas la Variante 1, ajuster le code

**Si toutes échouent :**
- Vérifier le champ `errorMessage` dans les résultats
- Comparer la `signString` avec ce que le serveur attend
- Consulter les logs Vercel pour plus de détails

### Étape 4 : Vérifier les Logs Vercel (si nécessaire)

```
1. Aller sur : https://vercel.com/laboutique/logs
2. Chercher : [OAuth] 🔐 String to Sign:
3. Chercher : [OAuth] 🔑 SERVEUR MESSAGE ERREUR:
4. Comparer les deux pour identifier la différence
```

---

## 🔍 Variantes de Signature Testées

### Variante 1 : HMAC-SHA256 avec sign_method (NOTRE IMPLÉMENTATION ACTUELLE)
```typescript
signString = '/auth/token/create' + 'app_key' + VALUE + 'code' + VALUE + 'sign_method' + 'sha256' + 'timestamp' + VALUE
signature = crypto.createHmac('sha256', appSecret).update(signString).digest('hex').toUpperCase()
```

### Variante 2 : HMAC-SHA256 SANS sign_method dans signString
```typescript
signString = '/auth/token/create' + 'app_key' + VALUE + 'code' + VALUE + 'timestamp' + VALUE
// sign_method ajouté aux params APRÈS signature
```

### Variante 3 : Signature en lowercase
```typescript
// Même que Variante 1 mais .toLowerCase() au lieu de .toUpperCase()
```

---

## 📊 Matrice de Décision

| Résultat | Action |
|----------|--------|
| **Variante 1 fonctionne** | ✅ Rien à faire, c'est déjà implémenté |
| **Variante 2 fonctionne** | Modifier `generateSystemSign()` pour exclure `sign_method` |
| **Variante 3 fonctionne** | Changer `.toUpperCase()` en `.toLowerCase()` |
| **Aucune ne fonctionne** | → Passer au Plan B (voir ci-dessous) |

---

## 🆘 Plan B : Solutions Alternatives

Si après les tests, aucune variante ne fonctionne :

### Option 1 : Import Manuel (Recommandé - Simple)
- Télécharger les produits en CSV depuis AliExpress
- Parser et importer dans Supabase
- ✅ Gratuit
- ✅ Simple
- ❌ Mise à jour manuelle

### Option 2 : API Tierce (RapidAPI)
- Utiliser "AliExpress Unofficial API" sur RapidAPI
- Coût : ~$50/mois pour 10k requêtes
- ✅ Stable et maintenu
- ✅ Pas de problèmes de signature
- ❌ Coût mensuel

### Option 3 : Scraping (Complexe)
- Puppeteer + Proxy rotatif
- Parsing HTML des pages produits
- ✅ Gratuit (hors coût proxy)
- ❌ Fragile (changements UI)
- ❌ Risque de blocage IP

### Option 4 : Contact Support AliExpress
- Email support avec App Key: 520312
- Demander exemple EXACT de requête fonctionnelle
- ⏱️ Délai : 3-7 jours
- ✅ Solution officielle garantie

---

## 🎓 Ce que Nous Avons Appris

### Documentation AliExpress
La documentation AliExpress distingue deux types d'APIs :

1. **System APIs** (`/rest/auth/*`)
   - Utilisent HMAC-SHA256
   - Format : `apiPath + key1 + value1 + ...`
   - Exemples : `/auth/token/create`, `/auth/token/refresh`

2. **Business APIs** (`/sync?method=...`)
   - Utilisent MD5 wrappé
   - Format : `secret + key1 + value1 + ... + secret`
   - Exemples : `aliexpress.ds.product.get`

### Méthode de Signature Correcte (System APIs)

```typescript
// 1. Paramètres (sans 'sign')
const params = {
  app_key: 'XXX',
  code: 'YYY',
  timestamp: 'ZZZ',
  sign_method: 'sha256'
};

// 2. Trier par clé (ASCII)
const sorted = Object.keys(params).sort();
// → ['app_key', 'code', 'sign_method', 'timestamp']

// 3. Construire signString
let signString = '/auth/token/create';
for (const key of sorted) {
  signString += key + params[key];
}
// → '/auth/token/createapp_keyXXXcodeYYYsign_methodsha256timestampZZZ'

// 4. Signature HMAC-SHA256
const signature = crypto
  .createHmac('sha256', appSecret)
  .update(signString, 'utf8')
  .digest('hex')
  .toUpperCase();

// 5. Ajouter aux params
params.sign = signature;

// 6. Requête
const url = `https://api-sg.aliexpress.com/rest/auth/token/create?${new URLSearchParams(params)}`;
```

---

## 🔑 Configuration Actuelle

```
ALIEXPRESS_APP_KEY=520312
ALIEXPRESS_APP_SECRET=vfuE366X5RPk9BghoOcGTk3nGfcncvOe
ALIEXPRESS_REDIRECT_URI=https://laboutique-seven.vercel.app/api/aliexpress/callback
```

Vérifier que ces valeurs sont identiques :
- ✅ `.env.local`
- ✅ Vercel Environment Variables
- ✅ Portail AliExpress Developer

---

## 📞 Support

Si bloqué après 2 heures, contacter :
- **AliExpress Developer Support** : developer@aliexpress.com
- **App Key** : 520312
- **Question** : "Comment générer la signature EXACTE pour /auth/token/create ?"

---

## ✅ Checklist Finale

- [x] Code corrigé pour utiliser SHA256
- [x] Logs améliorés pour debug
- [x] Routes de test créées
- [x] Documentation complète rédigée
- [ ] **TEST AVEC VRAI CODE OAuth** ← À FAIRE
- [ ] Vérifier résultats sur Vercel Logs
- [ ] Activer Plan B si nécessaire

---

**Dernière mise à jour :** 2025-10-14

**Statut :** ✅ Corrections appliquées - En attente de test en production
