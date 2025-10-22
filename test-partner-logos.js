const fs = require('fs');
const path = require('path');

console.log('🔍 Test des logos des partenaires...\n');

const partnersDir = path.join(__dirname, 'public', 'images', 'partners');

// Vérifier si le dossier existe
if (!fs.existsSync(partnersDir)) {
  console.log('❌ Le dossier public/images/partners n\'existe pas');
  process.exit(1);
}

// Liste des logos attendus
const expectedLogos = [
  'alibaba-logo.svg',
  'aliexpress-logo.svg',
  'mtn-logo.svg',
  'moov-logo.svg',
  'visa-logo.svg',
  'mastercard-logo.svg',
  'paypal-logo.svg',
  'dhl-logo.svg',
  'fedex-logo.svg',
  'samsung-logo.svg',
  'apple-logo.svg',
  'nike-logo.svg',
  'placeholder-logo.svg'
];

console.log('📁 Fichiers dans le dossier partners:');
const files = fs.readdirSync(partnersDir);
files.forEach(file => {
  const filePath = path.join(partnersDir, file);
  const stats = fs.statSync(filePath);
  const size = (stats.size / 1024).toFixed(2);
  console.log(`  ✅ ${file} (${size} KB)`);
});

console.log('\n🔍 Vérification des logos attendus:');
let missingLogos = [];
expectedLogos.forEach(logo => {
  if (files.includes(logo)) {
    console.log(`  ✅ ${logo}`);
  } else {
    console.log(`  ❌ ${logo} - MANQUANT`);
    missingLogos.push(logo);
  }
});

if (missingLogos.length === 0) {
  console.log('\n🎉 Tous les logos sont présents !');
} else {
  console.log(`\n⚠️  ${missingLogos.length} logo(s) manquant(s):`, missingLogos.join(', '));
}

// Vérifier le contenu des fichiers SVG
console.log('\n🔍 Vérification du contenu des logos SVG:');
files.filter(file => file.endsWith('.svg')).forEach(file => {
  const filePath = path.join(partnersDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('<svg') && content.includes('</svg>')) {
    console.log(`  ✅ ${file} - SVG valide`);
  } else {
    console.log(`  ❌ ${file} - SVG invalide`);
  }
});

console.log('\n✨ Test terminé !');