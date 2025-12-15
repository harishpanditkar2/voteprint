const fs = require('fs');
const path = require('path');

// Load voter data
const voters = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf8'));

// Find blank cards (cards with no name)
const blankCards = voters.filter(v => 
  (!v.name || v.name.trim() === '') && v.ward === '7'
);

console.log('=== BLANK CARDS ANALYSIS ===\n');
console.log(`Total blank cards in Ward 7: ${blankCards.length}`);

// Categorize by issue type
const categories = {
  ocrFailed: blankCards.filter(v => v.ocrFailed === true),
  pendingManual: blankCards.filter(v => v.pendingManualEntry === true),
  hasVoterId: blankCards.filter(v => v.voterId && v.voterId.trim() !== ''),
  hasCardImage: blankCards.filter(v => v.cardImage && v.cardImage.trim() !== ''),
  hasAge: blankCards.filter(v => v.age && v.age !== ''),
  hasGender: blankCards.filter(v => v.gender && v.gender !== '')
};

console.log('\n=== CATEGORIES ===');
console.log(`Cards marked ocrFailed: ${categories.ocrFailed.length}`);
console.log(`Cards marked pendingManualEntry: ${categories.pendingManual.length}`);
console.log(`Cards with Voter ID: ${categories.hasVoterId.length}`);
console.log(`Cards with Card Image: ${categories.hasCardImage.length}`);
console.log(`Cards with Age: ${categories.hasAge.length}`);
console.log(`Cards with Gender: ${categories.hasGender.length}`);

console.log('\n=== FIRST 10 BLANK CARDS ===');
blankCards.slice(0, 10).forEach((v, i) => {
  console.log(`\n${i+1}. Serial: ${v.uniqueSerial || v.serialNumber || 'NONE'}`);
  console.log(`   Voter ID: ${v.voterId || 'MISSING'}`);
  console.log(`   Name: '${v.name || ''}'`);
  console.log(`   Age: ${v.age || 'MISSING'}`);
  console.log(`   Gender: ${v.gender || 'MISSING'}`);
  console.log(`   Card Image: ${v.cardImage ? 'EXISTS' : 'MISSING'}`);
  console.log(`   OCR Failed: ${v.ocrFailed || false}`);
  console.log(`   Pending Manual: ${v.pendingManualEntry || false}`);
  console.log(`   Page: ${v.page || 'MISSING'}`);
});

// Check if card images actually exist
console.log('\n=== CHECKING CARD IMAGES ===');
const cardsWithImages = blankCards.filter(v => v.cardImage);
console.log(`Blank cards claiming to have images: ${cardsWithImages.length}`);

let actualImagesFound = 0;
let sampleExisting = [];
let sampleMissing = [];

cardsWithImages.slice(0, 20).forEach(v => {
  const imagePath = path.join('./public', v.cardImage);
  if (fs.existsSync(imagePath)) {
    actualImagesFound++;
    if (sampleExisting.length < 3) {
      sampleExisting.push({
        serial: v.uniqueSerial,
        voterId: v.voterId,
        image: v.cardImage
      });
    }
  } else {
    if (sampleMissing.length < 3) {
      sampleMissing.push({
        serial: v.uniqueSerial,
        voterId: v.voterId,
        image: v.cardImage
      });
    }
  }
});

console.log(`Images actually existing (from first 20 checked): ${actualImagesFound}/20`);

if (sampleExisting.length > 0) {
  console.log('\n=== SAMPLE EXISTING IMAGES (Can OCR these!) ===');
  sampleExisting.forEach(s => {
    console.log(`Serial ${s.serial}, Voter ${s.voterId}`);
    console.log(`  Image: ${s.image}`);
  });
}

if (sampleMissing.length > 0) {
  console.log('\n=== SAMPLE MISSING IMAGES ===');
  sampleMissing.forEach(s => {
    console.log(`Serial ${s.serial}, Voter ${s.voterId}`);
    console.log(`  Expected: ${s.image}`);
  });
}

console.log('\n=== RECOMMENDATION ===');
if (sampleExisting.length > 0) {
  console.log('✓ Found card images that can be re-OCR\'d to extract data!');
  console.log('✓ Run extract-voter-data.js on these specific images');
} else {
  console.log('⚠ No card images found - data must be manually entered');
}
