const fs = require('fs');

// Load voters data
const voters = JSON.parse(fs.readFileSync('public/data/voters.json', 'utf-8'));

// Check voters in W7F1
const w7f1Voters = voters.filter(v => v.uniqueSerial && v.uniqueSerial.startsWith('W7F1-'));

console.log('\n=== Checking First 10 W7F1 Voters ===\n');

w7f1Voters.slice(0, 10).forEach((voter, idx) => {
  console.log(`${idx + 1}. Serial: ${voter.uniqueSerial}`);
  console.log(`   Name: ${voter.name}`);
  console.log(`   Name includes serial? ${voter.name ? voter.name.includes(voter.uniqueSerial) : 'N/A'}`);
  console.log('');
});
