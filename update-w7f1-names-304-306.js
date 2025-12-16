const fs = require('fs');

// Read current data
const data = JSON.parse(fs.readFileSync('public/data/voters.json', 'utf8'));

// Create backup
const backupFile = `public/data/voters-backup-w7f1-names-304-306-${Date.now()}.json`;
fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
console.log(`Backup created: ${backupFile}`);

// Corrections to apply
const corrections = [
  { serial: '304', newName: 'जोहर अल्लीहुसेन नासिकवाला' },
  { serial: '305', newName: 'शमीम जोहर नासिकवाला' },
  { serial: '306', newName: 'मुस्तजा जोहर नासिकवाला' }
];

console.log('\nUpdating names:');

corrections.forEach(({ serial, newName }) => {
  const voterIndex = data.findIndex(v => 
    v.ward === '7' && 
    v.booth === '1' && 
    (v.serial === serial || v.serialNumber === serial)
  );

  if (voterIndex === -1) {
    console.log(`Serial ${serial}: NOT FOUND`);
    return;
  }

  console.log(`\nSerial ${serial}:`);
  console.log(`  Old name: ${data[voterIndex].name}`);
  data[voterIndex].name = newName;
  console.log(`  New name: ${data[voterIndex].name}`);
});

// Save updated data
fs.writeFileSync('public/data/voters.json', JSON.stringify(data, null, 2));
console.log('\n✓ Names updated successfully!');
