#!/usr/bin/env node

/**
 * Script de vérification du domaine jomionstore.com
 * Vérifie que tout est bien configuré
 */

const https = require('https');
const http = require('http');

const DOMAIN = 'jomionstore.com';
const WWW_DOMAIN = `www.${DOMAIN}`;

console.log('🔍 Vérification de la configuration du domaine...\n');

// 1. Vérifier HTTPS
async function checkHTTPS(domain) {
  return new Promise((resolve) => {
    https.get(`https://${domain}`, (res) => {
      resolve({
        success: true,
        statusCode: res.statusCode,
        headers: res.headers
      });
    }).on('error', (err) => {
      resolve({ success: false, error: err.message });
    });
  });
}

// 2. Vérifier redirection HTTP → HTTPS
async function checkHTTPRedirect(domain) {
  return new Promise((resolve) => {
    http.get(`http://${domain}`, (res) => {
      resolve({
        statusCode: res.statusCode,
        location: res.headers.location,
        redirects: res.statusCode >= 300 && res.statusCode < 400
      });
    }).on('error', (err) => {
      resolve({ success: false, error: err.message });
    });
  });
}

// 3. Vérifier variables d'environnement locales
function checkEnvVars() {
  require('dotenv').config({ path: '.env.local' });
  
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  
  return {
    NEXT_PUBLIC_APP_URL: appUrl,
    NEXT_PUBLIC_SITE_URL: siteUrl,
    pointsToProduction: appUrl?.includes(DOMAIN) || siteUrl?.includes(DOMAIN),
    pointsToLocalhost: appUrl?.includes('localhost') || siteUrl?.includes('localhost')
  };
}

async function main() {
  // Test 1: HTTPS
  console.log(`📡 Test 1: HTTPS ${DOMAIN}`);
  const httpsResult = await checkHTTPS(DOMAIN);
  if (httpsResult.success) {
    console.log(`   ✅ HTTPS fonctionne (${httpsResult.statusCode})`);
  } else {
    console.log(`   ❌ HTTPS ne fonctionne pas: ${httpsResult.error}`);
  }
  console.log('');

  // Test 2: WWW
  console.log(`📡 Test 2: HTTPS ${WWW_DOMAIN}`);
  const wwwResult = await checkHTTPS(WWW_DOMAIN);
  if (wwwResult.success) {
    console.log(`   ✅ WWW fonctionne (${wwwResult.statusCode})`);
  } else {
    console.log(`   ❌ WWW ne fonctionne pas: ${wwwResult.error}`);
  }
  console.log('');

  // Test 3: HTTP Redirect
  console.log(`📡 Test 3: Redirection HTTP → HTTPS`);
  const redirectResult = await checkHTTPRedirect(DOMAIN);
  if (redirectResult.redirects && redirectResult.location?.startsWith('https://')) {
    console.log(`   ✅ Redirection OK (${redirectResult.statusCode} → ${redirectResult.location})`);
  } else {
    console.log(`   ⚠️  Pas de redirection HTTPS détectée`);
  }
  console.log('');

  // Test 4: Variables locales
  console.log(`📡 Test 4: Variables d'environnement (.env.local)`);
  const envVars = checkEnvVars();
  console.log(`   NEXT_PUBLIC_APP_URL: ${envVars.NEXT_PUBLIC_APP_URL}`);
  console.log(`   NEXT_PUBLIC_SITE_URL: ${envVars.NEXT_PUBLIC_SITE_URL}`);
  if (envVars.pointsToLocalhost) {
    console.log(`   ✅ Variables locales pointent vers localhost (CORRECT pour dev)`);
  } else if (envVars.pointsToProduction) {
    console.log(`   ⚠️  Variables locales pointent vers production (devrait être localhost)`);
  }
  console.log('');

  // Résumé
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 RÉSUMÉ');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (httpsResult.success && wwwResult.success) {
    console.log('✅ Le domaine est accessible en HTTPS');
  } else {
    console.log('❌ Le domaine n\'est pas encore accessible');
    console.log('   → Vérifiez la configuration DNS/Vercel');
  }

  console.log('');
  console.log('📝 ACTIONS À FAIRE:');
  console.log('');
  console.log('1. ✅ Vérifier variables Vercel (Production):');
  console.log(`   NEXT_PUBLIC_APP_URL=https://${DOMAIN}`);
  console.log(`   NEXT_PUBLIC_SITE_URL=https://${DOMAIN}`);
  console.log('');
  console.log('2. ✅ Configurer Supabase redirect URLs:');
  console.log(`   https://${DOMAIN}/auth/callback`);
  console.log(`   https://${DOMAIN}/auth/reset-password`);
  console.log('');
  console.log('3. ✅ Configurer Qosic callback URLs:');
  console.log(`   https://${DOMAIN}/checkout/callback`);
  console.log(`   https://${DOMAIN}/checkout/cancel`);
  console.log('');
  console.log('📖 Voir CONFIGURATION_DOMAINE.md pour le guide complet');
  console.log('');
}

main().catch(console.error);
