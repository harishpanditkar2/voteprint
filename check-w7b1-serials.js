const fs = require('fs');

const voters = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf-8'));
const w7b1 = voters.filter(v => v.ward === '7' && v.booth === '1');

console.log('W7B1 Serial Range:', w7b1[0].serial, '-', w7b1[w7b1.length-1].serial);
console.log('Total:', w7b1.length);

console.log('\nSample high serials:');
w7b1.slice(-10).forEach(v => {
  console.log(`Serial ${v.serial}: ${v.name} (Age: ${v.age}, Gender: ${v.gender})`);
});

// Check for the serials mentioned by user
const checkSerials = ['48', '66', '67', '77', '82', '91', '92', '96', '114', '125', '130', '135', '154', '178', '204', '216', '256', '277'];

console.log('\nChecking mentioned serials:');
checkSerials.forEach(serial => {
  const voter = w7b1.find(v => v.serial === serial);
  if (voter) {
    console.log(`✓ Serial ${serial}: ${voter.name} (${voter.age}, ${voter.gender})`);
  } else {
    console.log(`✗ Serial ${serial}: NOT FOUND`);
  }
});
