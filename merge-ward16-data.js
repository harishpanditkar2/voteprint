const fs = require('fs');
const path = require('path');

console.log('🔄 Starting Ward 16 Data Merge Process...\n');

// Read current voters.json (Ward 7 data)
const currentVotersPath = path.join(__dirname, 'public', 'data', 'voters.json');
const currentVoters = JSON.parse(fs.readFileSync(currentVotersPath, 'utf8'));

console.log(`📊 Current data: ${currentVoters.length} voters`);
console.log(`   - Ward 7 voters loaded\n`);

// Read all Ward 16 booth files
const outputDir = path.join(__dirname, 'output');
const ward16Files = [
  'BoothVoterList_A4_Ward_16_Booth_1_2025-12-15.json',
  'BoothVoterList_A4_Ward_16_Booth_2_2025-12-15.json',
  'BoothVoterList_A4_Ward_16_Booth_3_2025-12-15.json',
  'BoothVoterList_A4_Ward_16_Booth_4_2025-12-15.json',
  'BoothVoterList_A4_Ward_16_Booth_5_2025-12-15.json',
  'BoothVoterList_A4_Ward_16_Booth_6_2025-12-15.json',
  'BoothVoterList_A4_Ward_16_Booth_7_2025-12-15.json'
];

let ward16Voters = [];
let boothCounts = {};

console.log('📥 Loading Ward 16 booth files...');
ward16Files.forEach((filename, index) => {
  const boothNum = index + 1;
  const filePath = path.join(outputDir, filename);
  
  if (fs.existsSync(filePath)) {
    const boothData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Transform to match current structure
    const transformedVoters = boothData.map((voter, idx) => ({
      serial: voter.serialNumber || `${idx + 1}`,
      voterId: voter.voterId || '',
      name: voter.name || '',
      age: voter.age || '',
      gender: voter.gender || '',
      serialNumber: voter.serialNumber || `${idx + 1}`,
      ward: '16',
      booth: `${boothNum}`,
      anukramank: idx + 1,
      uniqueSerial: `W16B${boothNum}S${voter.serialNumber || (idx + 1)}`,
      // Additional fields from Ward 16 data
      partNumber: voter.partNumber,
      houseNumber: voter.houseNumber,
      address: voter.address,
      actualWard: '16',
      actualBooth: `${boothNum}`
    }));
    
    ward16Voters = ward16Voters.concat(transformedVoters);
    boothCounts[boothNum] = transformedVoters.length;
    console.log(`   ✅ Booth ${boothNum}: ${transformedVoters.length} voters`);
  } else {
    console.log(`   ⚠️  Booth ${boothNum}: File not found`);
  }
});

console.log(`\n📊 Ward 16 Summary:`);
console.log(`   - Total voters: ${ward16Voters.length}`);
Object.keys(boothCounts).forEach(booth => {
  console.log(`   - Booth ${booth}: ${boothCounts[booth]} voters`);
});

// Merge data
const allVoters = [...currentVoters, ...ward16Voters];

console.log(`\n✅ Combined data:`);
console.log(`   - Ward 7: ${currentVoters.length} voters`);
console.log(`   - Ward 16: ${ward16Voters.length} voters`);
console.log(`   - Total: ${allVoters.length} voters`);

// Create backup
const backupPath = path.join(__dirname, `voters-backup-before-ward16-${Date.now()}.json`);
fs.writeFileSync(backupPath, JSON.stringify(currentVoters, null, 2));
console.log(`\n💾 Backup created: ${path.basename(backupPath)}`);

// Write merged data
fs.writeFileSync(currentVotersPath, JSON.stringify(allVoters, null, 2));
console.log(`✅ Updated voters.json with Ward 16 data`);

// Calculate file sizes
const currentSize = fs.statSync(currentVotersPath).size;
const sizeMB = (currentSize / (1024 * 1024)).toFixed(2);

console.log(`\n📦 File size: ${sizeMB} MB`);

// Data validation
const ward7Count = allVoters.filter(v => v.ward === '7').length;
const ward16Count = allVoters.filter(v => v.ward === '16').length;

console.log(`\n✅ Validation:`);
console.log(`   - Ward 7: ${ward7Count} voters`);
console.log(`   - Ward 16: ${ward16Count} voters`);

// Check for duplicates
const voterIds = allVoters.map(v => v.voterId).filter(Boolean);
const uniqueIds = new Set(voterIds);
const duplicateCount = voterIds.length - uniqueIds.size;

if (duplicateCount > 0) {
  console.log(`\n⚠️  Warning: ${duplicateCount} duplicate voter IDs found`);
} else {
  console.log(`\n✅ No duplicate voter IDs`);
}

console.log('\n🎉 Ward 16 data merge completed successfully!\n');
