const fs = require('fs');

// Read the voters file
let voters = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf-8'));

// Read W7F3 text file
const w7f3Text = fs.readFileSync('./pdflist/W7F3.txt', 'utf-8');
const lines = w7f3Text.split('\n');

console.log(`Read ${lines.length} lines from W7F3.txt`);

// Parse a single voter block
function parseSingleVoter(serial, voterId, partNumber, nameText, relationText, houseText, ageGenderText) {
  if (!serial || !voterId) return null;
  
  // Extract name
  const nameMatch = nameText.match(/मतदाराचे\s*(?:पूर्ण|पुर्ण)\s*:([^\s]+(?:\s+[^\s]+)*)/);
  const name = nameMatch ? nameMatch[1].replace(/नांव|नाव/g, '').trim() : '';
  
  // Extract relation
  let relation = '';
  let relationType = '';
  
  if (relationText.includes('वडिलांचे नाव')) {
    const match = relationText.match(/वडिलांचे नाव\s*:([^|०७eहन]+)/);
    if (match) {
      relation = match[1].replace(/[०७e\s*]+$/, '').trim();
      relationType = 'father';
    }
  } else if (relationText.includes('पतीचे नाव') || relationText.includes('पतीचेनाव')) {
    const match = relationText.match(/पतीचे नाव\s*:([^|०७eहन]+)/);
    if (match) {
      relation = match[1].replace(/[०७e\s*]+$/, '').trim();
      relationType = 'husband';
    }
  } else if (relationText.includes('आईचे नाव')) {
    const match = relationText.match(/आईचे नाव\s*:([^|०७eहन]+)/);
    if (match) {
      relation = match[1].replace(/[०७e\s*]+$/, '').trim();
      relationType = 'mother';
    }
  } else if (relationText.includes('इतर')) {
    const match = relationText.match(/इतर\s*:([^|०७eहन]+)/);
    if (match) {
      relation = match[1].replace(/[०७e\s*]+$/, '').trim();
      relationType = 'other';
    }
  }
  
  // Extract house
  const houseMatch = houseText.match(/घर\s*क्रमांक\s*:?\s*([^|०७eहनब]+)/);
  const house = houseMatch ? houseMatch[1].trim() : '';
  
  // Extract age and gender
  const ageMatch = ageGenderText.match(/वय\s*:?\s*([०-९\d]+)/);
  const genderMatch = ageGenderText.match(/लिंग\s*:?\s*(पु|स्री|खरी|ख्री|it|-t|oot|:पु|:ख्री|:स्री)/);
  
  let age = 0;
  if (ageMatch) {
    let ageStr = ageMatch[1];
    // Convert Devanagari digits to Arabic
    ageStr = ageStr.replace(/०/g, '0').replace(/१/g, '1').replace(/२/g, '2')
                   .replace(/३/g, '3').replace(/४/g, '4').replace(/५/g, '5')
                   .replace(/६/g, '6').replace(/७/g, '7').replace(/८/g, '8')
                   .replace(/९/g, '9');
    age = parseInt(ageStr) || 0;
  }
  
  let gender = 'M';
  if (genderMatch) {
    const g = genderMatch[1];
    if (g.includes('स्री') || g.includes('खरी') || g.includes('ख्री') || g === 'it' || g === '-t' || g === 'oot') {
      gender = 'F';
    }
  }
  
  return {
    voterId: voterId.trim(),
    name: name,
    age: age,
    gender: gender,
    ward: '7',
    booth: '3',
    serial: parseInt(serial),
    relation: relation,
    house: house,
    partNumber: partNumber.trim(),
    uniqueSerial: `W7F3-S${parseInt(serial)}`
  };
}

// Parse all voters
const newVoters = [];
let idx = 0;

while (idx < lines.length) {
  const line = lines[idx];
  
  // Skip header/footer lines
  if (line.includes('DELETED') || line.includes('बारामती नगर परिषद') || 
      line.includes('मतदान केंद्र :') || line.trim() === '' ||
      line.includes('पृष्ठ') || line.includes('सदरची यादी')) {
    idx++;
    continue;
  }
  
  // Check if line has voter IDs
  const voterIdPattern = /[A-Z]{3}[A-B]?\d{7}/g;
  const voterIdsInLine = line.match(voterIdPattern);
  
  if (!voterIdsInLine || voterIdsInLine.length === 0) {
    idx++;
    continue;
  }
  
  // Split line by | to get sections
  const sections = line.split('|').map(s => s.trim());
  
  if (sections.length === 1) {
    // Single voter format
    const match = line.match(/(\d+)\s+([A-Z]{3}[A-B]?\d{7})\s+(\d{3}\/\d{3}\/\d{3,4})/);
    if (match && idx + 4 < lines.length) {
      const serial = match[1];
      const voterId = match[2];
      const partNumber = match[3];
      
      const nameLine = lines[idx + 1] || '';
      const relationLine = lines[idx + 2] || '';
      const houseLine = lines[idx + 3] || '';
      const ageLine = lines[idx + 4] || '';
      
      const voter = parseSingleVoter(serial, voterId, partNumber, nameLine, relationLine, houseLine, ageLine);
      if (voter && voter.name) {
        newVoters.push(voter);
      }
      idx += 5;
    } else {
      idx++;
    }
  } else if (sections.length >= 3) {
    // Multi-column format (3 voters per line)
    const parsedFromLine = [];
    
    for (let section of sections) {
      const match = section.match(/^(\d+)\s+([A-Z]{3}[A-B]?\d{7})\s+(\d{3}\/\d{3}\/\d{3,4})/);
      if (match) {
        parsedFromLine.push({
          serial: match[1],
          voterId: match[2],
          partNumber: match[3]
        });
      }
    }
    
    if (parsedFromLine.length > 0 && idx + 4 < lines.length) {
      const nameLine = lines[idx + 1] || '';
      const relationLine = lines[idx + 2] || '';
      const houseLine = lines[idx + 3] || '';
      const ageLine = lines[idx + 4] || '';
      
      const nameSections = nameLine.split(/मतदाराचे\s*(?:पूर्ण|पुर्ण)\s*:/).slice(1);
      const relationSections = relationLine.split('|').map(s => s.trim());
      const houseSections = houseLine.split('|').map(s => s.trim());
      const ageSections = ageLine.split(/(?=वय\s*:)/);
      
      for (let i = 0; i < parsedFromLine.length; i++) {
        const voter = parseSingleVoter(
          parsedFromLine[i].serial,
          parsedFromLine[i].voterId,
          parsedFromLine[i].partNumber,
          nameSections[i] || '',
          relationSections[i] || '',
          houseSections[i] || '',
          ageSections[i + 1] || ageSections[i] || ''
        );
        
        if (voter && voter.name) {
          newVoters.push(voter);
        }
      }
      
      idx += 5;
    } else {
      idx++;
    }
  } else {
    idx++;
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

// Check for duplicates and conflicts
let added = 0;
let skipped = 0;

for (const newVoter of newVoters) {
  // Check if voter already exists (by voter ID or unique serial)
  const existingById = voters.find(v => v.voterId === newVoter.voterId);
  const existingBySerial = voters.find(v => v.uniqueSerial === newVoter.uniqueSerial);
  
  if (existingById || existingBySerial) {
    skipped++;
    continue;
  }
  
  voters.push(newVoter);
  added++;
}

console.log(`\nAdded: ${added} voters`);
console.log(`Skipped (duplicates): ${skipped} voters`);
console.log(`New total: ${voters.length} voters`);

// Show final state
const afterW7F1 = voters.filter(v => v.ward === '7' && v.booth === '1').length;
const afterW7F2 = voters.filter(v => v.ward === '7' && v.booth === '2').length;
const afterW7F3 = voters.filter(v => v.ward === '7' && v.booth === '3').length;

console.log(`\nFinal database:`);
console.log(`Total voters: ${voters.length}`);
console.log(`W7F1 (Booth 1): ${afterW7F1} voters`);
console.log(`W7F2 (Booth 2): ${afterW7F2} voters`);
console.log(`W7F3 (Booth 3): ${afterW7F3} voters (expected: 863)`);

// Check serial sequence
const w7f3Voters = voters.filter(v => v.ward === '7' && v.booth === '3');
const serials = w7f3Voters.map(v => v.serial).sort((a, b) => a - b);
const missing = [];
for (let i = 1; i <= 863; i++) {
  if (!serials.includes(i)) {
    missing.push(i);
  }
}

if (missing.length > 0) {
  console.log(`\nMissing serials (${missing.length}): ${missing.slice(0, 20).join(', ')}${missing.length > 20 ? '...' : ''}`);
}

// Create backup
const backupPath = `./public/data/voters-backup-w7f3-robust-${Date.now()}.json`;
fs.writeFileSync(backupPath, JSON.stringify(voters, null, 2));

// Save updated voters
fs.writeFileSync('./public/data/voters.json', JSON.stringify(voters, null, 2));

console.log(`\nBackup created: ${backupPath}`);
console.log('W7F3 import complete!');
