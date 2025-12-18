const fs = require('fs');
const { execSync } = require('child_process');

console.log('📦 Installing Advanced Data Processing Packages\n');

const packages = [
  'indic-transliteration',  // For Devanagari text processing
  'gender-detection-from-name',  // Gender inference
  'string-similarity',  // For name matching
  'natural',  // NLP for text processing
];

console.log('Installing packages:');
packages.forEach(pkg => console.log(`  - ${pkg}`));
console.log('');

try {
  execSync(`npm install ${packages.join(' ')}`, { stdio: 'inherit' });
  console.log('\n✅ All packages installed successfully!');
  console.log('\nNow run:');
  console.log('  node intelligent-data-extraction.js');
} catch (error) {
  console.error('\n❌ Installation failed:', error.message);
  process.exit(1);
}
