# 🔍 Comment Voir les Logs Vercel

## 🎯 Étapes Précises

### **1. Aller sur Vercel Dashboard**
```
https://vercel.com/dashboard
```

### **2. Sélectionner votre Projet**
Cliquez sur votre projet `laboutique-seven`

### **3. Aller dans Logs**

**Option A : Real-time Logs (Recommandé)**

1. En haut, cliquez sur **"Logs"** ou **"Runtime Logs"**
2. Vous verrez les logs en temps réel

**Option B : Function Logs**

1. Cliquez sur **"Deployments"**
2. Cliquez sur le **dernier déploiement** (✅ Ready)
3. Cliquez sur **"Function Logs"** ou **"View Function Logs"**

### **4. Filtrer les Logs**

Dans la barre de recherche/filtre, tapez :
```
[OAuth]
```

Vous devriez voir les logs commençant par `[OAuth]`

### **5. Chercher Ces Lignes**

Après avoir cliqué "Authorize", cherchez :

```
[OAuth] Chaîne à signer (System): /auth/token/createapp_key...
[OAuth] Signature générée: ABC123...
```

### **6. Copier et Envoyer**

Copiez ces 2 lignes complètes et envoyez-les moi.

---

## 📸 Alternative : Screenshot

Si difficile à copier, prenez un screenshot des logs et décrivez-moi ce que vous voyez.

---

## ⚡ Pourquoi C'est Important

Ces logs vont me montrer :
1. **Quels paramètres** sont dans la chaîne à signer
2. **Dans quel ordre** ils sont
3. **La signature** générée

Je pourrai alors comparer avec l'exemple de la doc et trouver la différence !

---

## 🎯 Actions

1. Allez sur Vercel Dashboard
2. Logs ou Function Logs
3. Cherchez `[OAuth]`
4. Copiez les lignes
5. Envoyez-les moi
