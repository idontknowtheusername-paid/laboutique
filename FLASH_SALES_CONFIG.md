# ⚡ Configuration des Ventes Flash

## ✅ Configuration actuelle (après modification)

### Règle stricte : Contrôle manuel uniquement

**Seuls les produits avec `is_flash_sale = true` apparaissent dans la section Ventes Flash.**

```typescript
// components/home/FlashSalesConnected.tsx
const flashProducts = data.data.filter((product: any) => {
  if (product.is_flash_sale) {
    const now = new Date();
    const endDate = product.flash_end_date ? new Date(product.flash_end_date) : null;
    return !endDate || endDate > now;
  }
  return false; // ❌ Pas de fallback automatique
});
```

## 🎯 Comportement

### Produits importés d'AliExpress
- ❌ N'apparaissent PAS automatiquement en Ventes Flash
- ✅ Ont un prix barré (`compare_price`) pour montrer la réduction
- ✅ Affichent le badge de réduction sur les cartes produits
- ⚡ Peuvent être ajoutés manuellement via l'admin

### Produits en Ventes Flash
- ✅ Uniquement ceux que tu actives manuellement
- ✅ Via Admin → Produits → Toggle "Flash Sale"
- ✅ Avec date de fin optionnelle (`flash_end_date`)
- ✅ Avec prix flash optionnel (`flash_price`)

## 📋 Comment ajouter un produit en Ventes Flash

1. Aller dans **Admin → Produits**
2. Trouver le produit à promouvoir
3. Activer le toggle **"Flash Sale"** ⚡
4. (Optionnel) Définir un prix flash spécifique
5. (Optionnel) Définir une date de fin

## 🔍 Où les prix barrés sont affichés

Les produits importés avec `compare_price > price` affichent :
- ✅ Badge de réduction sur les cartes produits
- ✅ Prix barré à côté du prix actuel
- ❌ Mais n'apparaissent PAS dans la section "Ventes Flash"

## 💡 Avantages de cette configuration

1. **Contrôle total** : Tu choisis quels produits mettre en avant
2. **Urgence créée** : Section Ventes Flash = vraies promotions limitées
3. **Flexibilité** : Tous les produits gardent leur prix barré pour montrer la valeur
4. **Marketing** : Tu peux créer des campagnes flash ciblées

## 🚀 Exemple d'utilisation

### Produit importé (TV 80 pouces)
```
Prix : 138,085 XOF
Prix barré : 306,856 XOF
is_flash_sale : false
→ Affiche la réduction partout SAUF dans "Ventes Flash"
```

### Même produit en promotion flash
```
Prix : 138,085 XOF
Prix barré : 306,856 XOF
is_flash_sale : true
flash_end_date : 2024-12-01
→ Apparaît dans "Ventes Flash" avec compte à rebours
```
