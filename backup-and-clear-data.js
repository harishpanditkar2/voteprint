const fs = require('fs');
const path = require('path');

const votersPath = 'public/data/voters.json';
const timestamp = Date.now();
const backupPath = `public/data/voters.json.backup-full-${timestamp}`;

console.log('\n=== Backup and Clear Voters Data ===\n');

// Read current data
const voters = JSON.parse(fs.readFileSync(votersPath, 'utf-8'));
console.log(`Current voters count: ${voters.length}`);

// Create backup
fs.writeFileSync(backupPath, JSON.stringify(voters, null, 2), 'utf-8');
console.log(`✅ Backup created: ${backupPath}`);

// Clear voters.json - set to empty array
fs.writeFileSync(votersPath, '[]', 'utf-8');
console.log(`✅ voters.json cleared (now empty array)`);

console.log('\n=== Ready for new data! ===\n');
