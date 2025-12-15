const fs = require('fs');

// Read the voters database
const voters = JSON.parse(fs.readFileSync('public/data/voters.json', 'utf8'));

// Find Ward 7 Booth 1 voters
const ward7booth1 = voters.filter(v => v.actualWard === '7' && v.actualBooth === '1');
console.log(`Found ${ward7booth1.length} voters in Ward 7 Booth 1`);

// Check which serial numbers exist
const serials = ward7booth1.map(v => parseInt(v.serialNumber)).sort((a, b) => a - b);
console.log(`\nSerial numbers present: ${serials.slice(0, 20).join(', ')}...`);

// Check for gaps in serial numbers 1-20
const gaps = [];
for (let i = 1; i <= 20; i++) {
  if (!serials.includes(i)) {
    gaps.push(i);
  }
}

console.log(`\nGaps in serial 1-20: ${gaps.join(', ')}`);

// Check voter card images for serials 7-12
console.log(`\n--- Checking serials 7-12 ---`);
for (let sn = 7; sn <= 12; sn++) {
  const voter = ward7booth1.find(v => parseInt(v.serialNumber) === sn);
  if (voter) {
    console.log(`Serial ${sn}: ${voter.name} (${voter.voterId})`);
    console.log(`  Image: ${voter.cardImage}`);
    
    // Check if image file exists
    const imagePath = `public${voter.cardImage}`;
    if (fs.existsSync(imagePath)) {
      console.log(`  ✓ Image file exists`);
    } else {
      console.log(`  ✗ Image file NOT found at ${imagePath}`);
    }
  } else {
    console.log(`Serial ${sn}: MISSING from database`);
    
    // Check if there are any voter card images that might belong to this serial
    const voterCards = fs.readdirSync('public/voter-cards');
    const possibleImages = voterCards.filter(f => 
      f.includes('_sn' + sn + '_page3') || 
      f.includes(`_sn${sn}_page3`)
    );
    
    if (possibleImages.length > 0) {
      console.log(`  Found possible images: ${possibleImages.join(', ')}`);
    } else {
      console.log(`  No voter card images found for serial ${sn}`);
    }
  }
}
