## Plan d'implémentation Backend ⇄ UI — La Boutique B

### Objectif
Relier Supabase (auth, données, RLS) à l'UI Next.js 13 et livrer un e-commerce complet, performant et maintenable, conforme aux règles de design du projet.

### Pré-requis
- Compte Supabase (projet + tables + RLS activé)
- Clés Stripe pour paiements (si Phase 5)
- Fichier `.env.local` configuré localement (non versionné)

### Découpage en Phases

#### Phase 0 — Préparation
- Créer `.env.local` avec:
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_NAME`
  - (Paiements) `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- Activer RLS sur Supabase et écrire des policies minimales pour: `profiles`, `cart_items`, `wishlist`, `orders`, `order_items`, `product_reviews`.
- Vérifier que les types TS dans `types/database.ts` correspondent au schéma Supabase.

Livrable: env local prêt, RLS actif, types synchronisés.

#### Phase 1 — Authentification et Profil
- Back:
  - Activer Email/Password dans Supabase Auth.
  - Créer `profiles` + trigger de sync à la création d'utilisateur.
  - Policies: un utilisateur peut lire/mettre à jour uniquement son profil.
- UI:
  - Relier `auth/login`, `auth/register`, `auth/forgot-password`, `auth/reset-password`, `auth/verify-email` aux helpers `signIn`, `signUp`, etc.
  - Ajouter le provider `AuthContext` au `RootLayout` si nécessaire.
  - Afficher l'état connecté (avatar/nom) dans `Header`.

Livrable: login/register OK, session fonctionnelle, redirections basiques.

#### Phase 2 — Catalogue Produits et Catégories
- Back:
  - Étendre `getProducts`, `getProduct`, `getCategories` (pagination, tri, filtres par catégorie/prix/featured).
  - Index DB: `products.slug`, `products.status`, `category_id`.
- UI:
  - Remplacer les mocks par les données Supabase dans `app/page.tsx` et carrousels.
  - `app/category/[slug]/page.tsx`: lister produits avec filtres/sort.
  - `app/product/[slug]/page.tsx`: détails produit, images, vendor, stock.

Livrable: catalogue dynamique, SEO propre (title/description dynamiques).

#### Phase 3 — Recherche
- Back:
  - Requêtes `ilike` multi-champs + filtres (prix, catégorie, tags).
  - Option: endpoint `app/api/search/route.ts` pour isoler la logique.
- UI:
  - `app/search/page.tsx`: champ avec debounce, résultats paginés, états de chargement.

Livrable: recherche rapide et tolérante, UX fluide.

#### Phase 4 — Panier et Wishlist
- Back:
  - Tables `cart_items`, `wishlist` avec RLS par `user_id`.
  - CRUD: insert/update/delete sécurisés.
- UI:
  - Brancher `useCart` sur les boutons "Ajouter au panier" (cartes et page produit).
  - Pages `app/cart/page.tsx`, `app/wishlist/page.tsx`: lecture/écriture en temps réel.
  - Calcul du total côté client; contrôle quantités/stock.

Livrable: panier persistant par utilisateur, wishlist fonctionnelle.

#### Phase 5 — Commandes et Paiements (Stripe)
- Back:
  - `app/api/checkout/route.ts`: créer PaymentIntent depuis le panier.
  - `app/api/stripe/webhook/route.ts`: confirmer paiement → créer `orders` + `order_items`, mettre à jour stock, vider panier (idempotence).
- UI:
  - `checkout/page.tsx`: adresses, récapitulatif, paiement, feedback.
  - Pages `checkout/success` et `checkout/cancel` existantes branchées.

Livrable: flux paiement complet et fiable, données de commande persistées.

#### Phase 6 — Espace Compte
- Back: requêtes sécurisées `orders` par `user_id`, détails commande.
- UI: `account/page.tsx`, `account/orders/page.tsx`, `account/wishlist/page.tsx` avec pagination et états vides.

Livrable: historique commandes + wishlist dans l'espace client.

#### Phase 7 — Avis Produits
- Back:
  - `product_reviews` + RLS (auteur ↔ review, lecture publique si `status='approved'`).
  - Option: fonction pour agrégats de notes.
- UI: formulaire d'avis, modération simple, affichage étoiles + pagination.

Livrable: avis utiles avec agrégats.

#### Phase 8 — Admin (MVP)
- Back:
  - Rôle `admin` via `profiles.role` + policies étendues.
  - CRUD: produits, catégories, bannières, coupons.
- UI: `app/admin/dashboard` (restaurer), listes, formulaires shadcn/ui.

Livrable: back-office minimal pour gérer le catalogue.

#### Phase 9 — Vendeurs (Marketplace MVP)
- Back: table `vendors`, ownership des produits, policies propriétaires.
- UI: `vendor/register`, `vendor/dashboard` pour gérer ses produits.

Livrable: multi-vendeurs basique.

#### Phase 10 — Performance, Qualité, Observabilité
- Performance UI: ISR/SSG/Streaming, lazy images, optimisation carrousels.
- Sécurité: validation `zod`, policies RLS strictes, filtrage inputs.
- Qualité: tests unitaires services, e2e vitaux (auth, panier, checkout), lints.
- Observabilité: logs API, monitoring erreurs (optionnel), métriques.
- CI/CD: build + lints + tests; déploiement Vercel.

### Tâches ordonnées (checklist)
- [ ] Phase 0: Env, RLS, types synchro
- [ ] Phase 1: Auth + Profil + Header
- [ ] Phase 2: Catalogue (page d'accueil, catégories, produit)
- [ ] Phase 3: Recherche
- [ ] Phase 4: Panier + Wishlist
- [ ] Phase 5: Checkout + Webhook + Commandes
- [ ] Phase 6: Espace compte
- [ ] Phase 7: Avis produits
- [ ] Phase 8: Admin MVP
- [ ] Phase 9: Vendeurs MVP
- [ ] Phase 10: Perf + Sécurité + Tests + CI/CD

### Notes d'implémentation (alignées aux règles du repo)
- Utiliser shadcn/ui et `lucide-react` exclusivement pour l'UI et les icônes.
- Ajouter "use client" en tête de tout composant qui utilise des hooks côté client.
- Éviter les divergences Server/Client (pas d'attributs extraneous depuis le serveur).
- Code propre, accessible, responsive; privilégier la performance et la lisibilité.


