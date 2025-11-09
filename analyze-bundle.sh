#!/bin/bash
echo "📊 Analyse des bundles JavaScript..."
echo ""
echo "🔍 Top 20 plus gros chunks:"
ls -lh .next/static/chunks/*.js 2>/dev/null | awk '{print $5, $9}' | sort -rh | head -20
echo ""
echo "📦 Taille totale des chunks:"
du -sh .next/static/chunks/ 2>/dev/null
echo ""
echo "📈 Statistiques:"
echo "- Nombre total de chunks: $(ls .next/static/chunks/*.js 2>/dev/null | wc -l)"
echo "- Chunks > 100K: $(ls -l .next/static/chunks/*.js 2>/dev/null | awk '$5 > 100000' | wc -l)"
echo "- Chunks > 200K: $(ls -l .next/static/chunks/*.js 2>/dev/null | awk '$5 > 200000' | wc -l)"
