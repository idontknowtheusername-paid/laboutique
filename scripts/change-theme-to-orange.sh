#!/bin/bash

# Script de changement du thème bleu vers orange #FF5722
# Jomionstore.com

echo "🎨 Changement du thème BLEU → ORANGE #FF5722"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Fonction de remplacement sécurisée
replace_in_files() {
    local search="$1"
    local replace="$2"
    local pattern="$3"
    
    echo "🔄 Remplacement: $search → $replace"
    
    # Trouver et remplacer dans tous les fichiers .tsx, .ts, .css, .sql
    find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" -o -name "*.sql" \) \
        -not -path "*/node_modules/*" \
        -not -path "*/.next/*" \
        -not -path "*/dist/*" \
        -not -path "*/.git/*" \
        -exec sed -i "s/$search/$replace/g" {} +
    
    echo "   ✅ Terminé"
}

echo "📝 Phase 1: Remplacement des classes Tailwind..."
echo ""

# Remplacer hover:bg-blue-700 par hover:bg-orange-700
replace_in_files "hover:bg-blue-700" "hover:bg-orange-700"

# Remplacer hover:bg-blue-800 par hover:bg-orange-700
replace_in_files "hover:bg-blue-800" "hover:bg-orange-700"

# Remplacer bg-blue-700 par bg-orange-600
replace_in_files "bg-blue-700" "bg-orange-600"

# Remplacer bg-blue-800 par bg-orange-700
replace_in_files "bg-blue-800" "bg-orange-700"

# Remplacer text-blue-500 par text-orange-500
replace_in_files "text-blue-500" "text-orange-500"

# Remplacer text-blue-600 par text-orange-600
replace_in_files "text-blue-600" "text-orange-600"

# Remplacer border-blue par border-orange
replace_in_files "border-blue" "border-orange"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Changement terminé !"
echo ""
echo "📊 Résumé:"
echo "   - Classes Tailwind: Modifiées"
echo "   - Configuration: Déjà fait (tailwind.config.ts + globals.css)"
echo ""
echo "🚀 Prochaines étapes:"
echo "   1. npm run build (tester le build)"
echo "   2. Vérifier visuellement le site"
echo "   3. Commit les changements"
echo ""
