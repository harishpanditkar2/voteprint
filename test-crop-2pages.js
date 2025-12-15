// Test cropping on first 2 pages only
const parser = require('./lib/tesseractCLIParser');
const fs = require('fs').promises;

async function testCropping() {
  try {
    const pdfPath = 'public/uploads/1765723758561_BoothVoterList_A4_Ward_7_Booth_1.pdf';
    
    console.log('🔄 Processing pages 2-3 only for testing...\n');
    
    // Parse with max 2 pages (page 1 is usually title, pages 2-3 have data)
    const voters = await parser.parseVoterPDFWithOCR(pdfPath, 4);
    
    // Filter only voters from page 2 and 3
    const testVoters = voters.filter(v => v.pageNumber === 2 || v.pageNumber === 3);
    
    console.log(`\n📊 Analysis:`);
    console.log(`Total voters extracted: ${testVoters.length}`);
    console.log(`Page 2 voters: ${testVoters.filter(v => v.pageNumber === 2).length}`);
    console.log(`Page 3 voters: ${testVoters.filter(v => v.pageNumber === 3).length}`);
    
    // Show first 5 voters with their details
    console.log(`\n📋 First 5 voters from page 3:`);
    testVoters.filter(v => v.pageNumber === 3).slice(0, 5).forEach((voter, i) => {
      console.log(`${i+1}. Serial #${voter.serialNumber} - ${voter.name} - ${voter.voterId}`);
      console.log(`   Image: ${voter.cardImage}`);
    });
    
    // Save test data
    await fs.writeFile(
      'public/data/voters-test.json',
      JSON.stringify(testVoters, null, 2)
    );
    
    console.log(`\n✅ Test data saved to voters-test.json`);
    console.log(`🖼️  Check the cropped images in public/voter-cards/`);
    console.log(`\n💡 Please verify:`);
    console.log(`   1. Open a few voter card images`);
    console.log(`   2. Check if the borders are properly cropped`);
    console.log(`   3. Verify that serial numbers match the grid positions`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

testCropping();
