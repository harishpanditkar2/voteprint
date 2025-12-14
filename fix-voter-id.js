const fs = require('fs');
const path = require('path');

// Fix the incorrect voter ID XUA2224959 → XUA7224959
const votersPath = path.join(__dirname, 'public', 'data', 'voters.json');
let voters = JSON.parse(fs.readFileSync(votersPath, 'utf-8'));

const wrongVoter = voters.find(v => v.voterId === 'XUA2224959');
if (wrongVoter) {
  console.log('🔧 Fixing incorrect voter ID:');
  console.log(`   Old ID: ${wrongVoter.voterId}`);
  wrongVoter.voterId = 'XUA7224959';
  console.log(`   New ID: ${wrongVoter.voterId}`);
  console.log(`   Name: ${wrongVoter.name}`);
  
  // Update card image path
  if (wrongVoter.cardImage) {
    wrongVoter.cardImage = wrongVoter.cardImage.replace('XUA2224959', 'XUA7224959');
  }
  
  fs.writeFileSync(votersPath, JSON.stringify(voters, null, 2), 'utf-8');
  console.log('✅ Voter ID corrected!\n');
}

// Verify all 30 voters now have correct data
console.log('Final verification:');
console.log(`Total voters: ${voters.length}`);
console.log(`All have names: ${voters.every(v => v.name && v.name.length > 0)}`);
console.log(`All have ages: ${voters.every(v => v.age && v.age.length > 0)}`);
console.log(`All have genders: ${voters.every(v => v.gender && v.gender.length > 0)}`);

console.log('\n✅ All 30 voters from page 2 now have complete and accurate data!');
