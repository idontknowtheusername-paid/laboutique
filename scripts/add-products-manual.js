#!/usr/bin/env node

// Script pour ajouter des produits temporaires
// Usage: node scripts/add-products-manual.js VOTRE_URL VOTRE_KEY

const { createClient } = require('@supabase/supabase-js');

// Récupérer les arguments de la ligne de commande
const args = process.argv.slice(2);
const supabaseUrl = args[0] || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = args[1] || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Usage: node add-products-manual.js <SUPABASE_URL> <SUPABASE_KEY>');
  console.log('   Ou configurez les variables dans .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🛍️ AJOUT DE PRODUITS TEMPORAIRES\n');

async function addSampleData() {
  try {
    // 1. Vérifier la connexion
    console.log('1. Test de connexion...');
    const { data: testData, error: testError } = await supabase
      .from('categories')
      .select('count')
      .limit(1);

    if (testError) {
      console.log(`❌ Connexion échouée: ${testError.message}`);
      return;
    }
    console.log('✅ Connexion réussie\n');

    // 2. Ajouter catégories
    console.log('2. Ajout des catégories...');
    const categories = [
      { name: 'Électronique', slug: 'electronique', description: 'Smartphones, ordinateurs, accessoires tech', status: 'active', sort_order: 1 },
      { name: 'Mode & Beauté', slug: 'mode-beaute', description: 'Vêtements, chaussures, cosmétiques', status: 'active', sort_order: 2 },
      { name: 'Maison & Jardin', slug: 'maison-jardin', description: 'Mobilier, décoration, jardinage', status: 'active', sort_order: 3 },
      { name: 'Sport & Loisirs', slug: 'sport-loisirs', description: 'Équipements sportifs, jeux, loisirs', status: 'active', sort_order: 4 }
    ];

    const { data: catData, error: catError } = await supabase
      .from('categories')
      .upsert(categories, { onConflict: 'slug' })
      .select();

    if (catError) {
      console.log(`❌ Erreur catégories: ${catError.message}`);
      return;
    }
    console.log(`✅ ${catData.length} catégories ajoutées\n`);

    // 3. Ajouter vendeurs
    console.log('3. Ajout des vendeurs...');
    const vendors = [
      { name: 'TechStore Bénin', slug: 'techstore-benin', email: 'contact@techstore.bj', description: 'Spécialiste en électronique', status: 'active', rating: 4.5 },
      { name: 'Fashion Plus', slug: 'fashion-plus', email: 'info@fashionplus.bj', description: 'Mode tendance', status: 'active', rating: 4.3 },
      { name: 'Maison Confort', slug: 'maison-confort', email: 'hello@maisonconfort.bj', description: 'Tout pour votre intérieur', status: 'active', rating: 4.7 }
    ];

    const { data: vendorData, error: vendorError } = await supabase
      .from('vendors')
      .upsert(vendors, { onConflict: 'slug' })
      .select();

    if (vendorError) {
      console.log(`❌ Erreur vendeurs: ${vendorError.message}`);
      return;
    }
    console.log(`✅ ${vendorData.length} vendeurs ajoutés\n`);

    // 4. Récupérer les IDs
    const electronicsCategory = catData.find(c => c.slug === 'electronique');
    const fashionCategory = catData.find(c => c.slug === 'mode-beaute');
    const homeCategory = catData.find(c => c.slug === 'maison-jardin');
    const sportsCategory = catData.find(c => c.slug === 'sport-loisirs');
    
    const techVendor = vendorData.find(v => v.slug === 'techstore-benin');
    const fashionVendor = vendorData.find(v => v.slug === 'fashion-plus');
    const homeVendor = vendorData.find(v => v.slug === 'maison-confort');

    // 5. Ajouter produits
    console.log('4. Ajout des produits...');
    const products = [
      // Électronique (avec promotions)
      {
        name: 'iPhone 15 Pro Max 256GB',
        slug: 'iphone-15-pro-max-256gb',
        sku: 'IPHONE15PM-256',
        description: 'Le dernier iPhone avec puce A17 Pro, appareil photo professionnel.',
        short_description: 'iPhone 15 Pro Max - 256GB, Titane Naturel',
        price: 850000,
        compare_price: 950000,
        category_id: electronicsCategory?.id,
        vendor_id: techVendor?.id,
        brand: 'Apple',
        images: ['https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=600'],
        status: 'active',
        featured: true,
        quantity: 25
      },
      {
        name: 'MacBook Air M3 13"',
        slug: 'macbook-air-m3-13',
        sku: 'MBA-M3-13-256',
        description: 'MacBook Air avec puce M3, écran Liquid Retina 13 pouces.',
        short_description: 'MacBook Air M3 - 13 pouces, 8GB RAM',
        price: 1200000,
        compare_price: 1350000,
        category_id: electronicsCategory?.id,
        vendor_id: techVendor?.id,
        brand: 'Apple',
        images: ['https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=600'],
        status: 'active',
        featured: true,
        quantity: 15
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        slug: 'samsung-galaxy-s24-ultra',
        sku: 'SGS24U-512',
        description: 'Smartphone Samsung Galaxy S24 Ultra avec S Pen et caméra 200MP.',
        short_description: 'Galaxy S24 Ultra - 512GB',
        price: 780000,
        compare_price: 890000,
        category_id: electronicsCategory?.id,
        vendor_id: techVendor?.id,
        brand: 'Samsung',
        images: ['https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=600'],
        status: 'active',
        featured: false,
        quantity: 30
      },
      {
        name: 'AirPods Pro 2ème génération',
        slug: 'airpods-pro-2',
        sku: 'APP-2GEN',
        description: 'Écouteurs sans fil avec réduction de bruit active.',
        short_description: 'AirPods Pro 2 - Réduction de bruit',
        price: 140000,
        compare_price: 180000,
        category_id: electronicsCategory?.id,
        vendor_id: techVendor?.id,
        brand: 'Apple',
        images: ['https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=600'],
        status: 'active',
        featured: false,
        quantity: 50
      },

      // Mode & Beauté
      {
        name: 'Robe Élégante Africaine',
        slug: 'robe-elegante-africaine',
        sku: 'REA-WAX-001',
        description: 'Magnifique robe traditionnelle africaine moderne.',
        short_description: 'Robe en wax authentique',
        price: 45000,
        compare_price: 55000,
        category_id: fashionCategory?.id,
        vendor_id: fashionVendor?.id,
        brand: 'African Style',
        images: ['https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600'],
        status: 'active',
        featured: true,
        quantity: 20
      },
      {
        name: 'Costume Homme Élégant',
        slug: 'costume-homme-elegant',
        sku: 'CHE-SLIM-001',
        description: 'Costume homme coupe slim, parfait pour les événements.',
        short_description: 'Costume slim fit premium',
        price: 120000,
        compare_price: 150000,
        category_id: fashionCategory?.id,
        vendor_id: fashionVendor?.id,
        brand: 'Elegant Man',
        images: ['https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600'],
        status: 'active',
        featured: false,
        quantity: 12
      },

      // Maison & Jardin
      {
        name: 'Canapé 3 Places Moderne',
        slug: 'canape-3-places-moderne',
        sku: 'C3P-MOD-001',
        description: 'Canapé 3 places au design moderne, tissu de qualité.',
        short_description: 'Canapé moderne 3 places',
        price: 280000,
        compare_price: 320000,
        category_id: homeCategory?.id,
        vendor_id: homeVendor?.id,
        brand: 'HomeComfort',
        images: ['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600'],
        status: 'active',
        featured: true,
        quantity: 8
      }
    ];

    let addedCount = 0;
    for (const product of products) {
      try {
        const { data, error } = await supabase
          .from('products')
          .upsert([product], { onConflict: 'slug' })
          .select();

        if (error) {
          console.log(`❌ ${product.name}: ${error.message}`);
        } else {
          console.log(`✅ ${product.name}`);
          addedCount++;
        }
      } catch (err) {
        console.log(`❌ ${product.name}: ${err.message}`);
      }
    }

    console.log(`\n🎉 TERMINÉ !`);
    console.log(`✅ ${catData.length} catégories`);
    console.log(`✅ ${vendorData.length} vendeurs`);
    console.log(`✅ ${addedCount} produits`);
    console.log(`\n🚀 Lancez maintenant: npm run dev`);

  } catch (error) {
    console.error(`❌ Erreur: ${error.message}`);
  }
}

addSampleData();