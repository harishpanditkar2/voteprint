const fs = require('fs');
const voters = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf-8'));

// Find W7F1 voters properly
const w7f1 = voters.filter(v => v.ward === '7' && v.booth === '1');
console.log(`Found ${w7f1.length} W7F1 voters\n`);

// Check specific serials
const checks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 13, 15, 17, 19];
console.log('Checking serials:');
checks.forEach(s => {
  const voter = w7f1.find(v => v.serial === s);
  if (voter) {
    console.log(`S${s}: ${voter.name} (Age: ${voter.age})`);
  } else {
    console.log(`S${s}: NOT FOUND`);
  }
});
