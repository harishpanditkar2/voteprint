const fs = require('fs');

const voters = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf-8'));
const w7b1 = voters.filter(v => v.ward === '7' && v.booth === '1');

// Check by anukramank instead
const checkAnukramanks = [4, 5, 7, 9, 13, 15, 17, 19, 48, 66, 67, 77, 82, 91, 92, 96, 114, 125, 130, 135];

console.log('Checking by anukramank:');
checkAnukramanks.forEach(ank => {
  const voter = w7b1.find(v => v.anukramank === ank);
  if (voter) {
    console.log(`✓ Anukramank ${ank}: ${voter.name} (Serial: ${voter.serial}, Age: ${voter.age}, Gender: ${voter.gender}, VoterID: ${voter.voterId})`);
  } else {
    console.log(`✗ Anukramank ${ank}: NOT FOUND`);
  }
});

console.log('\n--- Specific Names from User List ---');
const userNames = ['खुशबू महमद रफिक बागवान', 'करिश्मा शब्बीर बागवान', 'सई निलेश चिवटे', 'आकाश हिराचंद देशमुख'];
userNames.forEach(name => {
  const voter = w7b1.find(v => v.name === name);
  if (voter) {
    console.log(`✓ "${name}" → Anukramank: ${voter.anukramank}, Serial: ${voter.serial}, Age: ${voter.age}, Gender: ${voter.gender}`);
  }
});
