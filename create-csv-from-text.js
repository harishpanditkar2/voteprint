const fs = require('fs');

console.log('Creating CSV from W7F1.txt...\n');

const content = fs.readFileSync('./pdflist/W7F1.txt', 'utf8');
const lines = content.split('\n');

// CSV header
let csv = 'Serial,VoterID,Name,Age,Gender,Ward,Booth\n';

// Find all voter IDs with context
const voterIdPattern = /XUA\d{7}/g;
const foundVoters = new Map();

let match;
while ((match = voterIdPattern.exec(content)) !== null) {
  const voterId = match[0];
  const position = match.index;
  
  if (foundVoters.has(voterId)) continue;
  
  // Get surrounding context
  const contextStart = Math.max(0, position - 300);
  const contextEnd = Math.min(content.length, position + 500);
  const context = content.substring(contextStart, contextEnd);
  
  // Extract serial number
  const beforeId = context.substring(0, context.indexOf(voterId));
  const serialMatch = beforeId.match(/(\d+)\s*$/);
  if (!serialMatch) continue;
  
  const serial = serialMatch[1];
  if (parseInt(serial) < 1 || parseInt(serial) > 1000) continue;
  
  // Extract name - look backwards from voter ID
  let name = '';
  
  // Find the line containing this voter ID
  const lineIndex = lines.findIndex(line => line.includes(voterId));
  
  if (lineIndex >= 0) {
    // Look at previous 2 lines for name
    for (let i = Math.max(0, lineIndex - 2); i < lineIndex; i++) {
      const line = lines[i];
      
      // Check if line contains "मतदाराचे पूर्ण" or similar
      if (line.includes('मतदाराचे पूर्ण') || line.includes('मतदाराचे पुर्ण')) {
        // Extract name after the colon
        const nameMatch = line.match(/(?:मतदाराचे\s*पूर्ण|मतदाराचे\s*पुर्ण)\s*[:\s]+([ऀ-ॿ\s]+?)$/);
        if (nameMatch && nameMatch[1].trim().length >= 5) {
          name = nameMatch[1].trim().replace(/\s+/g, ' ');
          break;
        }
      }
      
      // If no marker found, check if line has Marathi text (likely a name)
      if (!name) {
        const marathiMatch = line.match(/([ऀ-ॿ\s]{5,})/);
        if (marathiMatch) {
          const possibleName = marathiMatch[1].trim().replace(/\s+/g, ' ');
          // Make sure it's not other metadata
          if (!possibleName.includes('नांव') && 
              !possibleName.includes('वडिलांचे') && 
              !possibleName.includes('पतीचे') &&
              !possibleName.includes('घर') &&
              possibleName.length < 50) {
            name = possibleName;
            break;
          }
        }
      }
    }
  }
  
  // Clean up name
  if (name) {
    name = name
      .replace(/^[:\s]+|[:\s]+$/g, '')
      .replace(/मतदाराचे.*?:/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  if (!name || name.length < 5) {
    name = `[Name not found - Serial ${serial}]`;
  }
  
  // Extract age
  const afterId = context.substring(context.indexOf(voterId));
  const agePattern = /वय\s*[:：]?\s*([०-९\d]+)/;
  const ageMatch = afterId.match(agePattern);
  let age = '30';
  
  if (ageMatch) {
    age = ageMatch[1]
      .replace(/०/g, '0').replace(/१/g, '1').replace(/२/g, '2')
      .replace(/३/g, '3').replace(/४/g, '4').replace(/५/g, '5')
      .replace(/६/g, '6').replace(/७/g, '7').replace(/८/g, '8')
      .replace(/९/g, '9');
  }
  
  // Extract gender
  const genderPattern = /लिंग\s*[:：]?\s*(पु|स्री|ख्री|सरी|ol|oot|it)/;
  const genderMatch = afterId.match(genderPattern);
  let gender = 'M';
  
  if (genderMatch) {
    const g = genderMatch[1];
    gender = (g === 'पु') ? 'M' : 'F';
  } else if (context.includes('पतीचे नाव') || context.includes('पतीचे')) {
    gender = 'F';
  }
  
  // Escape commas and quotes in name for CSV
  const escapedName = name.replace(/"/g, '""');
  const nameField = escapedName.includes(',') ? `"${escapedName}"` : escapedName;
  
  csv += `${serial},${voterId},${nameField},${age},${gender},7,1\n`;
  foundVoters.set(voterId, { serial, name, age, gender });
}

// Save to CSV file
fs.writeFileSync('./W7F1_voters.csv', csv);

console.log(`✅ Created W7F1_voters.csv`);
console.log(`   Total voters: ${foundVoters.size}`);
console.log(`   Expected: 991 voters`);
console.log(`   Coverage: ${((foundVoters.size / 991) * 100).toFixed(1)}%`);

// Show first few lines
console.log('\n📋 First 10 rows:');
const csvLines = csv.split('\n');
csvLines.slice(0, 11).forEach((line, i) => {
  if (i === 0) {
    console.log(`   ${line}`);
  } else if (line) {
    console.log(`   ${line}`);
  }
});

console.log('\n✅ CSV file ready for review and editing!');
console.log('   You can open it in Excel/LibreOffice to verify/correct names');
console.log('   Then import the corrected CSV back into the system\n');
