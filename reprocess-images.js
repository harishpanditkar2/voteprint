// Re-process existing PDF to regenerate voter card images with new cropping
const parser = require('./lib/tesseractCLIParser');
const fs = require('fs').promises;
const path = require('path');

async function reprocessImages() {
  try {
    // Use the most recent uploaded PDF
    const pdfPath = 'public/uploads/1765723758561_BoothVoterList_A4_Ward_7_Booth_1.pdf';
    
    const metadata = {
      ward: '7',
      booth: '1',
      pollingCenter: 'नगरपरिषद सवम विकनद सभगह'
    };
    
    console.log('🔄 Re-processing PDF with improved cropping algorithm...');
    console.log(`📄 PDF: ${pdfPath}`);
    
    const voters = await parser.parseVoterPDFWithOCR(pdfPath);
    
    console.log(`✅ Processed ${voters.length} voters`);
    console.log('💾 Saving to voters.json...');
    
    await fs.writeFile(
      'public/data/voters.json',
      JSON.stringify(voters, null, 2)
    );
    
    console.log('✅ Done! Voter card images have been regenerated with border-aware cropping.');
    console.log('🔍 Check public/voter-cards/ for the new images');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

reprocessImages();
