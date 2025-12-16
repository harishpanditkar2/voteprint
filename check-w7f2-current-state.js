const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf8'));

const w7f2 = data.filter(v => v.booth === '2').sort((a, b) => a.serial - b.serial);

console.log('W7F2 voters:', w7f2.length);
console.log('Serial range:', w7f2[0].serial, '-', w7f2[w7f2.length - 1].serial);

// Find all serials
const serials = w7f2.map(v => v.serial).sort((a, b) => a - b);
const missing = [];

for (let i = 1; i <= 861; i++) {
  if (!serials.includes(i)) {
    missing.push(i);
  }
}

console.log('\nMissing serials:', missing.length);
if (missing.length > 0) {
  console.log('First 20 missing:', missing.slice(0, 20));
  if (missing.length > 20) {
    console.log('...');
    console.log('Last 10 missing:', missing.slice(-10));
  }
}

// Check for duplicates
const dupes = {};
w7f2.forEach(v => {
  if (!dupes[v.voterId]) dupes[v.voterId] = [];
  dupes[v.voterId].push({serial: v.serial, name: v.name});
});

const dupIds = Object.keys(dupes).filter(id => dupes[id].length > 1);
console.log('\n✅ Duplicate voter IDs:', dupIds.length);

if (dupIds.length > 0) {
  console.log('\nAll duplicates:');
  dupIds.forEach(id => {
    const voters = dupes[id];
    console.log(`\n  ${id}:`);
    voters.forEach(v => console.log(`    Serial ${v.serial}: ${v.name}`));
  });
}
