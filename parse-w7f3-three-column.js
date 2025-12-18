const fs = require('fs');

console.log('🔍 W7F3 Three-Column Layout Parser\n');

const text = fs.readFileSync('./pdflist/W7F3.txt', 'utf-8');
const lines = text.split('\n');

console.log(`Processing ${lines.length} lines...\n`);

// Parse three-column layout
const voters = {};
let currentBlock = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Check if line has voter IDs (starts with numbers and XUA pattern)
  if (line.match(/^\d+\s+XUA/)) {
    // This is a voter ID line - process previous block if exists
    if (currentBlock.length > 0) {
      parseBlock(currentBlock);
    }
    
    // Start new block
    currentBlock = [line];
  } else if (currentBlock.length > 0) {
    // Add to current block
    currentBlock.push(line);
    
    // If we have 4-5 lines (ID line + name + relation + house + age/gender), process it
    if (currentBlock.length >= 4 && line.includes('लिंग')) {
      parseBlock(currentBlock);
      currentBlock = [];
    }
  }
}

// Process last block
if (currentBlock.length > 0) {
  parseBlock(currentBlock);
}

function parseBlock(block) {
  const idLine = block[0];
  
  // Extract 3 voters from the ID line
  // Pattern: serial voterID partNumber | serial voterID partNumber | serial voterID partNumber
  const matches = [...idLine.matchAll(/(\d+)\s+(XUA[A-B]?\d{7})\s+(\d{3}\/\d{3}\/\d{3})/g)];
  
  if (matches.length === 0) return;
  
  matches.forEach((match, colIndex) => {
    const serial = match[1];
    const voterId = match[2];
    const partNumber = match[3];
    
    voters[voterId] = {
      serial: parseInt(serial),
      voterId,
      partNumber,
      name: '',
      relation: '',
      house: '',
      age: '',
      gender: ''
    };
    
    // Extract name from line 1 (मतदाराचे पूर्ण line)
    if (block[1]) {
      const nameLine = block[1];
      // Split by मतदाराचे पूर्ण to get 3 columns
      const nameParts = nameLine.split(/मतदाराचे\s*(?:पूर्ण|पुर्ण)\s*:/);
      if (nameParts[colIndex + 1]) {
        const nameText = nameParts[colIndex + 1].split(/\s*(?:नांव|नाव)/)[0].trim();
        voters[voterId].name = nameText;
      }
    }
    
    // Extract relation from line 2
    if (block[2]) {
      const relationLine = block[2];
      const relationParts = relationLine.split(/\[?(?:वडिलांचे|पतीचे|आईचे)\s*(?:नाव|नांव)\s*:/);
      if (relationParts[colIndex + 1]) {
        const relText = relationParts[colIndex + 1].split(/\s*(?:oo|o०|०o|००)/)[0].trim();
        voters[voterId].relation = relText;
      }
    }
    
    // Extract house from line 3
    if (block[3]) {
      const houseLine = block[3];
      const houseParts = houseLine.split(/(?:घर|घेर|चर|चिर)\s*क्रमांक\s*:/);
      if (houseParts[colIndex + 1]) {
        const houseText = houseParts[colIndex + 1].split(/\s*\|/)[0].trim()
          .replace(/[^\d\/\-]/g, '').trim();
        if (houseText !== '-' && houseText !== '') {
          voters[voterId].house = houseText;
        }
      }
    }
    
    // Extract age and gender from age/gender line (last line in block)
    for (let j = 3; j < block.length; j++) {
      const ageLine = block[j];
      
      // Split by age markers
      const ageParts = ageLine.split(/[|\[]?\s*(?:वय|[Tvय])\s*:/);
      
      if (ageParts[colIndex + 1]) {
        const ageSection = ageParts[colIndex + 1];
        
        // Extract age
        const ageMatch = ageSection.match(/([०-९\d]{1,3})/);
        if (ageMatch) {
          let age = ageMatch[1];
          age = age.replace(/[०-९]/g, d => String.fromCharCode(d.charCodeAt(0) - 0x0966 + 48));
          const ageNum = parseInt(age);
          if (ageNum >= 18 && ageNum <= 120) {
            voters[voterId].age = age;
          }
        }
        
        // Extract gender
        if (ageSection.includes('ख्री') || ageSection.includes('स्री') || ageSection.includes('स्त्री')) {
          voters[voterId].gender = 'F';
        } else if (ageSection.includes('पु')) {
          voters[voterId].gender = 'M';
        } else if (ageSection.includes('it')) {
          // 'it' usually appears after female ages
          voters[voterId].gender = 'F';
        }
      }
    }
  });
}

// Convert to array
const votersArray = Object.values(voters);

console.log(`📊 Parsed ${votersArray.length} voters from W7F3.txt\n`);

// Statistics
const withNames = votersArray.filter(v => v.name).length;
const withAges = votersArray.filter(v => v.age).length;
const withGenders = votersArray.filter(v => v.gender).length;

console.log('📊 Extraction Quality:');
console.log(`  Names: ${withNames}/${votersArray.length}`);
console.log(`  Ages: ${withAges}/${votersArray.length}`);
console.log(`  Genders: ${withGenders}/${votersArray.length}\n`);

// Show samples
console.log('📋 Sample voters:');
votersArray.slice(0, 15).forEach(v => {
  console.log(`  ${v.serial}. ${v.name || 'N/A'} (${v.age || '?'}/${v.gender || '?'}) - ${v.voterId}`);
});

// Save
fs.writeFileSync('w7f3-parsed-complete.json', JSON.stringify(voters, null, 2));
console.log('\n💾 Saved to w7f3-parsed-complete.json');

// Now merge with database
console.log('\n🔄 Merging with database...\n');

const currentVoters = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf-8'));

// Backup
const backupPath = `voters-backup-before-complete-w7f3-${Date.now()}.json`;
fs.writeFileSync(backupPath, JSON.stringify(currentVoters, null, 2));
console.log(`💾 Backup: ${backupPath}\n`);

let updatedVoters = 0;
let fixedAges = 0;
let fixedGenders = 0;
let fixedNames = 0;

currentVoters.forEach(voter => {
  if (voter.ward === '7' && voter.booth === '3') {
    const parsed = voters[voter.voterId];
    
    if (parsed) {
      // Update name if better
      if (parsed.name && parsed.name.length > 3) {
        if (!voter.name || voter.name === 'N/A' || voter.name.includes('मतदाराचे')) {
          voter.name = parsed.name;
          fixedNames++;
        }
      }
      
      // Update age
      if (parsed.age && (!voter.age || voter.age === 'N/A' || voter.age === '0')) {
        voter.age = parsed.age;
        fixedAges++;
      }
      
      // Update gender
      if (parsed.gender && (!voter.gender || voter.gender === 'N/A' || (voter.gender !== 'M' && voter.gender !== 'F'))) {
        voter.gender = parsed.gender;
        fixedGenders++;
      }
      
      // Update relation
      if (parsed.relation && (!voter.relation || voter.relation === 'N/A')) {
        voter.relation = parsed.relation;
      }
      
      // Update house
      if (parsed.house && (!voter.house || voter.house === 'N/A')) {
        voter.house = parsed.house;
      }
      
      updatedVoters++;
    }
  }
});

console.log(`✅ Updated ${updatedVoters} W7F3 voters`);
console.log(`  - Fixed ${fixedNames} names`);
console.log(`  - Fixed ${fixedAges} ages`);
console.log(`  - Fixed ${fixedGenders} genders\n`);

// Save
fs.writeFileSync('./public/data/voters.json', JSON.stringify(currentVoters, null, 2));

// Final stats
const w7f1 = currentVoters.filter(v => v.ward === '7' && v.booth === '1');
const w7f2 = currentVoters.filter(v => v.ward === '7' && v.booth === '2');
const w7f3 = currentVoters.filter(v => v.ward === '7' && v.booth === '3');

console.log('📊 Final Database:');
console.log(`  W7F1: ${w7f1.length} voters`);
console.log(`  W7F2: ${w7f2.length} voters`);
console.log(`  W7F3: ${w7f3.length} voters`);
console.log(`  Total: ${currentVoters.length} voters\n`);

const w7f3ValidAges = w7f3.filter(v => v.age && v.age !== 'N/A' && v.age !== '0' && parseInt(v.age) >= 18).length;
const w7f3ValidGenders = w7f3.filter(v => v.gender === 'M' || v.gender === 'F').length;
const w7f3ValidNames = w7f3.filter(v => v.name && v.name !== 'N/A' && v.name.length > 3).length;

console.log('🔍 W7F3 Quality:');
console.log(`  Valid names: ${w7f3ValidNames}/${w7f3.length}`);
console.log(`  Valid ages: ${w7f3ValidAges}/${w7f3.length}`);
console.log(`  Valid genders: ${w7f3ValidGenders}/${w7f3.length}\n`);

console.log('📋 Sample W7F3 voters:');
w7f3.slice(0, 10).forEach(v => {
  console.log(`  ${v.serial}. ${v.name} (${v.age}/${v.gender}) - ${v.voterId}`);
});

console.log('\n✅ Complete extraction and update finished!');
