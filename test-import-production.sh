#!/bin/bash

echo "🧪 Test import AliExpress en PRODUCTION"
echo "URL: https://jomionstore.com/api/products/import"
echo ""

# URL de test (produit AliExpress réel)
TEST_URL="https://www.aliexpress.com/item/1005006143023732.html"

echo "📡 Envoi requête (prévisualisation)..."
echo ""

curl -X POST https://jomionstore.com/api/products/import \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"$TEST_URL\",
    \"importDirectly\": false
  }" \
  | jq '.'

echo ""
echo "✅ Test terminé"
echo ""
echo "💡 Pour importer directement, change 'importDirectly' à true"
