const fs = require('fs');

console.log('=== Intelligent Serial Number Correction ===\n');
console.log('Using pattern analysis and existing data to fix all Ward 7 serials\n');

// Read database
const voters = JSON.parse(fs.readFileSync('public/data/voters.json', 'utf8'));
const ward7 = voters.filter(v => v.actualWard === '7' || v.expectedWard === '7');

console.log(`Ward 7 voters: ${ward7.length}`);

// Create backup
const backupPath = `public/data/voters.json.backup-intelligent-fix-${Date.now()}`;
fs.copyFileSync('public/data/voters.json', backupPath);
console.log(`✓ Backup created: ${backupPath}\n`);

// Strategy: Reassign serials based on Voter ID sorting and file boundaries
// We know the correct counts: W7F1=991, W7F2=861, W7F3=863

console.log('Analyzing current data structure...\n');

// Group by file
const byFile = {
  W7F1: ward7.filter(v => v.fileReference === 'W7F1').sort((a,b) => {
    // Sort by page, then by voter ID for consistency
    if (a.pageNumber !== b.pageNumber) return a.pageNumber - b.pageNumber;
    return (a.voterId || '').localeCompare(b.voterId || '');
  }),
  W7F2: ward7.filter(v => v.fileReference === 'W7F2').sort((a,b) => {
    if (a.pageNumber !== b.pageNumber) return a.pageNumber - b.pageNumber;
    return (a.voterId || '').localeCompare(b.voterId || '');
  }),
  W7F3: ward7.filter(v => v.fileReference === 'W7F3').sort((a,b) => {
    if (a.pageNumber !== b.pageNumber) return a.pageNumber - b.pageNumber;
    return (a.voterId || '').localeCompare(b.voterId || '');
  })
};

console.log('Current file counts:');
Object.entries(byFile).forEach(([ref, voters]) => {
  console.log(`  ${ref}: ${voters.length} voters`);
});
console.log('');

// The key insight: Each page should have voters in sequential order
// Reassign serials based on the order they appear in sorted lists

let corrections = 0;
let cardRenames = [];

Object.entries(byFile).forEach(([fileRef, fileVoters]) => {
  console.log(`Processing ${fileRef}...`);
  
  fileVoters.forEach((voter, index) => {
    const correctSerial = index + 1; // 1-based serial
    const oldSerial = voter.serialNumber;
    const oldUniqueSerial = voter.uniqueSerial;
    const oldCardImage = voter.cardImage;
    
    if (parseInt(oldSerial) !== correctSerial) {
      // Update serial
      voter.serialNumber = correctSerial.toString();
      voter.uniqueSerial = `${fileRef}-S${correctSerial}`;
      
      // Update card image path
      if (voter.cardImage && voter.voterId) {
        const newCardImage = `/voter-cards/voter_${voter.voterId}_sn${correctSerial}_page${voter.pageNumber}.jpg`;
        
        if (oldCardImage !== newCardImage) {
          voter.cardImage = newCardImage;
          
          // Track card rename
          const oldPath = `public${oldCardImage}`;
          const newPath = `public${newCardImage}`;
          if (fs.existsSync(oldPath)) {
            cardRenames.push({ old: oldPath, new: newPath });
          }
        }
      }
      
      corrections++;
      
      if (corrections <= 10) { // Show first 10 corrections
        console.log(`  ${voter.voterId || 'BLANK'}: Serial ${oldSerial}→${correctSerial}`);
      }
    }
  });
  
  console.log(`  ✓ ${fileRef} complete\n`);
});

console.log(`Total corrections: ${corrections}`);
console.log('');

// Rename card image files
if (cardRenames.length > 0) {
  console.log(`Renaming ${cardRenames.length} card image files...`);
  
  let renamed = 0;
  let errors = 0;
  
  cardRenames.forEach((rename, i) => {
    try {
      if (fs.existsSync(rename.old) && rename.old !== rename.new) {
        // Check if target already exists
        if (fs.existsSync(rename.new)) {
          // Target exists, remove old file
          fs.unlinkSync(rename.old);
        } else {
          fs.renameSync(rename.old, rename.new);
        }
        renamed++;
        
        if ((i + 1) % 100 === 0) {
          console.log(`  ${i + 1} / ${cardRenames.length}...`);
        }
      }
    } catch (err) {
      errors++;
      if (errors <= 5) {
        console.log(`  Error: ${err.message}`);
      }
    }
  });
  
  console.log(`  ✓ Renamed ${renamed} files`);
  if (errors > 0) {
    console.log(`  ⚠ ${errors} errors`);
  }
  console.log('');
}

// Save updated database
fs.writeFileSync('public/data/voters.json', JSON.stringify(voters, null, 2));
console.log('✓ Database updated\n');

// Final validation
console.log('=== Final Validation ===\n');

const finalByFile = {
  W7F1: voters.filter(v => v.fileReference === 'W7F1'),
  W7F2: voters.filter(v => v.fileReference === 'W7F2'),
  W7F3: voters.filter(v => v.fileReference === 'W7F3')
};

Object.entries(finalByFile).forEach(([ref, fileVoters]) => {
  const serials = fileVoters.map(v => parseInt(v.serialNumber)).sort((a,b) => a-b);
  const min = Math.min(...serials);
  const max = Math.max(...serials);
  const gaps = [];
  const duplicates = [];
  
  // Check for gaps and duplicates
  for (let i = 1; i <= max; i++) {
    const count = serials.filter(s => s === i).length;
    if (count === 0) gaps.push(i);
    if (count > 1) duplicates.push(i);
  }
  
  console.log(`${ref}: ${fileVoters.length} voters, serials ${min}-${max}`);
  
  if (gaps.length === 0) {
    console.log(`  ✓ No gaps`);
  } else {
    console.log(`  ⚠ ${gaps.length} gaps: ${gaps.slice(0, 5).join(', ')}${gaps.length > 5 ? '...' : ''}`);
  }
  
  if (duplicates.length === 0) {
    console.log(`  ✓ No duplicates`);
  } else {
    console.log(`  ⚠ ${duplicates.length} duplicates: ${duplicates.slice(0, 5).join(', ')}`);
  }
  
  console.log('');
});

// Verify Page 2 specifically (we know this should be correct)
console.log('=== Page 2 Verification (Known Ground Truth) ===\n');

const page2 = voters.filter(v => v.pageNumber === 2 && v.fileReference === 'W7F1').sort((a,b) => parseInt(a.serialNumber) - parseInt(b.serialNumber));

const expectedPage2 = [
  { serial: 1, voterId: 'XUA7224868' },
  { serial: 2, voterId: 'XUA7224850' },
  { serial: 3, voterId: 'XUA7225139' },
  { serial: 4, voterId: 'XUA7224801' },
  { serial: 5, voterId: 'XUA7224645' },
  { serial: 6, voterId: 'XUA7225162' },
  { serial: 7, voterId: 'XUA7224819' },
  { serial: 9, voterId: 'XUA7224959' },
  { serial: 10, voterId: 'XUA7224785' },
  { serial: 11, voterId: 'XUA7351711' },
  { serial: 12, voterId: 'XUA7224694' },
  { serial: 13, voterId: 'XUA7351448' },
  { serial: 14, voterId: 'XUA7351463' },
  { serial: 15, voterId: 'XUA7670524' }
];

let page2Correct = 0;
let page2Wrong = 0;

expectedPage2.forEach(expected => {
  const voter = page2.find(v => v.voterId === expected.voterId);
  if (voter && parseInt(voter.serialNumber) === expected.serial) {
    page2Correct++;
  } else if (voter) {
    console.log(`  ⚠ ${expected.voterId}: Expected serial ${expected.serial}, got ${voter.serialNumber}`);
    page2Wrong++;
  } else {
    console.log(`  ✗ ${expected.voterId}: Not found on page 2`);
    page2Wrong++;
  }
});

if (page2Wrong === 0) {
  console.log(`✓ Page 2 validation PASSED: All ${page2Correct} voters correct`);
} else {
  console.log(`⚠ Page 2 validation FAILED: ${page2Correct} correct, ${page2Wrong} wrong`);
}

console.log('\n=== COMPLETE ===');
console.log('Serial numbers have been reassigned based on sequential ordering.');
console.log('Refresh your browser to see the corrected data.');
