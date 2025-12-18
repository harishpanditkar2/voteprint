const fs = require('fs');

const voters = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf-8'));
const w7b1 = voters.filter(v => v.ward === "7" && v.booth === "1");

console.log('Checking anukramank 910-915:\n');
w7b1.filter(v => v.anukramank >= 910 && v.anukramank <= 915).forEach(v => {
  console.log(`Anukramank ${v.anukramank} (Serial ${v.serial}):`);
  console.log(`  Name: ${v.name}`);
  console.log(`  VoterID: ${v.voterId}`);
  console.log(`  Age: ${v.age}, Gender: ${v.gender}\n`);
});

console.log('Checking if "रतनलाल रामकुमार गादिया" exists anywhere in W7B1:\n');
const found = w7b1.find(v => v.name.includes('रतनलाल'));
if (found) {
  console.log(`Found: Anukramank ${found.anukramank}, Serial ${found.serial}`);
  console.log(`Name: ${found.name}`);
  console.log(`VoterID: ${found.voterId}`);
} else {
  console.log('Not found in W7B1');
}
