# Recherche API AliExpress Dropship

## Méthodes API disponibles pour la recherche de produits :

### 1. aliexpress.ds.recommend.feed.get
- **Usage actuel** : Récupère des produits recommandés
- **Limitation** : Ne supporte pas la recherche par mots-clés
- **Feed types** : ds-bestselling, ds-new-arrival, ds-promotion
- **Paramètres** : feed_name (obligatoire), page_size, page_no

### 2. aliexpress.ds.product.get  
- **Usage** : Récupère un produit spécifique par ID
- **Limitation** : Un seul produit à la fois
- **Paramètres** : product_id (obligatoire)

### 3. Autres méthodes possibles à investiguer :
- aliexpress.ds.category.get (pour les catégories)
- aliexpress.ds.commissionorder.listbyindex (pour les commandes)

## Problème identifié :
L'API Dropship semble être limitée et ne permet pas de recherche libre par mots-clés.

## Solutions possibles :
1. Utiliser l'API publique AliExpress (sans OAuth)
2. Utiliser des feeds prédéfinis avec pagination
3. Implémenter un scraper léger
4. Combiner plusieurs feeds pour simuler une recherche