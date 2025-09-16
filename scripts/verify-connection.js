#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Configuration avec fallback
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

console.log(`${colors.bold}${colors.blue}🔍 VÉRIFICATION CONNEXION FRONTEND-BACKEND${colors.reset}\n`);

async function verifyConnection() {
  // Test des variables
  if (!supabaseUrl || supabaseUrl.includes('your_supabase')) {
    console.log(`${colors.red}❌ NEXT_PUBLIC_SUPABASE_URL non configurée${colors.reset}`);
    console.log(`${colors.yellow}→ Modifiez .env.local avec votre vraie URL Supabase${colors.reset}\n`);
    return false;
  }

  if (!supabaseKey || supabaseKey.includes('your_supabase')) {
    console.log(`${colors.red}❌ NEXT_PUBLIC_SUPABASE_ANON_KEY non configurée${colors.reset}`);
    console.log(`${colors.yellow}→ Modifiez .env.local avec votre vraie clé Supabase${colors.reset}\n`);
    return false;
  }

  console.log(`${colors.green}✅ Variables d'environnement configurées${colors.reset}\n`);

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test connexion
    console.log(`${colors.bold}Test de connexion...${colors.reset}`);
    const { data: testData, error: testError } = await supabase
      .from('categories')
      .select('count')
      .limit(1);

    if (testError) {
      console.log(`${colors.red}❌ Connexion échouée: ${testError.message}${colors.reset}\n`);
      return false;
    }

    console.log(`${colors.green}✅ Connexion Supabase réussie${colors.reset}\n`);

    // Vérifier les données
    console.log(`${colors.bold}Vérification des données...${colors.reset}`);

    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .eq('status', 'active');

    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active');

    const { data: vendors, error: vendError } = await supabase
      .from('vendors')
      .select('*')
      .eq('status', 'active');

    console.log(`${colors.green}✅ Catégories: ${categories?.length || 0}${colors.reset}`);
    console.log(`${colors.green}✅ Produits: ${products?.length || 0}${colors.reset}`);
    console.log(`${colors.green}✅ Vendeurs: ${vendors?.length || 0}${colors.reset}\n`);

    // Vérifier les produits en vedette
    const featuredProducts = products?.filter(p => p.featured) || [];
    console.log(`${colors.blue}📌 Produits en vedette: ${featuredProducts.length}${colors.reset}`);
    featuredProducts.forEach(p => {
      console.log(`   - ${p.name} (${p.price} FCFA)`);
    });

    // Vérifier les promotions
    const saleProducts = products?.filter(p => p.compare_price && p.compare_price > p.price) || [];
    console.log(`${colors.blue}🏷️ Produits en promotion: ${saleProducts.length}${colors.reset}`);
    saleProducts.forEach(p => {
      const discount = Math.round(((p.compare_price - p.price) / p.compare_price) * 100);
      console.log(`   - ${p.name} (-${discount}%)`);
    });

    console.log(`\n${colors.bold}${colors.green}🎉 TOUT EST PRÊT !${colors.reset}`);
    console.log(`${colors.yellow}Lancez: npm run dev${colors.reset}`);
    console.log(`${colors.yellow}Puis: http://localhost:3000${colors.reset}\n`);

    return true;

  } catch (error) {
    console.log(`${colors.red}❌ Erreur: ${error.message}${colors.reset}\n`);
    return false;
  }
}

verifyConnection();