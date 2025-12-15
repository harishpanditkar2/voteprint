const fs = require('fs');

// Read voters
const voters = JSON.parse(fs.readFileSync('public/data/voters.json', 'utf8'));

// Get W7F3 voters
const w7f3 = voters.filter(v => 
  (v.actualWard === '7' || v.expectedWard === '7') && 
  (v.actualBooth || v.booth) === '3'
);

console.log('=== W7F3 Duplicate Detection ===');
console.log('Total W7F3 voters:', w7f3.length);
console.log('');

// Group by serial number (as string)
const bySerial = {};
w7f3.forEach((v, idx) => {
  const serial = v.serialNumber;
  if (!bySerial[serial]) {
    bySerial[serial] = [];
  }
  bySerial[serial].push({
    index: idx,
    globalIndex: voters.indexOf(v),
    name: v.name,
    voterId: v.voterId,
    pageNumber: v.pageNumber,
    uniqueSerial: v.uniqueSerial
  });
});

// Find duplicates
const duplicates = Object.entries(bySerial).filter(([serial, entries]) => entries.length > 1);

if (duplicates.length > 0) {
  console.log('Found', duplicates.length, 'duplicate serial(s):');
  duplicates.forEach(([serial, entries]) => {
    console.log('\nSerial', serial + ':', entries.length, 'entries');
    entries.forEach((entry, i) => {
      console.log('  Entry', i + 1 + ':');
      console.log('    Global Index:', entry.globalIndex);
      console.log('    Name:', entry.name || '[blank]');
      console.log('    Voter ID:', entry.voterId || '[none]');
      console.log('    Page:', entry.pageNumber);
      console.log('    Unique Serial:', entry.uniqueSerial);
    });
  });
  
  // Prepare to remove the duplicate
  console.log('\n=== Removal Plan ===');
  const toRemove = [];
  duplicates.forEach(([serial, entries]) => {
    // Keep first entry (earlier page), remove others
    const sorted = entries.sort((a, b) => parseInt(a.pageNumber) - parseInt(b.pageNumber));
    toRemove.push(...sorted.slice(1));
  });
  
  console.log('Will remove', toRemove.length, 'duplicate(s)');
  console.log('Keeping entries from earlier pages');
} else {
  console.log('No duplicates found!');
  console.log('');
  console.log('Serial count distribution:');
  const serialCounts = Object.entries(bySerial)
    .map(([serial, entries]) => ({serial: parseInt(serial), count: entries.length}))
    .sort((a, b) => a.serial - b.serial);
  
  console.log('Total unique serials:', serialCounts.length);
  console.log('Min serial:', Math.min(...serialCounts.map(s => s.serial)));
  console.log('Max serial:', Math.max(...serialCounts.map(s => s.serial)));
  
  // Check for gaps
  const gaps = [];
  for (let i = 1; i <= 863; i++) {
    if (!bySerial[i.toString()]) {
      gaps.push(i);
    }
  }
  
  if (gaps.length > 0) {
    console.log('\nGaps in sequence:');
    console.log(gaps.slice(0, 20).join(', '), gaps.length > 20 ? '...' : '');
  } else {
    console.log('\nNo gaps in sequence 1-863');
  }
}
