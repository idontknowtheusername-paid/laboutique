// Test de l'API des catégories AliExpress
const testCategoriesAPI = async () => {
  console.log('🧪 Test API Catégories AliExpress');
  console.log('================================');

  try {
    // Test direct de l'API catégories
    const response = await fetch('http://localhost:3000/api/aliexpress/test-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    const result = await response.json();
    console.log('Résultat:', result);

  } catch (error) {
    console.error('Erreur:', error.message);
  }
};

testCategoriesAPI();