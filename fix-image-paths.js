const fs = require('fs');
const path = require('path');

console.log('Fixing voter card image paths...');

// Read voters data
const voters = require('./public/data/voters.json');
console.log(`Total voters: ${voters.length}`);

// Get all image files
const imageDir = path.join(__dirname, 'public', 'voter-cards');
const imageFiles = fs.readdirSync(imageDir);
console.log(`Total image files: ${imageFiles.length}`);

// Create a map of voterId to image files
const voterImages = {};
imageFiles.forEach(file => {
  // Extract voterId from filename: voter_XUA7224868_sn1_page2.jpg
  const match = file.match(/^voter_([A-Z0-9]+)_/);
  if (match) {
    const voterId = match[1];
    if (!voterImages[voterId]) {
      voterImages[voterId] = [];
    }
    voterImages[voterId].push(file);
  }
});

console.log(`Unique voter IDs with images: ${Object.keys(voterImages).length}`);

// Update voters with correct image paths
let fixedCount = 0;
let notFoundCount = 0;

voters.forEach(voter => {
  const images = voterImages[voter.voterId];
  
  if (images && images.length > 0) {
    // Sort images by filename to get the first one
    images.sort();
    // Use the first image
    voter.cardImage = `/voter-cards/${images[0]}`;
    fixedCount++;
  } else {
    notFoundCount++;
    console.log(`No image found for: ${voter.voterId}`);
  }
});

console.log(`\nFixed: ${fixedCount} voters`);
console.log(`Not found: ${notFoundCount} voters`);

// Save updated voters data
const outputPath = path.join(__dirname, 'public', 'data', 'voters.json');
fs.writeFileSync(outputPath, JSON.stringify(voters, null, 2));
console.log(`\n✓ Updated voters saved to: ${outputPath}`);
