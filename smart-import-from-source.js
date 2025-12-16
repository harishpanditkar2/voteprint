const fs = require('fs');

console.log('📋 Smart Import from add-w7f2-clean-fresh.js');
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

console.log(`Parsed ${allVoters.length} voters from source file\n`);

// Load current database
const data = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf8'));
const currentW7F2 = data.filter(v => v.booth === '2');
const existingSerials = new Set(currentW7F2.map(v => v.serial));
const existingVoterIds = new Set(data.map(v => v.voterId));

console.log('Current database:');
console.log(`  Total voters: ${data.length}`);
console.log(`  W7F2 voters: ${currentW7F2.length}`);
console.log(`  Missing from 861: ${861 - currentW7F2.length}\n`);

// Find voters that can be safely added
const candidatesForAddition = allVoters.filter(v => !existingSerials.has(v.serial));
console.log(`Candidates (not in DB by serial): ${candidatesForAddition.length}`);

// Check for voter ID conflicts
const safeToAdd = candidatesForAddition.filter(v => !existingVoterIds.has(v.voterId));
const conflicts = candidatesForAddition.filter(v => existingVoterIds.has(v.voterId));

console.log(`  Safe to add (no ID conflict): ${safeToAdd.length}`);
console.log(`  ID conflicts (duplicates): ${conflicts.length}\n`);

if (conflicts.length > 0) {
  console.log('⚠️  Voter ID Conflicts (these will be SKIPPED):');
  
  // Group conflicts by ID to show pattern
  const conflictsBySerialDiff = {};
  conflicts.forEach(v => {
    const existing = data.find(d => d.voterId === v.voterId);
    const diff = v.serial - existing.serial;
    if (!conflictsBySerialDiff[diff]) conflictsBySerialDiff[diff] = [];
    conflictsBySerialDiff[diff].push({
      voterId: v.voterId,
      existingSerial: existing.serial,
      newSerial: v.serial,
      existingName: existing.name,
      newName: v.name
    });
  });
  
  Object.keys(conflictsBySerialDiff).sort((a,b) => b-a).forEach(diff => {
    const group = conflictsBySerialDiff[diff];
    console.log(`\n  Serial difference ${diff} (${group.length} conflicts):`);
    group.slice(0, 3).forEach(c => {
      console.log(`    ${c.voterId}:`);
      console.log(`      Serial ${c.existingSerial}: ${c.existingName}`);
      console.log(`      Serial ${c.newSerial}: ${c.newName} ← DUPLICATE (skipped)`);
    });
    if (group.length > 3) {
      console.log(`    ... and ${group.length - 3} more with same pattern`);
    }
  });
  console.log();
}

if (safeToAdd.length === 0) {
  console.log('✅ No new voters to add - database is complete!\n');
  process.exit(0);
}

// Create backup
console.log('Creating backup...');
const backupFile = `./public/data/voters.json.backup-smart-import-${Date.now()}`;
fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
console.log(`✅ Backup: ${backupFile}\n`);

// Add safe voters
const votersToAdd = safeToAdd.map(v => ({
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
console.log(`   Skipped: ${conflicts.length} conflicts`);
console.log(`   New total: ${finalData.length}\n`);

const finalW7F2 = finalData.filter(v => v.booth === '2');
console.log('════════════════════════════════════════════════════════');
console.log('Final W7F2 Status');
console.log('════════════════════════════════════════════════════════\n');
console.log(`  Total W7F2 voters: ${finalW7F2.length}`);
console.log(`  Expected: 861`);
console.log(`  Still missing: ${861 - finalW7F2.length}`);

// Find which serials are still missing
const finalSerials = finalW7F2.map(v => v.serial).sort((a, b) => a - b);
const stillMissing = [];
for (let i = 1; i <= 861; i++) {
  if (!finalSerials.includes(i)) stillMissing.push(i);
}

if (stillMissing.length > 0) {
  console.log(`\n  Missing serial ranges (${stillMissing.length} total):`);
  
  // Group into ranges
  const ranges = [];
  let start = stillMissing[0];
  let end = stillMissing[0];
  
  for (let i = 1; i < stillMissing.length; i++) {
    if (stillMissing[i] === end + 1) {
      end = stillMissing[i];
    } else {
      ranges.push({start, end, count: end - start + 1});
      start = stillMissing[i];
      end = stillMissing[i];
    }
  }
  ranges.push({start, end, count: end - start + 1});
  
  ranges.forEach(r => {
    if (r.start === r.end) {
      console.log(`    Serial ${r.start}`);
    } else {
      console.log(`    Serials ${r.start}-${r.end} (${r.count} serials)`);
    }
  });
}

// Check for duplicates in final data
const voterIdCheck = {};
finalW7F2.forEach(v => {
  if (!voterIdCheck[v.voterId]) voterIdCheck[v.voterId] = [];
  voterIdCheck[v.voterId].push(v.serial);
});
const dupes = Object.keys(voterIdCheck).filter(id => voterIdCheck[id].length > 1);

console.log(`\n  Duplicate voter IDs: ${dupes.length}`);
if (dupes.length > 0 && dupes.length <= 5) {
  dupes.forEach(id => {
    console.log(`    ${id}: serials ${voterIdCheck[id].join(', ')}`);
  });
}

console.log('\n🎉 Import complete!');
console.log('════════════════════════════════════════════════════════\n');
