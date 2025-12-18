const fs = require('fs');

console.log('🔧 Fixing W7F3 Genders from Parsed Data\n');

// Load parsed data with correct genders
const parsedData = JSON.parse(fs.readFileSync('w7f3-parsed-complete.json', 'utf-8'));

// Load current database
const voters = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf-8'));

// Backup
const backupPath = `voters-backup-before-gender-fix-${Date.now()}.json`;
fs.writeFileSync(backupPath, JSON.stringify(voters, null, 2));
console.log(`💾 Backup: ${backupPath}\n`);

let fixedCount = 0;

voters.forEach(voter => {
  if (voter.ward === '7' && voter.booth === '3') {
    const parsed = parsedData[voter.voterId];
    
    if (parsed && parsed.gender) {
      // Force update gender from parsed data
      voter.gender = parsed.gender;
      fixedCount++;
    }
  }
});

console.log(`✅ Fixed ${fixedCount} genders\n`);

// Save
fs.writeFileSync('./public/data/voters.json', JSON.stringify(voters, null, 2));

// Verify
const w7f3 = voters.filter(v => v.ward === '7' && v.booth === '3');
const males = w7f3.filter(v => v.gender === 'M').length;
const females = w7f3.filter(v => v.gender === 'F').length;
const unknown = w7f3.filter(v => v.gender !== 'M' && v.gender !== 'F').length;

console.log('📊 W7F3 Gender Distribution:');
console.log(`  Males: ${males}`);
console.log(`  Females: ${females}`);
console.log(`  Unknown: ${unknown}`);
console.log(`  Total: ${w7f3.length}\n`);

console.log('📋 Sample corrected voters:');
w7f3.slice(0, 20).forEach(v => {
  const genderIcon = v.gender === 'M' ? '👨' : v.gender === 'F' ? '👩' : '❓';
  console.log(`  ${genderIcon} ${v.serial}. ${v.name} (${v.age}/${v.gender})`);
});

console.log('\n✅ Gender correction complete!');
