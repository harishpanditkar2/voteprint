const fs = require('fs');
const path = require('path');

// Read the voters database
const voters = JSON.parse(fs.readFileSync('public/data/voters.json', 'utf8'));

// Filter Ward 7 voters
const ward7Voters = voters.filter(v => v.actualWard === '7' || v.ward === '7');
console.log(`Total Ward 7 voters: ${ward7Voters.length}\n`);

// Group by booth
const byBooth = {};
ward7Voters.forEach(v => {
  const booth = v.actualBooth || v.booth;
  if (!byBooth[booth]) {
    byBooth[booth] = [];
  }
  byBooth[booth].push(v);
});

// Analyze each booth
console.log('='.repeat(80));
console.log('WARD 7 COMPLETE ANALYSIS');
console.log('='.repeat(80));

Object.keys(byBooth).sort((a, b) => parseInt(a) - parseInt(b)).forEach(boothNum => {
  const boothVoters = byBooth[boothNum];
  const serials = boothVoters.map(v => parseInt(v.serialNumber)).filter(n => !isNaN(n)).sort((a, b) => a - b);
  
  console.log(`\nBOOTH ${boothNum}:`);
  console.log(`  Total voters: ${boothVoters.length}`);
  console.log(`  Serial range: ${Math.min(...serials)} to ${Math.max(...serials)}`);
  console.log(`  Expected serials: ${Math.max(...serials)}`);
  console.log(`  Actual serials: ${serials.length}`);
  console.log(`  Missing: ${Math.max(...serials) - serials.length}`);
  
  // Find gaps
  const gaps = [];
  for (let i = 1; i <= Math.max(...serials); i++) {
    if (!serials.includes(i)) {
      gaps.push(i);
    }
  }
  
  if (gaps.length > 0) {
    console.log(`  Gaps: ${gaps.slice(0, 20).join(', ')}${gaps.length > 20 ? ` ... (${gaps.length} total)` : ''}`);
  }
  
  // Check for duplicates
  const duplicates = serials.filter((item, index) => serials.indexOf(item) !== index);
  if (duplicates.length > 0) {
    console.log(`  ⚠ DUPLICATES: ${[...new Set(duplicates)].join(', ')}`);
  }
  
  // Check for blank entries
  const blanks = boothVoters.filter(v => !v.name || v.name.trim() === '');
  if (blanks.length > 0) {
    console.log(`  ⚠ Blank entries: ${blanks.length} (serials: ${blanks.map(v => v.serialNumber).slice(0, 10).join(', ')}...)`);
  }
  
  // Check for missing voter IDs
  const noVoterId = boothVoters.filter(v => !v.voterId || v.voterId.trim() === '');
  if (noVoterId.length > 0) {
    console.log(`  ⚠ Missing voter IDs: ${noVoterId.length}`);
  }
});

console.log('\n' + '='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));
console.log(`Total Ward 7 voters: ${ward7Voters.length}`);
console.log(`Booths: ${Object.keys(byBooth).length} (${Object.keys(byBooth).sort((a, b) => parseInt(a) - parseInt(b)).join(', ')})`);

// Check PDF files
console.log('\n' + '='.repeat(80));
console.log('PDF FILES CHECK');
console.log('='.repeat(80));

const pdfFiles = [
  'BoothVoterList_A4_Ward_7_Booth_1 - converted.pdf',
  'BoothVoterList_A4_Ward_7_Booth_2 - converted.pdf',
  'BoothVoterList_A4_Ward_7_Booth_3 - converted.pdf'
];

pdfFiles.forEach((file, idx) => {
  const filePath = path.join('pdflist', file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`\nFile ${idx + 1}: ${file}`);
    console.log(`  Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  ✓ File exists`);
    
    // Check corresponding booth data
    const boothNum = (idx + 1).toString();
    if (byBooth[boothNum]) {
      console.log(`  Database booth ${boothNum}: ${byBooth[boothNum].length} voters`);
    } else {
      console.log(`  ⚠ No data found for booth ${boothNum} in database`);
    }
  } else {
    console.log(`\nFile ${idx + 1}: ${file}`);
    console.log(`  ✗ FILE NOT FOUND`);
  }
});

// Check for images directory
console.log('\n' + '='.repeat(80));
console.log('VOTER CARD IMAGES CHECK');
console.log('='.repeat(80));

const imageDir = 'public/voter-cards';
if (fs.existsSync(imageDir)) {
  const allImages = fs.readdirSync(imageDir);
  
  // Count images with no serial number in filename
  const noSerialImages = allImages.filter(f => f.match(/_sn_page\d+\.jpg$/));
  console.log(`Total voter card images: ${allImages.length}`);
  console.log(`Images without serial numbers: ${noSerialImages.length}`);
  
  // Check how many Ward 7 voters have images
  const ward7WithImages = ward7Voters.filter(v => v.cardImage && v.cardImage.trim() !== '');
  console.log(`Ward 7 voters with card images: ${ward7WithImages.length} / ${ward7Voters.length}`);
}

console.log('\n' + '='.repeat(80));
