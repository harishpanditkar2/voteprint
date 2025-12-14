// Final test - extract 10 voters with TesseractCLIParser
const TesseractCLIParser = require('./lib/tesseractCLIParser');
const path = require('path');
const fs = require('fs');

async function finalTest() {
  try {
    const votersPath = path.join(__dirname, 'public', 'data', 'voters.json');
    fs.writeFileSync(votersPath, '[]', 'utf8');
    console.log('✅ Cleared data\n');

    const pdfPath = path.join(__dirname, 'public', 'uploads', '1765723758561_BoothVoterList_A4_Ward_7_Booth_1.pdf');
    
    console.log('📄 Final Test: Extracting voters with clean Marathi names\n');

    const voters = await TesseractCLIParser.parseVoterPDFWithOCR(pdfPath, 1);

    console.log('\n' + '='.repeat(80));
    console.log(`✅ SUCCESS! Extracted ${voters.length} voters`);
    console.log('='.repeat(80));
    console.log('\n📝 Sample voters:\n');

    voters.slice(0, 10).forEach((voter, idx) => {
      console.log(`${idx + 1}. ${voter.name}`);
      console.log(`   ID: ${voter.voterId} | Age: ${voter.age} | Gender: ${voter.gender}`);
      console.log(`   Ward: ${voter.actualWard}, Booth: ${voter.actualBooth}\n`);
    });

    console.log('🌐 View at: http://localhost:3000/search');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

finalTest();
