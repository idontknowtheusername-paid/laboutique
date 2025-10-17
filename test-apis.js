#!/usr/bin/env node

// Script de test pour vérifier que toutes les APIs fonctionnent
const baseUrl = 'http://localhost:3000';

async function testAPI(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${baseUrl}${endpoint}`, options);
    const result = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function runTests() {
  console.log('🧪 TEST DES APIs - JOMIONSTORE\n');
  
  // Test 1: Newsletter
  console.log('1️⃣ Test Newsletter...');
  const newsletterTest = await testAPI('/api/newsletter', 'POST', {
    email: 'test@example.com'
  });
  console.log(`   ${newsletterTest.success ? '✅' : '❌'} Newsletter: ${newsletterTest.success ? 'OK' : newsletterTest.error || newsletterTest.data?.error}`);
  
  // Test 2: Contact
  console.log('2️⃣ Test Contact...');
  const contactTest = await testAPI('/api/contact', 'POST', {
    name: 'Test User',
    email: 'test@example.com',
    subject: 'Test Subject',
    message: 'Test message'
  });
  console.log(`   ${contactTest.success ? '✅' : '❌'} Contact: ${contactTest.success ? 'OK' : contactTest.error || contactTest.data?.error}`);
  
  // Test 3: Claims
  console.log('3️⃣ Test Claims...');
  const claimsTest = await testAPI('/api/claims', 'POST', {
    name: 'Test User',
    email: 'test@example.com',
    claimType: 'product',
    description: 'Test claim',
    desiredSolution: 'refund'
  });
  console.log(`   ${claimsTest.success ? '✅' : '❌'} Claims: ${claimsTest.success ? 'OK' : claimsTest.error || claimsTest.data?.error}`);
  
  // Test 4: Order Tracking
  console.log('4️⃣ Test Order Tracking...');
  const trackingTest = await testAPI('/api/orders/track?tracking=TEST123');
  console.log(`   ${trackingTest.success ? '✅' : '❌'} Tracking: ${trackingTest.success ? 'OK' : trackingTest.error || trackingTest.data?.error}`);
  
  console.log('\n🎯 RÉSUMÉ DES TESTS:');
  console.log(`   Newsletter: ${newsletterTest.success ? '✅' : '❌'}`);
  console.log(`   Contact: ${contactTest.success ? '✅' : '❌'}`);
  console.log(`   Claims: ${claimsTest.success ? '✅' : '❌'}`);
  console.log(`   Tracking: ${trackingTest.success ? '✅' : '❌'}`);
  
  const allSuccess = newsletterTest.success && contactTest.success && claimsTest.success && trackingTest.success;
  console.log(`\n${allSuccess ? '🎉 TOUS LES TESTS RÉUSSIS !' : '⚠️  CERTAINS TESTS ONT ÉCHOUÉ'}`);
}

// Attendre que le serveur démarre
setTimeout(runTests, 5000);