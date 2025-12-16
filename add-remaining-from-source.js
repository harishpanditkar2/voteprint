const fs = require('fs');

console.log('📋 Extracting Remaining W7F2 Voters from Source File');
console.log('════════════════════════════════════════════════════════\n');

// Read the source file
const fileContent = fs.readFileSync('./add-w7f2-clean-fresh.js', 'utf8');

// Extract the raw data
const rawDataMatch = fileContent.match(/const rawW7F2Data = `([\s\S]*?)`;/);
if (!rawDataMatch) {
  console.log('❌ Could not find rawW7F2Data');
  process.exit(1);
}

const rawData = rawDataMatch[1];
const blocks = rawData.trim().split(/\n(?=\d+ [A-Z]{3}\d{7})/);

console.log(`Found ${blocks.length} voter blocks in source file\n`);

// Parse all voters
const allVoters = [];
blocks.forEach(block => {
  const lines = block.trim().split('\n');
  if (lines.length < 4) return;
  
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
  
  lines.forEach(line => {
    if (line.includes('मतदाराचे पूर्ण:')) {
      name = line.split(':')[1]?.trim() || '';
    } else if (line.includes('वडिलांचे नाव:') || line.includes('पतीचे नाव:') || line.includes('इतर:')) {
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
      serial,
      voterId,
      name,
      age,
      gender,
      relation: relation || 'NA',
      house: house || 'NA',
      partNumber
    });
  }
});

console.log(`Parsed ${allVoters.length} voters total\n`);

// Filter for missing serials (652-861)
const missingSerials = allVoters.filter(v => v.serial >= 652 && v.serial <= 861);
console.log(`Voters in range 652-861: ${missingSerials.length}\n`);

// Load current database
const data = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf8'));
const currentW7F2 = data.filter(v => v.booth === '2');
const existingSerials = new Set(currentW7F2.map(v => v.serial));

console.log('Current database:');
console.log(`  Total: ${data.length}`);
console.log(`  W7F2: ${currentW7F2.length}`);
console.log(`  W7F2 serial range: ${Math.min(...currentW7F2.map(v => v.serial))}-${Math.max(...currentW7F2.map(v => v.serial))}\n`);

// Find what's actually missing
const actuallyMissing = missingSerials.filter(v => !existingSerials.has(v.serial));
console.log(`Actually missing serials: ${actuallyMissing.length}`);
if (actuallyMissing.length > 0) {
  console.log(`  Range: ${actuallyMissing[0].serial}-${actuallyMissing[actuallyMissing.length-1].serial}\n`);
}

// Check for voter ID conflicts
const existingVoterIds = new Set(data.map(v => v.voterId));
const conflicts = actuallyMissing.filter(v => existingVoterIds.has(v.voterId));

if (conflicts.length > 0) {
  console.log(`⚠️  Voter ID conflicts: ${conflicts.length}`);
  conflicts.slice(0, 5).forEach(v => {
    const existing = data.find(d => d.voterId === v.voterId);
    console.log(`   ${v.voterId}:`);
    console.log(`     Serial ${v.serial} (new): ${v.name}`);
    console.log(`     Serial ${existing.serial} (existing): ${existing.name}`);
  });
  if (conflicts.length > 5) {
    console.log(`   ... and ${conflicts.length - 5} more conflicts\n`);
  }
  
  console.log('\n❌ CANNOT PROCEED - Voter ID conflicts detected!');
  console.log('   The source file (add-w7f2-clean-fresh.js) contains duplicate IDs');
  console.log('   as reported in the bug. Serials 652+ likely have wrong IDs.\n');
  
  // Show which serials have duplicates
  console.log('Duplicate pattern analysis:');
  conflicts.slice(0, 10).forEach(v => {
    const existing = data.find(d => d.voterId === v.voterId);
    const diff = v.serial - existing.serial;
    console.log(`   Serial ${existing.serial} -> ${v.serial} (diff: ${diff}): ${v.voterId}`);
  });
  
  process.exit(1);
}

// Create backup
console.log('Creating backup...');
const backupFile = `./public/data/voters.json.backup-add-652-861-${Date.now()}`;
fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
console.log(`✅ Backup: ${backupFile}\n`);

// Add new voters
const votersToAdd = actuallyMissing.map(v => ({
  voterId: v.voterId,
  name: v.name,
  age: v.age,
  gender: v.gender,
  ward: '7',
  booth: '2',
  serial: v.serial,
  relation: v.relation,
  house: v.house,
  partNumber: v.partNumber,
  uniqueSerial: `W7F2-S${v.serial}`
}));

const finalData = [...data, ...votersToAdd];

// Sort
finalData.sort((a, b) => {
  if (a.booth !== b.booth) return a.booth.localeCompare(b.booth);
  return (a.serial || 0) - (b.serial || 0);
});

fs.writeFileSync('./public/data/voters.json', JSON.stringify(finalData, null, 2));

console.log('✅ Database updated');
console.log(`   Added: ${votersToAdd.length} voters`);
console.log(`   Total: ${finalData.length}\n`);

const finalW7F2 = finalData.filter(v => v.booth === '2');
console.log('Final W7F2 status:');
console.log(`   Count: ${finalW7F2.length} (expected: 861)`);
console.log(`   Missing: ${861 - finalW7F2.length} voters\n`);

console.log('════════════════════════════════════════════════════════');
