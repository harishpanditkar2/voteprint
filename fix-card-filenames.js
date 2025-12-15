const fs = require('fs');
const path = require('path');

console.log('=== Fixing Card Image Filenames and Serial Numbers ===\n');

// Read voters
const voters = JSON.parse(fs.readFileSync('public/data/voters.json', 'utf8'));
const ward7 = voters.filter(v => v.actualWard === '7' || v.expectedWard === '7');

// Identify cards needing rename
const needsRename = [];
const ward7CardsDir = 'public/voter-cards/';

ward7.forEach(v => {
  if (!v.cardImage) return;
  
  // Check if serial is missing from filename
  if (v.cardImage.includes('_sn_page')) {
    // Expected filename
    const expectedFilename = `voter_${v.voterId}_sn${v.serialNumber}_page${v.pageNumber}.jpg`;
    const expectedPath = `/voter-cards/${expectedFilename}`;
    
    needsRename.push({
      voterId: v.voterId,
      name: v.name || '(blank)',
      currentPath: v.cardImage,
      expectedPath: expectedPath,
      serialNumber: v.serialNumber,
      pageNumber: v.pageNumber,
      fileRef: v.fileReference
    });
  }
});

console.log(`Found ${needsRename.length} cards needing rename\n`);

// Show samples
console.log('Sample cards needing rename:');
needsRename.slice(0, 10).forEach(c => {
  console.log(`\nSerial ${c.serialNumber} (${c.fileRef}):`);
  console.log(`  Current: ${c.currentPath}`);
  console.log(`  Expected: ${c.expectedPath}`);
});

// Create rename script
console.log('\n\n=== Creating Rename Script ===\n');

const renameScript = needsRename.map(c => {
  const currentFile = `public${c.currentPath}`;
  const expectedFile = `public${c.expectedPath}`;
  return {
    current: currentFile,
    expected: expectedFile,
    voterId: c.voterId,
    serial: c.serialNumber
  };
});

// Save rename plan
fs.writeFileSync('card-rename-plan.json', JSON.stringify({
  totalRenames: renameScript.length,
  renames: renameScript
}, null, 2));

console.log(`✓ Rename plan saved to: card-rename-plan.json`);
console.log(`  Total files to rename: ${renameScript.length}`);

// Execute renames
console.log('\n=== Executing Renames ===\n');

let renamed = 0;
let errors = [];

renameScript.forEach((r, i) => {
  try {
    if (fs.existsSync(r.current)) {
      fs.renameSync(r.current, r.expected);
      renamed++;
      if ((i + 1) % 100 === 0) {
        console.log(`Renamed ${i + 1} / ${renameScript.length} files...`);
      }
    } else {
      errors.push({ file: r.current, error: 'File not found' });
    }
  } catch (err) {
    errors.push({ file: r.current, error: err.message });
  }
});

console.log(`\n✓ Renamed ${renamed} card image files`);

if (errors.length > 0) {
  console.log(`✗ ${errors.length} errors occurred`);
  fs.writeFileSync('card-rename-errors.json', JSON.stringify(errors, null, 2));
}

// Update database
console.log('\n=== Updating Database ===\n');

// Create backup
fs.copyFileSync('public/data/voters.json', 'public/data/voters.json.backup-before-card-rename');
console.log('✓ Backup created: voters.json.backup-before-card-rename');

// Update cardImage paths
let updated = 0;
voters.forEach(v => {
  if (v.actualWard === '7' || v.expectedWard === '7') {
    if (v.cardImage && v.cardImage.includes('_sn_page')) {
      const newPath = `/voter-cards/voter_${v.voterId}_sn${v.serialNumber}_page${v.pageNumber}.jpg`;
      v.cardImage = newPath;
      updated++;
    }
  }
});

// Save updated database
fs.writeFileSync('public/data/voters.json', JSON.stringify(voters, null, 2));
console.log(`✓ Updated ${updated} card image paths in database`);

console.log('\n=== COMPLETE ===');
console.log('Card image filenames and database paths have been fixed!');
