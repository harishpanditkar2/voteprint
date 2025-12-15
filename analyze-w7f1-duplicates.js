const fs = require('fs');

// Read voters
const voters = JSON.parse(fs.readFileSync('public/data/voters.json', 'utf8'));

// Get Ward 7 Booth 1 voters (File 1)
const w7f1 = voters.filter(v => 
  (v.actualWard === '7' || v.expectedWard === '7') && 
  (v.actualBooth === '1' || v.booth === '1')
);

console.log('=== Ward 7 File 1 (Booth 1) Analysis ===');
console.log(`Total entries: ${w7f1.length}`);
console.log(`Expected: 991 voters\n`);

// Group by page
const byPage = {};
w7f1.forEach(v => {
  const page = v.pageNumber;
  if (!byPage[page]) byPage[page] = [];
  byPage[page].push(v);
});

console.log('Voters by page:');
Object.keys(byPage).sort((a, b) => parseInt(a) - parseInt(b)).forEach(page => {
  const pageVoters = byPage[page];
  const serials = pageVoters.map(v => parseInt(v.serialNumber)).sort((a, b) => a - b);
  console.log(`  Page ${page}: ${pageVoters.length} voters, Serials ${Math.min(...serials)}-${Math.max(...serials)}`);
});

// Identify pages that might be from wrong file
console.log('\n=== Suspicious pages (high serial numbers suggest different file) ===');
Object.keys(byPage).sort((a, b) => parseInt(a) - parseInt(b)).forEach(page => {
  const pageVoters = byPage[page];
  const serials = pageVoters.map(v => parseInt(v.serialNumber));
  const maxSerial = Math.max(...serials);
  
  // If page has serials > 991, it's likely from a different file or merged incorrectly
  if (maxSerial > 991) {
    console.log(`  Page ${page}: Max serial ${maxSerial} (exceeds 991) - SUSPICIOUS`);
    console.log(`    Serials: ${serials.sort((a,b) => a-b).join(', ')}`);
  }
});

// Check for duplicate serial numbers
console.log('\n=== Duplicate Serials in Booth 1 ===');
const serialCounts = {};
w7f1.forEach(v => {
  const serial = v.serialNumber;
  if (!serialCounts[serial]) serialCounts[serial] = [];
  serialCounts[serial].push(v);
});

const duplicates = Object.entries(serialCounts).filter(([s, voters]) => voters.length > 1);
console.log(`Total duplicate serial numbers: ${duplicates.length}\n`);

console.log('Examples of duplicates (first 20):');
duplicates.slice(0, 20).forEach(([serial, voters]) => {
  console.log(`\nSerial ${serial} (${voters.length} copies):`);
  voters.forEach((v, idx) => {
    console.log(`  ${idx + 1}. ${v.name || '[blank]'} - ${v.voterId} - Page ${v.pageNumber}`);
  });
});

// Identify the likely correct range
console.log('\n\n=== Recommendation ===');
console.log('Based on analysis:');
console.log('- File should have 991 voters (Serial 1-991)');
console.log('- Pages 3-30 appear to be the main file');
console.log('- Pages 71-73 have duplicate serials and may be from re-scanning or different source');
console.log('\nAction needed: Remove duplicates, keeping voters from pages 3-30 as primary');
