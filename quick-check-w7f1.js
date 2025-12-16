const fs = require('fs');
const voters = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf-8'));
const w7f1 = voters.filter(v => v.ward === '7' && v.booth === '1');
const serials = w7f1.map(v => v.serial).sort((a, b) => a - b);
console.log('W7F1 serials:', serials[0], 'to', serials[serials.length - 1]);
console.log('Total:', w7f1.length);
console.log('\nFirst 10:');
w7f1.slice(0, 10).forEach(v => console.log(`S${v.serial}: ${v.name} (${v.voterId})`));
