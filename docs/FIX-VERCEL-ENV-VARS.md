# 🔧 Fix : Variables d'Environnement Vercel

## ❌ Problème

Erreur sur `https://laboutique-seven.vercel.app/api/aliexpress/auth` :
```
Erreur d'initialisation : ALIEXPRESS_APP_SECRET et ALIEXPRESS_APP_KEY sont nécessaires
```

## ✅ Cause

**Les variables dans `.env.local` ne sont PAS utilisées en production sur Vercel !**

`.env.local` = Local uniquement (npm run dev)  
Vercel Production = Dashboard Vercel uniquement

---

## 🎯 Solution (3 minutes)

### **Étape 1 : Ajouter les Variables sur Vercel** ⏱️ 2 min

1. Allez sur : https://vercel.com/dashboard
2. Sélectionnez votre projet : `laboutique`
3. Cliquez sur **"Settings"** (en haut)
4. Dans le menu gauche : **"Environment Variables"**
5. Ajoutez ces 3 variables :

#### Variable 1 :
```
Key:   ALIEXPRESS_APP_KEY
Value: 520312
Environment: Production, Preview, Development (cochez tout)
```

#### Variable 2 :
```
Key:   ALIEXPRESS_APP_SECRET
Value: vfuE366X5RPk9BghoOcGTk3nGfcncvOe
Environment: Production, Preview, Development (cochez tout)
```

#### Variable 3 :
```
Key:   ALIEXPRESS_REDIRECT_URI
Value: https://laboutique-seven.vercel.app/api/aliexpress/callback
Environment: Production, Preview, Development (cochez tout)
```

6. **Sauvegardez** chaque variable

---

### **Étape 2 : Redéployer** ⏱️ 1 min

⚠️ **CRITIQUE** : Les variables ne sont appliquées qu'après un nouveau déploiement !

**Option A : Via Dashboard**
1. Restez sur Vercel Dashboard
2. Allez dans **"Deployments"**
3. Cliquez sur le dernier déploiement
4. Cliquez sur **"⋯"** (3 points)
5. Cliquez **"Redeploy"**
6. Attendez ~2 minutes

**Option B : Via Git (Plus Simple)**
```bash
# Créer un commit vide pour forcer redéploiement
git commit --allow-empty -m "chore: trigger redeploy for env vars"
git push origin main
```

---

### **Étape 3 : Tester** ⏱️ 30s

Attendez que le déploiement soit terminé (voyez le ✅ sur Vercel)

Puis retestez :
```
https://laboutique-seven.vercel.app/api/aliexpress/auth
```

**Résultat attendu :**
- Redirect vers AliExpress OAuth
- Vous autorisez l'app
- Redirect vers `/admin/products?oauth_success=true`

---

## 🐛 Si Ça Ne Marche Toujours Pas

### Vérifier les Variables

Sur Vercel Dashboard → Settings → Environment Variables :

Vous devriez voir :
```
✅ ALIEXPRESS_APP_KEY = 520312
✅ ALIEXPRESS_APP_SECRET = vfuE366X5RPk9BghoOcGTk3nGfcncvOe
✅ ALIEXPRESS_REDIRECT_URI = https://laboutique-seven.vercel.app/api/aliexpress/callback
✅ NEXT_PUBLIC_SUPABASE_URL = [votre valeur]
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY = [votre valeur]
✅ SUPABASE_URL = [votre valeur]
✅ SUPABASE_SERVICE_ROLE_KEY = [votre valeur]
```

### Vérifier le Déploiement

1. Vercel Dashboard → Deployments
2. Le dernier déploiement doit avoir un **✅ Ready**
3. Cliquez dessus → "Build Logs" → Vérifiez qu'il n'y a pas d'erreur

---

## 💡 Astuce : Tester en Local AVANT Production

Pour éviter ce genre de problème, testez toujours en local d'abord :

```bash
# En local
npm run dev

# Tester
http://localhost:3000/api/aliexpress/auth
```

Si ça marche en local mais pas en prod → c'est les variables Vercel !

---

## 📸 Screenshot de la Config Vercel

```
Settings → Environment Variables

┌─────────────────────────────────────────────────────┐
│ ALIEXPRESS_APP_KEY                                  │
│ 520312                                              │
│ ☑ Production  ☑ Preview  ☑ Development             │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ ALIEXPRESS_APP_SECRET                               │
│ vfuE366X5RPk9BghoOcGTk3nGfcncvOe                    │
│ ☑ Production  ☑ Preview  ☑ Development             │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ ALIEXPRESS_REDIRECT_URI                             │
│ https://laboutique-seven.vercel.app/api/aliexpress… │
│ ☑ Production  ☑ Preview  ☑ Development             │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Checklist

- [ ] Variables ajoutées sur Vercel Dashboard
- [ ] Les 3 environnements cochés (Production, Preview, Development)
- [ ] Redéploiement lancé (commit vide ou Redeploy button)
- [ ] Déploiement terminé (✅ Ready)
- [ ] Test de `/api/aliexpress/auth` réussi

---

**Temps total : ~3 minutes**  
**Après ça, OAuth fonctionnera ! 🚀**
