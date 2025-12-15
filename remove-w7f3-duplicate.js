const fs = require('fs');

// Backup first
fs.copyFileSync('public/data/voters.json', 'public/data/voters.json.backup-remove-01');
console.log('✓ Backup created: voters.json.backup-remove-01');

// Read voters
const voters = JSON.parse(fs.readFileSync('public/data/voters.json', 'utf8'));
console.log('Current total voters:', voters.length);

// Find W7F3 voters with serial "01"
const w7f3Serial01Index = voters.findIndex(v => 
  (v.actualWard === '7' || v.expectedWard === '7') && 
  (v.actualBooth || v.booth) === '3' &&
  v.serialNumber === '01'
);

if (w7f3Serial01Index === -1) {
  console.log('\n❌ Serial "01" not found in W7F3!');
  process.exit(1);
}

const removed = voters[w7f3Serial01Index];
console.log('\n=== Found Serial "01" ===');
console.log('Index:', w7f3Serial01Index);
console.log('Name:', removed.name || '[blank]');
console.log('Voter ID:', removed.voterId || '[none]');
console.log('Page:', removed.pageNumber);
console.log('Unique Serial:', removed.uniqueSerial);

// Also check serial "1"
const w7f3Serial1 = voters.find(v => 
  (v.actualWard === '7' || v.expectedWard === '7') && 
  (v.actualBooth || v.booth) === '3' &&
  v.serialNumber === '1'
);

console.log('\n=== Serial "1" (keeping this) ===');
console.log('Name:', w7f3Serial1.name || '[blank]');
console.log('Voter ID:', w7f3Serial1.voterId || '[none]');
console.log('Page:', w7f3Serial1.pageNumber);
console.log('Unique Serial:', w7f3Serial1.uniqueSerial);

// Remove the "01" entry
voters.splice(w7f3Serial01Index, 1);

// Save
fs.writeFileSync('public/data/voters.json', JSON.stringify(voters, null, 2));
console.log('\n✓ Removed serial "01" from W7F3');
console.log('New total voters:', voters.length);

// Verify
const w7f3After = voters.filter(v => 
  (v.actualWard === '7' || v.expectedWard === '7') && 
  (v.actualBooth || v.booth) === '3'
);
console.log('\nW7F3 count after removal:', w7f3After.length, '(Expected: 863)');
console.log(w7f3After.length === 863 ? '✓ Perfect!' : '⚠️ Still wrong!');
