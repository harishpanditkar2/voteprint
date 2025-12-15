const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = './pdflist/page2.pdf';

async function extractPDFText() {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf.default(dataBuffer);
    
    console.log('📄 PDF Text Extraction from page2.pdf');
    console.log('='.repeat(70));
    console.log(`Total pages: ${data.numpages}`);
    console.log(`Total characters: ${data.text.length}`);
    console.log('='.repeat(70));
    console.log('\n📝 EXTRACTED TEXT:\n');
    console.log(data.text);
    console.log('\n' + '='.repeat(70));
    
    // Check for proper Marathi names
    console.log('\n🔍 CHECKING FOR PROPER MARATHI TEXT:\n');
    
    // Look for names with proper vowel signs
    const properNames = data.text.match(/[गजतदनपबमयरलवशषसहक-ह]ा[नजतदपबमयरलवशषसहक-ह]/g);
    if (properNames && properNames.length > 0) {
      console.log('✅ Found proper vowel signs "ा" in text!');
      console.log(`   Examples: ${properNames.slice(0, 5).join(', ')}`);
    } else {
      console.log('❌ No proper "ा" vowel signs found - text may be corrupted');
    }
    
    // Extract voter IDs
    const voterIds = data.text.match(/[XC][UR][AM]\d{7}/g);
    if (voterIds) {
      console.log(`\n✅ Found ${voterIds.length} voter IDs:`);
      voterIds.slice(0, 5).forEach(id => console.log(`   ${id}`));
    }
    
    // Save to file for inspection
    fs.writeFileSync('./page2-extracted-text.txt', data.text, 'utf8');
    console.log('\n💾 Full text saved to: page2-extracted-text.txt');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

extractPDFText();
