const fs = require('fs');

// Read voters
const votersData = fs.readFileSync('public/data/voters.json', 'utf8');
const voters = JSON.parse(votersData);

console.log(`Total voters before: ${voters.length}\n`);

// Backup
fs.writeFileSync('public/data/voters.json.backup-before-placeholders', votersData);
console.log('Backup created\n');

// Get Ward 7 voters
const ward7Voters = voters.filter(v => 
  v.actualWard === '7' || v.expectedWard === '7'
);

const newPlaceholders = [];

// File specs: W7F1 should have 991, others we'll complete based on max serial
const fileSpecs = {
  '1': { booth: '1', maxSerial: 991, fileNum: 1 },
  '2': { booth: '2', maxSerial: 1004, fileNum: 2 },
  '3': { booth: '3', maxSerial: 1344, fileNum: 3 }
};

Object.entries(fileSpecs).forEach(([boothKey, spec]) => {
  console.log(`=== Processing W7F${spec.fileNum} (Booth ${spec.booth}) ===`);
  
  const boothVoters = ward7Voters.filter(v => 
    (v.actualBooth || v.booth) === spec.booth
  );
  
  const existingSerials = new Set(
    boothVoters.map(v => parseInt(v.serialNumber))
  );
  
  console.log(`Existing voters: ${boothVoters.length}`);
  console.log(`Max serial: ${spec.maxSerial}`);
  
  // Find missing serials
  const missingSerials = [];
  for (let i = 1; i <= spec.maxSerial; i++) {
    if (!existingSerials.has(i)) {
      missingSerials.push(i);
    }
  }
  
  console.log(`Missing serials: ${missingSerials.length}`);
  
  // Create placeholders
  missingSerials.forEach(serial => {
    const placeholder = {
      serialNumber: serial.toString(),
      voterId: "",
      partNumber: `201/7/${spec.booth}/${serial}`,
      pageNumber: Math.ceil(serial / 30), // Estimate page
      name: "",
      age: "",
      gender: "",
      fatherName: "",
      relativeDetail: "",
      houseNumber: "",
      address: "",
      ward: "7",
      booth: spec.booth,
      actualWard: "7",
      actualBooth: spec.booth,
      pollingCenter: "मतदान केंद्रनिहाय मतदार यादी",
      source: "Placeholder - OCR Failed",
      nameStatus: "pending",
      cardImage: "",
      dataQuality: {
        voterId: "missing",
        age: "missing",
        gender: "missing",
        booth: "verified",
        ward: "verified",
        name: "missing",
        fatherName: "missing"
      },
      id: `PLACEHOLDER_W7F${spec.fileNum}_S${serial}_${Date.now()}`,
      createdAt: new Date().toISOString(),
      expectedWard: "7",
      expectedBooth: spec.booth,
      ocrFailed: true,
      pendingManualEntry: true,
      fileNumber: spec.fileNum,
      fileReference: `W7F${spec.fileNum}`,
      uniqueSerial: `W7F${spec.fileNum}-S${serial}`
    };
    
    newPlaceholders.push(placeholder);
  });
  
  console.log(`Created ${missingSerials.length} placeholders\n`);
});

// Add placeholders to voters array
voters.push(...newPlaceholders);

console.log(`=== Summary ===`);
console.log(`Total new placeholders: ${newPlaceholders.length}`);
console.log(`Total voters after: ${voters.length}\n`);

// Save
fs.writeFileSync('public/data/voters.json', JSON.stringify(voters, null, 2));
console.log('✓ Saved voters.json\n');

// Final report
console.log('=== Final Ward 7 Status ===');
Object.entries(fileSpecs).forEach(([boothKey, spec]) => {
  const boothVoters = voters.filter(v => 
    (v.actualWard === '7' || v.expectedWard === '7') &&
    (v.actualBooth || v.booth) === spec.booth
  );
  
  const withData = boothVoters.filter(v => v.name && v.name.trim() !== '');
  const placeholders = boothVoters.filter(v => v.ocrFailed || !v.name || v.name.trim() === '');
  
  console.log(`\nW7F${spec.fileNum} (Booth ${spec.booth}):`);
  console.log(`  Total entries: ${boothVoters.length}`);
  console.log(`  With data: ${withData.length}`);
  console.log(`  Placeholders: ${placeholders.length}`);
  console.log(`  Expected: ${spec.maxSerial}`);
  console.log(`  Status: ${boothVoters.length >= spec.maxSerial ? '✓ Complete' : '⚠️ Incomplete'}`);
});

console.log('\n✓ All Ward 7 files now have complete serial sequences');
console.log('✓ Blank entries can be filled manually through the UI');
