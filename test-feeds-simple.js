require('dotenv').config({ path: '.env.local' });

async function testFeeds() {
  console.log('\n🔍 Test des feeds AliExpress Dropship\n');
  console.log('='.repeat(60));
  
  const feeds = ['ds-bestselling', 'ds-new-arrival', 'ds-promotion', 'ds-choice'];
  let total = 0;
  
  for (const feed of feeds) {
    const response = await fetch('http://localhost:3000/api/aliexpress/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page_size: 10 })
    });
    
    const data = await response.json();
    const count = data.count || 0;
    total += count;
    
    console.log(`${count > 0 ? '✅' : '⚠️ '} ${feed.padEnd(20)} : ${count} produits`);
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log('='.repeat(60));
  console.log(`\n📊 Total: ${total} produits trouvés\n`);
  
  if (total === 0) {
    console.log('⚠️  Les feeds sont vides');
    console.log('\n💡 Solutions:');
    console.log('   1. Contacter le support AliExpress');
    console.log('   2. Utiliser l\'import individuel (fonctionne déjà ✅)');
  }
}

testFeeds();
