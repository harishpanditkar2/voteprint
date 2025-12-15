const fs = require('fs');
const path = require('path');

console.log('=== Assign Serial Numbers and Merge Data ===\n');

const OUTPUT_DIR = 'ward7-reextraction-output';
const EXTRACTION_FILE = path.join(OUTPUT_DIR, 'complete-extraction.json');

if (!fs.existsSync(EXTRACTION_FILE)) {
  console.error('Error: Extraction file not found. Run complete-ward7-reextraction.js first');
  process.exit(1);
}

// Read extraction results
const extractionData = JSON.parse(fs.readFileSync(EXTRACTION_FILE, 'utf8'));
const voters = JSON.parse(fs.readFileSync('public/data/voters.json', 'utf8'));

console.log('Loaded extraction data for', extractionData.length, 'pages');
console.log('Current database has', voters.length, 'voters');
console.log('');

// Determine file boundaries by analyzing the data
// W7F1 should have 991 voters, W7F2 has 861, W7F3 has 863
// We need to assign serials sequentially as voters appear in the PDF

console.log('=== Assigning Serial Numbers ===\n');

let globalSerial = 1;
let fileSerial = 1;
let currentFile = 'W7F1';
let fileVoterCounts = { W7F1: 0, W7F2: 0, W7F3: 0 };
const FILE_LIMITS = { W7F1: 991, W7F2: 861, W7F3: 863 };

const reextractedVoters = [];
const matchingLog = [];

extractionData.forEach(pageData => {
  if (pageData.error || !pageData.voters) return;
  
  pageData.voters.forEach((extractedVoter, indexOnPage) => {
    // Determine which file this voter belongs to based on cumulative count
    if (fileVoterCounts[currentFile] >= FILE_LIMITS[currentFile]) {
      // Move to next file
      if (currentFile === 'W7F1') {
        currentFile = 'W7F2';
        fileSerial = 1;
      } else if (currentFile === 'W7F2') {
        currentFile = 'W7F3';
        fileSerial = 1;
      }
    }
    
    // Try to find matching voter in existing database by Voter ID
    let existingVoter = null;
    if (extractedVoter.voterId) {
      existingVoter = voters.find(v => v.voterId === extractedVoter.voterId);
    }
    
    // Build voter record
    const voterRecord = {
      serialNumber: fileSerial.toString(),
      voterId: extractedVoter.voterId || (existingVoter ? existingVoter.voterId : ''),
      partNumber: extractedVoter.partNumber || (existingVoter ? existingVoter.partNumber : ''),
      pageNumber: pageData.page,
      name: extractedVoter.name || (existingVoter ? existingVoter.name : ''),
      age: extractedVoter.age || (existingVoter ? existingVoter.age : ''),
      gender: extractedVoter.gender || (existingVoter ? existingVoter.gender : ''),
      
      // Keep existing data that wasn't re-extracted
      fatherName: existingVoter ? existingVoter.fatherName || '' : '',
      relativeDetail: existingVoter ? existingVoter.relativeDetail || '' : '',
      houseNumber: existingVoter ? existingVoter.houseNumber || '' : '',
      address: existingVoter ? existingVoter.address || '' : '',
      
      // Ward and booth info
      ward: '138',
      booth: currentFile === 'W7F1' ? '143' : currentFile === 'W7F2' ? '144' : '145',
      actualWard: '7',
      actualBooth: currentFile === 'W7F1' ? '1' : currentFile === 'W7F2' ? '2' : '3',
      pollingCenter: 'मतदान केंद्रनिहाय मतदार यादी',
      
      // File reference
      fileNumber: currentFile === 'W7F1' ? 1 : currentFile === 'W7F2' ? 2 : 3,
      fileReference: currentFile,
      uniqueSerial: `${currentFile}-S${fileSerial}`,
      
      // Card image
      cardImage: extractedVoter.voterId ? 
        `/voter-cards/voter_${extractedVoter.voterId}_sn${fileSerial}_page${pageData.page}.jpg` : '',
      
      // Metadata
      source: 'Tesseract CLI OCR - Reextraction',
      dataQuality: {
        voterId: extractedVoter.voterId ? 'verified' : 'missing',
        age: extractedVoter.age ? 'verified' : 'missing',
        gender: extractedVoter.gender ? 'verified' : 'missing',
        booth: 'verified',
        ward: 'verified',
        name: extractedVoter.name ? 'verified' : 'missing',
        fatherName: 'missing'
      },
      
      // Keep IDs if exists
      id: existingVoter ? existingVoter.id : `VOTER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: existingVoter ? existingVoter.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      // Mark if extraction had issues
      ocrFailed: !extractedVoter.name && !extractedVoter.voterId,
      pendingManualEntry: !extractedVoter.name || !extractedVoter.voterId,
      reextracted: true
    };
    
    reextractedVoters.push(voterRecord);
    fileVoterCounts[currentFile]++;
    fileSerial++;
    globalSerial++;
    
    // Log matching
    if (existingVoter) {
      matchingLog.push({
        voterId: extractedVoter.voterId,
        oldSerial: existingVoter.serialNumber,
        newSerial: fileSerial - 1,
        oldPage: existingVoter.pageNumber,
        newPage: pageData.page,
        matched: true
      });
    }
  });
});

console.log('Reextracted voters:', reextractedVoters.length);
console.log('File counts:');
console.log('  W7F1:', fileVoterCounts.W7F1, '/ 991');
console.log('  W7F2:', fileVoterCounts.W7F2, '/ 861');
console.log('  W7F3:', fileVoterCounts.W7F3, '/ 863');
console.log('');

// Quality checks
const withAllData = reextractedVoters.filter(v => v.voterId && v.name && v.age && v.gender).length;
const withVoterId = reextractedVoters.filter(v => v.voterId).length;
const withName = reextractedVoters.filter(v => v.name).length;
const missingData = reextractedVoters.filter(v => !v.name || !v.voterId).length;

console.log('=== Quality Summary ===');
console.log(`Complete records: ${withAllData} (${((withAllData/reextractedVoters.length)*100).toFixed(1)}%)`);
console.log(`With Voter ID: ${withVoterId} (${((withVoterId/reextractedVoters.length)*100).toFixed(1)}%)`);
console.log(`With Name: ${withName} (${((withName/reextractedVoters.length)*100).toFixed(1)}%)`);
console.log(`Needs manual entry: ${missingData} (${((missingData/reextractedVoters.length)*100).toFixed(1)}%)`);
console.log('');

// Save reextracted data
fs.writeFileSync(
  path.join(OUTPUT_DIR, 'reextracted-voters.json'),
  JSON.stringify(reextractedVoters, null, 2)
);

console.log('✓ Reextracted voters saved to:', path.join(OUTPUT_DIR, 'reextracted-voters.json'));
console.log('');
console.log('Next step: Run merge-reextracted-data.js to update the database');
