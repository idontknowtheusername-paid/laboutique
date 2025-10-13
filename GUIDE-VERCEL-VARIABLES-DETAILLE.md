# 🎯 Guide Détaillé : Configurer Variables Vercel

## ❌ Problème Confirmé

Le test `/api/aliexpress/test-env` montre :
```
❌ ALIEXPRESS_APP_KEY: MANQUANT
❌ ALIEXPRESS_APP_SECRET: MANQUANT  
❌ ALIEXPRESS_REDIRECT_URI: MANQUANT
```

**→ Les variables ne sont PAS configurées sur Vercel !**

---

## ✅ Solution : Configuration Étape par Étape

### **ÉTAPE 1 : Aller sur Vercel Dashboard**

1. Ouvrez : https://vercel.com/dashboard
2. **Connectez-vous** si nécessaire
3. Vous verrez la liste de vos projets

---

### **ÉTAPE 2 : Sélectionner le BON Projet**

⚠️ **IMPORTANT** : Assurez-vous de sélectionner le bon projet !

**Cherchez le projet qui correspond à :**
- URL : `laboutique-seven.vercel.app`
- Nom du repo : `laboutique` ou similaire

**Cliquez dessus**

---

### **ÉTAPE 3 : Aller dans Settings**

Une fois dans le projet :

1. En haut de la page, cliquez sur **"Settings"** (⚙️)
2. Vous êtes maintenant dans les paramètres du projet

---

### **ÉTAPE 4 : Aller dans Environment Variables**

Dans le **menu de gauche**, cherchez et cliquez sur :

```
Environment Variables
```

Vous devriez voir une page avec :
- Un bouton "Add New" ou "Add Variable"
- Possiblement des variables existantes (Supabase, etc.)

---

### **ÉTAPE 5 : Ajouter ALIEXPRESS_APP_KEY**

1. Cliquez sur **"Add New"** ou **"Add Variable"**

2. Remplissez :
   ```
   Name:  ALIEXPRESS_APP_KEY
   ```

3. Dans le champ "Value", copiez-collez EXACTEMENT :
   ```
   520312
   ```

4. **Environment** : Cochez TOUTES les cases
   ```
   ☑ Production
   ☑ Preview
   ☑ Development
   ```

5. Cliquez **"Save"**

---

### **ÉTAPE 6 : Ajouter ALIEXPRESS_APP_SECRET**

1. Cliquez à nouveau sur **"Add New"**

2. Remplissez :
   ```
   Name:  ALIEXPRESS_APP_SECRET
   ```

3. Dans "Value", copiez-collez EXACTEMENT :
   ```
   vfuE366X5RPk9BghoOcGTk3nGfcncvOe
   ```

4. **Environment** : Cochez tout
   ```
   ☑ Production
   ☑ Preview
   ☑ Development
   ```

5. Cliquez **"Save"**

---

### **ÉTAPE 7 : Ajouter ALIEXPRESS_REDIRECT_URI**

1. Cliquez à nouveau sur **"Add New"**

2. Remplissez :
   ```
   Name:  ALIEXPRESS_REDIRECT_URI
   ```

3. Dans "Value", copiez-collez EXACTEMENT :
   ```
   https://laboutique-seven.vercel.app/api/aliexpress/callback
   ```

4. **Environment** : Cochez tout
   ```
   ☑ Production
   ☑ Preview
   ☑ Development
   ```

5. Cliquez **"Save"**

---

### **ÉTAPE 8 : Vérification**

Sur la page "Environment Variables", vous devriez maintenant voir :

```
✅ ALIEXPRESS_APP_KEY
   Value: 520312
   Environments: Production, Preview, Development

✅ ALIEXPRESS_APP_SECRET
   Value: vfuE366X5RPk9BghoOcGTk3nGfcncvOe
   Environments: Production, Preview, Development

✅ ALIEXPRESS_REDIRECT_URI
   Value: https://laboutique-seven.vercel.app/api/aliexpress/callback
   Environments: Production, Preview, Development
```

---

### **ÉTAPE 9 : Redéployer** ⚠️ CRITIQUE

Les variables ne sont appliquées qu'après un **nouveau déploiement** !

**Option A : Via Dashboard (Recommandé)**

1. En haut de la page Vercel, cliquez sur **"Deployments"**
2. Vous verrez la liste des déploiements
3. Trouvez le **premier** de la liste (le plus récent)
4. Cliquez sur les **3 points** `⋯` à droite
5. Cliquez **"Redeploy"**
6. Dans la popup, cliquez **"Redeploy"** à nouveau pour confirmer

**Option B : Via Terminal**

Si vous préférez :
```bash
# Créer commit vide pour forcer redéploiement
git commit --allow-empty -m "chore: apply env vars"
git push origin main
```

---

### **ÉTAPE 10 : Attendre (2-3 min)**

1. Restez sur la page "Deployments"
2. Vous verrez le nouveau déploiement en cours (⏳ Building...)
3. Attendez qu'il devienne **✅ Ready**
4. Ça prend ~2-3 minutes

---

### **ÉTAPE 11 : Tester À Nouveau**

Une fois le déploiement **✅ Ready**, testez :

**Test 1 :**
```
https://laboutique-seven.vercel.app/api/aliexpress/test-env
```

**Résultat attendu :**
```json
{
  "ALIEXPRESS_APP_KEY": "✅ Défini (520***)",
  "ALIEXPRESS_APP_SECRET": "✅ Défini (vfu***)",
  "ALIEXPRESS_REDIRECT_URI": "✅ Défini (https://..."
}
```

**Test 2 :**
```
https://laboutique-seven.vercel.app/api/aliexpress/auth
```

**Résultat attendu :**
→ Redirect vers AliExpress pour autoriser l'app

---

## 🐛 Dépannage

### "Je ne vois pas Environment Variables dans le menu"

→ Vous n'êtes peut-être pas sur le bon projet
→ Vérifiez que vous êtes bien sur `laboutique-seven.vercel.app`

### "Les variables n'apparaissent pas après Save"

→ Actualisez la page (F5)
→ Elles devraient apparaître

### "Le redéploiement échoue"

→ Allez dans Build Logs
→ Regardez l'erreur
→ Envoyez-moi le message d'erreur

### "Toujours ❌ MANQUANT après redéploiement"

→ Prenez un screenshot de votre page Environment Variables
→ Envoyez-le moi
→ Je vérifierai

---

## 📋 Checklist Complète

**Configuration :**
- [ ] Connecté à Vercel Dashboard
- [ ] Projet `laboutique-seven` sélectionné
- [ ] Settings → Environment Variables ouvert
- [ ] ALIEXPRESS_APP_KEY ajouté avec valeur `520312`
- [ ] ALIEXPRESS_APP_SECRET ajouté avec valeur `vfuE366X5RPk9BghoOcGTk3nGfcncvOe`
- [ ] ALIEXPRESS_REDIRECT_URI ajouté avec URL complète
- [ ] Les 3 environnements cochés pour chaque variable
- [ ] Toutes les variables sauvegardées

**Déploiement :**
- [ ] Redéploiement lancé (Redeploy ou git push)
- [ ] Déploiement terminé (✅ Ready)

**Tests :**
- [ ] `/api/aliexpress/test-env` → Toutes variables ✅
- [ ] `/api/aliexpress/auth` → Redirect vers AliExpress

---

## ⚠️ Points Critiques

1. **Le BON projet** : Vérifiez l'URL `laboutique-seven.vercel.app`
2. **TOUS les environnements** : Cochez Production, Preview, Development
3. **EXACTEMENT les mêmes noms** : Copier-coller les noms des variables
4. **REDÉPLOYER OBLIGATOIRE** : Les variables ne sont actives qu'après redéploiement
5. **Attendre le déploiement** : Ne testez pas avant le ✅ Ready

---

## 🎯 Aide Visuelle

Si vous avez des difficultés, envoyez-moi :

1. **Screenshot de la liste de vos projets Vercel**
   → Pour vérifier qu'on est sur le bon projet

2. **Screenshot de Environment Variables**
   → Pour vérifier que les variables sont bien ajoutées

3. **Screenshot du dernier déploiement**
   → Pour vérifier qu'il est terminé

---

**Temps total : 10 minutes**  
**Difficulté : Facile**  
**Après ça : OAuth fonctionnera ! 🚀**
