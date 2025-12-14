// Run upload test directly
const TesseractCLIParser = require('./lib/tesseractCLIParser');
const path = require('path');
const fs = require('fs');

async function runUpload() {
  try {
    // Clear existing data first
    const votersPath = path.join(__dirname, 'public', 'data', 'voters.json');
    fs.writeFileSync(votersPath, '[]', 'utf8');
    console.log('✅ Cleared existing voter data\n');

    const pdfPath = path.join(__dirname, 'public', 'uploads', '1765723758561_BoothVoterList_A4_Ward_7_Booth_1.pdf');
    
    console.log('📄 Processing: BoothVoterList_A4_Ward_7_Booth_1.pdf');
    console.log('📍 Ward: 7, Booth: 1');
    console.log('⚡ Testing with page 2 only (using Tesseract CLI)\n');

    const startTime = Date.now();
    // Using TesseractCLIParser with maxPages=1 (processes 1 page after header)
    const voters = await TesseractCLIParser.parseVoterPDFWithOCR(pdfPath, 1);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('\n' + '='.repeat(80));
    console.log('📊 UPLOAD TEST RESULTS');
    console.log('='.repeat(80));
    console.log(`Total voters extracted: ${voters.length}`);
    console.log(`Time taken: ${elapsed} seconds`);
    
    if (voters.length > 0) {
      console.log('\n📝 First 5 voters:\n');
      voters.slice(0, 5).forEach((voter, idx) => {
        console.log(`${idx + 1}. ${voter.name} (${voter.voterId})`);
        console.log(`   Age: ${voter.age}, Gender: ${voter.gender}`);
        console.log(`   Ward: ${voter.actualWard}, Booth: ${voter.actualBooth}\n`);
      });
      
      console.log('='.repeat(80));
      console.log('✅ Upload successful! Check http://localhost:3000/search');
    } else {
      console.log('\n⚠️  No voters found. Check OCR output above.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runUpload();
