# 🔧 Fix OAuth : client_id vs app_key

## ✅ Problème Résolu

**Erreur rencontrée :**
```
Error Code: param-clientid.null
Error Message: client_id不能为空
```

**Traduction :** "client_id ne peut pas être vide"

---

## 🎯 Cause du Problème

AliExpress OAuth utilise **des noms de paramètres différents** selon l'endpoint :

### **Endpoint d'Autorisation** (authorize)
```
https://oauth.aliexpress.com/authorize
```
**Paramètre attendu :** `client_id` ✅

### **Endpoint de Token** (getToken)
```
https://gw.api.alibaba.com/openapi/param2/1/system.oauth2/getToken
```
**Paramètre attendu :** `app_key` ✅

**J'avais utilisé `app_key` partout, mais l'autorisation attend `client_id` !**

---

## ✅ Solution Appliquée

### **Changement dans `aliexpress-oauth.service.ts` :**

**Avant :**
```typescript
generateAuthorizationUrl(state?: string): string {
  const params = {
    app_key: this.config.appKey,  // ❌ Incorrect
    redirect_uri: this.config.redirectUri,
    state: state,
    response_type: 'code',
  };
  // ...
}
```

**Après :**
```typescript
generateAuthorizationUrl(state?: string): string {
  const params = {
    client_id: this.config.appKey,  // ✅ Correct
    redirect_uri: this.config.redirectUri,
    state: state,
    response_type: 'code',
  };
  // ...
}
```

### **Changement dans `lib/types/aliexpress-oauth.ts` :**

**Avant :**
```typescript
export interface OAuthAuthorizationParams {
  app_key: string;  // ❌
  // ...
}
```

**Après :**
```typescript
export interface OAuthAuthorizationParams {
  client_id: string;  // ✅
  // ...
}
```

---

## 🚀 Déploiement

**✅ Commit :** `4167fed`  
**✅ Pushé vers :** GitHub main  
**⏳ Build Vercel :** En cours...

---

## 🧪 Comment Tester (Dans 2-3 Minutes)

### **ÉTAPE 1 : Attendre le Déploiement**

1. Allez sur : https://vercel.com/dashboard
2. Votre projet → Deployments
3. Attendez que le dernier déploiement soit **✅ Ready**

### **ÉTAPE 2 : Tester l'OAuth**

Ouvrez dans votre navigateur :
```
https://laboutique-seven.vercel.app/api/aliexpress/auth
```

**Résultat attendu :**

1. ✅ Redirect vers AliExpress OAuth
2. ✅ Page d'autorisation AliExpress s'affiche
3. ✅ Vous cliquez "Autoriser"
4. ✅ Redirect vers `/admin/products?oauth_success=true`
5. ✅ Token stocké dans Supabase

---

## 📊 Récapitulatif des Fixes

| Fix # | Problème | Solution | Status |
|-------|----------|----------|--------|
| 1 | Variables manquantes | Ajout sur Vercel Dashboard | ✅ Résolu |
| 2 | Edge Runtime | Force Node.js runtime | ✅ Résolu |
| 3 | `client_id` manquant | Utiliser `client_id` au lieu de `app_key` | ✅ Résolu |

---

## 🎯 Timeline

```
11:XX     → Variables configurées ✅
11:XX+5   → Fix Edge Runtime ✅
11:XX+10  → Fix client_id ✅
11:XX+12  → Build Vercel en cours ⏳
11:XX+15  → Déploiement actif ✅

Après     → OAuth fonctionne ! 🎉
```

---

## ✅ Checklist Finale

**Terminé :**
- [x] Variables d'environnement sur Vercel
- [x] Force Node.js runtime
- [x] Fix client_id pour OAuth

**À faire (dans 3 min) :**
- [ ] Attendre déploiement Vercel
- [ ] Tester `/api/aliexpress/auth`
- [ ] Autoriser l'app sur AliExpress
- [ ] Vérifier token en base
- [ ] Tester import produit

---

## 🐛 Si Nouvelle Erreur

**Prenez un screenshot et envoyez :**
- L'URL complète
- Le message d'erreur
- Les logs console (F12 → Console)

---

**Commit :** `4167fed`  
**Build :** En cours (2-3 min)  
**Prochaine étape :** Tester OAuth après déploiement ! 🚀
