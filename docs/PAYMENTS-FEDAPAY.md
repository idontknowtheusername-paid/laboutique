# Paiements FedaPay — Guide de configuration, tests et passage en production

## 1) Prérequis
- Compte FedaPay (sandbox puis production)
- Clés API sandbox et live (API Key + Public Key)
- Secret de webhook (sandbox et live)
- URL publique accessible pour recevoir les webhooks (ngrok en local ou domaine déployé)

## 2) Variables d’environnement
Ajouter dans votre environnement (voir `.env.example`):

- NEXT_PUBLIC_APP_URL: URL publique de l’application (ex. https://app.example.com)
- FEDAPAY_MODE: `test` ou `live`
- FEDAPAY_API_KEY: `sk_test_xxx` (puis `sk_live_xxx` en prod)
- FEDAPAY_PUBLIC_KEY: `pk_test_xxx` (puis `pk_live_xxx` en prod)
- FEDAPAY_WEBHOOK_SECRET: secret HMAC pour signer les webhooks

Commandes utiles:
```bash
# local
cp .env.example .env.local
# éditez .env.local puis redémarrez le serveur
```

## 3) Intégration dans l’application (déjà implémentée)
- Route API de checkout: `app/api/checkout/route.ts`
  - Calcule les totaux, crée une commande `pending` (idempotence), appelle FedaPay pour créer la transaction et renvoie `payment_url`.
  - Passe `order_id` et les `items` dans `metadata`.
- Route API webhook: `app/api/fedapay/webhook/route.ts`
  - Vérifie la signature HMAC (`x-fedapay-signature`) avec `FEDAPAY_WEBHOOK_SECRET`.
  - Mappe les statuts FedaPay → `orders.payment_status` et `orders.status`:
    - paid/approved → payment_status=paid, status=confirmed
    - canceled/failed → payment_status=failed, status=cancelled
  - Fallback par référence si `order_id` absent.
- Checkout UI: `app/checkout/page.tsx`
  - Protégée (redirection login si non connecté)
  - Appelle `/api/checkout` et redirige vers l’URL de paiement FedaPay
- Pages retour: `/checkout/success` et `/checkout/cancel`

## 4) Tests en sandbox (étapes exactes)
1. Mettre `FEDAPAY_MODE=test` et clés sandbox.
2. Si local, exposer l’app: `ngrok http 3000` puis définir `NEXT_PUBLIC_APP_URL=https://<ngrok>.ngrok.io`.
3. Dans le dashboard FedaPay (sandbox), configurer l’URL de webhook: `https://<URL_PUBLIC>/api/fedapay/webhook`.
4. Ouvrir `/checkout` → “Confirmer et payer” → redirection FedaPay sandbox → finaliser le paiement.
5. Attendre 2–5s → vérifier la commande en base:
   - `status=confirmed` et `payment_status=paid`.
6. Cas d’échec: annuler sur FedaPay → `status=cancelled`, `payment_status=failed`.

Vérification manuelle de l’API (optionnel):
```bash
curl -X POST https://<URL_PUBLIC>/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "UUID_USER",
    "items": [
      { "product_id": "prod1", "vendor_id": "default", "quantity": 1, "price": 10000 }
    ],
    "customer": { "name": "Test", "email": "t@example.com", "phone": "+22900000000", "shipping_address": {} }
  }'
# Réponse attendue: { payment_url, reference }
```

Simulation de webhook (optionnel):
```bash
curl -X POST https://<URL_PUBLIC>/api/fedapay/webhook \
  -H "Content-Type: application/json" \
  -H "x-fedapay-signature: <HMAC_HEX_DU_CORPS>" \
  -d '{
    "event": "transaction.paid",
    "data": {
      "id": 123456,
      "reference": "TX-TEST-12345",
      "status": "approved",
      "metadata": { "order_id": "UUID_COMMANDE" }
    }
  }'
```

Note: Pour générer l’HMAC de test, utilisez `sha256` HMAC du corps JSON brut avec `FEDAPAY_WEBHOOK_SECRET`.

## 5) Passage en production (go live)
1. Mettre `FEDAPAY_MODE=live`.
2. Remplacer `FEDAPAY_API_KEY` et `FEDAPAY_PUBLIC_KEY` par les clés live.
3. Définir `NEXT_PUBLIC_APP_URL` sur le domaine de prod.
4. Mettre à jour l’URL de webhook live dans le dashboard FedaPay.
5. Faire un paiement réel (petit montant) pour valider le flux.

## 6) Sécurité & conformité
- Les routes webhook refusent les signatures invalides (401).
- Conservez vos secrets en variables d’environnement (jamais en code).
- Ajoutez un monitoring (Sentry) pour capturer les erreurs en prod.
- Rate limiting conseillé sur `/api/checkout`.

## 7) Dépannage (troubleshooting)
- Build échoue pour env manquantes → compléter `.env` (voir `.env.example`).
- Paiement OK mais commande non mise à jour → vérifier l’URL webhook et la signature, logs serveur.
- Références manquantes → fallback par `reference` dans les `notes` (voir webhook). Assurez-vous que `order_id` est bien passé en metadata.

## 8) Points évolutifs (optionnels)
- Écran admin des transactions (statuts, référence, filtres).
- Email de confirmation de paiement.
- Statuts supplémentaires (processing/shipped/delivered) sur le cycle logistique.

---
Pour toute modification, mettre à jour ce document et `.env.example` afin de garder la procédure reproductible par l’équipe.