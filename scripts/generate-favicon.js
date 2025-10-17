#!/usr/bin/env node

/**
 * Script pour générer favicon.ico à partir de favicon.svg
 * Utilise sharp pour la conversion
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateFavicon() {
  console.log('🎨 Génération du favicon.ico orange...\n');

  const svgPath = path.join(__dirname, '../public/favicon.svg');
  const icoPath = path.join(__dirname, '../public/favicon.ico');

  try {
    // Lire le SVG
    const svgBuffer = fs.readFileSync(svgPath);
    
    // Générer les tailles ICO standard (16x16, 32x32, 48x48)
    const sizes = [16, 32, 48];
    const pngBuffers = [];

    for (const size of sizes) {
      console.log(`✓ Génération ${size}x${size}...`);
      const pngBuffer = await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toBuffer();
      pngBuffers.push(pngBuffer);
    }

    // Pour l'instant, utiliser la taille 32x32 comme favicon.ico principal
    // (ICO multi-taille nécessite une bibliothèque spécialisée)
    const mainFavicon = await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toBuffer();

    // Convertir en ICO (approximation avec PNG)
    // Note: Pour un vrai ICO multi-taille, utilisez 'to-ico' package
    await sharp(mainFavicon)
      .toFile(icoPath);

    console.log(`\n✅ Favicon généré avec succès: ${icoPath}`);
    console.log('🎨 Couleur: Orange #FF5722\n');

    // Info
    console.log('ℹ️  Note: Pour un ICO multi-taille parfait, utilisez:');
    console.log('   → https://realfavicongenerator.net');
    console.log('   → ou https://favicon.io/favicon-converter/\n');

  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error.message);
    console.log('\n💡 Solution alternative:');
    console.log('   1. Aller sur https://realfavicongenerator.net');
    console.log('   2. Uploader public/favicon.svg');
    console.log('   3. Télécharger le favicon.ico généré');
    console.log('   4. Remplacer public/favicon.ico\n');
    process.exit(1);
  }
}

generateFavicon();
