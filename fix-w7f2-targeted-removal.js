const fs = require('fs');

console.log('🔧 W7F2 Targeted Fix - Remove Duplicate Serials 615+');
console.log('════════════════════════════════════════════════════════\n');

// Step 1: Load current database
console.log('Step 1: Loading current database...');
const data = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf8'));
console.log(`   Total voters: ${data.length}`);

const w7f1 = data.filter(v => v.booth === '1');
const w7f2 = data.filter(v => v.booth === '2');
const others = data.filter(v => v.booth !== '1' && v.booth !== '2');

console.log(`   W7F1 (Booth 1): ${w7f1.length}`);
console.log(`   W7F2 (Booth 2): ${w7f2.length}`);
console.log(`   Others: ${others.length}\n`);

// Step 2: Analyze W7F2 duplicates
console.log('Step 2: Analyzing W7F2 duplicates...');
w7f2.sort((a, b) => a.serial - b.serial);

const voterIdMap = {};
w7f2.forEach(v => {
  if (!voterIdMap[v.voterId]) voterIdMap[v.voterId] = [];
  voterIdMap[v.voterId].push(v.serial);
});

const duplicateIds = Object.keys(voterIdMap).filter(id => voterIdMap[id].length > 1);
console.log(`   Found ${duplicateIds.length} duplicate voter IDs\n`);

// Analyze duplicate pattern
const duplicatePairs = [];
duplicateIds.forEach(id => {
  const serials = voterIdMap[id].sort((a, b) => a - b);
  if (serials.length === 2) {
    const diff = serials[1] - serials[0];
    duplicatePairs.push({id, serials, diff});
  }
});

if (duplicatePairs.length > 0) {
  const diffs = duplicatePairs.map(p => p.diff);
  const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  console.log(`   Duplicate pattern: avg difference = ${avgDiff.toFixed(1)} serials`);
  console.log(`   Examples:`);
  duplicatePairs.slice(0, 5).forEach(p => {
    console.log(`     ${p.id}: serials ${p.serials[0]} and ${p.serials[1]} (diff: ${p.diff})`);
  });
  console.log();
}

// Step 3: Identify the split point
const splitAnalysis = {};
w7f2.forEach(v => {
  const isDupe = duplicateIds.includes(v.voterId);
  const range = Math.floor(v.serial / 100) * 100;
  const key = `${range}-${range + 99}`;
  if (!splitAnalysis[key]) splitAnalysis[key] = {total: 0, dupes: 0};
  splitAnalysis[key].total++;
  if (isDupe) splitAnalysis[key].dupes++;
});

console.log('Step 3: Serial range analysis:');
Object.keys(splitAnalysis).sort().forEach(range => {
  const stats = splitAnalysis[range];
  const dupePercent = (stats.dupes / stats.total * 100).toFixed(1);
  console.log(`   ${range}: ${stats.total} voters, ${stats.dupes} duplicates (${dupePercent}%)`);
});
console.log();

// Step 4: Determine safe cutoff
// Based on the bug report, serials 615-704 and 705-795 share IDs
// This means serials 705+ are the bad ones
// But we also have some earlier duplicates (280 & 338)

const safeCutoff = 614; // Keep only up to 614
const w7f2Clean = w7f2.filter(v => v.serial <= safeCutoff);
const w7f2Bad = w7f2.filter(v => v.serial > safeCutoff);

console.log(`Step 4: Splitting W7F2 at serial ${safeCutoff}:`);
console.log(`   Keep (1-${safeCutoff}): ${w7f2Clean.length} voters`);
console.log(`   Remove (${safeCutoff + 1}+): ${w7f2Bad.length} voters\n`);

// Check if clean data still has duplicates
const cleanVoterIds = {};
w7f2Clean.forEach(v => {
  cleanVoterIds[v.voterId] = (cleanVoterIds[v.voterId] || 0) + 1;
});
const cleanDupes = Object.keys(cleanVoterIds).filter(id => cleanVoterIds[id] > 1);

if (cleanDupes.length > 0) {
  console.log(`⚠️  Clean data (1-${safeCutoff}) still has ${cleanDupes.length} duplicates:`);
  cleanDupes.forEach(id => {
    const voters = w7f2Clean.filter(v => v.voterId === id);
    console.log(`   ${id}: serials ${voters.map(v => v.serial).join(', ')}`);
  });
  console.log();
}

// Step 5: Create backup
console.log('Step 5: Creating backup...');
const backupFile = `./public/data/voters.json.backup-targeted-fix-${Date.now()}`;
fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
console.log(`✅ Backup: ${backupFile}\n`);

// Step 6: Save cleaned database
console.log('Step 6: Saving cleaned database...');
const cleanData = [...w7f1, ...w7f2Clean, ...others];
cleanData.sort((a, b) => {
  if (a.booth !== b.booth) return a.booth.localeCompare(b.booth);
  return (a.serial || 0) - (b.serial || 0);
});

fs.writeFileSync('./public/data/voters.json', JSON.stringify(cleanData, null, 2));
console.log(`✅ Database saved`);
console.log(`   Total voters: ${cleanData.length}`);
console.log(`   W7F1: ${w7f1.length}`);
console.log(`   W7F2: ${w7f2Clean.length} (was ${w7f2.length})`);
console.log(`   Removed: ${w7f2Bad.length} voters\n`);

// Step 7: Summary and next steps
console.log('════════════════════════════════════════════════════════');
console.log('✅ FIX COMPLETE - Database Cleaned');
console.log('════════════════════════════════════════════════════════\n');

console.log('Current State:');
console.log(`  • W7F1 (Booth 1): ${w7f1.length} voters ✅ COMPLETE`);
console.log(`  • W7F2 (Booth 2): ${w7f2Clean.length} voters (serials 1-${safeCutoff})`);
console.log(`  • Missing: Serials ${safeCutoff + 1}-861 (${861 - safeCutoff} voters)\n`);

if (cleanDupes.length > 0) {
  console.log(`⚠️  Remaining Issues:`);
  console.log(`  • ${cleanDupes.length} duplicate voter IDs in serials 1-${safeCutoff}`);
  console.log(`  • These need manual review\n`);
}

console.log('Next Steps:');
console.log(`  1. Extract correct data for serials ${safeCutoff + 1}-861 from OCR`);
console.log(`  2. The OCR data is in: ward7-w7f2-output/*.txt`);
console.log(`  3. Use a proper parser for the 3-column OCR format`);
console.log(`  4. Add the missing ${861 - safeCutoff} voters back to database\n`);

console.log('Files to use:');
console.log(`  • ward7-w7f2-output/page019.txt - Contains serials ~688-720`);
console.log(`  • ward7-w7f2-output/page020.txt - Contains serials ~721-760`);
console.log(`  • ward7-w7f2-output/page021.txt - Contains serials ~761-800`);
console.log(`  • ward7-w7f2-output/page022.txt - Contains serials ~801-861\n`);

console.log('════════════════════════════════════════════════════════');
