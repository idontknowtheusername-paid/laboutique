#!/bin/bash

echo "🧪 Test automatique de l'API d'import en masse"
echo "=============================================="

# Configuration
BASE_URL="http://localhost:3000"
API_ENDPOINT="$BASE_URL/api/products/import/bulk"

# Test 1: Recherche simple
echo ""
echo "📋 Test 1: Recherche de produits 'phone case'"
echo "----------------------------------------------"

RESPONSE=$(curl -s -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": "phone case",
    "min_price": 1,
    "max_price": 15,
    "sort": "sales_desc",
    "limit": 3
  }' \
  -w "HTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')

echo "Status HTTP: $HTTP_STATUS"

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Requête réussie"
    echo "Réponse:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo "❌ Erreur HTTP $HTTP_STATUS"
    echo "Réponse:"
    echo "$BODY"
fi

echo ""
echo "=============================================="

# Test 2: Test de l'API de recherche (preview)
echo ""
echo "📋 Test 2: API de recherche (preview)"
echo "--------------------------------------"

SEARCH_ENDPOINT="$BASE_URL/api/products/search"

RESPONSE2=$(curl -s -X POST "$SEARCH_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": "wireless earbuds",
    "min_price": 5,
    "max_price": 30,
    "sort": "sales_desc",
    "limit": 2
  }' \
  -w "HTTP_STATUS:%{http_code}")

HTTP_STATUS2=$(echo "$RESPONSE2" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
BODY2=$(echo "$RESPONSE2" | sed 's/HTTP_STATUS:[0-9]*$//')

echo "Status HTTP: $HTTP_STATUS2"

if [ "$HTTP_STATUS2" = "200" ]; then
    echo "✅ Requête réussie"
    echo "Réponse:"
    echo "$BODY2" | jq '.' 2>/dev/null || echo "$BODY2"
else
    echo "❌ Erreur HTTP $HTTP_STATUS2"
    echo "Réponse:"
    echo "$BODY2"
fi

echo ""
echo "=============================================="
echo "🏁 Tests terminés"

# Résumé
if [ "$HTTP_STATUS" = "200" ] && [ "$HTTP_STATUS2" = "200" ]; then
    echo "✅ Tous les tests sont passés avec succès !"
else
    echo "❌ Certains tests ont échoué"
fi