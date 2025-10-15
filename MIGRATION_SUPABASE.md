# 🗄️ MIGRATION SUPABASE - Tables Orders

## ⚠️ IMPORTANT - À FAIRE AVANT DE TESTER

Votre base de données Supabase **ne contient pas encore les tables `orders` et `order_items`**. 
C'est pourquoi vous voyez l'erreur **"Impossible de créer la commande"**.

---

## 📋 ÉTAPES POUR CRÉER LES TABLES

### **Option 1 : Via le Dashboard Supabase (RECOMMANDÉ)**

1. **Allez sur votre dashboard Supabase**
   - URL : https://supabase.com/dashboard/project/VOTRE-PROJECT-ID
   
2. **Cliquez sur "SQL Editor"** dans le menu de gauche

3. **Créez une nouvelle requête** (bouton "New Query")

4. **Copiez-collez le contenu du fichier** `supabase/migrations/20250116_create_orders_tables.sql`

5. **Cliquez sur "Run"** en bas à droite

6. **Vérifiez que ça a marché** :
   - Allez dans "Table Editor"
   - Vous devriez voir les tables `orders` et `order_items`

---

### **Option 2 : Via CLI Supabase (Pour les développeurs)**

```bash
# 1. Installer Supabase CLI
npm install -g supabase

# 2. Se connecter
supabase login

# 3. Lier le projet
supabase link --project-ref VOTRE-PROJECT-ID

# 4. Appliquer les migrations
supabase db push
```

---

## ✅ VÉRIFICATION

Une fois la migration appliquée, vérifiez dans Supabase :

### **Tables créées :**
- ✅ `public.orders`
- ✅ `public.order_items`

### **Index créés :**
- ✅ `idx_orders_user_id`
- ✅ `idx_orders_order_number`
- ✅ `idx_orders_status`
- ✅ `idx_order_items_order_id`
- Et d'autres...

### **Policies RLS (Row Level Security) :**
- ✅ Les utilisateurs peuvent voir leurs propres commandes
- ✅ Le service role peut tout faire (pour les APIs)

---

## 🔐 SÉCURITÉ

Les tables ont **Row Level Security (RLS) activée** :
- Les utilisateurs ne voient que **leurs propres commandes**
- Les APIs utilisent le **service role key** pour créer les commandes
- **Aucun risque** qu'un utilisateur voit les commandes d'un autre

---

## 📦 STRUCTURE DES TABLES

### **Table `orders`**
```sql
- id (UUID)
- order_number (VARCHAR) - Numéro unique
- user_id (UUID) - Référence vers auth.users
- status (pending, confirmed, processing, shipped, delivered, cancelled)
- payment_status (pending, paid, failed, refunded)
- payment_method (qosic, mobile_money, etc.)
- subtotal, tax_amount, shipping_amount, discount_amount, total_amount
- shipping_address, billing_address (JSONB)
- notes (TEXT)
- created_at, updated_at
```

### **Table `order_items`**
```sql
- id (UUID)
- order_id (UUID) - Référence vers orders
- product_id (UUID) - Référence vers products
- vendor_id (VARCHAR)
- quantity (INTEGER)
- price (DECIMAL)
- total (DECIMAL)
- created_at
```

---

## 🚀 APRÈS LA MIGRATION

Une fois les tables créées, **redémarrez votre serveur** :

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez
npm run dev
```

Ensuite testez le paiement sur `/checkout` - L'erreur **"Impossible de créer la commande"** devrait disparaître ! ✅

---

## ❓ EN CAS DE PROBLÈME

### **Erreur : "relation 'products' does not exist"**
➡️ Vous devez aussi créer la table `products` si elle n'existe pas

### **Erreur : "permission denied"**
➡️ Vérifiez que vous utilisez bien le **service role key** dans `.env.local`

### **La commande se crée mais reste vide**
➡️ Vérifiez que les policies RLS autorisent le service role

---

## 📞 SUPPORT

Si vous avez des problèmes, contactez le support Supabase ou vérifiez les logs dans :
- Dashboard Supabase > Logs
- Console développeur (F12)
- Terminal serveur

---

**Fait avec ❤️ pour La Boutique B**
