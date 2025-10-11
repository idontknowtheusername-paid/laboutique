# 🔐 Guide des Permissions AliExpress

## 📊 Situation Actuelle

Votre app **JomionStore** a les permissions suivantes :
- ✅ **System Tool** (active)
- ✅ **AliExpress-dropship** (active)

## ⚠️ Problème Identifié

L'API AliExpress a **2 types** d'authentification différents :

### 1️⃣ **APIs d'Affiliation** (Affiliate APIs)
- ✅ Authentification simple : `app_key` + `app_secret` + `signature`
- ✅ Pas besoin d'OAuth
- ❌ **Nécessite un Tracking ID**
- Exemples :
  - `aliexpress.affiliate.productdetail.get`
  - `aliexpress.affiliate.hotproduct.query`
  - `aliexpress.affiliate.link.generate`

### 2️⃣ **APIs Dropshipping** (Dropship APIs)
- ❌ Authentification OAuth : nécessite un `access_token`
- ❌ Flux OAuth complexe
- Exemples :
  - `aliexpress.ds.product.get`
  - `aliexpress.ds.order.get`

---

## 🎯 Solutions Possibles

### **SOLUTION 1 : Utiliser les APIs d'Affiliation** ⭐ RECOMMANDÉ

**Avantages :**
- ✅ Plus simple (pas d'OAuth)
- ✅ Même qualité de données
- ✅ Bonus : Gagnez des commissions (3-10%)

**Prérequis :**
1. Créer un compte affilié : https://portals.aliexpress.com
2. Obtenir un **Tracking ID**
3. Demander les permissions **"AliExpress Affiliate"** sur votre app

**Étapes :**

#### 1. S'inscrire au Programme d'Affiliation

1. Allez sur : https://portals.aliexpress.com
2. Créez un compte (gratuit)
3. Remplissez votre profil
4. Acceptez les conditions

#### 2. Obtenir le Tracking ID

1. Une fois inscrit, allez dans **Account** → **Tracking ID**
2. Créez un nouveau Tracking ID :
   - **Name** : "JomionStore Import"
   - **Type** : API
3. Copiez le Tracking ID (ex: `default123456`)

#### 3. Demander Permission Affiliate sur l'App

1. Retournez sur https://openservice.aliexpress.com
2. Ouvrez votre app "JomionStore"
3. Cliquez sur **"API Permission Group"**
4. Recherchez : **"AliExpress Affiliate"**
5. Cliquez sur **"Add"** ou **"Request"**
6. Attendez l'approbation (généralement instantané)

#### 4. Ajouter le Tracking ID dans .env.local

```bash
ALIEXPRESS_TRACKING_ID=votre_tracking_id_ici
```

---

### **SOLUTION 2 : Implémenter OAuth pour Dropship APIs** ⚠️ COMPLEXE

**Avantages :**
- Plus de contrôle sur les commandes
- Gestion des retours/remboursements

**Inconvénients :**
- ❌ Très complexe
- ❌ Flux OAuth multi-étapes
- ❌ Nécessite autorisation manuelle
- ❌ Access token à renouveler

**Pas recommandé pour commencer.**

---

### **SOLUTION 3 : Utiliser Scraping en Fallback** 🔄 ACTUEL

Le système actuel fait déjà ça :
1. Essaye l'API officielle
2. Si échoue → Fallback vers scraping

**Problème :** Le scraping est moins fiable et coûteux.

---

## 🚀 Action Recommandée : Configuration Tracking ID

### Étape 1 : S'inscrire au programme d'affiliation

```bash
# Ouvrir le lien
https://portals.aliexpress.com
```

### Étape 2 : Créer un Tracking ID

1. Menu : **Account** → **Tracking ID** → **New Tracking ID**
2. Copier la valeur

### Étape 3 : Ajouter dans .env.local

```bash
ALIEXPRESS_TRACKING_ID=votre_tracking_id_copie_ici
```

### Étape 4 : Tester

```bash
node scripts/test-aliexpress-api.js
```

Vous devriez voir :
```
✅ TRACKING_ID: default123456
✅ Connexion réussie !
✅ Test réussi !
```

---

## 📊 Comparaison des Solutions

| Critère | Affiliate APIs | Dropship APIs | Scraping |
|---------|----------------|---------------|----------|
| **Complexité** | 🟢 Simple | 🔴 Complexe | 🟡 Moyen |
| **Setup** | 5 min | 2-3 heures | Déjà fait |
| **Fiabilité** | 99% | 99% | 40-60% |
| **Données** | Complètes | Complètes | Limitées |
| **Commissions** | ✅ Oui (3-10%) | ❌ Non | ❌ Non |
| **Coût** | Gratuit | Gratuit | 50-200$/mois |

---

## 💡 Bonus : Gagner de l'Argent avec l'Affiliation

Une fois le Tracking ID configuré :

**Pour chaque vente générée via votre site :**
- Commission : **3% à 10%** du prix produit
- Exemple : Produit à 25 000 XOF → **750 à 2500 XOF** de commission
- Paiement mensuel par AliExpress

**Comment ça marche :**
1. Votre site importe produits avec votre Tracking ID
2. Client achète sur votre site
3. Vous recevez la commande et commandez sur AliExpress via votre lien affilié
4. Vous gagnez la commission + votre marge !

---

## 🆘 Questions Fréquentes

**Q : Le Tracking ID est obligatoire ?**
- Oui, pour l'API affiliate
- Non, pour le scraping (mais moins fiable)

**Q : Combien de temps pour obtenir le Tracking ID ?**
- Inscription : 5 minutes
- Approbation : Instantané
- Total : < 10 minutes

**Q : Je peux utiliser plusieurs Tracking IDs ?**
- Oui, créez-en plusieurs pour tracker différentes sources

**Q : Les permissions affiliate sont payantes ?**
- Non, c'est 100% gratuit

**Q : OAuth est vraiment nécessaire pour dropship ?**
- Oui, c'est obligatoire pour les APIs `aliexpress.ds.*`
- Mais les APIs affiliate donnent les mêmes données

---

## ✅ Checklist Rapide

```
□ S'inscrire sur https://portals.aliexpress.com
□ Créer un Tracking ID
□ Ajouter ALIEXPRESS_TRACKING_ID dans .env.local
□ Demander permission "AliExpress Affiliate" (optionnel, peut déjà être actif)
□ Tester : node scripts/test-aliexpress-api.js
□ Importer un premier produit via l'admin
```

---

**🎯 Prochaine action : Créez votre compte affilié et obtenez un Tracking ID !**

**Temps estimé : 10 minutes**
