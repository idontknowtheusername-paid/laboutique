#!/bin/bash

echo "🧪 Test des différents feeds AliExpress Dropship API"
echo "=================================================="

BASE_URL="http://localhost:3000"

# Test 1: Feed ds-bestselling (actuel)
echo ""
echo "📋 Test 1: Feed ds-bestselling (actuel)"
echo "---------------------------------------"
curl -s -X POST "$BASE_URL/api/products/search" \
  -H "Content-Type: application/json" \
  -d '{
    "sort": "sales_desc",
    "limit": 3
  }' | jq '.success, .message, .total'

# Test 2: Sans feed_name pour voir l'erreur
echo ""
echo "📋 Test 2: Test sans feed_name"
echo "------------------------------"
# Modifier temporairement le service pour tester

# Test 3: Avec mots-clés
echo ""
echo "📋 Test 3: Avec mots-clés 'phone'"
echo "--------------------------------"
curl -s -X POST "$BASE_URL/api/products/search" \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": "phone",
    "limit": 3
  }' | jq '.success, .message, .total'

# Test 4: Avec catégorie
echo ""
echo "📋 Test 4: Avec category_id"
echo "---------------------------"
curl -s -X POST "$BASE_URL/api/products/search" \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": "509",
    "limit": 3
  }' | jq '.success, .message, .total'

echo ""
echo "🏁 Tests terminés"