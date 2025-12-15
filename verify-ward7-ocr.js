const fs = require('fs');
const path = require('path');

console.log('=== Ward 7 OCR Data Verification ===\n');

// Read voters data
const voters = JSON.parse(fs.readFileSync('public/data/voters.json', 'utf8'));
const ward7Voters = voters.filter(v => v.actualWard === '7' || v.expectedWard === '7');

console.log('Total Ward 7 voters:', ward7Voters.length);
console.log('');

// Get OCR images
const ocrDir = 'pdflist/images/prabhag7ward1';
const ocrImages = fs.existsSync(ocrDir) ? fs.readdirSync(ocrDir) : [];
console.log('OCR Images found:', ocrImages.length);
console.log('');

// Parse page numbers from OCR images
const pageImages = {};
ocrImages.forEach(img => {
  const match = img.match(/page-(\d+)\.jpg$/);
  if (match) {
    const pageNum = parseInt(match[1]);
    pageImages[pageNum] = path.join(ocrDir, img);
  }
});

console.log('Pages with OCR images:', Object.keys(pageImages).length);
console.log('Page range:', Math.min(...Object.keys(pageImages).map(Number)), '-', Math.max(...Object.keys(pageImages).map(Number)));
console.log('');

// Group voters by booth and analyze
console.log('=== Voter Data Analysis by Booth ===\n');

['1', '2', '3'].forEach(booth => {
  const boothVoters = ward7Voters.filter(v => (v.actualBooth || v.booth) === booth);
  const expected = booth === '1' ? 991 : booth === '2' ? 861 : 863;
  const withData = boothVoters.filter(v => v.name && v.name.trim());
  const blanks = boothVoters.filter(v => !v.name || !v.name.trim());
  
  console.log(`W7F${booth} (Matadan Kendra ${booth}):`);
  console.log(`  Total: ${boothVoters.length}/${expected}`);
  console.log(`  With Data: ${withData.length}`);
  console.log(`  Blanks (OCR Failed): ${blanks.length}`);
  
  // Analyze page distribution
  const pages = [...new Set(withData.map(v => v.pageNumber))].sort((a,b) => a-b);
  console.log(`  Page Range: ${Math.min(...pages)}-${Math.max(...pages)} (${pages.length} pages)`);
  
  // Check voter IDs format
  const validVoterIds = withData.filter(v => v.voterId && v.voterId.match(/^[A-Z]{3}\d{7}$/));
  const invalidVoterIds = withData.filter(v => v.voterId && !v.voterId.match(/^[A-Z]{3}\d{7}$/));
  console.log(`  Valid Voter IDs: ${validVoterIds.length}/${withData.length}`);
  if (invalidVoterIds.length > 0) {
    console.log(`  Invalid Voter ID formats: ${invalidVoterIds.length}`);
    console.log(`    Examples:`, invalidVoterIds.slice(0, 3).map(v => `${v.voterId} (Serial ${v.serialNumber})`).join(', '));
  }
  
  // Check for duplicate voter IDs
  const voterIdCounts = {};
  withData.forEach(v => {
    if (v.voterId) {
      voterIdCounts[v.voterId] = (voterIdCounts[v.voterId] || 0) + 1;
    }
  });
  const duplicateIds = Object.entries(voterIdCounts).filter(([id, count]) => count > 1);
  if (duplicateIds.length > 0) {
    console.log(`  ⚠️  Duplicate Voter IDs: ${duplicateIds.length}`);
    duplicateIds.slice(0, 3).forEach(([id, count]) => {
      const dupes = withData.filter(v => v.voterId === id);
      console.log(`    ${id} appears ${count} times: Serials ${dupes.map(v => v.serialNumber).join(', ')}`);
    });
  }
  
  // Check card images
  const withImages = withData.filter(v => v.cardImage);
  const withoutImages = withData.filter(v => !v.cardImage);
  console.log(`  Card Images: ${withImages.length}/${withData.length}`);
  if (withoutImages.length > 0) {
    console.log(`    Missing images: Serials ${withoutImages.slice(0, 5).map(v => v.serialNumber).join(', ')}${withoutImages.length > 5 ? '...' : ''}`);
  }
  
  console.log('');
});

// Find voters on specific pages to cross-check with OCR images
console.log('=== Sample Voters for Manual Verification ===\n');
console.log('Page 3 voters (First page with data):');
const page3Voters = ward7Voters.filter(v => v.pageNumber === 3 && v.name);
page3Voters.slice(0, 5).forEach(v => {
  console.log(`  Serial ${v.serialNumber}: ${v.name} | ${v.voterId} | Age ${v.age} ${v.gender}`);
});
console.log('');

console.log('Page 10 voters (Mid section):');
const page10Voters = ward7Voters.filter(v => v.pageNumber === 10 && v.name);
page10Voters.slice(0, 5).forEach(v => {
  console.log(`  Serial ${v.serialNumber}: ${v.name} | ${v.voterId} | Age ${v.age} ${v.gender}`);
});
console.log('');

// Identify potential issues
console.log('=== Potential Data Issues ===\n');

// Missing names but has voter ID
const missingNames = ward7Voters.filter(v => v.voterId && (!v.name || !v.name.trim()));
if (missingNames.length > 0) {
  console.log(`⚠️  Voters with ID but no name: ${missingNames.length}`);
  missingNames.slice(0, 3).forEach(v => {
    console.log(`   Serial ${v.serialNumber} (Page ${v.pageNumber}): ${v.voterId}`);
  });
  console.log('');
}

// Has name but no voter ID
const missingVoterId = ward7Voters.filter(v => v.name && v.name.trim() && (!v.voterId || !v.voterId.trim()));
if (missingVoterId.length > 0) {
  console.log(`⚠️  Voters with name but no ID: ${missingVoterId.length}`);
  missingVoterId.slice(0, 3).forEach(v => {
    console.log(`   Serial ${v.serialNumber} (Page ${v.pageNumber}): ${v.name}`);
  });
  console.log('');
}

// Missing age
const missingAge = ward7Voters.filter(v => v.name && v.name.trim() && (!v.age || !v.age.trim()));
if (missingAge.length > 0) {
  console.log(`⚠️  Voters missing age: ${missingAge.length}`);
  console.log(`   Examples: Serials ${missingAge.slice(0, 5).map(v => v.serialNumber).join(', ')}`);
  console.log('');
}

// Missing gender
const missingGender = ward7Voters.filter(v => v.name && v.name.trim() && (!v.gender || !v.gender.trim()));
if (missingGender.length > 0) {
  console.log(`⚠️  Voters missing gender: ${missingGender.length}`);
  console.log(`   Examples: Serials ${missingGender.slice(0, 5).map(v => v.serialNumber).join(', ')}`);
  console.log('');
}

// Names that might be OCR errors (very short or have numbers)
const suspiciousNames = ward7Voters.filter(v => {
  if (!v.name || !v.name.trim()) return false;
  const name = v.name.trim();
  return name.length < 3 || /\d/.test(name) || /[^\u0900-\u097F\s]/.test(name);
});
if (suspiciousNames.length > 0) {
  console.log(`⚠️  Suspicious names (might need verification): ${suspiciousNames.length}`);
  suspiciousNames.slice(0, 5).forEach(v => {
    console.log(`   Serial ${v.serialNumber}: "${v.name}" | ${v.voterId}`);
  });
  console.log('');
}

// Generate verification report
console.log('=== Verification Actions Needed ===\n');
console.log('1. Check OCR images in: pdflist/images/prabhag7ward1/');
console.log('2. Verify voter data on pages with OCR images available');
console.log('3. Cross-check sample voters listed above with their images');
console.log('4. Pay special attention to:');
if (missingNames.length > 0) console.log('   - Voters with IDs but missing names');
if (missingVoterId.length > 0) console.log('   - Voters with names but missing IDs');
if (suspiciousNames.length > 0) console.log('   - Names that might be OCR errors');
console.log('');

// Export list of voters for manual verification
const verificationList = ward7Voters
  .filter(v => v.name && v.name.trim())
  .slice(0, 20)
  .map(v => ({
    serial: v.serialNumber,
    booth: v.actualBooth || v.booth,
    fileRef: v.fileReference,
    page: v.pageNumber,
    name: v.name,
    voterId: v.voterId,
    age: v.age,
    gender: v.gender,
    cardImage: v.cardImage
  }));

fs.writeFileSync('ward7-sample-verification.json', JSON.stringify(verificationList, null, 2));
console.log('✓ Sample verification list exported to: ward7-sample-verification.json');
console.log('  (First 20 voters from each booth for manual checking)');
