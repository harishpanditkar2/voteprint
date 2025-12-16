const fs = require('fs');

// Read current data
const data = JSON.parse(fs.readFileSync('public/data/voters.json', 'utf8'));

// Create backup
const backupFile = `public/data/voters-backup-w7f1s268-${Date.now()}.json`;
fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
console.log(`Backup created: ${backupFile}`);

// Find and update the voter
const voterIndex = data.findIndex(v => v.voterId === 'W7F1S268');

if (voterIndex === -1) {
  console.log('Voter W7F1S268 not found!');
  process.exit(1);
}

console.log('\nBefore update:');
console.log(`Voter ID: ${data[voterIndex].voterId}`);
console.log(`Old Name: ${data[voterIndex].name}`);

// Update the name
data[voterIndex].name = 'अश्विनी अशोक गलांडे';

console.log(`New Name: ${data[voterIndex].name}`);

// Save updated data
fs.writeFileSync('public/data/voters.json', JSON.stringify(data, null, 2));
console.log('\n✓ Name updated successfully!');
