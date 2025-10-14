# 🔍 Test Manuel du Code OAuth

## 🎯 Objectif

Tester l'échange du code OAuth manuellement pour voir l'erreur exacte.

---

## 📋 Étapes

### **1. Obtenir un Code OAuth**

Ouvrez cette URL :
```
https://laboutique-seven.vercel.app/api/aliexpress/auth
```

Vous serez redirigé vers AliExpress.

**NE CLIQUEZ PAS SUR "AUTHORIZE" !**

Au lieu de ça, **copiez l'URL complète** dans votre barre d'adresse.

Elle ressemble à :
```
https://api-sg.aliexpress.com/oauth/authorize?response_type=code&client_id=520312&redirect_uri=https://laboutique-seven.vercel.app/api/aliexpress/callback&force_auth=true&state=abc123
```

---

### **2. Cliquez "Authorize"**

Maintenant cliquez sur le bouton "Authorize".

---

### **3. Intercepter l'URL de Callback**

**TRÈS RAPIDEMENT**, quand vous êtes redirigé, **COPIEZ L'URL** avant que la page ne charge complètement.

L'URL ressemble à :
```
https://laboutique-seven.vercel.app/api/aliexpress/callback?code=XXXXX&state=abc123
```

**COPIEZ LE CODE (la partie après code=)**

Exemple : Si l'URL est :
```
.../callback?code=ABC123XYZ456&state=...
```

Le code est : `ABC123XYZ456`

---

### **4. Tester Manuellement**

Ouvrez cette URL (remplacez VOTRE_CODE) :
```
https://laboutique-seven.vercel.app/api/aliexpress/manual-test-token?code=VOTRE_CODE
```

Exemple :
```
https://laboutique-seven.vercel.app/api/aliexpress/manual-test-token?code=ABC123XYZ456
```

---

### **5. Résultat**

**Si succès :**
```json
{
  "success": true,
  "message": "Token échangé avec succès !"
}
```

**Si erreur :**
```json
{
  "success": false,
  "error": "Le message d'erreur exact"
}
```

**COPIEZ-MOI le JSON complet !**

---

## ⚠️ Note

Le code OAuth expire en **30 minutes**, donc faites vite entre les étapes 1-4 !

---

**Cela va nous permettre de tester avec un VRAI code et voir l'erreur exacte ! 🔍**
