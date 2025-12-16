const fs = require('fs');
const voters = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf-8'));
const w7f1 = voters.filter(v => v.ward === '7' && v.booth === '1');

console.log('Searching for voters matching the correction list:\n');

const searches = [
  { serial: 4, search: 'खुशबू', expected: 'खुशबू महमद रफिक बागवान' },
  { serial: 5, search: 'age:31', expected: 'Update age to 31' },
  { serial: 7, search: 'करिश्मा', expected: 'करिश्मा शब्बीर बागवान' },
  { serial: 9, search: 'age:31', expected: 'Update age to 31' },
  { serial: 13, search: 'age:39', expected: 'Update age to 39' },
  { serial: 15, search: 'सई', expected: 'सई निलेश चिवटे' },
  { serial: 17, search: 'age:38', expected: 'Update age to 38' },
  { serial: 19, search: 'आकाश', expected: 'आकाश हिराचंद देशमुख' }
];

// Check serials 1-30 to see what's there
console.log('W7F1 Serials 1-30:');
for (let i = 1; i <= 30; i++) {
  const voter = w7f1.find(v => v.serial === i);
  if (voter) {
    console.log(`S${i}: ${voter.name} (${voter.voterId}) - Age: ${voter.age}`);
  } else {
    console.log(`S${i}: NOT FOUND`);
  }
}

console.log('\n\nSearching for matching names:');
searches.forEach(s => {
  if (!s.search.startsWith('age:')) {
    const found = w7f1.filter(v => v.name && v.name.includes(s.search));
    if (found.length > 0) {
      found.forEach(f => console.log(`  Serial ${s.serial} → Found at S${f.serial}: ${f.name}`));
    }
  }
});
