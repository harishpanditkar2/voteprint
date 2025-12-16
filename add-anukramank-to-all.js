const fs = require('fs');

// Read voters.json
const voters = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf-8'));

console.log('=== ADDING ANUKRAMANK TO ALL VOTERS ===\n');

// Backup first
fs.writeFileSync('./public/data/voters-backup-before-anukramank-fix.json', 
  JSON.stringify(voters, null, 2));
console.log('✓ Backup created: voters-backup-before-anukramank-fix.json\n');

let updatesCount = 0;

// Process each booth
const booths = [
  { ward: "7", booth: "1" },
  { ward: "7", booth: "2" },
  { ward: "7", booth: "3" }
];

booths.forEach(boothInfo => {
  const boothVoters = voters.filter(v => 
    v.ward === boothInfo.ward && v.booth === boothInfo.booth
  );
  
  // Sort by serial number (which should be the original order)
  boothVoters.sort((a, b) => {
    const serialA = parseInt(a.serial) || 0;
    const serialB = parseInt(b.serial) || 0;
    return serialA - serialB;
  });
  
  console.log(`Ward ${boothInfo.ward} Booth ${boothInfo.booth}:`);
  console.log(`  Total voters: ${boothVoters.length}`);
  
  let addedCount = 0;
  let updatedCount = 0;
  
  // Assign anukramank sequentially based on sorted order
  boothVoters.forEach((voter, index) => {
    const newAnukramank = index + 1;
    
    if (!voter.anukramank) {
      voter.anukramank = newAnukramank;
      addedCount++;
      updatesCount++;
    } else if (voter.anukramank !== newAnukramank) {
      // Only update if different (for correction purposes)
      const oldAnk = voter.anukramank;
      voter.anukramank = newAnukramank;
      updatedCount++;
      updatesCount++;
      if (updatedCount <= 5) {
        console.log(`    Updated Serial ${voter.serial}: anukramank ${oldAnk} → ${newAnukramank}`);
      }
    }
  });
  
  console.log(`  Added anukramank: ${addedCount}`);
  console.log(`  Updated anukramank: ${updatedCount}`);
  console.log(`  New range: 1 - ${boothVoters.length}`);
  console.log();
});

// Save updated data
fs.writeFileSync('./public/data/voters.json', JSON.stringify(voters, null, 2));

console.log('=== SUMMARY ===');
console.log(`Total updates: ${updatesCount}`);
console.log('\n✓ All voters now have sequential anukramank values!');

// Verification
console.log('\n=== VERIFICATION ===');
booths.forEach(boothInfo => {
  const boothVoters = voters.filter(v => 
    v.ward === boothInfo.ward && v.booth === boothInfo.booth
  );
  
  const withAnk = boothVoters.filter(v => v.anukramank).length;
  const withoutAnk = boothVoters.filter(v => !v.anukramank).length;
  
  console.log(`W${boothInfo.ward}B${boothInfo.booth}: ${withAnk} with anukramank, ${withoutAnk} without`);
});
