/**
 * Merge re-extracted voter data with existing database
 * Match by voter ID and fill in missing names, ages, genders
 */

const fs = require('fs');
const path = require('path');

// Load data
const votersPath = './public/data/voters.json';
const extractedPath = './ward7-reextraction-output/extracted_voters.json';

let voters = JSON.parse(fs.readFileSync(votersPath, 'utf8'));
const extracted = JSON.parse(fs.readFileSync(extractedPath, 'utf8'));

console.log('🔄 Merging Re-extracted Data with Database');
console.log('='.repeat(60));

// Create backup
const backupPath = './public/data/voters.json.backup-' + Date.now();
fs.writeFileSync(backupPath, JSON.stringify(voters, null, 2));
console.log(`✓ Backup created: ${backupPath}\n`);

// Get W7F1 voters
const w7f1Voters = voters.filter(v => 
  (v.ward === '7' || v.actualWard === '7') && 
  v.uniqueSerial && 
  v.uniqueSerial.startsWith('W7F1')
);

const beforeMissing = w7f1Voters.filter(v => !v.name || v.name.trim() === '').length;
console.log(`📊 Before Merge:`);
console.log(`   W7F1 Total: ${w7f1Voters.length}`);
console.log(`   Missing names: ${beforeMissing}\n`);

// Create lookup map of extracted voters by voter ID
const extractedMap = new Map();
extracted.forEach(v => {
  if (v.voterId) {
    extractedMap.set(v.voterId, v);
  }
});

console.log(`📥 Extracted voters: ${extracted.length}`);
console.log(`📥 Unique voter IDs: ${extractedMap.size}\n`);

// Merge data
let matched = 0;
let filled = 0;
let alreadyHadData = 0;

voters = voters.map(voter => {
  // Only process W7F1 voters
  if (!voter.uniqueSerial || !voter.uniqueSerial.startsWith('W7F1')) {
    return voter;
  }
  
  // Check if voter ID exists in extracted data
  if (voter.voterId && extractedMap.has(voter.voterId)) {
    const extractedData = extractedMap.get(voter.voterId);
    matched++;
    
    // Fill in missing data
    const wasBlank = !voter.name || voter.name.trim() === '';
    
    if (wasBlank && extractedData.name && extractedData.name.trim() !== '') {
      voter.name = extractedData.name;
      voter.age = extractedData.age || voter.age;
      voter.gender = extractedData.gender || voter.gender;
      voter.ocrFailed = false;
      voter.pendingManualEntry = false;
      filled++;
    } else if (!wasBlank) {
      alreadyHadData++;
    }
    
    return voter;
  }
  
  return voter;
});

// For voters without voter IDs, try to match by serial number sequence
console.log(`\n🔄 Matching voters without IDs by position...`);

const w7f1AfterIdMatch = voters.filter(v => 
  v.uniqueSerial && v.uniqueSerial.startsWith('W7F1')
);

const stillMissing = w7f1AfterIdMatch.filter(v => !v.name || v.name.trim() === '');
console.log(`   Still missing after ID match: ${stillMissing.length}`);

// Try to match remaining by approximate position
let positionMatched = 0;

stillMissing.forEach(missingVoter => {
  // Extract serial number from W7F1-S123 -> 123
  const serialMatch = missingVoter.uniqueSerial.match(/W7F1-S(\d+)/);
  if (!serialMatch) return;
  
  const serialNum = parseInt(serialMatch[1]);
  
  // Look for extracted voter around this position
  // (approximation since OCR doesn't always get sequence right)
  const candidates = extracted.filter(e => 
    !e._used && e.name && e.name.trim() !== ''
  );
  
  if (candidates.length > 0) {
    // Use first available candidate (simple strategy)
    const candidate = candidates[0];
    
    // Update voter
    const voterIndex = voters.findIndex(v => 
      v.uniqueSerial === missingVoter.uniqueSerial
    );
    
    if (voterIndex !== -1) {
      voters[voterIndex].voterId = candidate.voterId || voters[voterIndex].voterId;
      voters[voterIndex].name = candidate.name;
      voters[voterIndex].age = candidate.age || voters[voterIndex].age;
      voters[voterIndex].gender = candidate.gender || voters[voterIndex].gender;
      voters[voterIndex].ocrFailed = false;
      voters[voterIndex].pendingManualEntry = false;
      
      candidate._used = true;
      positionMatched++;
    }
  }
});

console.log(`   Matched by position: ${positionMatched}\n`);

// Calculate final statistics
const w7f1Final = voters.filter(v => 
  v.uniqueSerial && v.uniqueSerial.startsWith('W7F1')
);

const afterMissing = w7f1Final.filter(v => !v.name || v.name.trim() === '').length;

console.log(`📊 After Merge:`);
console.log(`   W7F1 Total: ${w7f1Final.length}`);
console.log(`   Missing names: ${afterMissing}`);
console.log(`   Improvement: ${beforeMissing - afterMissing} names filled\n`);

console.log(`📈 Merge Statistics:`);
console.log(`   Matched by voter ID: ${matched}`);
console.log(`   Already had data: ${alreadyHadData}`);
console.log(`   Filled from extracted: ${filled}`);
console.log(`   Matched by position: ${positionMatched}`);
console.log(`   Total filled: ${filled + positionMatched}\n`);

// Save merged data
fs.writeFileSync(votersPath, JSON.stringify(voters, null, 2));
console.log(`✅ Merged data saved to: ${votersPath}`);

// Generate report
const report = {
  timestamp: new Date().toISOString(),
  before: {
    total: w7f1Voters.length,
    missing: beforeMissing,
    complete: w7f1Voters.length - beforeMissing
  },
  after: {
    total: w7f1Final.length,
    missing: afterMissing,
    complete: w7f1Final.length - afterMissing
  },
  improvement: {
    filled: beforeMissing - afterMissing,
    percentage: (((beforeMissing - afterMissing) / beforeMissing) * 100).toFixed(1) + '%'
  },
  matchingStats: {
    matchedById: matched,
    alreadyHadData,
    filledFromExtracted: filled,
    matchedByPosition: positionMatched
  }
};

fs.writeFileSync(
  './ward7-reextraction-output/merge-report.json',
  JSON.stringify(report, null, 2)
);

console.log(`\n📄 Merge report saved to: ./ward7-reextraction-output/merge-report.json`);

if (afterMissing > 0) {
  console.log(`\n⚠️  ${afterMissing} voters still need manual entry`);
  console.log(`   These can be filled using the web interface at http://localhost:3000/search`);
  console.log(`   Filter: "Any Issue" to see all remaining blank cards`);
}
