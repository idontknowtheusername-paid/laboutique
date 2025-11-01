#!/bin/bash

# Test direct de l'API Lygos avec curl
# Remplace YOUR_API_KEY par ta vraie clé API Lygos

echo "🧪 Test direct API Lygos..."
echo ""

# Test 1: Créer une passerelle de paiement
echo "📤 Création d'une passerelle de paiement..."
curl -X POST https://api.lygosapp.com/v1/gateway \
  -H "Content-Type: application/json" \
  -H "api-key: YOUR_API_KEY" \
  -d '{
    "amount": 1000,
    "shop_name": "JomionStore",
    "order_id": "TEST-' $(date +%s) '",
    "message": "Test de paiement JomionStore",
    "success_url": "https://jomionstore.com/success",
    "failure_url": "https://jomionstore.com/failure"
  }' \
  | jq '.'

echo ""
echo "📋 Analyse de la réponse:"
echo "- Vérifier si le champ 'link' est présent"
echo "- Vérifier le format de l'URL dans 'link'"
echo "- Noter l'ID de la passerelle créée"

echo ""
echo "🔍 Pour tester avec ta vraie clé API:"
echo "1. Remplace YOUR_API_KEY par ta clé Lygos"
echo "2. Exécute: chmod +x test-lygos-curl.sh && ./test-lygos-curl.sh"