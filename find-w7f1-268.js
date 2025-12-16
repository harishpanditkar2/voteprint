const fs = require('fs');

// Read current data
const data = JSON.parse(fs.readFileSync('public/data/voters.json', 'utf8'));

// Find voters around serial 268
const voters = data
  .filter(v => v.ward === '7' && v.booth === '1')
  .filter(v => {
    const s = parseInt(v.serial || v.serialNumber || '0');
    return s >= 265 && s <= 270;
  })
  .sort((a, b) => parseInt(a.serial || a.serialNumber) - parseInt(b.serial || b.serialNumber));

console.log('\nW7F1 Voters around serial 268:');
voters.forEach(v => {
  console.log(`Serial: ${v.serial || v.serialNumber}, Name: ${v.name}, ID: ${v.voterId}`);
});
