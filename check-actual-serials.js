const fs = require('fs');

console.log('=== Examining Actual Voter Card Serial Numbers ===\n');

// Read voters
const voters = JSON.parse(fs.readFileSync('public/data/voters.json', 'utf8'));
const ward7 = voters.filter(v => v.actualWard === '7' || v.expectedWard === '7');

// Sample page 3 voters to check their card images
console.log('=== Page 3 Voters (Sample) ===\n');
const page3 = ward7.filter(v => v.pageNumber === 3 && v.name && v.name.trim());

console.log(`Total voters on page 3: ${page3.length}`);
console.log('');

// Show voters with their card paths
console.log('Card image paths for first 15 voters:');
page3.slice(0, 15).forEach((v, i) => {
  console.log(`\n${i+1}. Serial ${v.serialNumber} (${v.fileReference}):`);
  console.log(`   Name: ${v.name}`);
  console.log(`   Voter ID: ${v.voterId}`);
  console.log(`   Card: ${v.cardImage || 'NO CARD IMAGE'}`);
});

// The key insight: Card filename contains "sn<serial>" which is the ACTUAL serial
console.log('\n\n=== CRITICAL INSIGHT ===\n');
console.log('The card image filename contains the ACTUAL serial number!');
console.log('Format: voter_<ID>_sn<SERIAL>_page<PAGE>.jpg');
console.log('');
console.log('Example: voter_XUA7224868_sn1_page3.jpg');
console.log('         → This voter\'s ACTUAL serial is 1 (from filename)');
console.log('');
console.log('We need to extract serial from the card filename, not from OCR!');

// Extract actual serials from card URLs
console.log('\n=== Extracting Actual Serials from Card Filenames ===\n');

const serialMapping = [];
page3.forEach(v => {
  // Extract serial from card URL: /voter-cards/voter_XUA7224868_sn1_page3.jpg
  if (!v.cardImage) return;
  const match = v.cardImage.match(/_sn(\d+)_/);
  if (match) {
    const actualSerial = match[1];
    if (actualSerial !== v.serialNumber && actualSerial !== String(v.serialNumber)) {
      serialMapping.push({
        name: v.name,
        voterId: v.voterId,
        currentSerial: v.serialNumber,
        actualSerial: actualSerial,
        fileRef: v.fileReference,
        page: v.pageNumber,
        cardUrl: v.cardImage
      });
    }
  }
});

console.log(`Found ${serialMapping.length} voters with incorrect serial numbers on page 3:`);
console.log('');

serialMapping.slice(0, 10).forEach(m => {
  console.log(`${m.name}`);
  console.log(`  Current DB serial: ${m.currentSerial}`);
  console.log(`  Actual card serial: ${m.actualSerial}`);
  console.log(`  File: ${m.fileRef}`);
  console.log('');
});

// Check all ward 7
console.log('=== Checking All Ward 7 Voters ===\n');
let totalMismatches = 0;
const allMismatches = [];

ward7.forEach(v => {
  if (v.cardImage) {
    const match = v.cardImage.match(/_sn(\d+)_/);
    if (match) {
      const actualSerial = match[1];
      if (actualSerial !== v.serialNumber && actualSerial !== String(v.serialNumber)) {
        totalMismatches++;
        allMismatches.push({
          voterId: v.voterId,
          name: v.name || '(blank)',
          currentSerial: v.serialNumber,
          actualSerial: actualSerial,
          fileRef: v.fileReference,
          page: v.pageNumber
        });
      }
    }
  }
});

console.log(`Total voters with serial mismatches: ${totalMismatches} out of ${ward7.length}`);
console.log('');

// Save full mismatch report
fs.writeFileSync('ward7-serial-mismatches.json', JSON.stringify({
  totalVoters: ward7.length,
  totalMismatches: totalMismatches,
  mismatches: allMismatches
}, null, 2));

console.log('✓ Mismatch report saved to: ward7-serial-mismatches.json');
console.log('');
console.log('=== SOLUTION ===');
console.log('Extract serial numbers from card image filenames and update database');
