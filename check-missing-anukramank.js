const fs = require('fs');

const voters = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf-8'));

// Check each booth separately
const booths = [
  { ward: "7", booth: "1", name: "Ward 7 Booth 1" },
  { ward: "7", booth: "2", name: "Ward 7 Booth 2" },
  { ward: "7", booth: "3", name: "Ward 7 Booth 3" }
];

console.log('=== MISSING ANUKRAMANK ANALYSIS ===\n');

booths.forEach(boothInfo => {
  const boothVoters = voters.filter(v => 
    v.ward === boothInfo.ward && v.booth === boothInfo.booth
  );
  
  if (boothVoters.length === 0) {
    console.log(`${boothInfo.name}: No voters found\n`);
    return;
  }
  
  // Sort by anukramank
  boothVoters.sort((a, b) => (a.anukramank || 0) - (b.anukramank || 0));
  
  // Filter out records without anukramank
  const validVoters = boothVoters.filter(v => v.anukramank);
  
  if (validVoters.length === 0) {
    console.log(`  ⚠ No anukramank values found!\n`);
    return;
  }
  
  const minAnk = validVoters[0].anukramank;
  const maxAnk = validVoters[validVoters.length - 1].anukramank;
  const totalVoters = validVoters.length;
  const expectedCount = maxAnk - minAnk + 1;
  const missingCount = expectedCount - totalVoters;
  
  console.log(`${boothInfo.name}:`);
  console.log(`  Range: ${minAnk} - ${maxAnk}`);
  console.log(`  Expected: ${expectedCount} voters`);
  console.log(`  Actual: ${totalVoters} voters`);
  console.log(`  Missing: ${missingCount} voters`);
  
  if (missingCount > 0) {
    console.log(`\n  Missing Anukramanks:`);
    
    const existingAnks = new Set(validVoters.map(v => v.anukramank));
    const missing = [];
    
    for (let i = minAnk; i <= maxAnk; i++) {
      if (!existingAnks.has(i)) {
        missing.push(i);
      }
    }
    
    // Show missing anukramanks
    if (missing.length <= 50) {
      console.log(`  ${missing.join(', ')}`);
    } else {
      console.log(`  First 50: ${missing.slice(0, 50).join(', ')}`);
      console.log(`  ... and ${missing.length - 50} more`);
    }
    
    // Check for duplicates
    const ankCounts = {};
    validVoters.forEach(v => {
      ankCounts[v.anukramank] = (ankCounts[v.anukramank] || 0) + 1;
    });
    
    const duplicates = Object.entries(ankCounts)
      .filter(([ank, count]) => count > 1)
      .map(([ank, count]) => ({ ank: parseInt(ank), count }));
    
    if (duplicates.length > 0) {
      console.log(`\n  ⚠ DUPLICATE Anukramanks Found:`);
      duplicates.forEach(({ ank, count }) => {
        console.log(`    Anukramank ${ank}: ${count} records`);
        const dupRecords = validVoters.filter(v => v.anukramank === ank);
        dupRecords.forEach(v => {
          console.log(`      - Serial ${v.serial}: ${v.name} (${v.voterId})`);
        });
      });
    }
  } else {
    console.log(`  ✓ No missing anukramanks - sequence is complete!`);
  }
  
  console.log();
});

// Overall summary
console.log('=== OVERALL SUMMARY ===');
const w7Total = voters.filter(v => v.ward === "7");
console.log(`Total Ward 7 voters: ${w7Total.length}`);

booths.forEach(boothInfo => {
  const count = voters.filter(v => 
    v.ward === boothInfo.ward && v.booth === boothInfo.booth
  ).length;
  console.log(`  ${boothInfo.name}: ${count} voters`);
});
