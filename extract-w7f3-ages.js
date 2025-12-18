const fs = require('fs');

console.log('🔍 Aggressive W7F3 Age and Gender Extraction\n');

// Read W7F3.txt
const text = fs.readFileSync('./pdflist/W7F3.txt', 'utf-8');
const lines = text.split('\n');

console.log(`Processing ${lines.length} lines from W7F3.txt...\n`);

// Build a map of voter data
const voterDataMap = {};

// First pass: Find all voter IDs and their line positions
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  // Match voter ID line
  const match = line.match(/^(\d+)\s+(XUA|CRM|TML|NBS|DMV|TGY|UZZ|NYM|ZSL|NJV)([A-B]?\d{7})/);
  
  if (match) {
    const serial = match[1];
    const voterId = match[2] + match[3];
    
    voterDataMap[voterId] = {
      serial,
      voterId,
      lineStart: i,
      name: '',
      age: '',
      gender: '',
      relation: '',
      house: ''
    };
  }
}

console.log(`Found ${Object.keys(voterDataMap).length} voter IDs\n`);

// Second pass: Extract age and gender for each voter
Object.values(voterDataMap).forEach(voter => {
  const startLine = voter.lineStart;
  
  // Look at next 10 lines for data
  for (let i = startLine; i < Math.min(startLine + 10, lines.length); i++) {
    const line = lines[i];
    
    // Extract name
    if (!voter.name) {
      const nameMatch = line.match(/मतदाराचे\s*(?:पूर्ण|पुर्ण)\s*(?:नांव)?\s*:?\s*([^\n\|]+?)(?:\s*वडिलांचे|\s*पतीचे|\s*\||$)/);
      if (nameMatch) {
        voter.name = nameMatch[1].trim();
      }
    }
    
    // Extract age - try multiple patterns
    if (!voter.age) {
      // Pattern 1: वय : 35
      let ageMatch = line.match(/वय\s*:?\s*([०-९\d]{1,3})/);
      
      // Pattern 2: Look for standalone numbers after वय
      if (!ageMatch) {
        ageMatch = line.match(/वय[^\d]{0,5}([०-९\d]{1,3})/);
      }
      
      if (ageMatch) {
        let age = ageMatch[1];
        // Convert Devanagari to Arabic
        age = age.replace(/[०-९]/g, d => String.fromCharCode(d.charCodeAt(0) - 0x0966 + 48));
        
        // Validate age (18-120)
        const ageNum = parseInt(age);
        if (ageNum >= 18 && ageNum <= 120) {
          voter.age = age;
        }
      }
    }
    
    // Extract gender - try multiple patterns
    if (!voter.gender) {
      // Pattern 1: लिंग : पुरुष/स्त्री
      if (line.includes('लिंग')) {
        if (line.includes('पुरुष') || line.includes('पु')) {
          voter.gender = 'M';
        } else if (line.includes('स्त्री') || line.includes('स्री') || line.includes('ख्री')) {
          voter.gender = 'F';
        }
      }
      
      // Pattern 2: Check next line after वय
      if (!voter.gender && line.includes('वय')) {
        const nextLine = lines[i + 1] || '';
        if (nextLine.includes('पुरुष') || nextLine.includes('पु')) {
          voter.gender = 'M';
        } else if (nextLine.includes('स्त्री') || nextLine.includes('स्री')) {
          voter.gender = 'F';
        }
      }
    }
  }
});

// Show statistics
const withAge = Object.values(voterDataMap).filter(v => v.age).length;
const withGender = Object.values(voterDataMap).filter(v => v.gender).length;
const withName = Object.values(voterDataMap).filter(v => v.name).length;

console.log('📊 Extraction Statistics:');
console.log(`  Names found: ${withName}/${Object.keys(voterDataMap).length}`);
console.log(`  Ages found: ${withAge}/${Object.keys(voterDataMap).length}`);
console.log(`  Genders found: ${withGender}/${Object.keys(voterDataMap).length}\n`);

// Show samples
console.log('📋 Sample extracted data:');
Object.values(voterDataMap).slice(0, 10).forEach(v => {
  console.log(`  ${v.serial}. ${v.name || 'N/A'} (${v.age || '?'}/${v.gender || '?'}) - ${v.voterId}`);
});

// Save extraction results
fs.writeFileSync('w7f3-extracted-data.json', JSON.stringify(voterDataMap, null, 2));
console.log('\n💾 Saved extraction results to w7f3-extracted-data.json');

// Now merge with database
console.log('\n🔄 Merging with database...');

const currentVoters = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf-8'));

let updatedCount = 0;
let fixedAges = 0;
let fixedGenders = 0;

currentVoters.forEach(voter => {
  if (voter.ward === '7' && voter.booth === '3') {
    const extracted = voterDataMap[voter.voterId];
    if (extracted) {
      // Update age if missing or invalid
      if ((!voter.age || voter.age === 'N/A' || voter.age === '0') && extracted.age) {
        voter.age = extracted.age;
        fixedAges++;
      }
      
      // Update gender if invalid
      if ((!voter.gender || voter.gender === 'N/A' || (voter.gender !== 'M' && voter.gender !== 'F')) && extracted.gender) {
        voter.gender = extracted.gender;
        fixedGenders++;
      }
      
      // Update name if better
      if (extracted.name && extracted.name.length > 5 && (!voter.name || voter.name.length < 5)) {
        voter.name = extracted.name;
      }
      
      updatedCount++;
    }
  }
});

console.log(`  ✅ Updated ${updatedCount} W7F3 voters`);
console.log(`  ✅ Fixed ${fixedAges} ages`);
console.log(`  ✅ Fixed ${fixedGenders} genders\n`);

// Backup
const backupPath = `voters-backup-before-age-fix-${Date.now()}.json`;
fs.writeFileSync(backupPath, fs.readFileSync('./public/data/voters.json'));
console.log(`💾 Backup: ${backupPath}`);

// Save updated database
fs.writeFileSync('./public/data/voters.json', JSON.stringify(currentVoters, null, 2));

// Final quality check
const w7f3 = currentVoters.filter(v => v.ward === '7' && v.booth === '3');
const w7f3ValidAges = w7f3.filter(v => v.age && v.age !== 'N/A' && v.age !== '0' && parseInt(v.age) >= 18).length;
const w7f3ValidGenders = w7f3.filter(v => v.gender === 'M' || v.gender === 'F').length;

console.log('\n📊 Final W7F3 Quality:');
console.log(`  Total: ${w7f3.length} voters`);
console.log(`  Valid ages: ${w7f3ValidAges}/${w7f3.length}`);
console.log(`  Valid genders: ${w7f3ValidGenders}/${w7f3.length}\n`);

console.log('📋 Sample updated voters:');
w7f3.slice(0, 10).forEach(v => {
  console.log(`  ${v.serial}. ${v.name} (${v.age}/${v.gender}) - ${v.voterId}`);
});

console.log('\n✅ Extraction and merge complete!');
