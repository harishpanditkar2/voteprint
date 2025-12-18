const fs = require('fs');
const { execSync } = require('child_process');

console.log('📦 Installing Data Processing Packages\n');

const packages = [
  'string-similarity',
  'natural'
];

console.log('Installing:');
packages.forEach(pkg => console.log(`  - ${pkg}`));
console.log('');

try {
  execSync(`npm install ${packages.join(' ')}`, { stdio: 'inherit' });
  console.log('\n✅ Packages installed!');
} catch (error) {
  console.error('\n❌ Failed:', error.message);
}
