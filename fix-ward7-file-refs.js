const fs = require('fs');

// Read the voters database
const votersData = fs.readFileSync('public/data/voters.json', 'utf8');
const voters = JSON.parse(votersData);

console.log(`Total voters before: ${voters.length}`);

// Backup
fs.writeFileSync('public/data/voters.json.backup-before-ward7-fix', votersData);
console.log('Backup created: voters.json.backup-before-ward7-fix');

// Get Ward 7 voters
const ward7Voters = voters.filter(v => 
  v.actualWard === '7' || v.expectedWard === '7'
);

console.log(`\nWard 7 voters: ${ward7Voters.length}`);

// Identify file numbers based on booth (since each booth has its own file)
// File mapping:
// - Booth 1 = File 1 (W7F1)
// - Booth 2 = File 2 (W7F2)  
// - Booth 3 = File 3 (W7F3)

const boothToFileMap = {
  '1': 1,
  '2': 2,
  '3': 3
};

// Update Ward 7 voters with file reference
let updatedCount = 0;
ward7Voters.forEach(voter => {
  const booth = voter.actualBooth || voter.booth;
  const fileNumber = boothToFileMap[booth];
  
  if (fileNumber) {
    voter.fileNumber = fileNumber;
    voter.fileReference = `W7F${fileNumber}`;
    voter.uniqueSerial = `W7F${fileNumber}-S${voter.serialNumber}`;
    updatedCount++;
  }
});

console.log(`Updated ${updatedCount} Ward 7 voters with file references`);

// Now check for duplicates with the new system
console.log('\n=== Checking duplicates after adding file references ===');

const byBoothAndSerial = {};
ward7Voters.forEach(v => {
  const booth = v.actualBooth || v.booth;
  const serial = v.serialNumber;
  const key = `${booth}-${serial}`;
  
  if (!byBoothAndSerial[key]) {
    byBoothAndSerial[key] = [];
  }
  byBoothAndSerial[key].push(v);
});

// Find actual duplicates (same booth + serial = same file)
const actualDuplicates = Object.entries(byBoothAndSerial)
  .filter(([key, voters]) => voters.length > 1);

console.log(`\nFound ${actualDuplicates.length} sets of duplicate entries (same file + serial)`);

if (actualDuplicates.length > 0) {
  console.log('\nDuplicate examples (first 10):');
  actualDuplicates.slice(0, 10).forEach(([key, dups]) => {
    const [booth, serial] = key.split('-');
    console.log(`  W7F${boothToFileMap[booth]}-S${serial} (Booth ${booth}, Serial ${serial}): ${dups.length} entries`);
    dups.forEach((dup, idx) => {
      console.log(`    ${idx + 1}. ${dup.name || '[blank]'} - ${dup.voterId} - Page ${dup.pageNumber}`);
    });
  });
}

// Save the updated data
fs.writeFileSync('public/data/voters.json', JSON.stringify(voters, null, 2));
console.log('\n✓ Updated voters.json with file references');

// Generate summary report
console.log('\n=== Ward 7 Summary ===');
['1', '2', '3'].forEach(booth => {
  const boothVoters = ward7Voters.filter(v => (v.actualBooth || v.booth) === booth);
  const fileNum = boothToFileMap[booth];
  const serials = boothVoters.map(v => parseInt(v.serialNumber)).sort((a, b) => a - b);
  const maxSerial = Math.max(...serials);
  
  console.log(`\nFile ${fileNum} (W7F${fileNum}) - Booth ${booth}:`);
  console.log(`  Total voters: ${boothVoters.length}`);
  console.log(`  Serial range: 1 to ${maxSerial}`);
  console.log(`  Expected: ~${maxSerial} voters (if complete)`);
  
  // Count unique serials
  const uniqueSerials = new Set(serials);
  console.log(`  Unique serials: ${uniqueSerials.size}`);
  console.log(`  Missing serials: ${maxSerial - uniqueSerials.size}`);
});

console.log('\n✓ File references added to all Ward 7 voters');
console.log('✓ Each voter now has:');
console.log('  - fileNumber: 1, 2, or 3');
console.log('  - fileReference: W7F1, W7F2, or W7F3');
console.log('  - uniqueSerial: W7F1-S1, W7F2-S1, etc.');
