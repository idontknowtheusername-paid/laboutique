#!/bin/bash

echo "🧪 TEST: Import par catégorie réelle AliExpress"
echo "==============================================="

# Test avec Computer & Office (category_id: 7)
echo ""
echo "📱 Test 1: Computer & Office (ID: 7)"
curl -s -X POST http://localhost:3000/api/aliexpress/test-single-feed \
  -H "Content-Type: application/json" \
  -d '{"feed_name": "ds-bestselling", "category_id": "7"}' | jq '.success, .productCount'

# Test avec Apparel & Accessories (category_id: 3)
echo ""
echo "👕 Test 2: Apparel & Accessories (ID: 3)"
curl -s -X POST http://localhost:3000/api/aliexpress/test-single-feed \
  -H "Content-Type: application/json" \
  -d '{"feed_name": "ds-bestselling", "category_id": "3"}' | jq '.success, .productCount'

echo ""
echo "🏁 Tests terminés"
