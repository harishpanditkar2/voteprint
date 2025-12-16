const fs = require('fs');

console.log('📋 Importing W7F3 (Booth 3) Voters');
console.log('════════════════════════════════════════════════════════\n');

// Read the W7F3.txt file
const fileContent = fs.readFileSync('./pdflist/W7F3.txt', 'utf8');
const lines = fileContent.split('\n');

console.log(`Read ${lines.length} lines from W7F3.txt\n`);

// Parse voters
const voters = [];
let currentBlock = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  // Look for voter ID pattern: serial number, voter ID, part number
  if (/^\d+\s+[A-Z]{3}[A-B]?\d{7}\s+\d{3}\/\d{3}\/\d{3}/.test(line)) {
    // Process previous block if it exists
    if (currentBlock.length > 0) {
      const voter = parseBlock(currentBlock);
      if (voter) voters.push(voter);
    }
    
    // Start new block
    currentBlock = [line];
  } else if (currentBlock.length > 0) {
    // Add line to current block
    currentBlock.push(line);
    
    // If we have age/gender line, block is complete
    if (line.includes('वय :') && line.includes('लिंग :')) {
      const voter = parseBlock(currentBlock);
      if (voter) voters.push(voter);
      currentBlock = [];
    }
  }
}

// Process last block
if (currentBlock.length > 0) {
  const voter = parseBlock(currentBlock);
  if (voter) voters.push(voter);
}

console.log(`Parsed ${voters.length} voters from W7F3\n`);

function parseBlock(lines) {
  const firstLine = lines[0];
  const match = firstLine.match(/^(\d+)\s+([A-Z]{3}[A-B]?\d{7})\s+(\d{3}\/\d{3}\/\d{3})/);
  
  if (!match) return null;
  
  const serial = parseInt(match[1]);
  const voterId = match[2];
  const partNumber = match[3];
  
  let name = '';
  let relation = '';
  let house = '';
  let age = '';
  let gender = '';
  
  for (const line of lines) {
    if (line.includes('मतदाराचे पूर्ण') && line.includes(':')) {
      const parts = line.split(':');
      if (parts.length > 1) {
        name = parts[1].split('मतदाराचे')[0].split('नांव')[0].trim();
      }
    } else if ((line.includes('वडिलांचे नाव') || line.includes('पतीचे नाव') || line.includes('इतर') || line.includes('आईचे नाव')) && line.includes(':')) {
      const parts = line.split(':');
      if (parts.length > 1) {
        relation = parts[1].split(/[oo०5५e।॥\|]/)[0].trim();
      }
    } else if (line.includes('घर क्रमांक') && line.includes(':')) {
      const parts = line.split(':');
      if (parts.length > 1) {
        house = parts[1].split(/[eo।॥\|पडि]/)[0].trim() || '-';
      }
    } else if (line.includes('वय') && line.includes('लिंग')) {
      const ageMatch = line.match(/वय\s*[:：]\s*(\d+|R|0)/);
      const genderMatch = line.match(/लिंग\s*[:：]\s*(पु|स्री|खरी|ख्री|it)/);
      
      if (ageMatch) age = ageMatch[1] === 'R' || ageMatch[1] === '0' ? '18' : ageMatch[1];
      if (genderMatch) {
        const g = genderMatch[1];
        gender = (g === 'पु') ? 'M' : 'F';
      }
    }
  }
  
  if (!voterId || !name || !age || !gender) return null;
  
  return {
    serial,
    voterId,
    name,
    age,
    gender,
    relation: relation || 'NA',
    house: house || '-',
    partNumber
  };
}

// Load current database
const data = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf8'));
const currentW7F3 = data.filter(v => v.booth === '3');
const existingSerials = new Set(currentW7F3.map(v => v.serial));
const existingVoterIds = new Set(data.map(v => v.voterId));

console.log('Current database:');
console.log(`  Total voters: ${data.length}`);
console.log(`  W7F1 (Booth 1): ${data.filter(v => v.booth === '1').length}`);
console.log(`  W7F2 (Booth 2): ${data.filter(v => v.booth === '2').length}`);
console.log(`  W7F3 (Booth 3): ${currentW7F3.length}\n`);

// Filter voters to add
const newVoters = voters.filter(v => !existingSerials.has(v.serial));
const safeToAdd = newVoters.filter(v => !existingVoterIds.has(v.voterId));
const conflicts = newVoters.filter(v => existingVoterIds.has(v.voterId));

console.log(`Voters from W7F3.txt: ${voters.length}`);
console.log(`  New (not in DB): ${newVoters.length}`);
console.log(`  Safe to add: ${safeToAdd.length}`);
console.log(`  ID conflicts: ${conflicts.length}\n`);

if (conflicts.length > 0) {
  console.log('⚠️  Voter ID conflicts (will be skipped):');
  conflicts.slice(0, 10).forEach(v => {
    const existing = data.find(d => d.voterId === v.voterId);
    console.log(`  ${v.voterId}:`);
    console.log(`    Booth ${existing.booth} Serial ${existing.serial}: ${existing.name}`);
    console.log(`    Booth 3 Serial ${v.serial}: ${v.name}`);
  });
  if (conflicts.length > 10) {
    console.log(`  ... and ${conflicts.length - 10} more\n`);
  }
  console.log();
}

if (safeToAdd.length === 0) {
  console.log('✅ No new voters to add\n');
  process.exit(0);
}

// Create backup
console.log('Creating backup...');
const backupFile = `./public/data/voters.json.backup-w7f3-import-${Date.now()}`;
fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
console.log(`✅ Backup: ${backupFile}\n`);

// Add W7F3 voters
const votersToAdd = safeToAdd.map(v => ({
  voterId: v.voterId,
  name: v.name,
  age: v.age,
  gender: v.gender,
  ward: '7',
  booth: '3',
  serial: v.serial,
  relation: v.relation,
  house: v.house,
  partNumber: v.partNumber,
  uniqueSerial: `W7F3-S${v.serial}`
}));

const finalData = [...data, ...votersToAdd];

// Sort
finalData.sort((a, b) => {
  if (a.ward !== b.ward) return a.ward.localeCompare(b.ward);
  if (a.booth !== b.booth) return a.booth.localeCompare(b.booth);
  return (a.serial || 0) - (b.serial || 0);
});

fs.writeFileSync('./public/data/voters.json', JSON.stringify(finalData, null, 2));

console.log('✅ Database updated');
console.log(`   Added: ${votersToAdd.length} voters`);
console.log(`   Skipped: ${conflicts.length} conflicts`);
console.log(`   New total: ${finalData.length}\n`);

console.log('════════════════════════════════════════════════════════');
console.log('FINAL DATABASE STATUS');
console.log('════════════════════════════════════════════════════════\n');

const w7f1 = finalData.filter(v => v.booth === '1');
const w7f2 = finalData.filter(v => v.booth === '2');
const w7f3 = finalData.filter(v => v.booth === '3');

console.log(`📊 Ward 7 Complete Status:`);
console.log(`  W7F1 (Booth 1): ${w7f1.length} voters`);
console.log(`  W7F2 (Booth 2): ${w7f2.length} voters`);
console.log(`  W7F3 (Booth 3): ${w7f3.length} voters`);
console.log(`  TOTAL: ${w7f1.length + w7f2.length + w7f3.length} voters\n`);

console.log(`💾 Total Database: ${finalData.length} voters\n`);

// Check for duplicates across all booths
const allVoterIds = {};
finalData.forEach(v => {
  if (!allVoterIds[v.voterId]) allVoterIds[v.voterId] = [];
  allVoterIds[v.voterId].push({booth: v.booth, serial: v.serial});
});

const dupes = Object.keys(allVoterIds).filter(id => allVoterIds[id].length > 1);
console.log(`⚠️  Duplicate Voter IDs across all booths: ${dupes.length}`);

if (dupes.length > 0 && dupes.length <= 5) {
  dupes.forEach(id => {
    console.log(`  ${id}:`);
    allVoterIds[id].forEach(v => {
      console.log(`    Booth ${v.booth} Serial ${v.serial}`);
    });
  });
}

console.log('\n🎉 W7F3 import complete!');
console.log('════════════════════════════════════════════════════════\n');
