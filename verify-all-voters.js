const fs = require('fs');
const path = require('path');

console.log('🔍 Voter Data Verification Report\n');
console.log('═══════════════════════════════════════════════════════════════════\n');

// Read voters.json
const votersPath = path.join(__dirname, 'public', 'data', 'voters.json');
const voters = JSON.parse(fs.readFileSync(votersPath, 'utf-8'));

console.log(`Total Voters: ${voters.length}\n`);
console.log('Please verify each voter against the PDF:\n');
console.log('═══════════════════════════════════════════════════════════════════\n');

voters.forEach((voter, index) => {
  const serialNum = index + 1;
  console.log(`${serialNum}. ${voter.name}`);
  console.log(`   #${voter.serialNumber} • ${voter.voterId}`);
  console.log(`   वय ${voter.age} • ${voter.gender === 'M' ? 'पुरुष' : 'स्त्री'} • प्रभाग ${voter.actualWard} • बूथ ${voter.actualBooth}`);
  console.log('');
});

console.log('═══════════════════════════════════════════════════════════════════');
console.log('\n💡 Instructions:');
console.log('1. Compare each entry above with the PDF');
console.log('2. Note any mismatches in voter ID, age, or gender');
console.log('3. Provide corrections in this format:');
console.log('   Serial X: correct voter ID, correct age, correct gender');
console.log('\nExample: 8: XUA7224942, 54, F\n');
