# Guide de Débogage OAuth AliExpress

## 🎯 Changements Effectués

### 1. Correction de la Méthode de Signature

**Problème identifié :**
- `exchangeCodeForToken()` utilisait la méthode de signature MD5 (pour Business APIs)
- Mais `/auth/token/create` est une **System API** qui nécessite SHA256

**Solution appliquée :**
```typescript
// AVANT (INCORRECT)
params.sign_method = 'md5';
params.sign = this.generateSign(params); // MD5 wrappé

// APRÈS (CORRECT)
params.sign_method = 'sha256';
params.sign = this.generateSystemSign(apiPath, params); // HMAC-SHA256
```

### 2. Amélioration du Logging

**Ajouts dans `aliexpress-oauth.service.ts` :**
- ✅ Logs détaillés de la chaîne à signer
- ✅ Logs des paramètres triés
- ✅ Logs complets des headers de réponse
- ✅ Capture du header `X-Ca-Error-Message` (crucial pour debug)
- ✅ Capture du header `X-Ca-Signature-Headers` si disponible

### 3. Route de Test Améliorée

Nouvelle route : `/api/aliexpress/test-improved-signature`
- Teste 5 variantes de signature différentes
- Compare avec l'exemple de la documentation
- Facilite l'identification de la bonne méthode

---

## 🧪 Procédure de Test

### Étape 1 : Générer un Code OAuth

1. Ouvrir dans le navigateur : `https://laboutique-seven.vercel.app/api/aliexpress/auth`
2. Autoriser l'application AliExpress
3. Vous serez redirigé vers : `https://laboutique-seven.vercel.app/api/aliexpress/callback?code=XXXXX`
4. **IMPORTANT** : Intercepter cette URL AVANT que la page ne se charge complètement
5. Copier le paramètre `code=XXXXX` de l'URL

### Étape 2 : Tester avec le Code

Appeler : `https://laboutique-seven.vercel.app/api/aliexpress/manual-test-token?code=XXXXX`

### Étape 3 : Vérifier les Logs Vercel

1. Aller sur : https://vercel.com/laboutique/logs
2. Chercher les logs de la fonction qui contiennent :
   - `[OAuth] 🔐 String to Sign:`
   - `[OAuth] 🔐 Signature générée:`
   - `[OAuth] 📥 Response Status:`
   - `[OAuth] 🔑 SERVEUR MESSAGE ERREUR:` ← **CRUCIAL**

### Étape 4 : Analyser les Résultats

#### Si le header `X-Ca-Error-Message` contient une StringToSign :
```
Comparer :
- Notre signString : (dans les logs)
- StringToSign attendue : (dans X-Ca-Error-Message)

→ Identifier la différence exacte
→ Ajuster generateSystemSign() en conséquence
```

#### Si l'erreur est toujours "IncompleteSignature" :
```
Vérifier :
1. Format du chemin API : /auth/token/create ou autre ?
2. Paramètres inclus : sign_method doit-il être dans la signature ?
3. Ordre des paramètres : tri ASCII correct ?
4. Encoding : UTF-8 vs autre ?
```

---

## 🔍 Variantes de Signature Testables

Utiliser `/api/aliexpress/test-improved-signature?code=XXXXX` pour tester :

### Variante 1 : HMAC-SHA256 avec sign_method (ACTUELLE)
```
signString = /auth/token/create + app_key + VALUE + code + VALUE + sign_method + sha256 + timestamp + VALUE
signature = HMAC-SHA256(signString, appSecret)
```

### Variante 2 : HMAC-SHA256 SANS sign_method
```
signString = /auth/token/create + app_key + VALUE + code + VALUE + timestamp + VALUE
signature = HMAC-SHA256(signString, appSecret)
```

### Variante 3 : MD5 Wrappé (Business API)
```
signString = appSecret + method + VALUE + ... + appSecret
signature = MD5(signString)
```

### Variante 4 : SHA256 Simple (non HMAC)
```
signString = /auth/token/create + params...
signature = SHA256(signString) // sans clé HMAC
```

### Variante 5 : HMAC-SHA256 avec Secret Wrappé
```
signString = appSecret + /auth/token/create + params... + appSecret
signature = HMAC-SHA256(signString, appSecret)
```

---

## 📋 Checklist de Débogage

- [ ] Code OAuth récupéré (expire après quelques minutes)
- [ ] Test manuel effectué via `/api/aliexpress/manual-test-token`
- [ ] Logs Vercel consultés
- [ ] Header `X-Ca-Error-Message` analysé
- [ ] Comparaison signString effectuée
- [ ] Variantes testées si nécessaire

---

## 🔑 Informations de Configuration

```
App Key: 520312
App Secret: vfuE366X... (32 caractères)
Redirect URI: https://laboutique-seven.vercel.app/api/aliexpress/callback
API Base URL: https://api-sg.aliexpress.com/rest
```

---

## 🆘 Si Toujours Bloqué Après 2h

### Plan B : Solutions Alternatives

1. **Import Manuel CSV**
   - Télécharger les produits en CSV depuis AliExpress
   - Parser et importer dans Supabase
   - Mise à jour manuelle périodique

2. **API Tierce (RapidAPI)**
   - AliExpress Unofficial API
   - Coût : ~$50/mois pour 10k requêtes
   - Plus stable mais payant

3. **Scraping avec Rate Limiting**
   - Puppeteer + Proxy
   - Parsing HTML des pages produits
   - Risque de blocage, nécessite rotation IP

4. **Contact Support AliExpress**
   - App Key: 520312
   - Demander un exemple EXACT de requête fonctionnelle
   - Peut prendre 3-7 jours de réponse

---

## 📚 Références

- [Doc OAuth AliExpress](https://openservice.aliexpress.com/doc/doc.htm?nodeId=27493&docId=118729)
- [Doc auth.token.create](https://openservice.aliexpress.com/doc/api.htm?cid=3&path=/auth/token/create)
- [Example signString](https://openservice.aliexpress.com/doc/doc.htm?nodeId=27493&docId=118731)

---

## 🎬 Prochaines Étapes

1. Tester avec le code corrigé (SHA256 au lieu de MD5)
2. Vérifier le header `X-Ca-Error-Message`
3. Si échec, tester les 5 variantes
4. Si toujours bloqué, activer le Plan B

**Bonne chance ! 🍀**
