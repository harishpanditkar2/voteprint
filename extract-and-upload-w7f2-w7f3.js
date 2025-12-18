const fs = require('fs');
const path = require('path');

// Read existing voters
const votersPath = path.join(__dirname, 'public', 'data', 'voters.json');
const existingVoters = JSON.parse(fs.readFileSync(votersPath, 'utf8'));

console.log('📊 Current database status:');
const w7f1Count = existingVoters.filter(v => v.ward === '7' && v.booth === '1').length;
const w7f2Count = existingVoters.filter(v => v.ward === '7' && v.booth === '2').length;
const w7f3Count = existingVoters.filter(v => v.ward === '7' && v.booth === '3').length;
console.log(`W7F1: ${w7f1Count} voters`);
console.log(`W7F2: ${w7f2Count} voters`);
console.log(`W7F3: ${w7f3Count} voters`);
console.log(`Total: ${existingVoters.length} voters\n`);

// Function to parse voter data from text blocks
function parseVoterBlock(block, serial, voterId, constituency, booth) {
  const lines = block.split('\n').map(l => l.trim()).filter(l => l);
  
  let name = '';
  let relation = '';
  let house = '';
  let age = '';
  let gender = '';
  
  // Extract name - usually on first line after serial/voterId
  for (let line of lines) {
    if (line.includes('मतदाराचे पूर्ण') || line.includes('नांव')) {
      const nameMatch = line.match(/मतदाराचे\s*पूर्ण\s*:?\s*(.+?)(?:\s+नांव|$)/);
      if (nameMatch) {
        name = nameMatch[1].trim();
        // Clean up common OCR artifacts
        name = name.replace(/\s+नांव\s*$/, '').replace(/\s+\|\s*$/, '').trim();
      }
    }
    
    // Extract relation (father/husband name)
    if (line.includes('वडिलांचे नाव') || line.includes('पतीचे नाव')) {
      const relationMatch = line.match(/(?:वडिलांचे|पतीचे)\s*नाव\s*:?\s*(.+?)(?:\s+oo|\s+[०-९]|\s+घर|$)/);
      if (relationMatch) {
        relation = relationMatch[1].trim();
        relation = relation.replace(/\s+oo\s*$/, '').replace(/\s+[०-९।].*$/, '').trim();
      }
    }
    
    // Extract house number
    if (line.includes('घर क्रमांक')) {
      const houseMatch = line.match(/घर\s*क्रमांक\s*:?\s*(.+?)(?:\s+e|\s+ot|$)/);
      if (houseMatch) {
        house = houseMatch[1].trim();
        house = house.replace(/\s+[eot].*$/, '').replace(/[-।पडि]+$/, '').trim();
        if (house === '-' || house === '।' || !house) house = '';
      }
    }
    
    // Extract age and gender
    if (line.includes('वय') && line.includes('लिंग')) {
      const ageMatch = line.match(/वय\s*:?\s*([०-९०-९\d]+)/);
      const genderMatch = line.match(/लिंग\s*:?\s*([पुस्][ुृर][षी]?)/);
      
      if (ageMatch) {
        age = ageMatch[1];
        // Convert Marathi numerals to English
        age = age.replace(/[०-९]/g, d => String.fromCharCode(d.charCodeAt(0) - 0x0966 + 48));
        age = age.replace(/[०-९]/g, d => String.fromCharCode(d.charCodeAt(0) - 0x0966 + 48));
      }
      
      if (genderMatch) {
        const g = genderMatch[1];
        if (g.includes('पु')) gender = 'M';
        else if (g.includes('स्') || g.includes('ख्')) gender = 'F';
      }
    }
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
    partNumber: constituency || 'N/A',
    actualWard: '7',
    actualBooth: booth
  };
}

// Function to extract voters from text file
function extractVotersFromText(filePath, booth) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Pattern to match: serial number, voter ID, constituency
  const voterPattern = /^(\d+)\s+(XUA|CRM|TML|NBS|DMV|TGY|UZZ|NYM|ZSL|NJV)(\w+)\s+(\d+\/\d+\/\d+)\s*$/;
  
  const voters = [];
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i].trim();
    const match = line.match(voterPattern);
    
    if (match) {
      const serial = parseInt(match[1]);
      const voterId = match[2] + match[3];
      const constituency = match[4];
      
      // Collect next 4-5 lines as voter data block
      const block = [];
      for (let j = 0; j < 6 && i + j < lines.length; j++) {
        block.push(lines[i + j]);
      }
      
      const voter = parseVoterBlock(block.join('\n'), serial, voterId, constituency, booth);
      voters.push(voter);
      
      i += 6; // Skip the block
    } else {
      i++;
    }
  }
  
  return voters;
}

console.log('\n🔄 Extracting W7F2 voters from text file...');
const w7f2Voters = extractVotersFromText('pdflist/W7F2.txt', '2');
console.log(`✅ Extracted ${w7f2Voters.length} W7F2 voters`);

console.log('\n🔄 Extracting W7F3 voters from text file...');
const w7f3Voters = extractVotersFromText('pdflist/W7F3.txt', '3');
console.log(`✅ Extracted ${w7f3Voters.length} W7F3 voters`);

// Show samples
console.log('\n📋 Sample W7F2 voters:');
w7f2Voters.slice(0, 3).forEach(v => {
  console.log(`  Serial ${v.serial}: ${v.name} (${v.age}/${v.gender}) - ${v.voterId}`);
});

console.log('\n📋 Sample W7F3 voters:');
w7f3Voters.slice(0, 3).forEach(v => {
  console.log(`  Serial ${v.serial}: ${v.name} (${v.age}/${v.gender}) - ${v.voterId}`);
});

// Validate data quality
console.log('\n🔍 Data quality check:');
const w7f2WithNames = w7f2Voters.filter(v => v.name && v.name !== 'N/A').length;
const w7f3WithNames = w7f3Voters.filter(v => v.name && v.name !== 'N/A').length;
console.log(`W7F2: ${w7f2WithNames}/${w7f2Voters.length} voters have names (${(w7f2WithNames/w7f2Voters.length*100).toFixed(1)}%)`);
console.log(`W7F3: ${w7f3WithNames}/${w7f3Voters.length} voters have names (${(w7f3WithNames/w7f3Voters.length*100).toFixed(1)}%)`);

// Create backup
const backupPath = `voters-backup-w7f2-w7f3-${Date.now()}.json`;
fs.writeFileSync(backupPath, JSON.stringify(existingVoters, null, 2));
console.log(`\n💾 Backup created: ${backupPath}`);

// Remove existing W7F2 and W7F3 voters
const otherVoters = existingVoters.filter(v => !(v.ward === '7' && (v.booth === '2' || v.booth === '3')));
console.log(`\n🗑️  Removed ${w7f2Count} existing W7F2 voters`);
console.log(`🗑️  Removed ${w7f3Count} existing W7F3 voters`);

// Combine with new data
const updatedVoters = [...otherVoters, ...w7f2Voters, ...w7f3Voters];

console.log(`\n📊 Updated database status:`);
const newW7f1Count = updatedVoters.filter(v => v.ward === '7' && v.booth === '1').length;
const newW7f2Count = updatedVoters.filter(v => v.ward === '7' && v.booth === '2').length;
const newW7f3Count = updatedVoters.filter(v => v.ward === '7' && v.booth === '3').length;
console.log(`W7F1: ${newW7f1Count} voters (unchanged)`);
console.log(`W7F2: ${newW7f2Count} voters (${newW7f2Count > w7f2Count ? '+' : ''}${newW7f2Count - w7f2Count})`);
console.log(`W7F3: ${newW7f3Count} voters (${newW7f3Count > w7f3Count ? '+' : ''}${newW7f3Count - w7f3Count})`);
console.log(`Total: ${updatedVoters.length} voters`);

// Write updated data
fs.writeFileSync(votersPath, JSON.stringify(updatedVoters, null, 2));
console.log(`\n✅ Database updated successfully!`);
console.log(`📁 File: ${votersPath}`);
