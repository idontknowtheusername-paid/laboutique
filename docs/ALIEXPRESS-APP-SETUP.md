# 🚀 Configuration App AliExpress - La Boutique B

## 📋 Informations pour le Formulaire

### 1. **App Name**
```
La Boutique B Drop Shipping
```
**Alternative (plus court) :**
```
LaBoutiqueB
```

---

### 2. **Callback URL** ⚠️ IMPORTANT

**URL de Production (RECOMMANDÉ) :**
```
https://VOTRE-DOMAINE.com/api/aliexpress/callback
```

**Exemples :**
- Si votre site est `laboutique.bj` :
  ```
  https://laboutique.bj/api/aliexpress/callback
  ```

- Si vous utilisez Vercel/Netlify :
  ```
  https://votre-app.vercel.app/api/aliexpress/callback
  ```

**Pour le développement local :**
- AliExpress n'accepte pas `localhost`
- Utilisez ngrok : `https://xxxx.ngrok.io/api/aliexpress/callback`
- Ou ajoutez plusieurs callback URLs après création

---

### 3. **App Description**

**Version Complète (Recommandée) :**
```
La Boutique B - Plateforme e-commerce Drop Shipping

Notre application permet d'importer automatiquement des produits depuis AliExpress vers notre boutique en ligne basée au Bénin. 

Fonctionnalités principales :
- Import automatique de produits (nom, prix, images, descriptions, variantes)
- Synchronisation des stocks et prix en temps réel
- Gestion des commandes et tracking
- Programme d'affiliation pour générer des revenus
- Interface d'administration pour gérer le catalogue

La Boutique B est une plateforme e-commerce moderne qui connecte les vendeurs AliExpress avec les clients africains, en offrant une expérience d'achat locale avec paiement mobile et livraison adaptée.

Technologies : Next.js, Supabase, TypeScript
Public cible : Commerçants et dropshippers en Afrique de l'Ouest
Contact : admin@laboutique.bj
```

**Version Courte (si limite de caractères) :**
```
Application e-commerce drop shipping pour La Boutique B (Bénin). Import automatique de produits AliExpress avec synchronisation des prix, stocks et gestion des commandes. Plateforme Next.js pour connecter vendeurs AliExpress et clients africains avec paiement mobile et livraison locale.
```

---

### 4. **App Logo** (100px × 100px)

#### Option A : Logo Simple (Prêt à Télécharger)
1. Ouvrez le fichier : `/public/aliexpress-logo-guide.html`
2. Cliquez sur le bouton "Télécharger Logo"
3. Utilisez le fichier PNG généré

#### Option B : Créer avec Canva
1. Aller sur https://www.canva.com
2. Créer un design 100×100px
3. Design suggéré :
   - Fond : Bleu (#0066CC)
   - Texte : "B" blanc, gras, centré
   - Style : Moderne, minimaliste
4. Télécharger en PNG

#### Option C : Logo Existant
- Redimensionner à exactement 100×100px
- Format PNG (recommandé) ou JPG
- Taille < 100KB

#### Spécifications Techniques :
- ✅ Taille : **100px × 100px** (exactement)
- ✅ Format : **PNG** (recommandé) ou JPG
- ✅ Taille fichier : **< 100 KB**
- ✅ Design : Simple, clair, professionnel
- ✅ Éviter : Détails trop fins (illisibles en petit)

---

## 📝 Récapitulatif du Formulaire

| Champ | Valeur à Entrer |
|-------|-----------------|
| **App Name** | `La Boutique B Drop Shipping` |
| **Callback URL** | `https://VOTRE-DOMAINE.com/api/aliexpress/callback` |
| **App Description** | Copier la description complète ci-dessus |
| **App Logo** | Upload du fichier PNG 100×100px |

---

## ✅ Checklist Avant Soumission

- [ ] App Name est clair et identifiable
- [ ] Callback URL utilise HTTPS (pas HTTP)
- [ ] Callback URL pointe vers votre domaine de production
- [ ] Description explique clairement l'usage (drop shipping)
- [ ] Logo est exactement 100×100px
- [ ] Logo est en PNG ou JPG, < 100KB
- [ ] Vous avez noté toutes les informations

---

## 🔑 Après Création de l'App

Une fois l'app créée, AliExpress vous fournira :

1. **App Key** (API Key)
2. **App Secret** (API Secret)
3. **Tracking ID** (pour l'affiliation)

### Où les ajouter :

Créez un fichier `.env.local` à la racine du projet :

```bash
# AliExpress API Configuration
ALIEXPRESS_APP_KEY=votre_app_key_ici
ALIEXPRESS_APP_SECRET=votre_app_secret_ici
ALIEXPRESS_TRACKING_ID=votre_tracking_id_ici
```

⚠️ **IMPORTANT** :
- Ne JAMAIS commiter ces clés dans Git
- Les garder secrètes
- Les ajouter dans les variables d'environnement de production (Vercel/Netlify)

---

## 📞 Support

Si vous avez des questions lors de la création :
- Documentation AliExpress : https://openservice.aliexpress.com/doc/
- Support : Contacter le support AliExpress
- Issues techniques : Vérifier la console développeur

---

## 🎯 Prochaines Étapes

Après avoir créé l'app :
1. ✅ Récupérer App Key et App Secret
2. ✅ Les ajouter dans `.env.local`
3. ✅ Tester la connexion API
4. ✅ Implémenter l'import de produits
5. ✅ Tester l'affiliation (optionnel)

---

**Date de création** : 2025-10-11
**Dernière mise à jour** : 2025-10-11
