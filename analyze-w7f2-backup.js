const fs = require('fs');
const data = require('./public/data/voters.json.backup-before-w7f2-fix-1765868047871');

const w7f2 = data.filter(v => v.booth === '2').sort((a, b) => a.serial - b.serial);

console.log('W7F2 serial range:', w7f2[0].serial, '-', w7f2[w7f2.length - 1].serial);
console.log('Total W7F2:', w7f2.length);

// Find gaps in serial numbers
const gaps = [];
for (let i = 1; i < w7f2.length; i++) {
  if (w7f2[i].serial - w7f2[i - 1].serial > 1) {
    gaps.push({from: w7f2[i - 1].serial, to: w7f2[i].serial, missing: w7f2[i].serial - w7f2[i - 1].serial - 1});
  }
}

console.log('\nGaps in serials:');
gaps.forEach(g => console.log(`  ${g.from} -> ${g.to} (missing ${g.missing} serials)`));

// Check for duplicate voter IDs
const dupes = {};
w7f2.forEach(v => {
  dupes[v.voterId] = (dupes[v.voterId] || 0) + 1;
});

const dupIds = Object.keys(dupes).filter(id => dupes[id] > 1);
console.log('\nDuplicate voter IDs:', dupIds.length);

if (dupIds.length > 0) {
  console.log('\nFirst 10 duplicates:');
  dupIds.slice(0, 10).forEach(id => {
    const voters = w7f2.filter(v => v.voterId === id);
    console.log(`  ${id}: serials ${voters.map(v => v.serial).join(', ')}`);
  });
}

// Check serial 615 and 705 specifically
const v615 = w7f2.find(v => v.serial === 615);
const v705 = w7f2.find(v => v.serial === 705);

if (v615 && v705) {
  console.log(`\nSerial 615: ${v615.voterId} - ${v615.name}`);
  console.log(`Serial 705: ${v705.voterId} - ${v705.name}`);
  console.log(`Same ID? ${v615.voterId === v705.voterId ? 'YES - THIS IS THE BUG!' : 'NO'}`);
}
