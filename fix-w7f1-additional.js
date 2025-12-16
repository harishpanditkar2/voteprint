const fs = require('fs');

// Read the voters file
let voters = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf-8'));

// Create backup
const backupPath = `./public/data/voters-backup-w7f1-additional-${Date.now()}.json`;
fs.writeFileSync(backupPath, JSON.stringify(voters, null, 2));
console.log(`Backup created: ${backupPath}\n`);

// Additional corrections from user
const corrections = [
  { serial: 4, name: 'खुशबू महमद रफिक बागवान' },
  { serial: 5, age: 31 },
  { serial: 7, name: 'करिश्मा शब्बीर बागवान' },
  { serial: 9, age: 31 },
  { serial: 13, age: 39 },
  { serial: 15, name: 'सई निलेश चिवटे' },
  { serial: 17, age: 38 },
  { serial: 19, name: 'आकाश हिराचंद देशमुख' }
];

let corrected = 0;
let notFound = 0;

console.log('Applying additional W7F1 corrections:\n');

for (const correction of corrections) {
  const voterIndex = voters.findIndex(v => 
    v.ward === '7' && v.booth === '1' && String(v.serial) === String(correction.serial)
  );
  
  if (voterIndex === -1) {
    console.log(`❌ Serial ${correction.serial}: NOT FOUND`);
    notFound++;
    continue;
  }
  
  const voter = voters[voterIndex];
  const changes = [];
  
  if (correction.name && voter.name !== correction.name) {
    changes.push(`Name: "${voter.name}" → "${correction.name}"`);
    voters[voterIndex].name = correction.name;
  }
  
  if (correction.age && voter.age !== correction.age) {
    changes.push(`Age: ${voter.age} → ${correction.age}`);
    voters[voterIndex].age = correction.age;
  }
  
  if (correction.gender && voter.gender !== correction.gender) {
    changes.push(`Gender: ${voter.gender} → ${correction.gender}`);
    voters[voterIndex].gender = correction.gender;
  }
  
  if (changes.length > 0) {
    console.log(`✅ Serial ${correction.serial}: ${changes.join(', ')}`);
    corrected++;
  } else {
    console.log(`ℹ️  Serial ${correction.serial}: Already correct`);
  }
}

console.log(`\n📊 Summary:`);
console.log(`   Corrected: ${corrected} voters`);
console.log(`   Not found: ${notFound} voters`);

// Save updated voters
fs.writeFileSync('./public/data/voters.json', JSON.stringify(voters, null, 2));
console.log(`\n✅ Updated voters.json with additional corrections`);
