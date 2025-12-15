const fs = require('fs');

// Read the voters database
const votersData = fs.readFileSync('public/data/voters.json', 'utf8');
const voters = JSON.parse(votersData);

console.log(`Total voters before: ${voters.length}`);

// Find Ward 7 Booth 1 voters to use as template
const ward7booth1Example = voters.find(v => v.actualWard === '7' && v.actualBooth === '1');

// Create blank placeholder entries for missing serial numbers
const missingSerials = [5, 10, 11];

const newVoters = missingSerials.map(sn => ({
  serialNumber: sn.toString(),
  voterId: "", // Blank - to be filled manually
  partNumber: `201/138/${140 + sn}`, // Following the pattern
  pageNumber: 3,
  name: "", // Blank - to be filled manually
  age: "",
  gender: "",
  fatherName: "",
  relativeDetail: "",
  houseNumber: "",
  address: "",
  ward: "138",
  booth: (140 + sn).toString(),
  actualWard: "7",
  actualBooth: "1",
  pollingCenter: "मतदान केंद्रनिहाय मतदार यादी",
  source: "Manual Entry - OCR Failed",
  nameStatus: "pending",
  cardImage: "", // No card image - OCR failed to extract this voter
  dataQuality: {
    voterId: "missing",
    age: "missing",
    gender: "missing",
    booth: "verified",
    ward: "verified",
    name: "missing",
    fatherName: "missing"
  },
  id: `VOTER_${Date.now()}_${sn}_PLACEHOLDER`,
  createdAt: new Date().toISOString(),
  expectedWard: "7",
  expectedBooth: "1",
  ocrFailed: true,
  pendingManualEntry: true
}));

console.log(`\nCreating placeholder entries for serials: ${missingSerials.join(', ')}`);

// Add the new voters to the array
voters.push(...newVoters);

console.log(`Total voters after: ${voters.length}`);

// Save backup
fs.writeFileSync('public/data/voters.json.backup-before-placeholders', votersData);
console.log('\nBackup saved to: voters.json.backup-before-placeholders');

// Save updated voters
fs.writeFileSync('public/data/voters.json', JSON.stringify(voters, null, 2));
console.log('Updated voters.json saved');

console.log('\nNew placeholder entries:');
newVoters.forEach(v => {
  console.log(`  Serial ${v.serialNumber}: Booth ${v.booth}, Status: ${v.source}`);
});

console.log('\nThese entries can now be edited through the UI to add the correct voter information.');
