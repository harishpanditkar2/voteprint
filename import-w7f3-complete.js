const fs = require('fs');

// Read the voters file
let voters = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf-8'));

// Read W7F3 text file
const w7f3Text = fs.readFileSync('./pdflist/W7F3.txt', 'utf-8');
const lines = w7f3Text.split('\n');

console.log(`Read ${lines.length} lines from W7F3.txt`);

// Parse voter data - handles 3 voters per line format
function parseMultiColumnLine(lines, startIdx) {
  const parsedVoters = [];
  
  // First line has: serial | voterID | partNumber for 3 voters
  const firstLine = lines[startIdx];
  
  // Split by | to get 3 sections
  const sections = firstLine.split('|').map(s => s.trim());
  
  if (sections.length < 3) return { voters: parsedVoters, nextIdx: startIdx + 1 };
  
  // Extract serials, IDs, and part numbers from each section
  const voterData = sections.map(section => {
    const match = section.match(/^(\d+)\s+([A-Z]{3}[A-B]?\d{7})\s+(\d{3}\/\d{3}\/\d{3})/);
    if (!match) return null;
    return {
      serial: parseInt(match[1]),
      voterId: match[2],
      partNumber: match[3]
    };
  }).filter(v => v !== null);
  
  if (voterData.length === 0) return { voters: parsedVoters, nextIdx: startIdx + 1 };
  
  // Second line has names
  let nameIdx = startIdx + 1;
  while (nameIdx < lines.length && !lines[nameIdx].includes('मतदाराचे')) nameIdx++;
  
  if (nameIdx >= lines.length) return { voters: parsedVoters, nextIdx: startIdx + 1 };
  
  const nameLine = lines[nameIdx];
  const nameSections = nameLine.split(/मतदाराचे\s*(?:पूर्ण|पुर्ण)\s*:/).slice(1);
  const names = nameSections.map(s => {
    const parts = s.split(/\s*(?:नांव|नाव)\s*/);
    return parts[0].trim();
  });
  
  // Third line has relations
  let relationIdx = nameIdx + 1;
  const relationLine = lines[relationIdx];
  const relations = [];
  const relationSections = relationLine.split('|').map(s => s.trim());
  
  for (let section of relationSections) {
    let relation = '';
    let relationType = '';
    
    if (section.includes('वडिलांचे नाव')) {
      const match = section.match(/वडिलांचे नाव\s*:([^|०७]+)/);
      if (match) {
        relation = match[1].replace(/[०७e\s]+$/, '').trim();
        relationType = 'father';
      }
    } else if (section.includes('पतीचे नाव')) {
      const match = section.match(/पतीचे नाव\s*:([^|०७]+)/);
      if (match) {
        relation = match[1].replace(/[०७e\s]+$/, '').trim();
        relationType = 'husband';
      }
    } else if (section.includes('आईचे नाव')) {
      const match = section.match(/आईचे नाव\s*:([^|०७]+)/);
      if (match) {
        relation = match[1].replace(/[०७e\s]+$/, '').trim();
        relationType = 'mother';
      }
    }
    
    if (relation) relations.push({ relation, relationType });
  }
  
  // Fourth line has house numbers
  let houseIdx = relationIdx + 1;
  const houseLine = lines[houseIdx];
  const houses = [];
  const houseSections = houseLine.split('|').map(s => s.trim());
  
  for (let section of houseSections) {
    const match = section.match(/घर\s*क्रमांक\s*:?\s*([^|०७eहन]+)/);
    if (match) {
      houses.push(match[1].trim());
    }
  }
  
  // Fifth line has age and gender
  let ageIdx = houseIdx + 1;
  const ageLine = lines[ageIdx];
  const ageGenders = [];
  const ageSections = ageLine.split(/(?:वय\s*:\s*)/);
  
  for (let i = 1; i < ageSections.length; i++) {
    const section = ageSections[i];
    const ageMatch = section.match(/^([०-९\d]+)/);
    const genderMatch = section.match(/लिंग\s*:?\s*(पु|स्री|खरी|ख्री|it|-t|oot)/);
    
    if (ageMatch) {
      let age = ageMatch[1];
      // Convert Devanagari digits to Arabic
      age = age.replace(/०/g, '0').replace(/१/g, '1').replace(/२/g, '2')
                 .replace(/३/g, '3').replace(/४/g, '4').replace(/५/g, '5')
                 .replace(/६/g, '6').replace(/७/g, '7').replace(/८/g, '8')
                 .replace(/९/g, '9');
      
      let gender = 'M';
      if (genderMatch) {
        const g = genderMatch[1];
        if (g === 'स्री' || g === 'खरी' || g === 'ख्री' || g === 'it' || g === '-t' || g === 'oot') {
          gender = 'F';
        }
      }
      
      ageGenders.push({ age: parseInt(age), gender });
    }
  }
  
  // Combine all data
  for (let i = 0; i < voterData.length; i++) {
    if (!voterData[i]) continue;
    
    const voter = {
      voterId: voterData[i].voterId,
      name: names[i] || '',
      age: ageGenders[i]?.age || 0,
      gender: ageGenders[i]?.gender || 'M',
      ward: '7',
      booth: '3',
      serial: voterData[i].serial,
      relation: relations[i]?.relation || '',
      house: houses[i] || '',
      partNumber: voterData[i].partNumber,
      uniqueSerial: `W7F3-S${voterData[i].serial}`
    };
    
    if (voter.name && voter.voterId) {
      parsedVoters.push(voter);
    }
  }
  
  return { voters: parsedVoters, nextIdx: ageIdx + 1 };
}

// Parse all voters
const newVoters = [];
let idx = 0;

while (idx < lines.length) {
  const line = lines[idx];
  
  // Check if this is a voter line (starts with number and voter ID)
  if (/^\d+\s+[A-Z]{3}[A-B]?\d{7}\s+\d{3}\/\d{3}\/\d{3}/.test(line)) {
    const result = parseMultiColumnLine(lines, idx);
    newVoters.push(...result.voters);
    idx = result.nextIdx;
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
console.log(`W7F3 (Booth 3): ${afterW7F3} voters`);

// Create backup
const backupPath = `./public/data/voters-backup-w7f3-complete-${Date.now()}.json`;
fs.writeFileSync(backupPath, JSON.stringify(voters, null, 2));

// Save updated voters
fs.writeFileSync('./public/data/voters.json', JSON.stringify(voters, null, 2));

console.log(`\nBackup created: ${backupPath}`);
console.log('W7F3 import complete!');
