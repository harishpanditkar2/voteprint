const fs = require('fs');

console.log('🔧 Fixing Data Issues...\n');

// Read current database
let voters = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf-8'));

// Backup
const backupPath = `voters-backup-before-fixes-${Date.now()}.json`;
fs.writeFileSync(backupPath, JSON.stringify(voters, null, 2));
console.log(`✅ Backup created: ${backupPath}\n`);

// Fix 1: Remove duplicate voter IDs in W7F1 (304-306)
console.log('🔍 Checking W7F1 duplicates...');
const w7f1Duplicates = ['CRM2062461', 'CRM2062453', 'CRM2063691'];
const w7f1 = voters.filter(v => v.ward === '7' && v.booth === '1');

w7f1Duplicates.forEach(id => {
  const matching = w7f1.filter(v => v.voterId === id);
  if (matching.length > 1) {
    console.log(`  Found ${matching.length} voters with ID ${id}:`);
    matching.forEach((v, idx) => {
      console.log(`    ${idx + 1}. Serial ${v.serial}: ${v.name}`);
    });
    
    // Keep the one with higher serial number (newer)
    const toRemove = matching.slice(0, -1);
    console.log(`  → Removing ${toRemove.length} duplicate(s), keeping serial ${matching[matching.length-1].serial}`);
    voters = voters.filter(v => !toRemove.some(r => r.serial === v.serial && r.ward === v.ward && r.booth === v.booth));
  }
});

// Fix 2: Handle W7F2 duplicates - keep first occurrence
console.log('\n🔍 Checking W7F2 duplicates...');
const w7f2 = voters.filter(v => v.ward === '7' && v.booth === '2');
const w7f2IdMap = {};
w7f2.forEach(v => {
  if (!w7f2IdMap[v.voterId]) {
    w7f2IdMap[v.voterId] = [];
  }
  w7f2IdMap[v.voterId].push(v);
});

const w7f2Duplicates = Object.entries(w7f2IdMap).filter(([id, list]) => list.length > 1);
console.log(`Found ${w7f2Duplicates.length} duplicate voter IDs in W7F2`);

let removedCount = 0;
w7f2Duplicates.forEach(([id, list]) => {
  // Keep first occurrence, remove rest
  const toRemove = list.slice(1);
  voters = voters.filter(v => !toRemove.some(r => r.serial === v.serial && r.ward === v.ward && r.booth === v.booth));
  removedCount += toRemove.length;
});
console.log(`  → Removed ${removedCount} duplicate voters from W7F2`);

// Fix 3: Parse ages from W7F3.txt for missing ages
console.log('\n🔍 Fixing W7F3 missing ages...');
const w7f3Text = fs.readFileSync('./pdflist/W7F3.txt', 'utf-8');
const w7f3 = voters.filter(v => v.ward === '7' && v.booth === '3');

// Simple age extraction from text
let fixedAges = 0;
w7f3.forEach(voter => {
  if (!voter.age || voter.age === 'N/A') {
    // Try to find this voter's data in the text
    const idPattern = new RegExp(voter.voterId + '[^\\n]*\\n[^\\n]*\\n[^\\n]*वय[^\\n]*:(\\d+)', 'i');
    const match = w7f3Text.match(idPattern);
    
    if (match && match[1]) {
      const age = match[1].trim();
      const voterIndex = voters.findIndex(v => v.voterId === voter.voterId && v.ward === '7' && v.booth === '3');
      if (voterIndex >= 0) {
        voters[voterIndex].age = age;
        fixedAges++;
      }
    }
  }
});

console.log(`  → Fixed ${fixedAges} missing ages in W7F3`);

// Save updated database
fs.writeFileSync('./public/data/voters.json', JSON.stringify(voters, null, 2));

// Final stats
const finalW7f1 = voters.filter(v => v.ward === '7' && v.booth === '1').length;
const finalW7f2 = voters.filter(v => v.ward === '7' && v.booth === '2').length;
const finalW7f3 = voters.filter(v => v.ward === '7' && v.booth === '3').length;

console.log('\n✅ Fixes Applied!');
console.log(`\nFinal Count:`);
console.log(`W7F1: ${finalW7f1} voters`);
console.log(`W7F2: ${finalW7f2} voters`);
console.log(`W7F3: ${finalW7f3} voters`);
console.log(`Total: ${voters.length} voters`);
