const fs = require('fs');

console.log('🔧 Fixing serialNumber field for all voters...\n');

// Read current database
let voters = [];
try {
  const dbContent = fs.readFileSync('./public/data/voters.json', 'utf8');
  if (dbContent.trim()) {
    voters = JSON.parse(dbContent);
  }
} catch (e) {
  console.log('❌ Error reading database');
  process.exit(1);
}

console.log(`📊 Current database: ${voters.length} voters`);

let fixedCount = 0;
voters.forEach(voter => {
  if (voter.serial && !voter.serialNumber) {
    voter.serialNumber = voter.serial;
    fixedCount++;
  }
});

console.log(`✅ Fixed ${fixedCount} voters with missing serialNumber field`);

// Save updated database
fs.writeFileSync('./public/data/voters.json', JSON.stringify(voters, null, 2));

console.log('💾 Database updated successfully!');
console.log(`📊 Final count: ${voters.length} voters`);