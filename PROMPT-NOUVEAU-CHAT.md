# Prompt pour Nouveau Chat - Intégration OAuth AliExpress

## Contexte

Application e-commerce Next.js avec import de produits AliExpress. 

**Problème actuel :** Échec de l'échange du code OAuth contre un access_token avec l'erreur `IncompleteSignature - The request signature does not conform to platform standards`.

---

## Informations de l'Application AliExpress

- **App Key:** 520312
- **App Secret:** vfuE366X5RPk9BghoOcGTk3nGfcncvOe
- **Callback URL:** https://laboutique-seven.vercel.app/api/aliexpress/callback
- **Type d'app:** Drop Shipping
- **Statut:** Online (approuvé)
- **Permissions:** Drop Shipping APIs activées

---

## Ce qui a été tenté (4 jours)

### ✅ Ce qui fonctionne :
1. Autorisation OAuth - L'utilisateur peut autoriser l'app
2. Réception du code OAuth dans le callback
3. Le code est au bon format : `3_520312_XXXXX`

### ❌ Ce qui ne fonctionne PAS :
L'échange du code contre un access_token via `/auth/token/create`

**Erreur reçue :**
```json
{
  "type": "ISV",
  "code": "IncompleteSignature",
  "message": "The request signature does not conform to platform standards"
}
```

### 🔧 Variantes de signature testées :
1. **SHA256 simple** : `crypto.createHash('sha256').update(signString)`
2. **HMAC-SHA256** : `crypto.createHmac('sha256', appSecret).update(signString)`
3. **MD5 avec wrapping** : `appSecret + params + appSecret`
4. **Avec/sans API path** dans la chaîne de signature
5. **Différents ordres de paramètres**

**Aucune n'a fonctionné.**

---

## Documentation AliExpress

### URL d'autorisation (fonctionne) :
```
https://api-sg.aliexpress.com/oauth/authorize?response_type=code&force_auth=true&redirect_uri=${callback}&client_id=${appkey}
```

### API d'échange de token (ne fonctionne pas) :
**Endpoint supposé :** `https://api-sg.aliexpress.com/rest/auth/token/create`

**Documentation officielle :**
https://openservice.aliexpress.com/doc/doc.htm?nodeId=27493&docId=118729

**Exemple SDK Java :**
```java
String url = "https://api-sg.aliexpress.com";
String appkey = "your_appkey";
String appSecret = "your_appSecret";
String action = "/auth/token/create";
IopClient client = new IopClientImpl(url, appkey, appSecret);
IopRequest request = new IopRequest();
request.setApiName(action);
request.addApiParameter("code", "your_code");
IopResponse response = client.execute(request, Protocol.GOP);
```

**Note importante de la doc :**
> "When the signatures do not match, the gateway returns the StringToSign of the server signature through an X-Ca-Error-Message in the HTTP Response Header."

### Structure de réponse attendue :
```json
{
  "access_token": "50000000528...",
  "refresh_token": "50001001928...",
  "expires_in": 3153599922,
  "refresh_expires_in": 3153599922,
  "user_id": "200042362",
  "seller_id": "200042362",
  "havana_id": "17379911544"
}
```

---

## Code Actuel

### Fichier principal : `lib/services/aliexpress-oauth.service.ts`

**Méthode problématique :**
```typescript
async exchangeCodeForToken(code: string): Promise<AliExpressOAuthToken> {
  const timestamp = Date.now().toString();
  
  const params: Record<string, any> = {
    app_key: this.config.appKey,
    code: code,
    timestamp: timestamp,
    sign_method: 'md5', // ou 'sha256' ?
    format: 'json',
    v: '2.0',
    method: 'auth.token.create',
  };

  // Générer la signature - MÉTHODE INCORRECTE
  params.sign = this.generateSign(params);

  const url = `${this.restBaseUrl}/auth/token/create?${new URLSearchParams(params).toString()}`;
  
  const response = await fetch(url, { method: 'GET' });
  const data = await response.json();
  // ...
}
```

**Méthode de signature actuelle (MD5 wrapping) :**
```typescript
private generateSign(params: Record<string, any>): string {
  const sortedKeys = Object.keys(params).sort();
  
  let signString = this.config.appSecret;
  for (const key of sortedKeys) {
    if (params[key] !== undefined && params[key] !== null) {
      signString += key + params[key];
    }
  }
  signString += this.config.appSecret;

  return crypto.createHash('md5').update(signString, 'utf8').digest('hex').toUpperCase();
}
```

---

## Variables d'Environnement

`.env.local` :
```
ALIEXPRESS_APP_KEY=520312
ALIEXPRESS_APP_SECRET=vfuE366X5RPk9BghoOcGTk3nGfcncvOe
ALIEXPRESS_REDIRECT_URI=https://laboutique-seven.vercel.app/api/aliexpress/callback
```

**Vercel env vars :** Configurées identiquement

---

## Routes API Créées

- ✅ `/api/aliexpress/auth` - Initie OAuth (fonctionne)
- ✅ `/api/aliexpress/callback` - Reçoit code (fonctionne)
- ❌ Échange de token dans callback (échoue avec IncompleteSignature)
- 🔧 `/api/aliexpress/manual-test-token?code=XXX` - Test manuel
- 🔧 `/api/aliexpress/test-signature` - Debug signature
- 🔧 `/api/aliexpress/test-all-signatures` - 6 variantes de signatures
- 🔧 `/api/aliexpress/test-with-signature` - Test avec signature spécifique

---

## Ce qu'il faut faire

### 🎯 Objectif
Trouver la **bonne méthode de génération de signature** pour `/auth/token/create`.

### 🔍 Pistes à explorer

1. **Lire le header `X-Ca-Error-Message`**
   - La doc dit que le serveur renvoie la `StringToSign` attendue dans ce header
   - Code pour lire : `response.headers.get('X-Ca-Error-Message')`
   - **CRUCIAL : Comparer avec notre signString**

2. **Vérifier le SDK officiel AliExpress**
   - SDK Java : https://github.com/aliexpress/aliexpress-sdk
   - SDK PHP : Peut contenir des indices
   - Comment génèrent-ils EXACTEMENT la signature ?

3. **Tester différents endpoints**
   - Peut-être que l'endpoint n'est PAS `/rest/auth/token/create`
   - Essayer : `/sync?method=auth.token.create`
   - Essayer : `/token/create` directement

4. **Vérifier les paramètres requis**
   - Sont-ils tous nécessaires : `format`, `v`, `method`, `sign_method` ?
   - Y a-t-il des paramètres manquants ?

5. **Contacter le support AliExpress**
   - Avec App Key 520312
   - Demander un exemple EXACT de requête pour `/auth/token/create`

---

## Instruction pour le nouveau chat

**Consigne :** Ne pas faire 50 tests différents. **CONCENTRE-TOI** sur :

1. **TROUVER un exemple de code fonctionnel** (GitHub, Stack Overflow, forum AliExpress)
2. **LIRE le SDK officiel** pour voir comment ILS génèrent la signature
3. **CAPTURER le header `X-Ca-Error-Message`** pour voir ce que le serveur attend EXACTEMENT
4. Si rien ne fonctionne après 2h, **PROPOSER une solution alternative** (webhook, API tierce, etc.)

**Ne pas :** Tourner en rond avec des variantes de signature sans comprendre ce que le serveur attend réellement.

---

## Informations Techniques

- **Framework :** Next.js 13.5.1
- **Runtime API routes :** Node.js (pas Edge)
- **Base de données :** Supabase
- **Déploiement :** Vercel
- **Branche actuelle :** `main`

---

## Fichiers Importants

- `lib/services/aliexpress-oauth.service.ts` - Service OAuth
- `lib/types/aliexpress-oauth.ts` - Types TypeScript
- `app/api/aliexpress/auth/route.ts` - Initiation OAuth
- `app/api/aliexpress/callback/route.ts` - Callback OAuth
- `supabase/migrations/20251011_create_aliexpress_oauth_tokens.sql` - Table tokens

---

## Dernier Test à Faire (PRIORITÉ)

**Capturer `X-Ca-Error-Message` :**

Le code est déjà en place dans `lib/services/aliexpress-oauth.service.ts` (ligne 92-101) :

```typescript
const errorMessage = response.headers.get('X-Ca-Error-Message');
console.log('[OAuth] 🔑 SERVEUR ATTEND CETTE STRING:', errorMessage);
```

**Action :**
1. Obtenir un nouveau code via `/api/aliexpress/auth`
2. Tester avec `/api/aliexpress/manual-test-token?code=XXX`
3. **Aller sur Vercel Logs Runtime**
4. Chercher la ligne `[OAuth] 🔑 SERVEUR ATTEND CETTE STRING:`
5. **Comparer avec notre signString**

**Si le header est vide ou ne contient rien d'utile :**
→ Alors passer au Plan B (SDK analysis ou contact support)

---

## Budget Temps

**Maximum 2 heures.**

Si après 2h la signature ne fonctionne toujours pas :
→ **Proposer une solution alternative** (import manuel, API tierce, scraping avec rate limiting, etc.)

---

Bonne chance ! 🍀
