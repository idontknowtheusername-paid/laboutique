#!/bin/bash

echo "🧪 Test détaillé de l'API AliExpress Dropship"
echo "=============================================="

BASE_URL="http://localhost:3000"

# Test avec différents paramètres
echo ""
echo "📋 Test 1: Sans mots-clés (feed général)"
echo "----------------------------------------"

curl -s -X POST "$BASE_URL/api/products/search" \
  -H "Content-Type: application/json" \
  -d '{
    "sort": "sales_desc",
    "limit": 5
  }' | jq '.'

echo ""
echo "📋 Test 2: Avec catégorie spécifique"
echo "------------------------------------"

curl -s -X POST "$BASE_URL/api/products/search" \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": "509",
    "sort": "sales_desc", 
    "limit": 3
  }' | jq '.'

echo ""
echo "📋 Test 3: Test simple sans filtres"
echo "-----------------------------------"

curl -s -X POST "$BASE_URL/api/products/search" \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": "electronics",
    "limit": 2
  }' | jq '.'

echo ""
echo "🏁 Tests terminés"