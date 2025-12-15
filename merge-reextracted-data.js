const fs = require('fs');
const path = require('path');

console.log('=== Merge Reextracted Data with Database ===\n');

const OUTPUT_DIR = 'ward7-reextraction-output';
const REEXTRACTED_FILE = path.join(OUTPUT_DIR, 'reextracted-voters.json');

if (!fs.existsSync(REEXTRACTED_FILE)) {
  console.error('Error: Reextracted file not found. Run assign-serial-numbers.js first');
  process.exit(1);
}

// Read data
const reextractedVoters = JSON.parse(fs.readFileSync(REEXTRACTED_FILE, 'utf8'));
const voters = JSON.parse(fs.readFileSync('public/data/voters.json', 'utf8'));

console.log('Reextracted voters:', reextractedVoters.length);
console.log('Current database voters:', voters.length);
console.log('');

// Create backup
const backupPath = `public/data/voters.json.backup-before-reextraction-${Date.now()}`;
fs.copyFileSync('public/data/voters.json', backupPath);
console.log('✓ Backup created:', backupPath);
console.log('');

// Remove all existing Ward 7 voters
const nonWard7Voters = voters.filter(v => v.actualWard !== '7' && v.expectedWard !== '7');
console.log('Removing existing Ward 7 voters from database...');
console.log(`  Keeping ${nonWard7Voters.length} non-Ward 7 voters`);
console.log(`  Removing ${voters.length - nonWard7Voters.length} Ward 7 voters`);
console.log('');

// Merge reextracted Ward 7 data with non-Ward 7 voters
const mergedVoters = [...nonWard7Voters, ...reextractedVoters];

console.log('Merged database size:', mergedVoters.length);
console.log('');

// Sort by ward and serial for consistency
mergedVoters.sort((a, b) => {
  const wardA = parseInt(a.actualWard || a.expectedWard || a.ward || 0);
  const wardB = parseInt(b.actualWard || b.expectedWard || b.ward || 0);
  if (wardA !== wardB) return wardA - wardB;
  
  const serialA = parseInt(a.serialNumber || 0);
  const serialB = parseInt(b.serialNumber || 0);
  return serialA - serialB;
});

// Save merged database
fs.writeFileSync('public/data/voters.json', JSON.stringify(mergedVoters, null, 2));
console.log('✓ Database updated successfully!');
console.log('');

// Generate summary report
const ward7Final = mergedVoters.filter(v => v.actualWard === '7');
const byFile = { W7F1: [], W7F2: [], W7F3: [] };
ward7Final.forEach(v => {
  if (v.fileReference && byFile[v.fileReference]) {
    byFile[v.fileReference].push(v);
  }
});

console.log('=== Final Ward 7 Statistics ===');
console.log(`Total Ward 7 voters: ${ward7Final.length}`);
console.log('');
console.log('By file:');
Object.entries(byFile).forEach(([ref, voters]) => {
  const withData = voters.filter(v => v.name && v.voterId);
  const needsManual = voters.filter(v => v.pendingManualEntry);
  console.log(`  ${ref}: ${voters.length} total`);
  console.log(`    Complete: ${withData.length}`);
  console.log(`    Needs manual entry: ${needsManual.length}`);
});
console.log('');

// Data quality summary
const completeRecords = ward7Final.filter(v => v.voterId && v.name && v.age && v.gender);
const missingName = ward7Final.filter(v => v.voterId && !v.name);
const missingId = ward7Final.filter(v => !v.voterId && v.name);
const completelyBlank = ward7Final.filter(v => !v.voterId && !v.name);

console.log('Data Quality:');
console.log(`  Complete records: ${completeRecords.length} (${((completeRecords.length/ward7Final.length)*100).toFixed(1)}%)`);
console.log(`  Missing name: ${missingName.length}`);
console.log(`  Missing voter ID: ${missingId.length}`);
console.log(`  Blank (OCR failed): ${completelyBlank.length}`);
console.log('');

// Serial number validation
console.log('=== Serial Number Validation ===');
Object.entries(byFile).forEach(([ref, voters]) => {
  const serials = voters.map(v => parseInt(v.serialNumber)).sort((a,b) => a-b);
  const min = Math.min(...serials);
  const max = Math.max(...serials);
  const expected = voters.length;
  const gaps = [];
  
  for (let i = 1; i <= expected; i++) {
    if (!serials.includes(i)) {
      gaps.push(i);
    }
  }
  
  console.log(`${ref}: Serials ${min}-${max}`);
  if (gaps.length > 0) {
    console.log(`  ⚠ ${gaps.length} gaps: ${gaps.slice(0, 10).join(', ')}${gaps.length > 10 ? '...' : ''}`);
  } else {
    console.log(`  ✓ No gaps, continuous sequence`);
  }
});
console.log('');

// Save detailed report
const report = {
  timestamp: new Date().toISOString(),
  totalVoters: mergedVoters.length,
  ward7Voters: ward7Final.length,
  byFile: {
    W7F1: byFile.W7F1.length,
    W7F2: byFile.W7F2.length,
    W7F3: byFile.W7F3.length
  },
  dataQuality: {
    completeRecords: completeRecords.length,
    missingName: missingName.length,
    missingId: missingId.length,
    blank: completelyBlank.length
  },
  needsManualEntry: ward7Final.filter(v => v.pendingManualEntry).map(v => ({
    serial: v.uniqueSerial,
    voterId: v.voterId || 'MISSING',
    name: v.name || 'MISSING',
    page: v.pageNumber
  }))
};

fs.writeFileSync(
  path.join(OUTPUT_DIR, 'merge-report.json'),
  JSON.stringify(report, null, 2)
);

console.log('✓ Detailed report saved to:', path.join(OUTPUT_DIR, 'merge-report.json'));
console.log('');
console.log('=== COMPLETE ===');
console.log('Ward 7 data has been completely reextracted and merged!');
console.log('');
console.log('Refresh your browser to see the updated data.');
console.log('Voters needing manual entry are marked with pendingManualEntry: true');
