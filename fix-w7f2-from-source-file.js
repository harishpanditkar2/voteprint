const fs = require('fs');

console.log('🔧 W7F2 Complete Fix - Extract from add-w7f2-clean-fresh.js');
console.log('════════════════════════════════════════════════════════\n');

// Step 1: Read and parse the raw data file
console.log('Step 1: Reading add-w7f2-clean-fresh.js...');
const fileContent = fs.readFileSync('./add-w7f2-clean-fresh.js', 'utf8');

// Extract the raw data string
const rawDataMatch = fileContent.match(/const rawW7F2Data = `([\s\S]*?)`;/);
if (!rawDataMatch) {
  console.log('❌ Could not find rawW7F2Data in file');
  process.exit(1);
}

const rawData = rawDataMatch[1];
const blocks = rawData.trim().split(/\n(?=\d+ [A-Z]{3}\d{7})/); // Split on serial numbers

console.log(`✅ Found ${blocks.length} voter blocks\n`);

// Step 2: Parse all voters
console.log('Step 2: Parsing voter data...');
const allVoters = [];

blocks.forEach((block, index) => {
  const lines = block.trim().split('\n');
  if (lines.length < 4) return; // Skip invalid blocks
  
  const firstLine = lines[0];
  const match = firstLine.match(/^(\d+)\s+([A-Z]{3}\d{7})\s+(\d{3}\/\d{3}\/\d{3})/);
  
  if (!match) return;
  
  const serial = parseInt(match[1]);
  const voterId = match[2];
  const partNumber = match[3];
  
  let name = '';
  let relation = '';
  let house = '';
  let age = '';
  let gender = '';
  
  // Parse rest of the block
  lines.forEach(line => {
    if (line.includes('मतदाराचे पूर्ण:')) {
      name = line.split(':')[1]?.trim() || '';
    } else if (line.includes('वडिलांचे नाव:') || line.includes('पतीचे नाव:') || line.includes('इतर:') || line.includes('आईचे नाव:')) {
      const parts = line.split(':');
      relation = parts[1]?.trim() || '';
    } else if (line.includes('घर क्रमांक:')) {
      house = line.split(':')[1]?.trim() || 'NA';
    } else if (line.includes('वय:') && line.includes('लिंग:')) {
      const ageMatch = line.match(/वय:\s*(\d+)/);
      const genderMatch = line.match(/लिंग:\s*(पु|स्री)/);
      if (ageMatch) age = ageMatch[1];
      if (genderMatch) gender = genderMatch[1] === 'पु' ? 'M' : 'F';
    }
  });
  
  if (voterId && name && age && gender) {
    allVoters.push({
      voterId,
      name,
      age,
      gender,
      ward: '7',
      booth: '2',
      serial,
      relation: relation || 'NA',
      house: house || 'NA',
      partNumber,
      uniqueSerial: `W7F2-S${serial}`
    });
  }
});

console.log(`✅ Parsed ${allVoters.length} voters\n`);

// Step 3: Check for duplicate voter IDs in the source data
console.log('Step 3: Checking for duplicates in source data...');
const voterIdMap = {};
allVoters.forEach(v => {
  if (!voterIdMap[v.voterId]) voterIdMap[v.voterId] = [];
  voterIdMap[v.voterId].push(v.serial);
});

const duplicateIds = Object.keys(voterIdMap).filter(id => voterIdMap[id].length > 1);

if (duplicateIds.length > 0) {
  console.log(`⚠️  Found ${duplicateIds.length} duplicate voter IDs in source file:`);
  duplicateIds.slice(0, 10).forEach(id => {
    console.log(`   ${id}: serials ${voterIdMap[id].join(', ')}`);
  });
  if (duplicateIds.length > 10) {
    console.log(`   ... and ${duplicateIds.length - 10} more`);
  }
  console.log('\n❌ Source data has duplicates - cannot proceed');
  console.log('   The add-w7f2-clean-fresh.js file needs to be fixed first\n');
  process.exit(1);
} else {
  console.log(`✅ No duplicates in source data\n`);
}

// Step 4: Load current database
console.log('Step 4: Loading current database...');
const currentData = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf8'));
const currentW7F2 = currentData.filter(v => v.booth === '2');
const currentNonW7F2 = currentData.filter(v => v.booth !== '2');

console.log(`   Current total: ${currentData.length}`);
console.log(`   Current W7F2: ${currentW7F2.length}`);
console.log(`   Other booths: ${currentNonW7F2.length}\n`);

// Step 5: Create backup
console.log('Step 5: Creating backup...');
const backupFile = `./public/data/voters.json.backup-complete-fix-${Date.now()}`;
fs.writeFileSync(backupFile, JSON.stringify(currentData, null, 2));
console.log(`✅ Backup: ${backupFile}\n`);

// Step 6: Replace W7F2 data completely
console.log('Step 6: Replacing W7F2 data...');
const finalData = [...currentNonW7F2, ...allVoters];

// Sort by booth and serial
finalData.sort((a, b) => {
  if (a.booth !== b.booth) return a.booth.localeCompare(b.booth);
  return (a.serial || 0) - (b.serial || 0);
});

fs.writeFileSync('./public/data/voters.json', JSON.stringify(finalData, null, 2));
console.log(`✅ Database updated`);
console.log(`   Total voters: ${finalData.length}`);
console.log(`   W7F2 voters: ${allVoters.length}\n`);

// Step 7: Final verification
console.log('═══════════════════════════════════════════════════════');
console.log('Step 7: Final Verification');
console.log('═══════════════════════════════════════════════════════\n');

const finalW7F2 = finalData.filter(v => v.booth === '2');
const finalVoterIdMap = {};
finalW7F2.forEach(v => {
  if (!finalVoterIdMap[v.voterId]) finalVoterIdMap[v.voterId] = [];
  finalVoterIdMap[v.voterId].push({serial: v.serial, name: v.name});
});

const finalDuplicates = Object.keys(finalVoterIdMap).filter(id => finalVoterIdMap[id].length > 1);

if (finalDuplicates.length > 0) {
  console.log(`❌ STILL HAVE ${finalDuplicates.length} DUPLICATE VOTER IDs!\n`);
  finalDuplicates.slice(0, 5).forEach(id => {
    console.log(`   ${id}:`);
    finalVoterIdMap[id].forEach(v => {
      console.log(`     Serial ${v.serial}: ${v.name}`);
    });
  });
  console.log('\n⚠️  Source data has duplicates - needs manual review');
} else {
  console.log(`✅ SUCCESS! No duplicate voter IDs`);
  console.log(`✅ W7F2 data complete with ${finalW7F2.length} unique voters`);
  
  // Check serial coverage
  const serials = finalW7F2.map(v => v.serial).sort((a, b) => a - b);
  const missing = [];
  for (let i = 1; i <= 861; i++) {
    if (!serials.includes(i)) missing.push(i);
  }
  
  if (missing.length > 0) {
    console.log(`\n⚠️  Missing ${missing.length} serials:`);
    console.log(`   ${missing.slice(0, 10).join(', ')}${missing.length > 10 ? '...' : ''}`);
  } else {
    console.log(`✅ All serials 1-861 present`);
  }
  
  console.log(`\n🎉 W7F2 fix completed successfully!`);
}

console.log('\n════════════════════════════════════════════════════════');
