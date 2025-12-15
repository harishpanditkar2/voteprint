const fs = require('fs');

// Load voters data
const voters = JSON.parse(fs.readFileSync('public/data/voters.json', 'utf-8'));

// Check for voter with serial W7F1-S2
const s2Voters = voters.filter(v => v.uniqueSerial === 'W7F1-S2' || v.serialNumber === 'W7F1-S2');

console.log('\n=== Voters with Serial W7F1-S2 ===');
console.log(`Found ${s2Voters.length} voter(s):\n`);

s2Voters.forEach((voter, idx) => {
  console.log(`Voter ${idx + 1}:`);
  console.log(`  Voter ID: ${voter.voterId}`);
  console.log(`  Name: ${voter.name}`);
  console.log(`  Unique Serial: ${voter.uniqueSerial}`);
  console.log(`  Serial Number: ${voter.serialNumber || 'N/A'}`);
  console.log(`  Ward: ${voter.actualWard || voter.ward}`);
  console.log(`  Booth: ${voter.actualBooth || voter.booth}`);
  console.log('');
});

// Also check for duplicate voter IDs
const voterIdMap = {};
s2Voters.forEach(v => {
  if (voterIdMap[v.voterId]) {
    console.log(`⚠️ DUPLICATE VOTER ID: ${v.voterId}`);
  }
  voterIdMap[v.voterId] = true;
});

console.log('\n=== Analysis Complete ===');
