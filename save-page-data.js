const fs = require('fs');

console.log('\n💾 Saving to database...\n');

// Read temp data
const newVoters = JSON.parse(fs.readFileSync('./temp-page-data.json', 'utf8'));

// Read current database
let currentVoters = [];
try {
  const dbContent = fs.readFileSync('./public/data/voters.json', 'utf8');
  if (dbContent.trim()) {
    currentVoters = JSON.parse(dbContent);
  }
} catch (e) {
  currentVoters = [];
}

console.log(`📊 Current database: ${currentVoters.length} voters`);
console.log(`📥 Adding: ${newVoters.length} new voters`);

// Add anukramank field (sequential counter)
const startAnukramank = currentVoters.length + 1;
newVoters.forEach((voter, idx) => {
  voter.anukramank = startAnukramank + idx;
  voter.serialNumber = voter.serial; // Copy serial to serialNumber for website compatibility
  voter.uniqueSerial = `W${voter.ward}B${voter.booth}S${voter.serialNumber}`;
});

// Append new voters
const allVoters = [...currentVoters, ...newVoters];

// Save
fs.writeFileSync('./public/data/voters.json', JSON.stringify(allVoters, null, 2));

console.log(`\n✅ SAVED TO DATABASE!`);
console.log(`   Total voters now: ${allVoters.length}`);
console.log(`   Anukramank range: ${startAnukramank} to ${startAnukramank + newVoters.length - 1}`);

// Show summary by booth
const w7b1 = allVoters.filter(v => v.ward === '7' && v.booth === '1').length;
const w7b2 = allVoters.filter(v => v.ward === '7' && v.booth === '2').length;
const w7b3 = allVoters.filter(v => v.ward === '7' && v.booth === '3').length;

console.log(`\n📊 DATABASE BREAKDOWN:`);
console.log(`   Ward 7, Booth 1: ${w7b1} voters`);
console.log(`   Ward 7, Booth 2: ${w7b2} voters`);
console.log(`   Ward 7, Booth 3: ${w7b3} voters`);
console.log(`\n✅ Ready for next page!\n`);

// Clean up temp file
fs.unlinkSync('./temp-page-data.json');
