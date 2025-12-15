const fs = require('fs');

const extracted = JSON.parse(fs.readFileSync('./ward7-reextraction-output/extracted_voters.json', 'utf8'));
const voters = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf8'));

console.log('=== EXTRACTED DATA (from fresh OCR) ===\n');
console.log('Sample 10 extracted voters:');
extracted.slice(0, 10).forEach((v, i) => {
  console.log(`${i+1}. ${v.voterId} - ${v.name.substring(0, 30)} - Age:${v.age} - ${v.gender} - Page:${v.pageNum}`);
});

console.log('\n=== BLANK VOTERS IN DATABASE ===\n');
const blank = voters.filter(x => 
  x.uniqueSerial && 
  x.uniqueSerial.startsWith('W7F1') && 
  (!x.name || x.name.trim() === '')
);

console.log(`Total blank: ${blank.length}`);
console.log('\nSample 10 blank voters:');
blank.slice(0, 10).forEach((b, i) => {
  console.log(`${i+1}. Serial:${b.uniqueSerial} ID:${b.voterId || 'NONE'} Booth:${b.booth || b.actualBooth}`);
});

console.log('\n=== ANALYSIS ===');
console.log(`Extracted voters: ${extracted.length}`);
console.log(`Blank voters: ${blank.length}`);
console.log(`Blank with voter IDs: ${blank.filter(b => b.voterId).length}`);
console.log(`Blank without voter IDs: ${blank.filter(b => !b.voterId).length}`);
