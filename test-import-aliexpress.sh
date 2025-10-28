#!/bin/bash

# Test de l'import AliExpress en local
echo "🧪 Test import AliExpress..."
echo ""

# URL de test (produit AliExpress réel)
TEST_URL="https://www.aliexpress.com/item/1005006143023732.html"

echo "📡 Envoi requête à http://localhost:3000/api/products/import"
echo "URL produit: $TEST_URL"
echo ""

curl -X POST http://localhost:3000/api/products/import \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"$TEST_URL\",
    \"importDirectly\": false
  }" \
  | jq '.'

echo ""
echo "✅ Test terminé"
