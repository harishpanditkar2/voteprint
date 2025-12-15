const fs = require('fs');

// Clear the database completely
const votersFilePath = './public/data/voters.json';

// Create backup
if (fs.existsSync(votersFilePath)) {
  const backupPath = `${votersFilePath}.backup-before-clear-${Date.now()}`;
  fs.copyFileSync(votersFilePath, backupPath);
  console.log(`✅ Backup created: ${backupPath}`);
}

// Clear the file
fs.writeFileSync(votersFilePath, JSON.stringify([], null, 2));

console.log('✅ Database cleared - voters.json now contains empty array []');
console.log('\nReady for fresh import!');
