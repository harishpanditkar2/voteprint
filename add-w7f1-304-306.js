const fs = require('fs');

// Read current data
const data = JSON.parse(fs.readFileSync('public/data/voters.json', 'utf8'));

// Create backup
const backupFile = `public/data/voters-backup-w7f1-304-306-${Date.now()}.json`;
fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
console.log(`Backup created: ${backupFile}`);

// New voters to add based on the image
const newVoters = [
  {
    voterId: 'CRM2062461',
    name: 'शुभांगी प्रकाश दळवी',
    age: 81,
    gender: 'M',
    ward: '7',
    booth: '1',
    serial: '304',
    serialNumber: '304',
    relation: 'प्रकाश दळवी',
    house: '४३१२ मिग',
    partNumber: '201/138/448',
    actualWard: '7',
    actualBooth: '1'
  },
  {
    voterId: 'CRM2062453',
    name: 'रिना प्रकाश दळवी',
    age: 76,
    gender: 'F',
    ward: '7',
    booth: '1',
    serial: '305',
    serialNumber: '305',
    relation: 'प्रकाश दळवी',
    house: '४३१२ मिग',
    partNumber: '201/138/449',
    actualWard: '7',
    actualBooth: '1'
  },
  {
    voterId: 'CRM2063691',
    name: 'विठ्ठल नारायण लोणकर',
    age: 56,
    gender: 'M',
    ward: '7',
    booth: '1',
    serial: '306',
    serialNumber: '306',
    relation: 'नारायण लोणकर',
    house: '४३१२',
    partNumber: '201/138/450',
    actualWard: '7',
    actualBooth: '1'
  }
];

console.log('\nAdding voters:');
newVoters.forEach(v => {
  console.log(`Serial ${v.serial}: ${v.name}, ID: ${v.voterId}`);
  data.push(v);
});

// Save updated data
fs.writeFileSync('public/data/voters.json', JSON.stringify(data, null, 2));
console.log(`\n✓ Added ${newVoters.length} voters successfully!`);
console.log(`Total voters now: ${data.length}`);
