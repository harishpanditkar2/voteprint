const fs = require('fs');

const voters = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf-8'));

console.log('=== DETAILED ANUKRAMANK ANALYSIS ===\n');

// Ward 7 Booth 1
const w7b1 = voters.filter(v => v.ward === "7" && v.booth === "1");
const w7b1Valid = w7b1.filter(v => v.anukramank).sort((a, b) => a.anukramank - b.anukramank);

console.log('WARD 7 BOOTH 1:');
console.log(`Total voters: ${w7b1.length}`);
console.log(`With anukramank: ${w7b1Valid.length}`);
console.log(`Range: ${w7b1Valid[0]?.anukramank} - ${w7b1Valid[w7b1Valid.length-1]?.anukramank}`);

const w7b1Anks = new Set(w7b1Valid.map(v => v.anukramank));
const w7b1Missing = [];
const maxW7b1 = w7b1Valid[w7b1Valid.length-1]?.anukramank || 0;

for (let i = 1; i <= maxW7b1; i++) {
  if (!w7b1Anks.has(i)) {
    w7b1Missing.push(i);
  }
}

console.log(`\nMissing ${w7b1Missing.length} anukramanks:`);
console.log(w7b1Missing.join(', '));

// Ward 7 Booth 2
console.log('\n\nWARD 7 BOOTH 2:');
const w7b2 = voters.filter(v => v.ward === "7" && v.booth === "2");
const w7b2Valid = w7b2.filter(v => v.anukramank).sort((a, b) => a.anukramank - b.anukramank);

console.log(`Total voters: ${w7b2.length}`);
console.log(`With anukramank: ${w7b2Valid.length}`);
if (w7b2Valid.length > 0) {
  console.log(`Range: ${w7b2Valid[0].anukramank} - ${w7b2Valid[w7b2Valid.length-1].anukramank}`);
  
  const w7b2Anks = new Set(w7b2Valid.map(v => v.anukramank));
  const w7b2Missing = [];
  const maxW7b2 = w7b2Valid[w7b2Valid.length-1].anukramank;
  
  for (let i = 1; i <= maxW7b2; i++) {
    if (!w7b2Anks.has(i)) {
      w7b2Missing.push(i);
    }
  }
  
  if (w7b2Missing.length > 0) {
    console.log(`\nMissing ${w7b2Missing.length} anukramanks:`);
    console.log(w7b2Missing.join(', '));
  } else {
    console.log('✓ Complete sequence!');
  }
}

// Ward 7 Booth 3
console.log('\n\nWARD 7 BOOTH 3:');
const w7b3 = voters.filter(v => v.ward === "7" && v.booth === "3");
const w7b3Valid = w7b3.filter(v => v.anukramank).sort((a, b) => a.anukramank - b.anukramank);

console.log(`Total voters: ${w7b3.length}`);
console.log(`With anukramank: ${w7b3Valid.length}`);
console.log(`Without anukramank: ${w7b3.length - w7b3Valid.length}`);

if (w7b3Valid.length > 0) {
  console.log(`Range: ${w7b3Valid[0].anukramank} - ${w7b3Valid[w7b3Valid.length-1].anukramank}`);
  
  const w7b3Anks = new Set(w7b3Valid.map(v => v.anukramank));
  const w7b3Missing = [];
  const maxW7b3 = w7b3Valid[w7b3Valid.length-1].anukramank;
  
  for (let i = 1; i <= maxW7b3; i++) {
    if (!w7b3Anks.has(i)) {
      w7b3Missing.push(i);
    }
  }
  
  if (w7b3Missing.length > 0) {
    console.log(`\nMissing ${w7b3Missing.length} anukramanks:`);
    if (w7b3Missing.length <= 100) {
      console.log(w7b3Missing.join(', '));
    } else {
      console.log(`First 100: ${w7b3Missing.slice(0, 100).join(', ')}`);
      console.log(`... and ${w7b3Missing.length - 100} more`);
    }
  } else {
    console.log('✓ Complete sequence!');
  }
}

// Check voters without anukramank in W7B3
if (w7b3.length > w7b3Valid.length) {
  console.log('\nVoters WITHOUT anukramank in W7B3:');
  const noAnk = w7b3.filter(v => !v.anukramank);
  noAnk.slice(0, 10).forEach(v => {
    console.log(`  Serial ${v.serial}: ${v.name} (${v.voterId})`);
  });
  if (noAnk.length > 10) {
    console.log(`  ... and ${noAnk.length - 10} more`);
  }
}

console.log('\n=== SUMMARY ===');
console.log(`W7B1: ${w7b1Missing.length} missing anukramanks`);
console.log(`W7B2: Complete sequence`);
console.log(`W7B3: ${w7b3.length - w7b3Valid.length} voters without anukramank`);
