const fs = require('fs');
const path = require('path');

console.log('=== Ward 7 Serial Number Correction Script ===\n');

// Read database
const voters = JSON.parse(fs.readFileSync('public/data/voters.json', 'utf8'));

// Ground truth data from screenshot (Page 2 = actual page 2 in PDF)
// This maps Voter IDs to their CORRECT serial numbers as shown in PDF
const correctMappings = {
  // Page 2 serials 1-15 (from screenshot)
  'XUA7224868': { serial: 1, page: 2, file: 'W7F1' },
  'XUA7224850': { serial: 2, page: 2, file: 'W7F1' },
  'XUA7225139': { serial: 3, page: 2, file: 'W7F1' },
  'XUA7224801': { serial: 4, page: 2, file: 'W7F1' },
  'XUA7224645': { serial: 5, page: 2, file: 'W7F1' },  // Currently WRONG: 146
  'XUA7225162': { serial: 6, page: 2, file: 'W7F1' },
  'XUA7224819': { serial: 7, page: 2, file: 'W7F1' },
  'XUA7224942': { serial: 8, page: 2, file: 'W7F1' },  // MISSING in DB
  'XUA7224959': { serial: 9, page: 2, file: 'W7F1' },  // Currently WRONG: 8
  'XUA7224785': { serial: 10, page: 2, file: 'W7F1' }, // Currently WRONG: 9
  'XUA7351711': { serial: 11, page: 2, file: 'W7F1' }, // Currently WRONG: 152
  'XUA7224694': { serial: 12, page: 2, file: 'W7F1' }, // Currently WRONG: 153
  'XUA7351448': { serial: 13, page: 2, file: 'W7F1' }, // Currently WRONG: 12
  'XUA7351463': { serial: 14, page: 2, file: 'W7F1' }, // Currently WRONG: 155
  'XUA7670524': { serial: 15, page: 2, file: 'W7F1' }  // Currently WRONG: 156
};

console.log('Correcting serial numbers based on screenshot verification...\n');

// Create backup
const backupPath = `public/data/voters.json.backup-before-serial-fix-${Date.now()}`;
fs.copyFileSync('public/data/voters.json', backupPath);
console.log(`✓ Backup created: ${backupPath}\n`);

// Track changes
const corrections = [];
let corrected = 0;
let alreadyCorrect = 0;
let missing = 0;

// Apply corrections
Object.entries(correctMappings).forEach(([voterId, correctData]) => {
  const voter = voters.find(v => v.voterId === voterId);
  
  if (!voter) {
    console.log(`✗ Voter ${voterId} MISSING from database (Serial ${correctData.serial})`);
    missing++;
    corrections.push({
      voterId,
      status: 'MISSING',
      correctSerial: correctData.serial,
      correctPage: correctData.page
    });
    return;
  }
  
  const oldSerial = voter.serialNumber;
  const oldPage = voter.pageNumber;
  const oldUniqueSerial = voter.uniqueSerial;
  
  if (oldSerial == correctData.serial && oldPage == correctData.page) {
    console.log(`✓ ${voterId}: Serial ${oldSerial} already correct`);
    alreadyCorrect++;
    return;
  }
  
  // Apply correction
  voter.serialNumber = correctData.serial.toString();
  voter.pageNumber = correctData.page;
  voter.fileReference = correctData.file;
  voter.uniqueSerial = `${correctData.file}-S${correctData.serial}`;
  
  // Update card image path
  if (voter.cardImage) {
    const oldCardImage = voter.cardImage;
    const newCardImage = `/voter-cards/voter_${voterId}_sn${correctData.serial}_page${correctData.page}.jpg`;
    voter.cardImage = newCardImage;
    
    // Rename actual file if it exists
    const oldPath = `public${oldCardImage}`;
    const newPath = `public${newCardImage}`;
    
    if (fs.existsSync(oldPath) && oldPath !== newPath) {
      try {
        fs.renameSync(oldPath, newPath);
        console.log(`  → Renamed card image: ${path.basename(oldCardImage)} → ${path.basename(newCardImage)}`);
      } catch (err) {
        if (!fs.existsSync(newPath)) {
          console.log(`  ⚠ Failed to rename card: ${err.message}`);
        }
      }
    }
  }
  
  console.log(`✓ ${voterId}: Serial ${oldSerial}→${correctData.serial}, Page ${oldPage}→${correctData.page}, uniqueSerial ${oldUniqueSerial}→${voter.uniqueSerial}`);
  corrected++;
  
  corrections.push({
    voterId,
    status: 'CORRECTED',
    oldSerial: oldSerial,
    newSerial: correctData.serial,
    oldPage: oldPage,
    newPage: correctData.page,
    oldUniqueSerial: oldUniqueSerial,
    newUniqueSerial: voter.uniqueSerial
  });
});

console.log('\n=== Correction Summary ===');
console.log(`Total voters checked: ${Object.keys(correctMappings).length}`);
console.log(`Already correct: ${alreadyCorrect}`);
console.log(`Corrected: ${corrected}`);
console.log(`Missing from DB: ${missing}`);

// Save corrected database
fs.writeFileSync('public/data/voters.json', JSON.stringify(voters, null, 2));
console.log('\n✓ Database updated with corrected serial numbers');

// Save correction report
fs.writeFileSync('serial-corrections-applied.json', JSON.stringify({
  timestamp: new Date().toISOString(),
  summary: {
    totalChecked: Object.keys(correctMappings).length,
    alreadyCorrect,
    corrected,
    missing
  },
  corrections
}, null, 2));
console.log('✓ Correction report saved: serial-corrections-applied.json');

// Add missing voter if needed
if (missing > 0) {
  console.log('\n⚠ WARNING: 1 voter is missing from database!');
  console.log('Missing Voter ID: XUA7224942 (Serial 8, Page 2)');
  console.log('This voter needs to be manually added from the PDF/OCR image');
}

console.log('\n=== NEXT STEPS ===');
console.log('1. Verify corrections by checking Page 2 in UI');
console.log('2. Apply same correction method to remaining pages');
console.log('3. Add missing voter XUA7224942');
console.log('4. Re-run full Ward 7 verification');
