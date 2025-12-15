const fs = require('fs');

console.log('Creating comprehensive CSV from W7F1.txt...\n');

const content = fs.readFileSync('./pdflist/W7F1.txt', 'utf8');
const lines = content.split('\n');

// CSV output
let csv = 'Serial,VoterID,Name,Age,Gender,Ward,Booth\n';
const voters = [];

// First pass: Extract each voter ID with line number
const voterPositions = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const matches = [...line.matchAll(/(\d+)\s+XUA(\d{7})/g)];
  
  for (const match of matches) {
    const serial = match[1];
    const voterId = 'XUA' + match[2];
    
    if (parseInt(serial) >= 1 && parseInt(serial) <= 1000) {
      voterPositions.push({
        lineNum: i,
        serial: serial,
        voterId: voterId,
        position: match.index
      });
    }
  }
}

console.log(`Found ${voterPositions.length} voter IDs with serial numbers`);

// Second pass: Extract name, age, gender for each
for (const vp of voterPositions) {
  let name = '';
  let age = '30';
  let gender = 'M';
  
  // Look for name in previous 1-3 lines
  for (let lookback = 1; lookback <= 3; lookback++) {
    const prevLineNum = vp.lineNum - lookback;
    if (prevLineNum < 0) break;
    
    const prevLine = lines[prevLineNum];
    
    // Pattern 1: Name on its own line above voter ID
    if (prevLine.includes('मतदाराचे पूर्ण') || prevLine.includes('मतदाराचे पुर्ण')) {
      // Extract name after colon
      const nameMatch = prevLine.match(/(?:मतदाराचे\s*पूर्ण|मतदाराचे\s*पुर्ण)\s*[:\s:]+([ऀ-ॿ\s]+?)$/);
      if (nameMatch) {
        name = nameMatch[1].trim().replace(/\s+/g, ' ');
        if (name.length >= 5 && name.length < 80) {
          break;
        }
      }
    }
  }
  
  // Pattern 2: For cases where name is on same line (3-column layout)
  if (!name || name.length < 5) {
    const currentLine = lines[vp.lineNum];
    const afterSerial = currentLine.substring(vp.position);
    
    // Look for "मतदाराचे पूर्ण" pattern before this voter ID
    const beforeMatch = currentLine.substring(0, vp.position).match(/मतदाराचे\s*पूर्ण\s*[:\s:]+([ऀ-ॿ\s]+?)(?:\s+\d+\s+XUA|$)/);
    if (beforeMatch) {
      name = beforeMatch[1].trim().replace(/\s+/g, ' ');
    }
    
    // Also check next line for merged names
    if ((!name || name.length < 5) && vp.lineNum + 1 < lines.length) {
      const nextLine = lines[vp.lineNum + 1];
      
      // Extract first occurrence of name pattern
      const mergedNameMatch = nextLine.match(/मतदाराचे\s*पूर्ण\s*[:\s:]+([ऀ-ॿ\s]+?)\s+(?:मतदाराचे|नांव|वडिलांचे|पतीचे|XUA)/);
      if (mergedNameMatch) {
        name = mergedNameMatch[1].trim().replace(/\s+/g, ' ');
      }
    }
  }
  
  // Clean up name
  if (name) {
    name = name
      .replace(/^\s*[:\s]+/, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  if (!name || name.length < 5) {
    name = '[Name missing]';
  }
  
  // Extract age: Look in next 1-5 lines
  for (let lookahead = 0; lookahead <= 5; lookahead++) {
    const nextLineNum = vp.lineNum + lookahead;
    if (nextLineNum >= lines.length) break;
    
    const nextLine = lines[nextLineNum];
    
    // Find all ages in the line
    const ageMatches = [...nextLine.matchAll(/वय\s*[:：]?\s*([०-९\d]+)/g)];
    if (ageMatches.length > 0) {
      // Use first age found
      const ageValue = ageMatches[0][1];
      age = ageValue
        .replace(/०/g, '0').replace(/१/g, '1').replace(/२/g, '2')
        .replace(/३/g, '3').replace(/४/g, '4').replace(/५/g, '5')
        .replace(/६/g, '6').replace(/७/g, '7').replace(/८/g, '8')
        .replace(/९/g, '9');
      break;
    }
  }
  
  // Extract gender: Look in next 1-5 lines
  for (let lookahead = 0; lookahead <= 5; lookahead++) {
    const nextLineNum = vp.lineNum + lookahead;
    if (nextLineNum >= lines.length) break;
    
    const nextLine = lines[nextLineNum];
    
    // Find gender markers
    const genderMatches = [...nextLine.matchAll(/लिंग\s*[:：]?\s*(पु|स्री|ख्री|सरी|ol|oot|it)/g)];
    if (genderMatches.length > 0) {
      const g = genderMatches[0][1];
      gender = (g === 'पु') ? 'M' : 'F';
      break;
    }
  }
  
  // Check for husband's name indicator (means female)
  const contextLines = lines.slice(Math.max(0, vp.lineNum - 2), vp.lineNum + 3).join(' ');
  if (contextLines.includes('पतीचे नाव') && gender === 'M') {
    gender = 'F';
  }
  
  voters.push({
    serial: vp.serial,
    voterId: vp.voterId,
    name: name,
    age: age,
    gender: gender
  });
}

// Sort by serial number
voters.sort((a, b) => parseInt(a.serial) - parseInt(b.serial));

// Generate CSV
for (const v of voters) {
  const escapedName = v.name.replace(/"/g, '""');
  const nameField = escapedName.includes(',') ? `"${escapedName}"` : escapedName;
  csv += `${v.serial},${v.voterId},${nameField},${v.age},${v.gender},7,1\n`;
}

// Save to file with UTF-8 BOM for Excel compatibility
fs.writeFileSync('./W7F1_voters.csv', '\ufeff' + csv, 'utf8');

console.log(`✅ Created W7F1_voters.csv`);
console.log(`   Total voters: ${voters.length}`);
console.log(`   Expected: 991 voters`);
console.log(`   Coverage: ${((voters.length / 991) * 100).toFixed(1)}%`);

// Show sample
console.log('\n📋 Sample voters:');
voters.slice(0, 10).forEach(v => {
  console.log(`   ${v.serial.padStart(3)} | ${v.voterId} | ${v.name}`);
});

console.log('\n✅ CSV file created!');
console.log('   Open in Excel/Calc to review and edit names');
console.log('   Then you can import the corrected data\n');
