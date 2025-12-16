const fs = require('fs');

const data = JSON.parse(fs.readFileSync('public/data/voters.json', 'utf8'));

// Get voters at serials 304, 305, 306 in W7F1
const serials = ['304', '305', '306'];

console.log('Current data for W7F1 serials 304-306:\n');

serials.forEach(serial => {
  const voter = data.find(v => 
    v.ward === '7' && 
    v.booth === '1' && 
    (v.serial === serial || v.serialNumber === serial)
  );
  
  if (voter) {
    console.log(`Serial ${serial}:`);
    console.log(`  Name: ${voter.name}`);
    console.log(`  Voter ID: ${voter.voterId}`);
    console.log(`  Age: ${voter.age}`);
    console.log(`  Gender: ${voter.gender}`);
    console.log(`  Relation: ${voter.relation || 'N/A'}`);
    console.log(`  House: ${voter.house || 'N/A'}`);
    console.log(`  Part Number: ${voter.partNumber || 'N/A'}`);
    console.log('');
  } else {
    console.log(`Serial ${serial}: NOT FOUND\n`);
  }
});
