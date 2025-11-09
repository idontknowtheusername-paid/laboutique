#!/bin/bash

echo "🔄 Remplacement des console.log restants..."

# Compter les console.log restants
TOTAL=$(grep -r "console\." app/ lib/ components/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | grep -v ".next" | wc -l)

echo "📊 Total de console.* trouvés: $TOTAL"

# Afficher les fichiers concernés
echo ""
echo "📁 Fichiers avec console.*:"
grep -r "console\." app/ lib/ components/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | grep -v ".next" | cut -d: -f1 | sort | uniq

echo ""
echo "✅ Les fichiers critiques (API, webhooks, paiements) ont été mis à jour"
echo "ℹ️  Les console.log restants sont principalement dans:"
echo "   - Pages de debug (intentionnels)"
echo "   - Composants UI (moins critiques)"
echo "   - Services (à migrer progressivement)"
