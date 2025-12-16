const fs = require('fs');

// Read the file
const content = fs.readFileSync('add-w7f2-clean-fresh.js', 'utf-8');

// Extract all serial numbers
const serialPattern = /^(\d+) (XUA\w+|CRM\w+|TML\w+|NBS\w+|DMV\w+|TGY\w+|UZZ\w+|NYM\w+|ZSL\w+|NJV\w+) /gm;
const matches = [...content.matchAll(serialPattern)];

console.log(`Total entries found: ${matches.length}`);

// Extract serial numbers
const serials = matches.map(m => parseInt(m[1]));

// Check for duplicates
const serialCounts = {};
const duplicates = [];
serials.forEach(s => {
  serialCounts[s] = (serialCounts[s] || 0) + 1;
  if (serialCounts[s] > 1 && !duplicates.includes(s)) {
    duplicates.push(s);
  }
});

if (duplicates.length > 0) {
  console.log('\n❌ DUPLICATES FOUND:');
  duplicates.sort((a, b) => a - b).forEach(d => {
    console.log(`  Serial ${d} appears ${serialCounts[d]} times`);
    // Show where duplicates are
    const indices = [];
    serials.forEach((s, idx) => {
      if (s === d) indices.push(idx + 1);
    });
    console.log(`    At positions: ${indices.join(', ')}`);
  });
} else {
  console.log('\n✅ No duplicates found');
}

// Check for missing serials
const missing = [];
for (let i = 1; i <= 861; i++) {
  if (!serials.includes(i)) {
    missing.push(i);
  }
}

if (missing.length > 0) {
  console.log('\n❌ MISSING SERIALS:');
  console.log(`  ${missing.join(', ')}`);
} else {
  console.log('✅ All serials 1-861 present');
}

// Check sequence
let outOfOrder = [];
for (let i = 0; i < serials.length - 1; i++) {
  if (serials[i] >= serials[i + 1]) {
    outOfOrder.push(`Serial ${serials[i]} comes before ${serials[i + 1]}`);
  }
}

if (outOfOrder.length > 0) {
  console.log('\n⚠️  OUT OF ORDER:');
  outOfOrder.forEach(msg => console.log(`  ${msg}`));
} else {
  console.log('✅ All serials in correct order');
}

// Check range
const min = Math.min(...serials);
const max = Math.max(...serials);
console.log(`\n📊 Range: ${min} to ${max}`);
console.log(`📊 Expected: 861 voters`);
console.log(`📊 Found: ${serials.length} entries`);

if (min === 1 && max === 861 && missing.length === 0 && duplicates.length === 0 && serials.length === 861) {
  console.log('\n✅✅✅ VALIDATION PASSED: All 861 serials correct!');
} else {
  console.log('\n❌ VALIDATION FAILED: Issues found above');
}

// Check for serial 805 specifically (since it was mentioned as possibly duplicate)
const serial805Count = serials.filter(s => s === 805).length;
console.log(`\n🔍 Serial 805 appears: ${serial805Count} time(s)`);

// Check for serial 860 specifically
const serial860Count = serials.filter(s => s === 860).length;
console.log(`🔍 Serial 860 appears: ${serial860Count} time(s)`);
