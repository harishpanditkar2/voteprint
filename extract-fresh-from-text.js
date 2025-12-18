const fs = require('fs');

console.log('🔍 Extracting Fresh Data from W7F2.txt and W7F3.txt\n');

// Helper function to parse voter block from text
function parseVoterFromText(serial, voterId, partNumber, textBlock, booth) {
  // Extract name
  let name = '';
  const nameMatch = textBlock.match(/मतदाराचे\s*(?:पूर्ण|पुर्ण)\s*:?\s*([^\n]+)/);
  if (nameMatch) {
    name = nameMatch[1].trim()
      .replace(/\s*नांव.*$/i, '')
      .replace(/\s*वडिलांचे.*$/i, '')
      .replace(/\s*पतीचे.*$/i, '')
      .replace(/\s*\|.*$/i, '')
      .trim();
  }
  
  // Extract relation
  let relation = '';
  const relationMatch = textBlock.match(/(?:वडिलांचे|पतीचे|आईचे|इतर)\s*(?:नाव)?\s*:?\s*([^\n|०]+)/);
  if (relationMatch) {
    relation = relationMatch[1].trim()
      .replace(/\s*oo.*$/i, '')
      .replace(/\s*घर.*$/i, '')
      .replace(/[०।॥e]+.*$/, '')
      .trim();
  }
  
  // Extract house
  let house = '';
  const houseMatch = textBlock.match(/घर\s*क्रमांक\s*:?\s*([^\n]+)/);
  if (houseMatch) {
    house = houseMatch[1].trim()
      .replace(/\s*[eot]+\s*$/i, '')
      .replace(/\s*पडि.*$/i, '')
      .replace(/[-।]+$/, '')
      .trim();
    if (house === '-' || house === '।' || house === 'NA' || house === 'e') house = '';
  }
  
  // Extract age and gender
  let age = '';
  let gender = '';
  const ageMatch = textBlock.match(/वय\s*:?\s*([०-९\d]+)/);
  const genderMatch = textBlock.match(/लिंग\s*:?\s*(पु|स्त्री|स्री|ख्री|खरी)/);
  
  if (ageMatch) {
    age = ageMatch[1];
    // Convert Devanagari numerals to Arabic
    age = age.replace(/[०-९]/g, d => String.fromCharCode(d.charCodeAt(0) - 0x0966 + 48));
  }
  
  if (genderMatch) {
    const g = genderMatch[1];
    gender = g.includes('पु') ? 'M' : 'F';
  }
  
  return {
    voterId: voterId,
    name: name || 'N/A',
    age: age || 'N/A',
    gender: gender || 'N/A',
    ward: '7',
    booth: booth,
    serial: serial.toString(),
    serialNumber: serial.toString(),
    relation: relation || 'N/A',
    house: house || 'N/A',
    partNumber: partNumber,
    actualWard: '7',
    actualBooth: booth
  };
}

// Parse W7F2.txt
function extractW7F2() {
  console.log('📄 Parsing W7F2.txt...');
  const text = fs.readFileSync('./pdflist/W7F2.txt', 'utf-8');
  const lines = text.split('\n');
  
  const voters = [];
  const voterPattern = /^(\d+)\s+(XUA|CRM|TML|NBS|DMV|TGY|UZZ|NYM|ZSL|NJV)([A-B]?\d{7})\s+(\d{3}\/\d{3}\/\d{3})/;
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    const match = line.match(voterPattern);
    
    if (match) {
      const serial = parseInt(match[1]);
      const voterId = match[2] + match[3];
      const partNumber = match[4];
      
      // Collect next 5-6 lines as voter data block
      const block = [];
      for (let j = 0; j < 6 && i + j < lines.length; j++) {
        block.push(lines[i + j]);
      }
      
      const voter = parseVoterFromText(serial, voterId, partNumber, block.join('\n'), '2');
      voters.push(voter);
      
      i += 6;
    } else {
      i++;
    }
  }
  
  console.log(`  ✅ Extracted ${voters.length} voters\n`);
  return voters;
}

// Parse W7F3.txt
function extractW7F3() {
  console.log('📄 Parsing W7F3.txt...');
  const text = fs.readFileSync('./pdflist/W7F3.txt', 'utf-8');
  const lines = text.split('\n');
  
  const voters = [];
  const voterPattern = /^(\d+)\s+(XUA|CRM|TML|NBS|DMV|TGY|UZZ|NYM|ZSL|NJV)([A-B]?\d{7})\s+(\d{3}\/\d{3}\/\d{3})/;
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    const match = line.match(voterPattern);
    
    if (match) {
      const serial = parseInt(match[1]);
      const voterId = match[2] + match[3];
      const partNumber = match[4];
      
      // Collect next 5-6 lines as voter data block
      const block = [];
      for (let j = 0; j < 6 && i + j < lines.length; j++) {
        block.push(lines[i + j]);
      }
      
      const voter = parseVoterFromText(serial, voterId, partNumber, block.join('\n'), '3');
      voters.push(voter);
      
      i += 6;
    } else {
      i++;
    }
  }
  
  console.log(`  ✅ Extracted ${voters.length} voters\n`);
  return voters;
}

// Main execution
try {
  // Extract from text files
  const w7f2Voters = extractW7F2();
  const w7f3Voters = extractW7F3();
  
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
  
  // Replace W7F2 and W7F3 data with freshly extracted data
  const updatedVoters = [
    ...currentW7F1,  // Keep W7F1 as is
    ...w7f2Voters,   // Replace with fresh W7F2
    ...w7f3Voters    // Replace with fresh W7F3
  ];
  
  console.log('📊 Updated Database:');
  console.log(`  W7F1: ${currentW7F1.length} voters (unchanged)`);
  console.log(`  W7F2: ${w7f2Voters.length} voters (freshly extracted)`);
  console.log(`  W7F3: ${w7f3Voters.length} voters (freshly extracted)`);
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
  
  // Show samples
  console.log('\n📋 Sample W7F2 voters:');
  w7f2Voters.slice(0, 3).forEach(v => {
    console.log(`  Serial ${v.serial}: ${v.name} (${v.age}/${v.gender}) - ${v.voterId}`);
  });
  
  console.log('\n📋 Sample W7F3 voters:');
  w7f3Voters.slice(0, 3).forEach(v => {
    console.log(`  Serial ${v.serial}: ${v.name} (${v.age}/${v.gender}) - ${v.voterId}`);
  });
  
  console.log('\n✅ Fresh extraction and update complete!\n');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}
