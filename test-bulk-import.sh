#!/bin/bash

echo "🧪 Test import en masse (3 produits)"
echo ""

# Produit 1
echo "📦 Import produit 1..."
RESULT1=$(curl -s -X POST https://jomionstore.com/api/products/import \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://fr.aliexpress.com/item/1005007499493593.html",
    "importDirectly": true,
    "publishDirectly": false
  }')

echo "$RESULT1" | jq -r 'if .success then "✅ Succès: " + .data.name else "❌ Erreur: " + .error end'
echo ""

# Produit 2
echo "📦 Import produit 2..."
RESULT2=$(curl -s -X POST https://jomionstore.com/api/products/import \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://fr.aliexpress.com/item/1005006143023732.html",
    "importDirectly": true,
    "publishDirectly": false
  }')

echo "$RESULT2" | jq -r 'if .success then "✅ Succès: " + .data.name else "❌ Erreur: " + .error end'
echo ""

# Produit 3
echo "📦 Import produit 3..."
RESULT3=$(curl -s -X POST https://jomionstore.com/api/products/import \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://fr.aliexpress.com/item/1005004788969283.html",
    "importDirectly": true,
    "publishDirectly": false
  }')

echo "$RESULT3" | jq -r 'if .success then "✅ Succès: " + .data.name else "❌ Erreur: " + .error end'
echo ""

# Résumé
echo "📊 Résumé:"
SUCCESS_COUNT=0
if echo "$RESULT1" | jq -e '.success' > /dev/null 2>&1; then ((SUCCESS_COUNT++)); fi
if echo "$RESULT2" | jq -e '.success' > /dev/null 2>&1; then ((SUCCESS_COUNT++)); fi
if echo "$RESULT3" | jq -e '.success' > /dev/null 2>&1; then ((SUCCESS_COUNT++)); fi

echo "✅ Succès: $SUCCESS_COUNT/3"
echo "❌ Échecs: $((3 - SUCCESS_COUNT))/3"
