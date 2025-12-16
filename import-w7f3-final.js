const fs = require('fs');

// Read the voters file
let voters = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf-8'));

// Read W7F3 text file
const w7f3Text = fs.readFileSync('./pdflist/W7F3.txt', 'utf-8');
const lines = w7f3Text.split('\n');

console.log(`Read ${lines.length} lines from W7F3.txt`);

// Helper to convert Devanagari digits
function convertDevanagariToArabic(str) {
  return str.replace(/०/g, '0').replace(/१/g, '1').replace(/२/g, '2')
            .replace(/३/g, '3').replace(/४/g, '4').replace(/५/g, '5')
            .replace(/६/g, '6').replace(/७/g, '7').replace(/८/g, '8')
            .replace(/९/g, '9');
}

// Extract all voter ID lines with their line numbers
const voterLines = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const voterPattern = /(\d+)\s+([A-Z]{3}[A-B]?\d{7})\s+(\d{3}\/\d{3}\/\d{3,4})/g;
  const matches = [...line.matchAll(voterPattern)];
  
  if (matches.length > 0) {
    voterLines.push({ lineIdx: i, line: line, matches: matches });
  }
}

console.log(`Found ${voterLines.length} lines containing voter data`);

// Parse each voter line
const newVoters = [];

for (const voterLine of voterLines) {
  const { lineIdx, line, matches } = voterLine;
  
  // Determine how many voters are on this line
  const numVoters = matches.length;
  
  if (numVoters === 0) continue;
  
  // Get the next few lines
  const nameLine = lines[lineIdx + 1] || '';
  const relationLine = lines[lineIdx + 2] || '';
  const houseLine = lines[lineIdx + 3] || '';
  const ageLine = lines[lineIdx + 4] || '';
  
  if (numVoters === 1) {
    // Single voter format
    const match = matches[0];
    const serial = parseInt(match[1]);
    const voterId = match[2];
    const partNumber = match[3];
    
    // Extract name
    const nameMatch = nameLine.match(/मतदाराचे\s*(?:पूर्ण|पुर्ण)\s*:([^\n]+)/);
    let name = '';
    if (nameMatch) {
      name = nameMatch[1].replace(/नांव|नाव/g, '').trim().split(/\s+/).slice(0, 4).join(' ');
    }
    
    // Extract relation
    let relation = '';
    if (relationLine.includes('वडिलांचे नाव')) {
      const m = relationLine.match(/वडिलांचे नाव\s*:([^०७eहन\n]+)/);
      if (m) relation = m[1].trim().split(/\s+/).slice(0, 3).join(' ');
    } else if (relationLine.includes('पतीचे नाव') || relationLine.includes('पतीचेनाव')) {
      const m = relationLine.match(/पतीचे\s*नाव\s*:([^०७eहन\n]+)/);
      if (m) relation = m[1].trim().split(/\s+/).slice(0, 3).join(' ');
    } else if (relationLine.includes('आईचे नाव')) {
      const m = relationLine.match(/आईचे नाव\s*:([^०७eहन\n]+)/);
      if (m) relation = m[1].trim().split(/\s+/).slice(0, 3).join(' ');
    } else if (relationLine.includes('इतर')) {
      const m = relationLine.match(/इतर\s*:([^०७eहन\n]+)/);
      if (m) relation = m[1].trim().split(/\s+/).slice(0, 3).join(' ');
    }
    
    // Extract house
    const houseMatch = houseLine.match(/घर\s*क्रमांक\s*:?\s*([^०७eहनबपडि\n]+)/);
    const house = houseMatch ? houseMatch[1].trim().slice(0, 50) : '';
    
    // Extract age and gender
    const ageMatch = ageLine.match(/वय\s*:?\s*([०-९\d]+)/);
    const genderMatch = ageLine.match(/लिंग\s*:?\s*(पु|स्री|खरी|ख्री|it|-t|oot|:पु|:ख्री|:स्री)/);
    
    let age = 0;
    if (ageMatch) {
      const ageStr = convertDevanagariToArabic(ageMatch[1]);
      age = parseInt(ageStr) || 0;
    }
    
    let gender = 'M';
    if (genderMatch) {
      const g = genderMatch[1];
      if (g.includes('स्री') || g.includes('खरी') || g.includes('ख्री') || g === 'it' || g === '-t' || g === 'oot') {
        gender = 'F';
      }
    }
    
    if (name && voterId) {
      newVoters.push({
        voterId: voterId,
        name: name,
        age: age,
        gender: gender,
        ward: '7',
        booth: '3',
        serial: serial,
        relation: relation,
        house: house,
        partNumber: partNumber,
        uniqueSerial: `W7F3-S${serial}`
      });
    }
  } else {
    // Multi-voter format (typically 3)
    const votersData = matches.map(m => ({
      serial: parseInt(m[1]),
      voterId: m[2],
      partNumber: m[3]
    }));
    
    // Split name line
    const nameParts = nameLine.split(/मतदाराचे\s*(?:पूर्ण|पुर्ण)\s*:/).slice(1);
    const names = nameParts.map(p => p.replace(/नांव|नाव/g, '').trim().split(/\s+/).slice(0, 4).join(' '));
    
    // Split relation line by |
    const relationParts = relationLine.split('|');
    const relations = relationParts.map(p => {
      let rel = '';
      if (p.includes('वडिलांचे नाव')) {
        const m = p.match(/वडिलांचे नाव\s*:([^०७eहन\n]+)/);
        if (m) rel = m[1].trim().split(/\s+/).slice(0, 3).join(' ');
      } else if (p.includes('पतीचे नाव') || p.includes('पतीचेनाव')) {
        const m = p.match(/पतीचे\s*नाव\s*:([^०७eहन\n]+)/);
        if (m) rel = m[1].trim().split(/\s+/).slice(0, 3).join(' ');
      } else if (p.includes('आईचे नाव')) {
        const m = p.match(/आईचे नाव\s*:([^०७eहन\n]+)/);
        if (m) rel = m[1].trim().split(/\s+/).slice(0, 3).join(' ');
      } else if (p.includes('इतर')) {
        const m = p.match(/इतर\s*:([^०७eहन\n]+)/);
        if (m) rel = m[1].trim().split(/\s+/).slice(0, 3).join(' ');
      }
      return rel;
    });
    
    // Split house line by |
    const houseParts = houseLine.split('|');
    const houses = houseParts.map(p => {
      const m = p.match(/घर\s*क्रमांक\s*:?\s*([^०७eहनबपडि\n]+)/);
      return m ? m[1].trim().slice(0, 50) : '';
    });
    
    // Split age line - look for multiple "वय :" patterns
    const ageGenderParts = ageLine.split(/(?=वय\s*:)/);
    const agesGenders = ageGenderParts.map(p => {
      const ageMatch = p.match(/वय\s*:?\s*([०-९\d]+)/);
      const genderMatch = p.match(/लिंग\s*:?\s*(पु|स्री|खरी|ख्री|it|-t|oot|:पु|:ख्री|:स्री)/);
      
      let age = 0;
      if (ageMatch) {
        const ageStr = convertDevanagariToArabic(ageMatch[1]);
        age = parseInt(ageStr) || 0;
      }
      
      let gender = 'M';
      if (genderMatch) {
        const g = genderMatch[1];
        if (g.includes('स्री') || g.includes('खरी') || g.includes('ख्री') || g === 'it' || g === '-t' || g === 'oot') {
          gender = 'F';
        }
      }
      
      return { age, gender };
    }).filter(ag => ag.age > 0 || ag.gender);
    
    // Combine all data
    for (let i = 0; i < votersData.length; i++) {
      const name = names[i] || '';
      const relation = relations[i] || '';
      const house = houses[i] || '';
      const ageGender = agesGenders[i] || { age: 0, gender: 'M' };
      
      if (name && votersData[i].voterId) {
        newVoters.push({
          voterId: votersData[i].voterId,
          name: name,
          age: ageGender.age,
          gender: ageGender.gender,
          ward: '7',
          booth: '3',
          serial: votersData[i].serial,
          relation: relation,
          house: house,
          partNumber: votersData[i].partNumber,
          uniqueSerial: `W7F3-S${votersData[i].serial}`
        });
      }
    }
  }
}

console.log(`Parsed ${newVoters.length} voters from W7F3`);

// Show database state before import
const beforeW7F1 = voters.filter(v => v.ward === '7' && v.booth === '1').length;
const beforeW7F2 = voters.filter(v => v.ward === '7' && v.booth === '2').length;
const beforeW7F3 = voters.filter(v => v.ward === '7' && v.booth === '3').length;

console.log(`\nCurrent database:`);
console.log(`Total voters: ${voters.length}`);
console.log(`W7F1 (Booth 1): ${beforeW7F1} voters`);
console.log(`W7F2 (Booth 2): ${beforeW7F2} voters`);
console.log(`W7F3 (Booth 3): ${beforeW7F3} voters`);

// Remove existing W7F3 voters to reimport
voters = voters.filter(v => !(v.ward === '7' && v.booth === '3'));
console.log(`\nRemoved existing W7F3 voters. Total now: ${voters.length}`);

// Add all new voters
let added = 0;
for (const newVoter of newVoters) {
  voters.push(newVoter);
  added++;
}

console.log(`Added: ${added} voters`);
console.log(`New total: ${voters.length} voters`);

// Show final state
const afterW7F1 = voters.filter(v => v.ward === '7' && v.booth === '1').length;
const afterW7F2 = voters.filter(v => v.ward === '7' && v.booth === '2').length;
const afterW7F3 = voters.filter(v => v.ward === '7' && v.booth === '3').length;

console.log(`\nFinal database:`);
console.log(`Total voters: ${voters.length}`);
console.log(`W7F1 (Booth 1): ${afterW7F1} voters`);
console.log(`W7F2 (Booth 2): ${afterW7F2} voters`);
console.log(`W7F3 (Booth 3): ${afterW7F3} voters (expected: ~795)`);

// Create backup
const backupPath = `./public/data/voters-backup-w7f3-final-${Date.now()}.json`;
fs.writeFileSync(backupPath, JSON.stringify(voters, null, 2));

// Save updated voters
fs.writeFileSync('./public/data/voters.json', JSON.stringify(voters, null, 2));

console.log(`\nBackup created: ${backupPath}`);
console.log('W7F3 import COMPLETE!');
console.log(`\n✅ Ward 7 Total: ${afterW7F1 + afterW7F2 + afterW7F3} voters`);
