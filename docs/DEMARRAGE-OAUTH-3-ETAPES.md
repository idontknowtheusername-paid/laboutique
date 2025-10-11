# ⚡ Démarrage OAuth - 3 Étapes Simples

## ✅ Configuration Terminée

Votre système utilise maintenant l'**API AliExpress Dropship** (OAuth) !

---

## 🚀 3 Étapes Pour Commencer

### **ÉTAPE 1 : Configurer Redirect URI sur AliExpress** ⏱️ 2 min

1. Allez sur : https://openservice.aliexpress.com
2. Cliquez sur votre app **"JomionStore"**
3. Trouvez "Callback URL" ou "Redirect URI"
4. **Vérifiez/Modifiez** pour mettre :
   ```
   https://laboutique-seven.vercel.app/api/aliexpress/callback
   ```
5. **Sauvegardez**

⚠️ **CRITIQUE** : Sans ça, l'OAuth échouera !

---

### **ÉTAPE 2 : Créer Table Supabase** ⏱️ 2 min

1. Allez sur : https://supabase.com
2. Ouvrez votre projet
3. **SQL Editor** → **New Query**
4. Copiez-collez le fichier :
   ```
   supabase/migrations/20251011_create_aliexpress_oauth_tokens.sql
   ```
5. Cliquez **"Run"**
6. ✅ Table `aliexpress_oauth_tokens` créée !

---

### **ÉTAPE 3 : Autoriser l'App** ⏱️ 1 min

#### En Local :

```bash
# Démarrer le serveur
npm run dev

# Ouvrir dans le navigateur
http://localhost:3000/api/aliexpress/auth
```

#### En Production :

```
https://laboutique-seven.vercel.app/api/aliexpress/auth
```

**Ce qui va se passer :**
1. Redirect vers AliExpress
2. Vous autorisez l'app
3. Redirect vers votre admin
4. ✅ Token stocké en base !

---

## 🎉 C'est Terminé ! Testez l'Import

1. Allez sur : `/admin/products/import`
2. Collez une URL AliExpress
3. Cliquez "Importer directement"
4. **Import en 1-2 secondes** ! ⚡

---

## 📋 Checklist

```
□ Redirect URI configuré sur AliExpress
□ Migration Supabase exécutée
□ App autorisée via /api/aliexpress/auth
□ Test d'import réussi
```

---

## 🐛 Si Problème

### "Invalid redirect_uri"
→ Vérifiez que le Redirect URI sur AliExpress est exact

### "Table does not exist"
→ Exécutez la migration Supabase

### "Aucun token trouvé"
→ Autorisez l'app via `/api/aliexpress/auth`

---

## 📚 Docs Complètes

- **Guide complet** : `docs/OAUTH-COMPLETE-README.md`
- **Ce guide** : `docs/DEMARRAGE-OAUTH-3-ETAPES.md`

---

**Temps total : 5 minutes**  
**Système : OAuth Dropship AliExpress**  
**Status : ✅ Production Ready**
