const fs = require('fs');

console.log('🚀 Installing OCR packages for Node.js...\n');
console.log('This will install:');
console.log('  - pdf-parse (for PDF text extraction)');
console.log('  - pdf2pic (for PDF to image conversion)');
console.log('  - tesseract.js (pure JS OCR engine)\n');

const { execSync } = require('child_process');

try {
  console.log('📦 Installing pdf-parse...');
  execSync('npm install pdf-parse', { stdio: 'inherit' });
  
  console.log('\n📦 Installing pdf2pic...');
  execSync('npm install pdf2pic', { stdio: 'inherit' });
  
  console.log('\n📦 Installing tesseract.js...');
  execSync('npm install tesseract.js', { stdio: 'inherit' });
  
  console.log('\n✅ All packages installed successfully!');
  console.log('\nNow you can run:');
  console.log('  node comprehensive-ocr-nodejs.js');
  
} catch (error) {
  console.error('\n❌ Installation failed:', error.message);
  process.exit(1);
}
