const fs = require('fs');

// Read voters
const votersData = fs.readFileSync('public/data/voters.json', 'utf8');
const voters = JSON.parse(votersData);

console.log(`Total voters before cleanup: ${voters.length}`);

// Backup
fs.writeFileSync('public/data/voters.json.backup-before-dedup', votersData);
console.log('Backup created: voters.json.backup-before-dedup\n');

// Get Ward 7 voters grouped by file (booth)
const ward7Voters = voters.filter(v => 
  v.actualWard === '7' || v.expectedWard === '7'
);

console.log(`Ward 7 voters before dedup: ${ward7Voters.length}\n`);

// Process each file (booth) separately
const keptVoters = [];
const removedVoters = [];

['1', '2', '3'].forEach(booth => {
  const fileNum = booth;
  const boothVoters = ward7Voters.filter(v => (v.actualBooth || v.booth) === booth);
  
  console.log(`=== Processing W7F${fileNum} (Booth ${booth}) ===`);
  console.log(`Total entries: ${boothVoters.length}`);
  
  // Sort by page number (earlier pages are primary)
  boothVoters.sort((a, b) => a.pageNumber - b.pageNumber);
  
  // Track which serials we've seen
  const seenSerials = new Set();
  const kept = [];
  const removed = [];
  
  boothVoters.forEach(voter => {
    const serial = voter.serialNumber;
    
    if (!seenSerials.has(serial)) {
      // First occurrence - keep it
      seenSerials.add(serial);
      kept.push(voter);
    } else {
      // Duplicate - mark for removal
      removed.push(voter);
    }
  });
  
  console.log(`Kept: ${kept.length} unique voters`);
  console.log(`Removed: ${removed.length} duplicates`);
  
  // Add kept voters to final list
  keptVoters.push(...kept);
  removedVoters.push(...removed);
  
  // Show gaps
  const keptSerials = kept.map(v => parseInt(v.serialNumber)).sort((a, b) => a - b);
  const maxSerial = Math.max(...keptSerials);
  const gaps = [];
  for (let i = 1; i <= maxSerial; i++) {
    if (!keptSerials.includes(i)) {
      gaps.push(i);
    }
  }
  
  console.log(`Serial range: 1-${maxSerial}`);
  console.log(`Missing serials: ${gaps.length}`);
  if (gaps.length > 0 && gaps.length <= 50) {
    console.log(`Gaps: ${gaps.join(', ')}`);
  }
  console.log('');
});

// Replace Ward 7 voters in main array
const nonWard7Voters = voters.filter(v => 
  v.actualWard !== '7' && v.expectedWard !== '7'
);

const finalVoters = [...nonWard7Voters, ...keptVoters];

console.log(`\n=== Summary ===`);
console.log(`Total voters after cleanup: ${finalVoters.length}`);
console.log(`Ward 7 voters after dedup: ${keptVoters.length}`);
console.log(`Duplicates removed: ${removedVoters.length}`);

// Save cleaned data
fs.writeFileSync('public/data/voters.json', JSON.stringify(finalVoters, null, 2));
console.log('\n✓ Saved cleaned voters.json');

// Save removed duplicates for reference
fs.writeFileSync('removed-duplicates-ward7.json', JSON.stringify(removedVoters, null, 2));
console.log('✓ Saved removed duplicates to: removed-duplicates-ward7.json');

// Final report by file
console.log('\n=== Final Ward 7 Status ===');
['1', '2', '3'].forEach(booth => {
  const fileNum = booth;
  const boothVoters = keptVoters.filter(v => (v.actualBooth || v.booth) === booth);
  const serials = boothVoters.map(v => parseInt(v.serialNumber)).sort((a, b) => a - b);
  const maxSerial = Math.max(...serials);
  
  console.log(`\nW7F${fileNum} (Booth ${booth}):`);
  console.log(`  Unique voters: ${boothVoters.length}`);
  console.log(`  Serial range: 1-${maxSerial}`);
  console.log(`  Missing: ${maxSerial - boothVoters.length} serials`);
  
  if (fileNum === '1') {
    console.log(`  Expected: 991 voters`);
    console.log(`  Status: ${boothVoters.length >= 991 ? '✓' : '⚠️'} ${boothVoters.length < 991 ? `Missing ${991 - boothVoters.length}` : 'Complete'}`);
  }
});
