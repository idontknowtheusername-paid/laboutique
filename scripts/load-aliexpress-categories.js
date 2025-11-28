#!/usr/bin/env node

/**
 * Script pour charger les catégories AliExpress dans la base de données
 * Usage: node scripts/load-aliexpress-categories.js
 */

async function loadCategories() {
  try {
    console.log('🔄 Chargement des catégories AliExpress...');

    const response = await fetch('http://localhost:3000/api/aliexpress/categories');
    const data = await response.json();

    if (data.success) {
      console.log(`✅ ${data.total} catégories chargées avec succès`);
      console.log(`   - ${data.top_level} catégories principales`);
      console.log(`   - ${data.total - data.top_level} sous-catégories`);
      console.log(`   - Cached: ${data.cached ? 'Oui' : 'Non'}`);
      
      // Afficher quelques exemples
      console.log('\n📋 Exemples de catégories:');
      data.categories.slice(0, 10).forEach((cat) => {
        console.log(`   - ${cat.name} (ID: ${cat.id})`);
      });
    } else {
      console.error('❌ Erreur:', data.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Erreur lors du chargement:', error.message);
    process.exit(1);
  }
}

loadCategories();
