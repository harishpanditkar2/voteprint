const fs = require('fs');

// Read voters
const votersData = fs.readFileSync('public/data/voters.json', 'utf8');
const voters = JSON.parse(votersData);

console.log(`Total voters before correction: ${voters.length}\n`);

// Backup
fs.writeFileSync('public/data/voters.json.backup-before-correction', votersData);
console.log('Backup created\n');

// CORRECT file specs from PDF first pages
const correctSpecs = {
  '1': { booth: '1', maxSerial: 991, fileNum: 1, name: 'Matadan Kendra 1' },
  '2': { booth: '2', maxSerial: 861, fileNum: 2, name: 'Matadan Kendra 2' },
  '3': { booth: '3', maxSerial: 863, fileNum: 3, name: 'Matadan Kendra 3' }
};

let totalRemoved = 0;

Object.entries(correctSpecs).forEach(([boothKey, spec]) => {
  console.log(`=== Correcting ${spec.name} W7F${spec.fileNum} (Booth ${spec.booth}) ===`);
  
  const boothVoters = voters.filter(v => 
    (v.actualWard === '7' || v.expectedWard === '7') &&
    (v.actualBooth || v.booth) === spec.booth
  );
  
  console.log(`Current entries: ${boothVoters.length}`);
  console.log(`Correct max serial: ${spec.maxSerial}`);
  
  // Find entries with serial > maxSerial (these are wrong)
  const toRemove = boothVoters.filter(v => parseInt(v.serialNumber) > spec.maxSerial);
  
  if (toRemove.length > 0) {
    console.log(`⚠️ Removing ${toRemove.length} entries with serial > ${spec.maxSerial}`);
    
    // Remove these from main voters array
    toRemove.forEach(voter => {
      const index = voters.findIndex(v => v.id === voter.id);
      if (index !== -1) {
        voters.splice(index, 1);
        totalRemoved++;
      }
    });
  } else {
    console.log(`✓ No excess entries to remove`);
  }
  
  // Now check if we need to add any missing serials
  const remainingVoters = voters.filter(v => 
    (v.actualWard === '7' || v.expectedWard === '7') &&
    (v.actualBooth || v.booth) === spec.booth
  );
  
  const existingSerials = new Set(
    remainingVoters.map(v => parseInt(v.serialNumber))
  );
  
  const missing = [];
  for (let i = 1; i <= spec.maxSerial; i++) {
    if (!existingSerials.has(i)) {
      missing.push(i);
    }
  }
  
  if (missing.length > 0) {
    console.log(`⚠️ Need to add ${missing.length} placeholders for missing serials`);
    
    missing.forEach(serial => {
      const placeholder = {
        serialNumber: serial.toString(),
        voterId: "",
        partNumber: `201/7/${spec.booth}/${serial}`,
        pageNumber: Math.ceil(serial / 30),
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
        pollingCenter: `${spec.name} - मतदान केंद्रनिहाय मतदार यादी`,
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
      
      voters.push(placeholder);
    });
    
    console.log(`✓ Added ${missing.length} placeholders`);
  }
  
  console.log('');
});

console.log(`=== Summary ===`);
console.log(`Total entries removed: ${totalRemoved}`);
console.log(`Total voters after correction: ${voters.length}\n`);

// Save
fs.writeFileSync('public/data/voters.json', JSON.stringify(voters, null, 2));
console.log('✓ Saved corrected voters.json\n');

// Final verification
console.log('=== Final Ward 7 Status (Corrected) ===');
Object.entries(correctSpecs).forEach(([boothKey, spec]) => {
  const boothVoters = voters.filter(v => 
    (v.actualWard === '7' || v.expectedWard === '7') &&
    (v.actualBooth || v.booth) === spec.booth
  );
  
  const withData = boothVoters.filter(v => v.name && v.name.trim() !== '');
  const placeholders = boothVoters.filter(v => v.ocrFailed || !v.name || v.name.trim() === '');
  
  console.log(`\n${spec.name} - W7F${spec.fileNum} (Booth ${spec.booth}):`);
  console.log(`  Total entries: ${boothVoters.length}`);
  console.log(`  With data: ${withData.length}`);
  console.log(`  Placeholders: ${placeholders.length}`);
  console.log(`  Expected: ${spec.maxSerial} voters`);
  console.log(`  Status: ${boothVoters.length === spec.maxSerial ? '✓ Exactly correct!' : boothVoters.length > spec.maxSerial ? '⚠️ Too many!' : '⚠️ Too few!'}`);
});

console.log('\n✓ Ward 7 corrected to match PDF first page voter counts');
