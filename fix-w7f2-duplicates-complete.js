const fs = require('fs');

console.log('🔧 W7F2 Duplicate Fix Script');
console.log('════════════════════════════════════════════\n');

// Step 1: Backup current database
console.log('Step 1: Creating backup...');
const data = require('./public/data/voters.json');
const backupFile = `./public/data/voters.json.backup-before-w7f2-fix-${Date.now()}`;
fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
console.log(`✅ Backup created: ${backupFile}`);
console.log(`   Total voters in backup: ${data.length}\n`);

// Step 2: Remove duplicate W7F2 serials (705-861)
console.log('Step 2: Removing duplicate W7F2 voters (serials 705-861)...');
const w7f2Before = data.filter(v => v.booth === '2').length;
const cleanData = data.filter(v => !(v.booth === '2' && v.serial >= 705));
const w7f2After = cleanData.filter(v => v.booth === '2').length;
console.log(`✅ Removed ${w7f2Before - w7f2After} duplicate voters`);
console.log(`   W7F2 voters before: ${w7f2Before}`);
console.log(`   W7F2 voters after: ${w7f2After}`);
console.log(`   Total database: ${cleanData.length} voters\n`);

// Step 3: Parse OCR data for serials 705-861
console.log('Step 3: Parsing correct OCR data for serials 705-861...');

// Read all OCR files from ward7-w7f2-output
const ocrFiles = [
  'page019.txt', // Contains serials 688-720 (includes 705-720)
  'page020.txt', // Contains serials 721-760
  'page021.txt', // Contains serials 761-800
  'page022.txt'  // Contains serials 801-840+ (includes up to 861)
];

let allVoters = [];

for (const file of ocrFiles) {
  const filePath = `./ward7-w7f2-output/${file}`;
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    continue;
  }
  
  const text = fs.readFileSync(filePath, 'utf8');
  const voters = parseOCRText(text);
  allVoters = allVoters.concat(voters);
  console.log(`   Parsed ${file}: ${voters.length} voters found`);
}

// Filter to only serials 705-861
const correctVoters = allVoters.filter(v => v.serial >= 705 && v.serial <= 861);
console.log(`\n✅ Total correct voters parsed: ${correctVoters.length} (serials 705-861)`);

// Step 4: Validate parsed data
console.log('\nStep 4: Validating parsed data...');
let validCount = 0;
let issueCount = 0;
const issues = [];

correctVoters.forEach(v => {
  const problems = [];
  if (!v.voterId || !/^[A-Z]{3}\d{7}$/.test(v.voterId)) {
    problems.push('Invalid voter ID');
  }
  if (!v.name || v.name.trim().length < 3) {
    problems.push('Invalid name');
  }
  if (!v.age || isNaN(v.age)) {
    problems.push('Invalid age');
  }
  if (!v.gender || !['M', 'F'].includes(v.gender)) {
    problems.push('Invalid gender');
  }
  
  if (problems.length > 0) {
    issueCount++;
    issues.push(`Serial ${v.serial}: ${problems.join(', ')}`);
  } else {
    validCount++;
  }
});

console.log(`✅ Valid voters: ${validCount}`);
if (issueCount > 0) {
  console.log(`⚠️  Voters with issues: ${issueCount}`);
  issues.slice(0, 10).forEach(issue => console.log(`   - ${issue}`));
  if (issues.length > 10) {
    console.log(`   ... and ${issues.length - 10} more`);
  }
}

// Step 5: Check for duplicate voter IDs in new data
console.log('\nStep 5: Checking for duplicate voter IDs...');
const voterIdSet = new Set();
const duplicates = [];
correctVoters.forEach(v => {
  if (voterIdSet.has(v.voterId)) {
    duplicates.push(v.voterId);
  }
  voterIdSet.add(v.voterId);
});

if (duplicates.length > 0) {
  console.log(`❌ Found ${duplicates.length} duplicate voter IDs in new data!`);
  duplicates.slice(0, 5).forEach(id => console.log(`   - ${id}`));
} else {
  console.log(`✅ No duplicate voter IDs in new data`);
}

// Step 6: Add corrected voters to database
console.log('\nStep 6: Adding corrected voters to database...');
const finalData = [...cleanData, ...correctVoters];
fs.writeFileSync('./public/data/voters.json', JSON.stringify(finalData, null, 2));
console.log(`✅ Database updated`);
console.log(`   Total voters now: ${finalData.length}`);
console.log(`   W7F2 voters now: ${finalData.filter(v => v.booth === '2').length}`);

// Step 7: Final verification
console.log('\n═══════════════════════════════════════════');
console.log('Step 7: Final Verification');
console.log('═══════════════════════════════════════════');

const finalW7F2 = finalData.filter(v => v.booth === '2');
const finalVoterIds = new Set();
const finalDuplicates = [];

finalW7F2.forEach(v => {
  if (finalVoterIds.has(v.voterId)) {
    finalDuplicates.push({
      voterId: v.voterId,
      serials: finalW7F2.filter(vv => vv.voterId === v.voterId).map(vv => vv.serial)
    });
  }
  finalVoterIds.add(v.voterId);
});

if (finalDuplicates.length > 0) {
  console.log(`\n❌ STILL HAVE ${finalDuplicates.length} DUPLICATE VOTER IDs!`);
  finalDuplicates.slice(0, 5).forEach(dup => {
    console.log(`   ${dup.voterId}: serials ${dup.serials.join(', ')}`);
  });
  console.log('\n⚠️  FIX NOT COMPLETE - Manual review required');
} else {
  console.log(`\n✅ SUCCESS! No duplicate voter IDs found`);
  console.log(`✅ W7F2 data is now clean with ${finalW7F2.length} unique voters`);
  console.log(`\n🎉 Fix completed successfully!`);
}

// ============================================================================
// Helper Functions
// ============================================================================

function parseOCRText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const voters = [];
  
  let i = 0;
  while (i < lines.length) {
    // Look for serial number line with format: "123 XUA1234567 201/140/456"
    const line = lines[i];
    const serialMatch = line.match(/^(\d{3,4})\s+([A-Z]{3}\d{7})\s+(\d{3}\/\d{3}\/\d{3})/);
    
    if (serialMatch) {
      const serial = parseInt(serialMatch[1]);
      const voterId = serialMatch[2];
      const partNumber = serialMatch[3];
      
      // Look for name line (next line that contains "मतदाराचे पूर्ण")
      let nameText = '';
      let relation = '';
      let house = '';
      let age = '';
      let gender = '';
      
      // Scan next few lines for voter details
      for (let j = i; j < Math.min(i + 10, lines.length); j++) {
        const currentLine = lines[j];
        
        // Name line
        if (currentLine.includes('मतदाराचे पूर्ण') && currentLine.includes(':')) {
          const parts = currentLine.split(':');
          if (parts[1]) {
            nameText = parts[1].split('मतदाराचे')[0].trim();
          }
        }
        
        // Relation line (वडिलांचे नाव or पतीचे नाव)
        if ((currentLine.includes('वडिलांचे नाव') || currentLine.includes('पतीचे नाव')) && currentLine.includes(':')) {
          const parts = currentLine.split(':');
          if (parts[1]) {
            relation = parts[1].split(/[०o५]/)[0].trim();
          }
        }
        
        // House number
        if (currentLine.includes('घर क्रमांक') && currentLine.includes(':')) {
          const parts = currentLine.split(':');
          if (parts[1]) {
            house = parts[1].split(/[०oe।॥\|]/)[0].trim();
          }
        }
        
        // Age and gender line
        if (currentLine.includes('वय') && currentLine.includes('लिंग')) {
          const ageMatch = currentLine.match(/वय\s*[:：]\s*(\d+)/);
          const genderMatch = currentLine.match(/लिंग\s*[:：]\s*(पु|स्री)/);
          
          if (ageMatch) age = ageMatch[1];
          if (genderMatch) gender = genderMatch[1] === 'पु' ? 'M' : 'F';
        }
      }
      
      // Only add if we have minimum required data
      if (voterId && nameText && age && gender) {
        voters.push({
          voterId,
          name: nameText,
          age,
          gender,
          ward: '7',
          booth: '2',
          serial,
          relation: relation || 'N/A',
          house: house || 'N/A',
          partNumber,
          uniqueSerial: `W7F2-S${serial}`
        });
      }
    }
    
    i++;
  }
  
  return voters;
}

console.log('\n════════════════════════════════════════════');
console.log('Script completed.');
console.log('════════════════════════════════════════════\n');
