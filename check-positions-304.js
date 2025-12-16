const fs = require('fs');

const data = JSON.parse(fs.readFileSync('public/data/voters.json', 'utf8'));
const w7f1 = data.filter(v => v.ward === '7' && v.booth === '1');

console.log(`Total W7F1 voters: ${w7f1.length}`);
console.log('\nChecking positions 302-308:');

for (let i = 301; i < 308 && i < w7f1.length; i++) {
  const v = w7f1[i];
  console.log(`Pos ${i+1}: Serial ${v.serial || v.serialNumber}, Name: ${v.name}, ID: ${v.voterId}`);
}
