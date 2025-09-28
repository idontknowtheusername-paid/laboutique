// Script de diagnostic pour l'import de produits
async function waitForReady(url, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) return true;
    } catch (_) {}
    await new Promise(r => setTimeout(r, 500));
  }
  return false;
}

const diagnoseImport = async () => {
  console.log('🔍 Diagnostic de l\'import de produits...\n');
  const baseUrl = process.env.DIAG_BASE_URL || 'http://localhost:3000';
  const healthUrl = `${baseUrl}/api/health`;
  const importUrl = `${baseUrl}/api/products/import`;
  console.log(`🔗 Base URL: ${baseUrl}`);
  console.log('⏳ Attente du serveur...');
  await waitForReady(baseUrl);
  
  // Test 1: Vérifier la connectivité de l'API
  console.log('1️⃣ Test de connectivité API...');
  try {
    const healthResponse = await fetch(healthUrl);
    if (healthResponse.ok) {
      console.log('✅ API accessible');
    } else {
      console.log('❌ API non accessible:', healthResponse.status);
    }
  } catch (error) {
    console.log('❌ Erreur de connectivité:', error.message);
  }
  
  // Test 2: Test de scraping (sans import)
  console.log('\n2️⃣ Test de scraping...');
  try {
    const scrapeResponse = await fetch(importUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://www.alibaba.com/x/B0l3Ay?ck=pdp',
        importDirectly: false // Juste scraper, pas d'import
      })
    });
    
    const scrapeResult = await scrapeResponse.json();
    
    if (scrapeResponse.ok && scrapeResult.success) {
      console.log('✅ Scraping réussi');
      console.log('📝 Produit scrapé:', scrapeResult.data?.name);
      console.log('💰 Prix:', scrapeResult.data?.price);
      console.log('🏷️ Plateforme:', scrapeResult.data?.source_platform);
    } else {
      console.log('❌ Scraping échoué:', scrapeResult.error);
    }
  } catch (error) {
    console.log('❌ Erreur de scraping:', error.message);
  }
  
  // Test 3: Test d'import complet
  console.log('\n3️⃣ Test d\'import complet...');
  try {
    const importResponse = await fetch(importUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://www.alibaba.com/x/B0l3Ay?ck=pdp',
        importDirectly: true
      })
    });
    
    const importResult = await importResponse.json();
    
    console.log('📊 Statut:', importResponse.status);
    console.log('📋 Réponse:', JSON.stringify(importResult, null, 2));
    
    if (importResponse.ok && importResult.success) {
      console.log('✅ Import réussi !');
    } else {
      console.log('❌ Import échoué');
      
      // Analyser l'erreur
      if (importResult.error) {
        console.log('🔍 Type d\'erreur détecté:');
        
        if (importResult.error.includes('vendeur')) {
          console.log('   → Problème de vendeur par défaut');
        } else if (importResult.error.includes('catégorie')) {
          console.log('   → Problème de catégorie');
        } else if (importResult.error.includes('RLS') || importResult.error.includes('row-level security')) {
          console.log('   → Problème de permissions RLS');
        } else if (importResult.error.includes('API key')) {
          console.log('   → Problème de configuration Supabase');
          console.log('\n🛠️ Action requise: Définir SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY, puis redémarrer.');
        } else if (importResult.error.includes('column') || importResult.error.includes('does not exist')) {
          console.log('   → Problème de schéma de base de données');
        } else {
          console.log('   → Erreur inconnue');
        }
      }
    }
  } catch (error) {
    console.log('❌ Erreur d\'import:', error.message);
  }
  
  console.log('\n🏁 Diagnostic terminé');
};

// Exécuter le diagnostic
diagnoseImport();