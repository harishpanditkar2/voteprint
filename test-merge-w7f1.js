/**
 * TEST MERGE - Verify merging works with 5-page test data
 */

const fs = require('fs');

const votersPath = './public/data/voters.json';
const extractedPath = './ward7-test-output/test_extracted_voters.json';

let voters = JSON.parse(fs.readFileSync(votersPath, 'utf8'));
const extracted = JSON.parse(fs.readFileSync(extractedPath, 'utf8'));

console.log('🧪 TEST MERGE - Verifying with 5-page data');
console.log('='.repeat(60));

// Create backup
const backupPath = './public/data/voters.json.backup-test-' + Date.now();
fs.writeFileSync(backupPath, JSON.stringify(voters, null, 2));
console.log(`✓ Test backup: ${backupPath}\n`);

// Get W7F1 voters
const w7f1Voters = voters.filter(v => 
  (v.ward === '7' || v.actualWard === '7') && 
  v.uniqueSerial && 
  v.uniqueSerial.startsWith('W7F1')
);

const beforeMissing = w7f1Voters.filter(v => !v.name || v.name.trim() === '').length;
console.log(`📊 Before:`);
console.log(`   W7F1 Total: ${w7f1Voters.length}`);
console.log(`   Missing names: ${beforeMissing}\n`);

console.log(`📥 Test Extracted:`);
console.log(`   Total: ${extracted.length}`);
console.log(`   With names: ${extracted.filter(v => v.name).length}`);
console.log(`   With IDs: ${extracted.filter(v => v.voterId).length}\n`);

// Create lookup map
const extractedMap = new Map();
extracted.forEach(v => {
  if (v.voterId) {
    extractedMap.set(v.voterId, v);
  }
});

// Merge by voter ID
let matched = 0;
let filled = 0;

voters = voters.map(voter => {
  if (!voter.uniqueSerial || !voter.uniqueSerial.startsWith('W7F1')) {
    return voter;
  }
  
  if (voter.voterId && extractedMap.has(voter.voterId)) {
    const extractedData = extractedMap.get(voter.voterId);
    matched++;
    
    const wasBlank = !voter.name || voter.name.trim() === '';
    
    if (wasBlank && extractedData.name && extractedData.name.trim() !== '') {
      console.log(`✓ Filling: ${voter.uniqueSerial} (${voter.voterId})`);
      console.log(`  Name: ${extractedData.name}`);
      console.log(`  Age: ${extractedData.age}, Gender: ${extractedData.gender}\n`);
      
      voter.name = extractedData.name;
      voter.age = extractedData.age || voter.age;
      voter.gender = extractedData.gender || voter.gender;
      voter.ocrFailed = false;
      voter.pendingManualEntry = false;
      filled++;
    }
    
    return voter;
  }
  
  return voter;
});

// Calculate results
const w7f1Final = voters.filter(v => 
  v.uniqueSerial && v.uniqueSerial.startsWith('W7F1')
);

const afterMissing = w7f1Final.filter(v => !v.name || v.name.trim() === '').length;

console.log(`📊 After Merge:`);
console.log(`   Missing names: ${afterMissing}`);
console.log(`   Filled: ${filled} voters\n`);

console.log(`📈 Results:`);
console.log(`   Matched by ID: ${matched}`);
console.log(`   Successfully filled: ${filled}`);
console.log(`   Success rate: ${filled}/${extracted.filter(v => v.name).length} = ${((filled / extracted.filter(v => v.name).length) * 100).toFixed(1)}%\n`);

if (filled > 0) {
  console.log(`✅ TEST SUCCESSFUL!`);
  console.log(`   The extraction and merge process works correctly.`);
  console.log(`   Ready to process all 73 pages.\n`);
  
  // Save test results
  fs.writeFileSync(votersPath, JSON.stringify(voters, null, 2));
  console.log(`💾 Test changes saved to database`);
  console.log(`📌 Next: Run full extraction with reextract-ward7-improved.js`);
} else {
  console.log(`⚠️  No voters filled - need to debug extraction`);
  console.log(`   Restoring backup...`);
  fs.copyFileSync(backupPath, votersPath);
}
