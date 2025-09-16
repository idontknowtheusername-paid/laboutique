#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables Supabase non configurées');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Couleurs console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

console.log(`${colors.bold}${colors.blue}🛍️ AJOUT DE PRODUITS TEMPORAIRES${colors.reset}\n`);

async function addSampleData() {
  try {
    // 1. Ajouter des catégories
    console.log(`${colors.bold}1. Ajout des catégories...${colors.reset}`);
    
    const categories = [
      {
        name: 'Électronique',
        slug: 'electronique',
        description: 'Smartphones, ordinateurs, accessoires tech',
        status: 'active',
        sort_order: 1
      },
      {
        name: 'Mode & Beauté',
        slug: 'mode-beaute',
        description: 'Vêtements, chaussures, cosmétiques',
        status: 'active',
        sort_order: 2
      },
      {
        name: 'Maison & Jardin',
        slug: 'maison-jardin',
        description: 'Mobilier, décoration, jardinage',
        status: 'active',
        sort_order: 3
      },
      {
        name: 'Sport & Loisirs',
        slug: 'sport-loisirs',
        description: 'Équipements sportifs, jeux, loisirs',
        status: 'active',
        sort_order: 4
      }
    ];

    const { data: insertedCategories, error: catError } = await supabase
      .from('categories')
      .upsert(categories, { onConflict: 'slug' })
      .select();

    if (catError) {
      console.log(`${colors.red}❌ Erreur catégories: ${catError.message}${colors.reset}`);
      return;
    }

    console.log(`${colors.green}✅ ${insertedCategories.length} catégories ajoutées${colors.reset}`);

    // 2. Ajouter des vendeurs
    console.log(`${colors.bold}2. Ajout des vendeurs...${colors.reset}`);
    
    const vendors = [
      {
        name: 'TechStore Bénin',
        slug: 'techstore-benin',
        email: 'contact@techstore.bj',
        description: 'Spécialiste en électronique et high-tech',
        status: 'active',
        rating: 4.5,
        total_reviews: 150
      },
      {
        name: 'Fashion Plus',
        slug: 'fashion-plus',
        email: 'info@fashionplus.bj',
        description: 'Mode tendance pour tous',
        status: 'active',
        rating: 4.3,
        total_reviews: 89
      },
      {
        name: 'Maison Confort',
        slug: 'maison-confort',
        email: 'hello@maisonconfort.bj',
        description: 'Tout pour votre intérieur',
        status: 'active',
        rating: 4.7,
        total_reviews: 234
      }
    ];

    const { data: insertedVendors, error: vendorError } = await supabase
      .from('vendors')
      .upsert(vendors, { onConflict: 'slug' })
      .select();

    if (vendorError) {
      console.log(`${colors.red}❌ Erreur vendeurs: ${vendorError.message}${colors.reset}`);
      return;
    }

    console.log(`${colors.green}✅ ${insertedVendors.length} vendeurs ajoutés${colors.reset}`);

    // 3. Récupérer les IDs pour les relations
    const electronicsCategory = insertedCategories.find(c => c.slug === 'electronique');
    const fashionCategory = insertedCategories.find(c => c.slug === 'mode-beaute');
    const homeCategory = insertedCategories.find(c => c.slug === 'maison-jardin');
    const sportsCategory = insertedCategories.find(c => c.slug === 'sport-loisirs');
    
    const techVendor = insertedVendors.find(v => v.slug === 'techstore-benin');
    const fashionVendor = insertedVendors.find(v => v.slug === 'fashion-plus');
    const homeVendor = insertedVendors.find(v => v.slug === 'maison-confort');

    // 4. Ajouter des produits
    console.log(`${colors.bold}3. Ajout des produits...${colors.reset}`);
    
    const products = [
      // Électronique
      {
        name: 'iPhone 15 Pro Max 256GB',
        slug: 'iphone-15-pro-max-256gb',
        sku: 'IPHONE15PM-256',
        description: 'Le dernier iPhone avec puce A17 Pro, appareil photo professionnel et écran Super Retina XDR de 6.7 pouces.',
        short_description: 'iPhone 15 Pro Max - 256GB, Titane Naturel',
        price: 850000,
        compare_price: 950000,
        category_id: electronicsCategory?.id,
        vendor_id: techVendor?.id,
        brand: 'Apple',
        images: [
          'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=600',
          'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=600'
        ],
        status: 'active',
        featured: true,
        quantity: 25,
        track_quantity: true
      },
      {
        name: 'MacBook Air M3 13"',
        slug: 'macbook-air-m3-13',
        sku: 'MBA-M3-13-256',
        description: 'MacBook Air avec puce M3, écran Liquid Retina 13 pouces, jusqu\'à 18h d\'autonomie.',
        short_description: 'MacBook Air M3 - 13 pouces, 8GB RAM, 256GB SSD',
        price: 1200000,
        compare_price: 1350000,
        category_id: electronicsCategory?.id,
        vendor_id: techVendor?.id,
        brand: 'Apple',
        images: [
          'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=600'
        ],
        status: 'active',
        featured: true,
        quantity: 15,
        track_quantity: true
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        slug: 'samsung-galaxy-s24-ultra',
        sku: 'SGS24U-512',
        description: 'Smartphone Samsung Galaxy S24 Ultra avec S Pen, caméra 200MP et écran Dynamic AMOLED 2X.',
        short_description: 'Galaxy S24 Ultra - 512GB, Titanium Black',
        price: 780000,
        compare_price: 890000,
        category_id: electronicsCategory?.id,
        vendor_id: techVendor?.id,
        brand: 'Samsung',
        images: [
          'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=600'
        ],
        status: 'active',
        featured: false,
        quantity: 30,
        track_quantity: true
      },
      {
        name: 'AirPods Pro 2ème génération',
        slug: 'airpods-pro-2',
        sku: 'APP-2GEN',
        description: 'Écouteurs sans fil avec réduction de bruit active, audio spatial personnalisé.',
        short_description: 'AirPods Pro 2 - Réduction de bruit active',
        price: 140000,
        compare_price: 180000,
        category_id: electronicsCategory?.id,
        vendor_id: techVendor?.id,
        brand: 'Apple',
        images: [
          'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=600'
        ],
        status: 'active',
        featured: false,
        quantity: 50,
        track_quantity: true
      },

      // Mode & Beauté
      {
        name: 'Robe Élégante Africaine',
        slug: 'robe-elegante-africaine',
        sku: 'REA-WAX-001',
        description: 'Magnifique robe traditionnelle africaine moderne, parfaite pour les occasions spéciales.',
        short_description: 'Robe en wax authentique, coupe moderne',
        price: 45000,
        compare_price: 55000,
        category_id: fashionCategory?.id,
        vendor_id: fashionVendor?.id,
        brand: 'African Style',
        images: [
          'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600'
        ],
        status: 'active',
        featured: true,
        quantity: 20,
        track_quantity: true
      },
      {
        name: 'Costume Homme Élégant',
        slug: 'costume-homme-elegant',
        sku: 'CHE-SLIM-001',
        description: 'Costume homme coupe slim, parfait pour les événements professionnels et cérémonies.',
        short_description: 'Costume slim fit, tissu premium',
        price: 120000,
        compare_price: 150000,
        category_id: fashionCategory?.id,
        vendor_id: fashionVendor?.id,
        brand: 'Elegant Man',
        images: [
          'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600'
        ],
        status: 'active',
        featured: false,
        quantity: 12,
        track_quantity: true
      },
      {
        name: 'Parfum Femme Premium',
        slug: 'parfum-femme-premium',
        sku: 'PFP-ROSE-001',
        description: 'Parfum féminin aux notes florales, longue tenue, idéal pour toutes occasions.',
        short_description: 'Parfum floral premium - 100ml',
        price: 85000,
        category_id: fashionCategory?.id,
        vendor_id: fashionVendor?.id,
        brand: 'Essence',
        images: [
          'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=600'
        ],
        status: 'active',
        featured: false,
        quantity: 35,
        track_quantity: true
      },

      // Maison & Jardin
      {
        name: 'Canapé 3 Places Moderne',
        slug: 'canape-3-places-moderne',
        sku: 'C3P-MOD-001',
        description: 'Canapé 3 places au design moderne, tissu de qualité, parfait pour le salon.',
        short_description: 'Canapé moderne 3 places - Tissu premium',
        price: 280000,
        compare_price: 320000,
        category_id: homeCategory?.id,
        vendor_id: homeVendor?.id,
        brand: 'HomeComfort',
        images: [
          'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600'
        ],
        status: 'active',
        featured: true,
        quantity: 8,
        track_quantity: true
      },
      {
        name: 'Réfrigérateur Samsung 400L',
        slug: 'refrigerateur-samsung-400l',
        sku: 'REF-SAM-400L',
        description: 'Réfrigérateur Samsung 400L, technologie No Frost, classe énergétique A++.',
        short_description: 'Réfrigérateur 400L - No Frost',
        price: 450000,
        compare_price: 520000,
        category_id: homeCategory?.id,
        vendor_id: homeVendor?.id,
        brand: 'Samsung',
        images: [
          'https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg?auto=compress&cs=tinysrgb&w=600'
        ],
        status: 'active',
        featured: false,
        quantity: 6,
        track_quantity: true
      },

      // Sport & Loisirs
      {
        name: 'Ensemble Fitness Homme',
        slug: 'ensemble-fitness-homme',
        sku: 'EFH-SPORT-001',
        description: 'Ensemble sportif homme respirant, parfait pour la salle de sport et le running.',
        short_description: 'Ensemble fitness - Tissu respirant',
        price: 35000,
        category_id: sportsCategory?.id,
        vendor_id: fashionVendor?.id,
        brand: 'SportWear',
        images: [
          'https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=600'
        ],
        status: 'active',
        featured: false,
        quantity: 40,
        track_quantity: true
      },
      {
        name: 'Montre Connectée Samsung',
        slug: 'montre-connectee-samsung',
        sku: 'MCS-WATCH-001',
        description: 'Montre connectée Samsung avec GPS, suivi santé, étanche.',
        short_description: 'Montre connectée - GPS + Santé',
        price: 150000,
        compare_price: 180000,
        category_id: sportsCategory?.id,
        vendor_id: techVendor?.id,
        brand: 'Samsung',
        images: [
          'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=600'
        ],
        status: 'active',
        featured: true,
        quantity: 18,
        track_quantity: true
      }
    ];

    // Ajouter les produits un par un pour avoir un meilleur contrôle
    let addedCount = 0;
    for (const product of products) {
      try {
        const { data, error } = await supabase
          .from('products')
          .upsert([product], { onConflict: 'slug' })
          .select();

        if (error) {
          console.log(`${colors.red}❌ Erreur produit "${product.name}": ${error.message}${colors.reset}`);
        } else {
          console.log(`${colors.green}✅ Produit ajouté: ${product.name}${colors.reset}`);
          addedCount++;
        }
      } catch (err) {
        console.log(`${colors.red}❌ Erreur produit "${product.name}": ${err.message}${colors.reset}`);
      }
    }

    console.log(`${colors.bold}${colors.green}\n🎉 SUCCÈS !${colors.reset}`);
    console.log(`${colors.green}✅ ${insertedCategories.length} catégories${colors.reset}`);
    console.log(`${colors.green}✅ ${insertedVendors.length} vendeurs${colors.reset}`);
    console.log(`${colors.green}✅ ${addedCount} produits${colors.reset}`);

    // 5. Ajouter quelques bannières pour le carrousel
    console.log(`${colors.bold}4. Ajout des bannières...${colors.reset}`);
    
    const banners = [
      {
        title: 'Soldes Électronique',
        subtitle: 'Jusqu\'à -30% sur tous les smartphones',
        image_url: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=1200',
        link_url: '/category/electronique',
        button_text: 'Voir les offres',
        position: 'hero',
        status: 'active',
        sort_order: 1
      },
      {
        title: 'Nouvelle Collection Mode',
        subtitle: 'Découvrez les tendances 2025',
        image_url: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1200',
        link_url: '/category/mode-beaute',
        button_text: 'Explorer',
        position: 'hero',
        status: 'active',
        sort_order: 2
      }
    ];

    const { data: insertedBanners, error: bannerError } = await supabase
      .from('banners')
      .upsert(banners, { onConflict: 'title' })
      .select();

    if (bannerError) {
      console.log(`${colors.red}❌ Erreur bannières: ${bannerError.message}${colors.reset}`);
    } else {
      console.log(`${colors.green}✅ ${insertedBanners.length} bannières ajoutées${colors.reset}`);
    }

    console.log(`${colors.bold}${colors.blue}\n🚀 PRÊT À TESTER !${colors.reset}`);
    console.log(`${colors.yellow}Lancez maintenant: npm run dev${colors.reset}`);
    console.log(`${colors.yellow}Puis allez sur: http://localhost:3000${colors.reset}\n`);

  } catch (error) {
    console.error(`${colors.red}❌ Erreur générale: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Exécuter le script
addSampleData();