const fs = require('fs');
const path = require('path');

// Read the PDF text content
const pdfText = fs.readFileSync('pdf-text-data.txt', 'utf8');

// Parse voter data from the text
function parseVoterData(text) {
  const voters = [];
  
  // Pattern to match voter entries
  // Format: Serial# VoterID House# followed by name, father/husband name, age, gender
  const voterPattern = /(\d+)\s+(XUA\d+|CRM\d+|[A-Z]{3}\d+)\s+201\/138\/(\d+)/g;
  
  let match;
  const lines = text.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Match voter ID pattern
    const voterMatch = line.match(/(XUA\d+|CRM\d+|[A-Z]{3}\d+)\s+201\/138\/(\d+)/);
    if (voterMatch) {
      const voterId = voterMatch[1];
      const houseNum = voterMatch[2];
      
      // Try to extract serial number from previous context
      let serialNum = null;
      const serialMatch = line.match(/^(\d+)\s+/);
      if (serialMatch) {
        serialNum = serialMatch[1];
      }
      
      // Look for name in next few lines (मतदाराचे पूर्ण नाव:)
      let name = '';
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        if (lines[j].includes('मतदाराचे पूर्ण')) {
          const nameMatch = lines[j].match(/मतदाराचे पूर्ण[:\s]+(.*)/);
          if (nameMatch) {
            name = nameMatch[1].trim();
            break;
          }
        }
      }
      
      // Look for age and gender
      let age = null;
      let gender = null;
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        const ageMatch = lines[j].match(/वय[:\s]+(\d+)/);
        if (ageMatch) {
          age = parseInt(ageMatch[1]);
        }
        
        const genderMatch = lines[j].match(/लिंग[:\s]+(पु|स्त्री)/);
        if (genderMatch) {
          gender = genderMatch[1] === 'पु' ? 'M' : 'F';
        }
        
        if (age && gender) break;
      }
      
      voters.push({
        serialNumber: serialNum,
        voterId: voterId,
        houseNumber: houseNum,
        name: name,
        age: age,
        gender: gender,
        pageNumber: null // Will determine from context
      });
    }
  }
  
  return voters;
}

// Parse the document
console.log('📖 Parsing PDF text data...\n');
const parsedVoters = parseVoterData(pdfText);

console.log(`✅ Found ${parsedVoters.length} voters in PDF text\n`);

// Load existing voters.json
const votersJsonPath = path.join(__dirname, 'public', 'data', 'voters.json');
let existingVoters = [];
if (fs.existsSync(votersJsonPath)) {
  existingVoters = JSON.parse(fs.readFileSync(votersJsonPath, 'utf8'));
  console.log(`📋 Loaded ${existingVoters.length} voters from database\n`);
}

// Cross-check
console.log('🔍 Cross-checking data:\n');

// Check for missing voters
const existingVoterIds = new Set(existingVoters.map(v => v.voterId));
const parsedVoterIds = new Set(parsedVoters.map(v => v.voterId));

const missingInDb = parsedVoters.filter(v => !existingVoterIds.has(v.voterId));
const extraInDb = existingVoters.filter(v => !parsedVoterIds.has(v.voterId));

if (missingInDb.length > 0) {
  console.log(`⚠️  ${missingInDb.length} voters in PDF but not in database:`);
  missingInDb.slice(0, 10).forEach(v => {
    console.log(`   - ${v.voterId}: ${v.name}`);
  });
  if (missingInDb.length > 10) {
    console.log(`   ... and ${missingInDb.length - 10} more`);
  }
  console.log();
}

if (extraInDb.length > 0) {
  console.log(`⚠️  ${extraInDb.length} voters in database but not in PDF:`);
  extraInDb.slice(0, 10).forEach(v => {
    console.log(`   - ${v.voterId}: ${v.name}`);
  });
  if (extraInDb.length > 10) {
    console.log(`   ... and ${extraInDb.length - 10} more`);
  }
  console.log();
}

// Check for name mismatches
let nameMismatches = 0;
parsedVoters.forEach(pv => {
  const existing = existingVoters.find(ev => ev.voterId === pv.voterId);
  if (existing && pv.name && existing.name !== pv.name) {
    if (nameMismatches < 10) {
      console.log(`⚠️  Name mismatch for ${pv.voterId}:`);
      console.log(`   PDF: ${pv.name}`);
      console.log(`   DB:  ${existing.name}`);
    }
    nameMismatches++;
  }
});

if (nameMismatches > 10) {
  console.log(`   ... and ${nameMismatches - 10} more name mismatches`);
}

// Summary
console.log('\n📊 Summary:');
console.log(`   PDF voters: ${parsedVoters.length}`);
console.log(`   DB voters: ${existingVoters.length}`);
console.log(`   Missing in DB: ${missingInDb.length}`);
console.log(`   Extra in DB: ${extraInDb.length}`);
console.log(`   Name mismatches: ${nameMismatches}`);

// Save parsed data for review
fs.writeFileSync('parsed-pdf-voters.json', JSON.stringify(parsedVoters, null, 2));
console.log('\n💾 Saved parsed data to parsed-pdf-voters.json');
