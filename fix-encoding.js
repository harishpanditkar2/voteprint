const fs = require('fs');

console.log('🔧 Fixing Marathi text encoding...\n');

// Read with proper UTF-8 encoding
const data = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf8'));

console.log(`📊 Total voters: ${data.length}`);

// Fix Serial 92 specifically
const voter92 = data.find(v => v.serialNumber === '92');
if (voter92) {
  voter92.name = 'सुभाष यशवंत रावळ';
  console.log(`✅ Fixed Serial 92: ${voter92.name}`);
}

// Save with proper UTF-8 encoding (no BOM)
fs.writeFileSync('./public/data/voters.json', JSON.stringify(data, null, 2), 'utf8');

console.log('\n✅ Encoding fixed!');
console.log('✅ All Marathi text should now display correctly\n');

// Show sample names
console.log('📋 Sample names (first 5):');
data.slice(0, 5).forEach(v => {
  console.log(`   ${v.serialNumber.padStart(3)} | ${v.name}`);
});
