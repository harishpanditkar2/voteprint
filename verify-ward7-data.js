const fs = require('fs');
const path = require('path');

console.log('=== Ward 7 Data Verification Report ===\n');

// Read voters data
const voters = JSON.parse(fs.readFileSync('public/data/voters.json', 'utf8'));
const ward7Voters = voters.filter(v => v.actualWard === '7' || v.expectedWard === '7');

console.log('1. VOTER COUNTS VERIFICATION');
console.log('─'.repeat(60));
console.log('Total database voters:', voters.length);
console.log('Total Ward 7 voters:', ward7Voters.length);
console.log('');

['1', '2', '3'].forEach(booth => {
  const boothVoters = ward7Voters.filter(v => (v.actualBooth || v.booth) === booth);
  const expected = booth === '1' ? 991 : booth === '2' ? 861 : 863;
  const withData = boothVoters.filter(v => v.name && v.name.trim());
  const blanks = boothVoters.filter(v => !v.name || !v.name.trim());
  const status = boothVoters.length === expected ? '✓' : '✗';
  
  console.log(`W7F${booth} (Matadan Kendra ${booth}):`);
  console.log(`  Count: ${boothVoters.length}/${expected} ${status}`);
  console.log(`  With Data: ${withData.length} (${Math.round(withData.length/expected*100)}%)`);
  console.log(`  Blanks: ${blanks.length} (${Math.round(blanks.length/expected*100)}%)`);
  console.log('');
});

console.log('\n2. FIELD COMPLETENESS CHECK');
console.log('─'.repeat(60));

// Check required fields
const missingFields = {
  fileNumber: ward7Voters.filter(v => !v.fileNumber).length,
  fileReference: ward7Voters.filter(v => !v.fileReference).length,
  uniqueSerial: ward7Voters.filter(v => !v.uniqueSerial).length,
  serialNumber: ward7Voters.filter(v => !v.serialNumber).length,
  actualWard: ward7Voters.filter(v => !v.actualWard && !v.expectedWard).length,
  actualBooth: ward7Voters.filter(v => !v.actualBooth && !v.booth).length
};

Object.entries(missingFields).forEach(([field, count]) => {
  const status = count === 0 ? '✓' : '✗';
  console.log(`${field}: ${status} (${count} missing)`);
});

console.log('\n3. FILE REFERENCE CONSISTENCY');
console.log('─'.repeat(60));

['1', '2', '3'].forEach(booth => {
  const boothVoters = ward7Voters.filter(v => (v.actualBooth || v.booth) === booth);
  const wrongFileNum = boothVoters.filter(v => v.fileNumber !== parseInt(booth));
  const wrongFileRef = boothVoters.filter(v => v.fileReference !== `W7F${booth}`);
  const wrongUniqueSer = boothVoters.filter(v => !v.uniqueSerial.startsWith(`W7F${booth}-S`));
  
  console.log(`W7F${booth}:`);
  console.log(`  Wrong fileNumber: ${wrongFileNum.length}`);
  console.log(`  Wrong fileReference: ${wrongFileRef.length}`);
  console.log(`  Wrong uniqueSerial format: ${wrongUniqueSer.length}`);
});

console.log('\n4. SERIAL NUMBER SEQUENCE CHECK');
console.log('─'.repeat(60));

['1', '2', '3'].forEach(booth => {
  const boothVoters = ward7Voters.filter(v => (v.actualBooth || v.booth) === booth);
  const expected = booth === '1' ? 991 : booth === '2' ? 861 : 863;
  
  // Check for gaps
  const serials = boothVoters.map(v => parseInt(v.serialNumber)).sort((a,b) => a-b);
  const gaps = [];
  const duplicates = [];
  
  for (let i = 1; i <= expected; i++) {
    const count = serials.filter(s => s === i).length;
    if (count === 0) gaps.push(i);
    if (count > 1) duplicates.push({serial: i, count});
  }
  
  console.log(`W7F${booth}:`);
  console.log(`  Expected range: 1-${expected}`);
  console.log(`  Actual entries: ${boothVoters.length}`);
  console.log(`  Gaps: ${gaps.length} ${gaps.length > 0 ? `(${gaps.slice(0,10).join(', ')}...)` : '✓'}`);
  console.log(`  Duplicates: ${duplicates.length} ${duplicates.length > 0 ? `(${JSON.stringify(duplicates.slice(0,3))})` : '✓'}`);
});

console.log('\n5. OCR DATA QUALITY CHECK');
console.log('─'.repeat(60));

['1', '2', '3'].forEach(booth => {
  const boothVoters = ward7Voters.filter(v => (v.actualBooth || v.booth) === booth);
  const withData = boothVoters.filter(v => v.name && v.name.trim());
  
  // Check field completeness for voters with data
  const stats = {
    hasVoterId: withData.filter(v => v.voterId && v.voterId.trim()).length,
    hasAge: withData.filter(v => v.age && v.age.trim()).length,
    hasGender: withData.filter(v => v.gender && v.gender.trim()).length,
    hasFatherName: withData.filter(v => v.fatherName && v.fatherName.trim()).length,
    hasHouseNumber: withData.filter(v => v.houseNumber && v.houseNumber.trim()).length,
    hasAddress: withData.filter(v => v.address && v.address.trim()).length,
    hasImage: withData.filter(v => v.cardImage && v.cardImage.trim()).length,
    ocrFailed: boothVoters.filter(v => v.ocrFailed === true).length,
    pendingManual: boothVoters.filter(v => v.pendingManualEntry === true).length
  };
  
  console.log(`W7F${booth} (${withData.length} voters with data):`);
  console.log(`  Voter ID: ${stats.hasVoterId} (${Math.round(stats.hasVoterId/withData.length*100)}%)`);
  console.log(`  Age: ${stats.hasAge} (${Math.round(stats.hasAge/withData.length*100)}%)`);
  console.log(`  Gender: ${stats.hasGender} (${Math.round(stats.hasGender/withData.length*100)}%)`);
  console.log(`  Card Image: ${stats.hasImage} (${Math.round(stats.hasImage/withData.length*100)}%)`);
  console.log(`  OCR Failed: ${stats.ocrFailed}`);
  console.log(`  Pending Manual: ${stats.pendingManual}`);
  console.log('');
});

console.log('\n6. SOURCE FILES VERIFICATION');
console.log('─'.repeat(60));

// Check if PDF files exist
const pdfFiles = [
  'pdflist/BoothVoterList_A4_Ward_7_Booth_1 - converted.pdf',
  'pdflist/BoothVoterList_A4_Ward_7_Booth_2 - converted.pdf',
  'pdflist/BoothVoterList_A4_Ward_7_Booth_3 - converted.pdf'
];

pdfFiles.forEach((file, idx) => {
  const exists = fs.existsSync(file);
  const size = exists ? (fs.statSync(file).size / 1024).toFixed(2) + ' KB' : 'N/A';
  console.log(`F${idx+1}: ${exists ? '✓' : '✗'} ${path.basename(file)} (${size})`);
});

// Check for OCR images
console.log('\nOCR Images:');
const ocrDir = 'pdflist/images/prabhag7ward1';
if (fs.existsSync(ocrDir)) {
  const files = fs.readdirSync(ocrDir);
  console.log(`  Found ${files.length} OCR images in ${ocrDir}`);
} else {
  console.log(`  ✗ Directory not found: ${ocrDir}`);
}

// Check voter card images
const cardDir = 'public/voter-cards';
if (fs.existsSync(cardDir)) {
  const allCards = fs.readdirSync(cardDir);
  console.log(`\nVoter Card Images: ${allCards.length} total`);
  
  // Sample check: verify some Ward 7 voters have their card images
  const w7WithCards = ward7Voters.filter(v => {
    if (!v.cardImage) return false;
    const imagePath = path.join('public', v.cardImage);
    return fs.existsSync(imagePath);
  });
  
  console.log(`  Ward 7 voters with accessible images: ${w7WithCards.length}/${ward7Voters.length}`);
}

console.log('\n7. DATA VALIDATION SUMMARY');
console.log('─'.repeat(60));

const issues = [];

// Check for critical issues
['1', '2', '3'].forEach(booth => {
  const boothVoters = ward7Voters.filter(v => (v.actualBooth || v.booth) === booth);
  const expected = booth === '1' ? 991 : booth === '2' ? 861 : 863;
  
  if (boothVoters.length !== expected) {
    issues.push(`W7F${booth}: Count mismatch (${boothVoters.length} vs ${expected})`);
  }
  
  const wrongFileRefs = boothVoters.filter(v => v.fileReference !== `W7F${booth}`);
  if (wrongFileRefs.length > 0) {
    issues.push(`W7F${booth}: ${wrongFileRefs.length} voters with wrong fileReference`);
  }
  
  const serials = boothVoters.map(v => parseInt(v.serialNumber));
  const gaps = [];
  for (let i = 1; i <= expected; i++) {
    if (!serials.includes(i)) gaps.push(i);
  }
  if (gaps.length > 0) {
    issues.push(`W7F${booth}: ${gaps.length} gaps in serial sequence`);
  }
});

if (issues.length === 0) {
  console.log('✓ All validation checks passed!');
  console.log('✓ Ward 7 data is complete and consistent');
} else {
  console.log('⚠️  Found issues:');
  issues.forEach(issue => console.log(`  - ${issue}`));
}

console.log('\n' + '═'.repeat(60));
console.log('Verification Complete');
console.log('═'.repeat(60));
