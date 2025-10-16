#!/bin/bash

echo "🎨 Correction des BLEUS RESTANTS → ORANGE #FF5722"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Fonction de remplacement
replace_all() {
    local search="$1"
    local replace="$2"
    
    echo "🔄 $search → $replace"
    
    find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" -o -name "*.sql" \) \
        -not -path "*/node_modules/*" \
        -not -path "*/.next/*" \
        -not -path "*/dist/*" \
        -not -path "*/.git/*" \
        -exec sed -i "s/$search/$replace/g" {} +
}

echo "📝 Phase 1: Backgrounds bleus..."
replace_all "bg-blue-50" "bg-orange-50"
replace_all "bg-blue-100" "bg-orange-100"
replace_all "bg-blue-200" "bg-orange-200"
replace_all "bg-blue-400" "bg-orange-400"
replace_all "bg-blue-500" "bg-orange-500"
replace_all "bg-blue-600" "bg-orange-600"

echo ""
echo "📝 Phase 2: Textes bleus..."
replace_all "text-blue-100" "text-orange-100"
replace_all "text-blue-200" "text-orange-200"
replace_all "text-blue-300" "text-orange-300"
replace_all "text-blue-700" "text-orange-700"
replace_all "text-blue-800" "text-orange-800"
replace_all "text-blue-900" "text-orange-900"

echo ""
echo "📝 Phase 3: Bordures bleues..."
replace_all "border-blue-200" "border-orange-200"
replace_all "border-blue-300" "border-orange-300"

echo ""
echo "📝 Phase 4: Gradients bleus..."
replace_all "to-blue-600" "to-orange-600"
replace_all "to-blue-700" "to-orange-700"
replace_all "from-blue-50" "from-orange-50"
replace_all "from-blue-500" "from-orange-500"
replace_all "from-blue-600" "from-orange-600"
replace_all "via-blue-50" "via-orange-50"
replace_all "via-blue-500" "via-orange-500"

echo ""
echo "📝 Phase 5: Code couleur hexadécimal hardcodé..."
replace_all "#4169E1" "#FF5722"
replace_all "background: '#4169E1'" "background: '#FF5722'"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Tous les bleus restants ont été remplacés !"
echo ""
