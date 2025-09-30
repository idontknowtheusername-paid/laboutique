#!/bin/bash

echo "🚀 Déploiement de JomiaStore avec optimisations de scalabilité..."

# 1. Vérifier les variables d'environnement
echo "📋 Vérification des variables d'environnement..."
if [ -z "$REDIS_HOST" ]; then
    echo "❌ REDIS_HOST non configuré"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ NEXT_PUBLIC_SUPABASE_URL non configuré"
    exit 1
fi

echo "✅ Variables d'environnement OK"

# 2. Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

# 3. Build avec optimisations
echo "🔨 Build avec optimisations..."
npm run build

# 4. Tests de performance
echo "🧪 Tests de performance..."
if command -v artillery &> /dev/null; then
    artillery run load-test.yml
else
    echo "⚠️ Artillery non installé, installation..."
    npm install -g artillery
    artillery run load-test.yml
fi

# 5. Déploiement Vercel
echo "🚀 Déploiement sur Vercel..."
vercel --prod

# 6. Vérification post-déploiement
echo "✅ Vérification post-déploiement..."
curl -f https://jomiastore.vercel.app/api/monitoring || echo "⚠️ Monitoring API non accessible"

echo "🎉 Déploiement terminé avec optimisations de scalabilité !"
echo "📊 Monitoring: https://jomiastore.vercel.app/api/monitoring"
echo "🔍 Tests de charge: artillery run load-test.yml"