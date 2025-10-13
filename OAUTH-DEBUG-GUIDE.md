# 🔍 Guide Debug OAuth AliExpress

## 📊 Historique des Erreurs Résolues

### ❌ Erreur 1 : Variables manquantes
```
ALIEXPRESS_APP_KEY et ALIEXPRESS_APP_SECRET sont requis
```
**Solution :** Configuré variables sur Vercel Dashboard ✅

---

### ❌ Erreur 2 : client_id manquant
```
Error Code: param-clientid.null
Error Message: client_id不能为空
```
**Solution :** Ajouté `client_id` dans les paramètres OAuth ✅

---

### ❌ Erreur 3 : app_key manquant
```
Error Code: param-appkey.not.exists
Error Message: appkey不存在
```
**Solution :** Ajouté `app_key` ET `client_id` dans les paramètres ✅

---

## 🔧 Fix Actuel (En Cours de Déploiement)

### **Paramètres OAuth Envoyés :**

```
https://oauth.aliexpress.com/authorize?
  client_id=520312
  &app_key=520312
  &redirect_uri=https://laboutique-seven.vercel.app/api/aliexpress/callback
  &state=abc123
  &response_type=code
```

---

## 🧪 Test Dans 2-3 Minutes

**Une fois le build Vercel terminé :**

```
https://laboutique-seven.vercel.app/api/aliexpress/auth
```

### **Résultat Attendu :**

✅ **Redirect vers AliExpress** avec page d'autorisation

### **Si Nouvelle Erreur :**

**Possibilités :**

1. **URL de base incorrecte**
   - Actuellement : `https://oauth.aliexpress.com/authorize`
   - Alternative : `https://oauth.alibaba.com/authorize`

2. **Paramètres manquants**
   - `site` ?
   - `scope` ?

3. **Format du redirect_uri**
   - Doit être HTTPS ✅
   - Doit être encodé ?

---

## 📋 Informations Utiles

### **Votre Configuration :**

```
App Key: 520312
App Secret: vfuE366X5RPk9BghoOcGTk3nGfcncvOe
Callback URL: https://laboutique-seven.vercel.app/api/aliexpress/callback
App Category: Drop Shipping
Permissions: System Tool + AliExpress-dropship
```

### **URLs Testées :**

1. ✅ `/api/aliexpress/test-env` → Variables OK
2. ⏳ `/api/aliexpress/auth` → En cours de fix

---

## 🐛 Si Problème Persiste

### **Informations à Collecter :**

1. **Message d'erreur complet**
   - Error Code
   - Error Message

2. **URL complète affichée**
   - Tous les paramètres

3. **Console Browser (F12)**
   - Onglet Network
   - Regarder la requête vers AliExpress

---

## 🔄 Alternatives à Essayer

### **Option A : URL Alibaba**

Si l'erreur persiste, on peut essayer :
```
https://oauth.alibaba.com/authorize
```

### **Option B : Ajouter paramètre site**

```
site=aliexpress
```

### **Option C : Vérifier documentation AliExpress**

Votre app sur : https://openservice.aliexpress.com
- Section "API Permission"
- Vérifier s'il y a des instructions OAuth spécifiques

---

## 📊 Tableau de Debug

| Étape | Paramètre | Valeur | Status |
|-------|-----------|--------|--------|
| 1 | Variables Vercel | Configurées | ✅ |
| 2 | Runtime | Node.js | ✅ |
| 3 | client_id | 520312 | ✅ |
| 4 | app_key | 520312 | ✅ (en test) |
| 5 | redirect_uri | https://... | ✅ |
| 6 | response_type | code | ✅ |
| 7 | state | Random | ✅ |

---

## ⏱️ Timeline

```
11:XX     → Fix app_key pushé ✅
11:XX+1   → Build Vercel démarre ⏳
11:XX+3   → Build termine ✅
11:XX+4   → Testez !
```

---

## 🎯 Prochaines Actions

**Dans 2-3 minutes :**

1. ⏳ Attendre build Vercel (✅ Ready)
2. 🧪 Tester `/api/aliexpress/auth`
3. 📸 Si erreur → Screenshot
4. 💬 Envoyer résultat

---

**Commit :** `dad9af5`  
**Status :** Build en cours  
**Test dans :** 2-3 minutes
