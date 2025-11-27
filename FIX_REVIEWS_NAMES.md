# Fix Reviews - Affichage des vrais noms

## Problème
Les avis affichaient "Utilisateur" au lieu du vrai nom du client.

## Cause
L'API cherchait `full_name` dans la table `profiles`, mais cette colonne n'existe pas. La table utilise `first_name` et `last_name` séparés.

## Solution appliquée

### 1. Correction de l'API Reviews
✅ Modifié `app/api/reviews/route.ts` pour :
- Récupérer `first_name` et `last_name` au lieu de `full_name`
- Combiner les deux champs pour créer le nom complet
- Extraire le prénom de l'email si les champs sont vides
- Utiliser "Client" comme fallback final

### 2. Logique de priorité
L'API utilise maintenant cette logique :
1. **Priorité 1** : `first_name + last_name` (si disponibles)
2. **Priorité 2** : Extraction du prénom depuis l'email
   - `jean.dupont@example.com` → "Jean"
   - `marie_claire123@example.com` → "Marie"
3. **Priorité 3** : Fallback "Client"

### 3. Fonction utilitaire créée
✅ Créé `lib/utils/user-name-helper.ts` avec :
- `extractNameFromEmail()` - Extrait le prénom de l'email
- `getUserDisplayName()` - Logique complète de fallback
- `formatNameWithInitial()` - Format "Jean D."
- `getInitials()` - Initiales pour avatars

## Structure de la table profiles

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT NULL,        -- ✅ Utilisé
  last_name TEXT NULL,          -- ✅ Utilisé
  avatar_url TEXT NULL,
  phone TEXT NULL,
  date_of_birth DATE NULL,
  gender TEXT NULL,
  language TEXT DEFAULT 'fr',
  country TEXT DEFAULT 'BJ',
  city TEXT NULL,
  address TEXT NULL,
  role TEXT DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Exemples de résultats

### Cas 1 : Utilisateur avec prénom et nom
```
first_name: "Jean"
last_name: "Dupont"
→ Affiche: "Jean Dupont"
```

### Cas 2 : Utilisateur avec seulement prénom
```
first_name: "Marie"
last_name: null
→ Affiche: "Marie"
```

### Cas 3 : Utilisateur sans nom mais avec email
```
first_name: null
last_name: null
email: "pierre.martin@example.com"
→ Affiche: "Pierre"
```

### Cas 4 : Utilisateur sans aucune info
```
first_name: null
last_name: null
email: "user123@example.com"
→ Affiche: "User"
```

## Test

Pour tester :
1. Va sur une page produit
2. Laisse un avis
3. Vérifie que ton nom s'affiche correctement
4. Si tu n'as pas renseigné ton prénom/nom dans ton profil, vérifie que le prénom est extrait de ton email

## Fichiers modifiés

- ✅ `app/api/reviews/route.ts` - Corrigé pour utiliser first_name/last_name
- ✅ `lib/utils/user-name-helper.ts` - Fonctions utilitaires créées
- ✅ `supabase/migrations/20251127_create_profiles_table.sql` - Documentation de la structure

## Note importante

Si un utilisateur veut que son vrai nom s'affiche, il doit :
1. Aller dans son profil
2. Renseigner son prénom et nom
3. Les avis futurs afficheront automatiquement son nom complet

Sinon, le système extraira intelligemment le prénom de son email ! 🎯
