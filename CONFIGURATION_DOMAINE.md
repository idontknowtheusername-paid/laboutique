# 🌐 Configuration Domaine Custom - jomionstore.com

## ✅ CHECKLIST COMPLÈTE

### 1️⃣ VERCEL - Configuration Domaine
**Status:** ✅ Connecté (selon vous)

**À vérifier sur Vercel Dashboard:**
- [ ] Aller sur https://vercel.com/dashboard
- [ ] Sélectionner votre projet
- [ ] **Settings → Domains**
- [ ] Vérifier que `jomionstore.com` et `www.jomionstore.com` sont listés
- [ ] Status doit être "Valid" avec certificat SSL ✅
- [ ] Redirections automatiques configurées :
  - `www.jomionstore.com` → `jomionstore.com` (ou l'inverse)

**Si pas encore fait :**
```
1. Vercel Dashboard → Project → Settings → Domains
2. Cliquer "Add Domain"
3. Entrer: jomionstore.com
4. Suivre les instructions DNS
5. Répéter pour www.jomionstore.com
```

---

### 2️⃣ VERCEL - Variables d'Environnement
**Status:** ⚠️ À METTRE À JOUR

**Action OBLIGATOIRE :**
```bash
Aller sur Vercel Dashboard → Project → Settings → Environment Variables

Modifier ces variables (pour tous les environnements: Production, Preview, Development):

NEXT_PUBLIC_APP_URL=https://jomionstore.com
NEXT_PUBLIC_SITE_URL=https://jomionstore.com
```

**⚠️ IMPORTANT :** Après modification, faire un **Redeploy** !
```
Vercel Dashboard → Deployments → ... (3 points) → Redeploy
```

---

### 3️⃣ SUPABASE - Redirect URLs
**Status:** ⚠️ À CONFIGURER

**Action OBLIGATOIRE :**
```
1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Settings → Authentication → URL Configuration
4. Ajouter ces URLs dans "Redirect URLs":

   https://jomionstore.com/auth/callback
   https://jomionstore.com/auth/reset-password
   https://www.jomionstore.com/auth/callback
   https://www.jomionstore.com/auth/reset-password

5. Site URL: https://jomionstore.com
```

**Pourquoi ?** Sans ça, l'authentification OAuth (Google, Facebook) ne marchera pas !

---

### 4️⃣ QOSIC - Callback URLs
**Status:** ⚠️ À CONFIGURER

**Action OBLIGATOIRE :**
```
1. Aller sur https://dashboard.qosic.com
2. Settings → Webhooks / Callbacks
3. Mettre à jour les URLs de callback :

   Checkout Success: https://jomionstore.com/checkout/callback
   Checkout Cancel: https://jomionstore.com/checkout/cancel
   Mobile Money: https://jomionstore.com/checkout/mobile-money-validation

4. Webhook URL (si applicable):
   https://jomionstore.com/api/qosic/webhook
```

**Pourquoi ?** Sans ça, les paiements ne pourront pas rediriger vers votre site !

---

### 5️⃣ DNS & SSL
**Status:** ✅ Géré automatiquement par Vercel

**À vérifier :**
- [ ] HTTPS activé automatiquement (certificat Let's Encrypt)
- [ ] Test : https://jomionstore.com (doit afficher votre site)
- [ ] Test : http://jomionstore.com (doit rediriger vers https)
- [ ] Test : www.jomionstore.com (doit rediriger vers version préférée)

---

### 6️⃣ SEO & Metadata
**Status:** ✅ Déjà configuré dans le code

**Vérification :**
```typescript
// app/layout.tsx (ligne 33)
metadataBase: new URL('https://www.jomionstore.com')
```

**⚠️ Incohérence détectée :** Le code dit `www.jomionstore.com` mais les variables disent `jomionstore.com`.

**Décidez quelle version est la principale :**
- Option A : `jomionstore.com` (sans www) ⭐ Recommandé
- Option B : `www.jomionstore.com` (avec www)

---

### 7️⃣ Tests Post-Déploiement
**À faire une fois tout configuré :**

**Test 1 : Domaine accessible**
```
✅ https://jomionstore.com → Site charge
✅ https://www.jomionstore.com → Redirige ou charge
✅ http:// → Redirige vers https://
```

**Test 2 : Authentification**
```
✅ Inscription → Email de confirmation reçu
✅ Connexion Google → Fonctionne
✅ Réinitialisation mot de passe → Email reçu avec bon lien
```

**Test 3 : Paiement**
```
✅ Checkout Qosic → Redirection OK
✅ Callback après paiement → Retour sur le site
✅ Mobile Money → SMS reçu
```

**Test 4 : SEO**
```
✅ Google: site:jomionstore.com → Pages indexées
✅ Open Graph preview (Facebook/WhatsApp) → Image/titre OK
✅ Twitter Card preview → OK
```

---

### 8️⃣ Configuration Locale (.env.local)
**Pour développement local :**

Garder `localhost` pour le dev local :
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Ne PAS les changer localement !**
Seules les variables Vercel (production) doivent pointer vers jomionstore.com.

---

### 9️⃣ Monitoring & Analytics
**Recommandé :**

- [ ] **Google Search Console**
  - Ajouter propriété : https://jomionstore.com
  - Soumettre sitemap : https://jomionstore.com/sitemap.xml

- [ ] **Google Analytics** (si pas déjà fait)
  - Créer propriété pour jomionstore.com
  - Ajouter tracking code

- [ ] **Vercel Analytics** (gratuit)
  - Activer dans Vercel Dashboard → Project → Analytics

---

### 🔟 Redirections (Optionnelles)
**Si vous migrez depuis un ancien domaine :**

Créer `vercel.json` :
```json
{
  "redirects": [
    {
      "source": "/ancien-url",
      "destination": "/nouveau-url",
      "permanent": true
    }
  ]
}
```

---

## 🚀 ORDRE D'EXÉCUTION RECOMMANDÉ

### Étape 1 : Vercel (5 min)
```
1. Vérifier domaine connecté
2. Mettre à jour variables NEXT_PUBLIC_APP_URL et NEXT_PUBLIC_SITE_URL
3. Redeploy
```

### Étape 2 : Supabase (3 min)
```
1. Ajouter redirect URLs
2. Mettre à jour Site URL
```

### Étape 3 : Qosic (3 min)
```
1. Mettre à jour callback URLs
2. Tester un paiement
```

### Étape 4 : Tests (10 min)
```
1. Ouvrir https://jomionstore.com
2. Tester inscription/connexion
3. Tester paiement
4. Vérifier HTTPS
```

---

## ⚠️ PROBLÈMES COURANTS

### Problème 1 : "Site cannot be reached"
**Cause :** DNS pas propagé
**Solution :** Attendre 24-48h ou vérifier DNS avec `nslookup jomionstore.com`

### Problème 2 : "OAuth redirect_uri mismatch"
**Cause :** Supabase redirect URLs pas configurées
**Solution :** Ajouter URLs dans Supabase → Settings → Authentication

### Problème 3 : "Payment callback failed"
**Cause :** Qosic callback URL incorrect
**Solution :** Mettre à jour dans dashboard Qosic

### Problème 4 : "Mixed content" (HTTP/HTTPS)
**Cause :** Ressources chargées en HTTP
**Solution :** Vérifier que toutes les URLs externes sont en HTTPS

---

## 📞 SUPPORT

**Vercel :** https://vercel.com/support
**Supabase :** https://supabase.com/support
**Qosic :** https://qosic.com/support

---

## ✅ CHECKLIST FINALE

Une fois tout configuré :

- [ ] ✅ Domaine accessible en HTTPS
- [ ] ✅ Redirections HTTP → HTTPS
- [ ] ✅ Variables Vercel mises à jour
- [ ] ✅ Supabase redirect URLs configurées
- [ ] ✅ Qosic callback URLs configurées
- [ ] ✅ Authentification testée
- [ ] ✅ Paiement testé
- [ ] ✅ SEO metadata vérifié
- [ ] ✅ Google Search Console configuré
- [ ] ✅ Analytics configuré

---

**🎉 FÉLICITATIONS ! Votre site est maintenant live sur jomionstore.com !**
