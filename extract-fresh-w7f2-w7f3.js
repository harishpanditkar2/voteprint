const fs = require('fs');
const { PDFParse } = require('pdf-parse');
const path = require('path');

console.log('🔍 Extracting Fresh Data from W7F2 and W7F3 PDFs\n');

// Helper function to parse voter block
function parseVoterData(text, booth) {
  const voters = [];
  
  // Split by voter entries - look for serial number + voter ID pattern
  const voterPattern = /(\d+)\s+(XUA|CRM|TML|NBS|DMV|TGY|UZZ|NYM|ZSL|NJV)([A-B]?\d{7})\s+(\d{3}\/\d{3}\/\d{3})/g;
  
  let match;
  const matches = [];
  while ((match = voterPattern.exec(text)) !== null) {
    matches.push({
      index: match.index,
      serial: parseInt(match[1]),
      voterId: match[2] + match[3],
      partNumber: match[4]
    });
  }
  
  console.log(`  Found ${matches.length} voter ID patterns`);
  
  // For each voter, extract the data block
  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const nextIndex = i < matches.length - 1 ? matches[i + 1].index : text.length;
    const block = text.substring(current.index, nextIndex);
    
    // Extract name
    let name = '';
    const nameMatch = block.match(/मतदाराचे\s*(?:पूर्ण|पुर्ण)\s*:?\s*([^\n]+)/);
    if (nameMatch) {
      name = nameMatch[1].trim()
        .replace(/\s*नांव.*$/i, '')
        .replace(/\s*वडिलांचे.*$/i, '')
        .replace(/\s*पतीचे.*$/i, '')
        .trim();
    }
    
    // Extract relation
    let relation = '';
    const relationMatch = block.match(/(?:वडिलांचे|पतीचे|आईचे)\s*नाव\s*:?\s*([^\n]+)/);
    if (relationMatch) {
      relation = relationMatch[1].trim()
        .replace(/\s*oo.*$/i, '')
        .replace(/\s*घर.*$/i, '')
        .replace(/[०।॥]+.*$/, '')
        .trim();
    }
    
    // Extract house
    let house = '';
    const houseMatch = block.match(/घर\s*क्रमांक\s*:?\s*([^\n]+)/);
    if (houseMatch) {
      house = houseMatch[1].trim()
        .replace(/\s*e\s*$/i, '')
        .replace(/\s*ot\s*$/i, '')
        .replace(/\s*पडि.*$/i, '')
        .replace(/[-।]+$/, '')
        .trim();
      if (house === '-' || house === '।' || house === 'NA') house = '';
    }
    
    // Extract age and gender
    let age = '';
    let gender = '';
    const ageMatch = block.match(/वय\s*:?\s*([०-९\d]+)/);
    const genderMatch = block.match(/लिंग\s*:?\s*(पु|स्त्री|स्री|ख्री)/);
    
    if (ageMatch) {
      age = ageMatch[1];
      // Convert Devanagari numerals to Arabic
      age = age.replace(/[०-९]/g, d => String.fromCharCode(d.charCodeAt(0) - 0x0966 + 48));
    }
    
    if (genderMatch) {
      const g = genderMatch[1];
      gender = g.includes('पु') ? 'M' : 'F';
    }
    
    if (name || age || gender) {
      voters.push({
        voterId: current.voterId,
        name: name || 'N/A',
        age: age || 'N/A',
        gender: gender || 'N/A',
        ward: '7',
        booth: booth,
        serial: current.serial.toString(),
        serialNumber: current.serial.toString(),
        relation: relation || 'N/A',
        house: house || 'N/A',
        partNumber: current.partNumber,
        actualWard: '7',
        actualBooth: booth
      });
    }
  }
  
  return voters;
}

// Extract W7F2
async function extractW7F2() {
  console.log('📄 Extracting W7F2 data...');
  
  const pdfPath = './pdflist/BoothVoterList_A4_Ward_7_Booth_2 - converted.pdf';
  const dataBuffer = fs.readFileSync(pdfPath);
  
  const parser = new PDFParse(dataBuffer);
  const data = await parser.parse();
  console.log(`  Pages: ${data.numpages}`);
  console.log(`  Text length: ${data.text.length} characters`);
  
  const voters = parseVoterData(data.text, '2');
  console.log(`  ✅ Extracted ${voters.length} voters\n`);
  
  return voters;
}

// Extract W7F3
async function extractW7F3() {
  console.log('📄 Extracting W7F3 data...');
  
  const pdfPath = './pdflist/BoothVoterList_A4_Ward_7_Booth_3 - converted.pdf';
  const dataBuffer = fs.readFileSync(pdfPath);
  
  const parser = new PDFParse(dataBuffer);
  const data = await parser.parse();
  console.log(`  Pages: ${data.numpages}`);
  console.log(`  Text length: ${data.text.length} characters`);
  
  const voters = parseVoterData(data.text, '3');
  console.log(`  ✅ Extracted ${voters.length} voters\n`);
  
  return voters;
}

// Main execution
async function main() {
  try {
    // Extract from PDFs
    const w7f2Voters = await extractW7F2();
    const w7f3Voters = await extractW7F3();
    
    // Read current database
    const currentVoters = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf-8'));
    
    console.log('📊 Current Database:');
    const currentW7F1 = currentVoters.filter(v => v.ward === '7' && v.booth === '1');
    const currentW7F2 = currentVoters.filter(v => v.ward === '7' && v.booth === '2');
    const currentW7F3 = currentVoters.filter(v => v.ward === '7' && v.booth === '3');
    console.log(`  W7F1: ${currentW7F1.length} voters`);
    console.log(`  W7F2: ${currentW7F2.length} voters`);
    console.log(`  W7F3: ${currentW7F3.length} voters`);
    console.log(`  Total: ${currentVoters.length} voters\n`);
    
    // Create backup
    const backupPath = `voters-backup-before-fresh-extraction-${Date.now()}.json`;
    fs.writeFileSync(backupPath, JSON.stringify(currentVoters, null, 2));
    console.log(`💾 Backup created: ${backupPath}\n`);
    
    // Replace W7F2 and W7F3 data
    const updatedVoters = [
      ...currentW7F1,  // Keep W7F1 as is
      ...w7f2Voters,   // Replace with fresh W7F2
      ...w7f3Voters    // Replace with fresh W7F3
    ];
    
    console.log('📊 Updated Database:');
    console.log(`  W7F1: ${currentW7F1.length} voters (unchanged)`);
    console.log(`  W7F2: ${w7f2Voters.length} voters (extracted fresh)`);
    console.log(`  W7F3: ${w7f3Voters.length} voters (extracted fresh)`);
    console.log(`  Total: ${updatedVoters.length} voters\n`);
    
    // Save updated database
    fs.writeFileSync('./public/data/voters.json', JSON.stringify(updatedVoters, null, 2));
    
    // Quality check
    console.log('🔍 Quality Check:');
    const missingNames = updatedVoters.filter(v => !v.name || v.name === 'N/A').length;
    const missingAges = updatedVoters.filter(v => !v.age || v.age === 'N/A').length;
    const missingGenders = updatedVoters.filter(v => !v.gender || v.gender === 'N/A').length;
    
    console.log(`  ✓ Valid names: ${updatedVoters.length - missingNames}/${updatedVoters.length}`);
    console.log(`  ✓ Valid ages: ${updatedVoters.length - missingAges}/${updatedVoters.length}`);
    console.log(`  ✓ Valid genders: ${updatedVoters.length - missingGenders}/${updatedVoters.length}`);
    
    if (missingNames > 0) console.log(`  ⚠️  Missing names: ${missingNames}`);
    if (missingAges > 0) console.log(`  ⚠️  Missing ages: ${missingAges}`);
    if (missingGenders > 0) console.log(`  ⚠️  Missing genders: ${missingGenders}`);
    
    console.log('\n✅ Fresh extraction and update complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
