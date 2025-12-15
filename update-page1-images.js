const parser = require('./lib/tesseractCLIParser');
const fs = require('fs');
const path = require('path');

const pdfPath = path.join(__dirname, 'pdflist', 'BoothVoterList_A4_Ward_7_Booth_1.pdf');

async function updatePage1Images() {
  console.log('🔄 Updating images for page 1 only...\n');

  try {
    // Process only page 1 (maxPages=1)
    const voters = await parser.parseVoterPDFWithOCR(pdfPath, 1);
    
    console.log(`\n✅ Total voters processed: ${voters.length}`);
    
    // Load existing full voters data
    const votersJsonPath = path.join(__dirname, 'public', 'data', 'voters.json');
    let allVoters = [];
    
    if (fs.existsSync(votersJsonPath)) {
      const existingData = fs.readFileSync(votersJsonPath, 'utf8');
      allVoters = JSON.parse(existingData);
      console.log(`📋 Loaded ${allVoters.length} existing voters from database`);
    }
    
    // Find the page number of the first processed page
    const firstPageNum = voters.length > 0 ? voters[0].pageNumber : null;
    
    if (firstPageNum) {
      // Remove old page 1 voters from allVoters
      allVoters = allVoters.filter(v => v.pageNumber !== firstPageNum);
      console.log(`🗑️  Removed old page ${firstPageNum} voters`);
      
      // Add new page 1 voters
      allVoters.push(...voters);
      console.log(`➕ Added ${voters.length} new page ${firstPageNum} voters`);
      
      // Sort by page and serial number
      allVoters.sort((a, b) => {
        if (a.pageNumber !== b.pageNumber) return a.pageNumber - b.pageNumber;
        return (parseInt(a.serialNumber) || 0) - (parseInt(b.serialNumber) || 0);
      });
      
      // Save updated data
      fs.writeFileSync(votersJsonPath, JSON.stringify(allVoters, null, 2));
      console.log(`\n💾 Updated voters.json with page ${firstPageNum} corrections`);
      console.log(`📊 Total voters in database: ${allVoters.length}`);
      
      console.log(`\n📋 First 5 voters from page ${firstPageNum}:`);
      voters.slice(0, 5).forEach((v, idx) => {
        console.log(`${idx + 1}. Serial #${v.serialNumber} - ${v.name?.substring(0, 20)} - ${v.voterId}`);
        console.log(`   Image: ${v.cardImage}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

updatePage1Images();
