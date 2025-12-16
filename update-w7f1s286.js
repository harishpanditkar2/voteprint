const fs = require('fs');

// Read current data
const data = JSON.parse(fs.readFileSync('public/data/voters.json', 'utf8'));

// Create backup
const backupFile = `public/data/voters-backup-w7f1s286-${Date.now()}.json`;
fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
console.log(`Backup created: ${backupFile}`);

// Find voter with serial 286 in W7F1
const voterIndex = data.findIndex(v => 
  v.ward === '7' && 
  v.booth === '1' && 
  (v.serial === '286' || v.serialNumber === '286')
);

if (voterIndex === -1) {
  console.log('Voter with serial 286 in W7F1 not found!');
  process.exit(1);
}

console.log('\nBefore update:');
console.log(`Voter ID: ${data[voterIndex].voterId}`);
console.log(`Serial: ${data[voterIndex].serial || data[voterIndex].serialNumber}`);
console.log(`Old Name: ${data[voterIndex].name}`);
console.log(`Old Age: ${data[voterIndex].age}`);
console.log(`Old Gender: ${data[voterIndex].gender}`);

// Update the voter details
data[voterIndex].name = 'आइवीनी अशोक गलांडे';
data[voterIndex].voterId = 'CRM2062271';
data[voterIndex].age = 65;
data[voterIndex].gender = 'F';

console.log('\nAfter update:');
console.log(`New Voter ID: ${data[voterIndex].voterId}`);
console.log(`New Name: ${data[voterIndex].name}`);
console.log(`New Age: ${data[voterIndex].age}`);
console.log(`New Gender: ${data[voterIndex].gender}`);

// Save updated data
fs.writeFileSync('public/data/voters.json', JSON.stringify(data, null, 2));
console.log('\n✓ Voter updated successfully!');
