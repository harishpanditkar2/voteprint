const fs = require('fs');

// Read current data
const data = JSON.parse(fs.readFileSync('public/data/voters.json', 'utf8'));

// Create backup
const backupFile = `public/data/voters-backup-w7f1s268-${Date.now()}.json`;
fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
console.log(`Backup created: ${backupFile}`);

// Find voter with serial 268 in W7F1
const voterIndex = data.findIndex(v => 
  v.ward === '7' && 
  v.booth === '1' && 
  (v.serial === '268' || v.serialNumber === '268')
);

if (voterIndex === -1) {
  console.log('Voter with serial 268 in W7F1 not found!');
  process.exit(1);
}

console.log('\nBefore update:');
console.log(`Voter ID: ${data[voterIndex].voterId}`);
console.log(`Serial: ${data[voterIndex].serial || data[voterIndex].serialNumber}`);
console.log(`Old Name: ${data[voterIndex].name}`);

// Update the name
data[voterIndex].name = 'अश्विनी अशोक गलांडे';

console.log(`New Name: ${data[voterIndex].name}`);

// Save updated data
fs.writeFileSync('public/data/voters.json', JSON.stringify(data, null, 2));
console.log('\n✓ Name updated successfully!');
