#!/usr/bin/env node

/**
 * Script de test pour l'API AliExpress
 * Usage : node scripts/test-aliexpress-api.js
 */

const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

// Configuration
const APP_KEY = process.env.ALIEXPRESS_APP_KEY;
const APP_SECRET = process.env.ALIEXPRESS_APP_SECRET;
const TRACKING_ID = process.env.ALIEXPRESS_TRACKING_ID;

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Générer la signature
function generateSign(params) {
  const sortedKeys = Object.keys(params).sort();
  let signString = APP_SECRET;
  
  for (const key of sortedKeys) {
    if (params[key] !== undefined && params[key] !== null) {
      signString += key + params[key];
    }
  }
  signString += APP_SECRET;
  
  return crypto.createHash('md5').update(signString, 'utf8').digest('hex').toUpperCase();
}

// Test de connexion
async function testConnection() {
  log('\n🔍 Test de Connexion à l\'API AliExpress\n', 'cyan');
  
  // Vérifier la configuration
  log('1️⃣  Vérification de la configuration...', 'blue');
  
  if (!APP_KEY) {
    log('❌ ALIEXPRESS_APP_KEY non configuré', 'red');
    log('   Ajoutez-le dans .env.local', 'yellow');
    return false;
  }
  log(`   ✅ APP_KEY: ${APP_KEY}`, 'green');
  
  if (!APP_SECRET) {
    log('❌ ALIEXPRESS_APP_SECRET non configuré', 'red');
    log('   Ajoutez-le dans .env.local', 'yellow');
    return false;
  }
  log(`   ✅ APP_SECRET: ${APP_SECRET.slice(0, 4)}...${APP_SECRET.slice(-4)}`, 'green');
  
  if (TRACKING_ID) {
    log(`   ✅ TRACKING_ID: ${TRACKING_ID}`, 'green');
  } else {
    log('   ⚠️  TRACKING_ID non configuré (optionnel pour l\'affiliation)', 'yellow');
  }
  
  // Test d'appel API
  log('\n2️⃣  Test d\'appel API...', 'blue');
  
  const timestamp = Date.now().toString();
  const method = 'aliexpress.affiliate.hotproduct.query';
  
  const params = {
    app_key: APP_KEY,
    method,
    timestamp,
    sign_method: 'md5',
    format: 'json',
    v: '2.0',
    page_no: '1',
    page_size: '5',
    target_currency: 'XOF',
    target_language: 'FR',
    ship_to_country: 'BJ',
  };
  
  if (TRACKING_ID) {
    params.tracking_id = TRACKING_ID;
  }
  
  params.sign = generateSign(params);
  
  const queryString = new URLSearchParams(params).toString();
  const url = `https://api-sg.aliexpress.com/sync?${queryString}`;
  
  log(`   📡 Appel: ${method}`, 'cyan');
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok) {
      log('   ✅ Connexion réussie !', 'green');
      
      // Analyser la réponse
      if (data.aliexpress_affiliate_hotproduct_query_response) {
        const result = data.aliexpress_affiliate_hotproduct_query_response.resp_result;
        
        if (result && result.resp_code === 200) {
          const products = result.result?.products?.product || [];
          log(`   ✅ ${products.length} produits trouvés`, 'green');
          
          if (products.length > 0) {
            log('\n3️⃣  Exemple de produit récupéré:', 'blue');
            const product = products[0];
            log(`   📦 Nom: ${product.product_title?.slice(0, 60)}...`, 'cyan');
            log(`   💰 Prix: ${product.sale_price} ${product.sale_price_currency || 'XOF'}`, 'cyan');
            log(`   🖼️  Image: ${product.product_main_image_url ? '✅' : '❌'}`, 'cyan');
          }
          
          log('\n✅ Test réussi ! L\'API AliExpress fonctionne correctement.', 'green');
          return true;
        } else {
          log(`   ❌ Erreur API: ${result?.resp_msg || 'Inconnue'}`, 'red');
          log(`   Code: ${result?.resp_code}`, 'yellow');
          return false;
        }
      } else if (data.error_response) {
        log(`   ❌ Erreur API: ${data.error_response.msg}`, 'red');
        log(`   Code: ${data.error_response.code}`, 'yellow');
        return false;
      } else {
        log('   ❌ Réponse inattendue', 'red');
        console.log('   Réponse complète:', JSON.stringify(data, null, 2));
        return false;
      }
    } else {
      log(`   ❌ Erreur HTTP ${response.status}`, 'red');
      const text = await response.text();
      log(`   Détails: ${text.slice(0, 200)}`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`   ❌ Erreur lors de l'appel: ${error.message}`, 'red');
    return false;
  }
}

// Test d'import d'un produit spécifique
async function testProductImport(productUrl) {
  log('\n🔍 Test d\'Import de Produit\n', 'cyan');
  log(`URL: ${productUrl}`, 'blue');
  
  // Extraire l'ID du produit
  const match = productUrl.match(/\/item\/(\d+)/);
  if (!match) {
    log('❌ Impossible d\'extraire l\'ID du produit', 'red');
    return false;
  }
  
  const productId = match[1];
  log(`Product ID: ${productId}`, 'cyan');
  
  const timestamp = Date.now().toString();
  const method = 'aliexpress.affiliate.productdetail.get';
  
  const params = {
    app_key: APP_KEY,
    method,
    timestamp,
    sign_method: 'md5',
    format: 'json',
    v: '2.0',
    product_ids: productId,
    fields: 'product_id,product_title,product_main_image_url,sale_price,original_price,product_detail_url',
    target_currency: 'XOF',
    target_language: 'FR',
    country: 'BJ',
  };
  
  if (TRACKING_ID) {
    params.tracking_id = TRACKING_ID;
  }
  
  params.sign = generateSign(params);
  
  const queryString = new URLSearchParams(params).toString();
  const url = `https://api-sg.aliexpress.com/sync?${queryString}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.aliexpress_affiliate_productdetail_get_response) {
      const result = data.aliexpress_affiliate_productdetail_get_response.resp_result;
      
      if (result && result.resp_code === 200 && result.result) {
        const products = result.result.products?.product || [];
        
        if (products.length > 0) {
          const product = products[0];
          log('\n✅ Produit récupéré avec succès !', 'green');
          log(`\n📦 Détails du produit:`, 'blue');
          log(`   Nom: ${product.product_title}`, 'cyan');
          log(`   Prix: ${product.sale_price} ${product.sale_price_currency || 'XOF'}`, 'cyan');
          log(`   Prix original: ${product.original_price || 'N/A'}`, 'cyan');
          log(`   Image: ${product.product_main_image_url ? '✅' : '❌'}`, 'cyan');
          log(`   URL: ${product.product_detail_url}`, 'cyan');
          return true;
        }
      }
    }
    
    log('❌ Produit non trouvé ou erreur', 'red');
    console.log('Réponse:', JSON.stringify(data, null, 2));
    return false;
  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
    return false;
  }
}

// Main
async function main() {
  log('═══════════════════════════════════════════════════', 'cyan');
  log('  Test API AliExpress - JomionStore', 'cyan');
  log('═══════════════════════════════════════════════════', 'cyan');
  
  const success = await testConnection();
  
  if (success) {
    log('\n📝 Commandes disponibles:', 'blue');
    log('   - Importer un produit : npm run import:test <URL>', 'cyan');
    log('   - Voir la doc : cat docs/ALIEXPRESS-INTEGRATION-COMPLETE.md', 'cyan');
  } else {
    log('\n❌ Le test a échoué. Vérifiez :', 'red');
    log('   1. Que .env.local existe avec les bonnes valeurs', 'yellow');
    log('   2. Que APP_KEY et APP_SECRET sont corrects', 'yellow');
    log('   3. Que votre app est en status "Test" ou "Online"', 'yellow');
    log('\n📖 Voir le guide : docs/ALIEXPRESS-INTEGRATION-COMPLETE.md', 'cyan');
  }
  
  log('\n═══════════════════════════════════════════════════\n', 'cyan');
}

// Exécuter
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testConnection, testProductImport };
