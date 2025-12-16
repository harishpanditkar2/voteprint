const fs = require('fs');

const data = JSON.parse(fs.readFileSync('public/data/voters.json', 'utf8'));

// Get W7F1 voters and check around 286
const w7f1 = data.filter(v => v.ward === '7' && v.booth === '1');

console.log(`Total W7F1 voters: ${w7f1.length}`);
console.log('\nVoters around position 286:');

for (let i = 283; i < 289 && i < w7f1.length; i++) {
  const v = w7f1[i];
  console.log(`Position ${i+1}: Serial ${v.serial || v.serialNumber}, Name: ${v.name}, ID: ${v.voterId}`);
}

// Also search by voter ID
console.log('\nSearching for voter ID CRM2062271:');
const byId = data.find(v => v.voterId === 'CRM2062271');
if (byId) {
  console.log(`Found: Serial ${byId.serial || byId.serialNumber}, Name: ${byId.name}, Ward: ${byId.ward}, Booth: ${byId.booth}`);
} else {
  console.log('Not found');
}
