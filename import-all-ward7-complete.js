const fs = require('fs');
const path = require('path');

console.log('=== Extracting All Ward 7 Voters from 3 Files ===\n');

// Function to extract voters from a file
function extractVotersFromFile(filename, fileNumber) {
  const filePath = `./pdflist/${filename}`;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const voters = [];
  const voterMap = new Map(); // To track unique voter IDs
  
  console.log(`\nProcessing ${filename}...`);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Find all voter IDs in this line
    const voterIdMatches = line.match(/XUA\d{7}/g);
    if (voterIdMatches) {
      for (const voterId of voterIdMatches) {
        if (voterMap.has(voterId)) continue; // Skip duplicates
        
        // Look for serial number near the voter ID
        const serialPattern = new RegExp(`(\\d+)\\s+[iन]*\\s*${voterId}`);
        const serialMatch = line.match(serialPattern);
        
        if (serialMatch) {
          const serialNum = serialMatch[1];
          
          // Extract voter data from surrounding context
          const contextStart = Math.max(0, i - 2);
          const contextEnd = Math.min(lines.length, i + 8);
          const context = lines.slice(contextStart, contextEnd).join('\n');
          
          // Extract name (मतदाराचे पूर्ण or मतदाराचे पुर्ण)
          const nameMatch = context.match(new RegExp(`मतदाराचे\\s+पू?र्ण[\\s:：]*([^\\n]*?)(?=${voterId}|\\n|XUA)`));
          if (!nameMatch) continue;
          
          let name = nameMatch[1].trim();
          // Clean up name
          name = name.replace(/[:：]+$/, '').trim();
          if (!name || name.length < 2) continue;
          
          // Extract age (वय)
          const agePattern = new RegExp(`वय\\s*[:：]\\s*([०-९\\d]+)`);
          const ageMatches = context.match(new RegExp(agePattern, 'g'));
          
          if (!ageMatches) continue;
          
          // Find the age that corresponds to this voter
          // Get the position of voter ID and find nearest age after it
          const voterPosInContext = context.indexOf(voterId);
          let age = '';
          for (const ageMatch of ageMatches) {
            const agePos = context.indexOf(ageMatch, voterPosInContext);
            if (agePos > voterPosInContext) {
              const ageValueMatch = ageMatch.match(/[०-९\d]+/);
              if (!ageValueMatch) continue;
              const ageValue = ageValueMatch[0];
              age = ageValue
                .replace(/०/g, '0').replace(/१/g, '1').replace(/२/g, '2')
                .replace(/३/g, '3').replace(/४/g, '4').replace(/५/g, '5')
                .replace(/६/g, '6').replace(/७/g, '7').replace(/८/g, '8')
                .replace(/९/g, '9');
              break;
            }
          }
          
          if (!age) continue;
          
          // Extract gender (लिंग)
          const genderPattern = new RegExp(`लिंग\\s*[:：]\\s*(पु|स्री|ख्री|सरी|it|oot|ol)`);
          const genderMatches = context.match(new RegExp(genderPattern, 'g'));
          
          if (!genderMatches) continue;
          
          let gender = '';
          for (const genderMatch of genderMatches) {
            const genderPos = context.indexOf(genderMatch, voterPosInContext);
            if (genderPos > voterPosInContext) {
              const genderValue = genderMatch.match(/(पु|स्री|ख्री|सरी|it|oot|ol)/)[0];
              gender = (genderValue === 'पु') ? 'M' : 'F';
              break;
            }
          }
          
          if (!gender) continue;
          
          const voter = {
            voterId: voterId,
            name: name,
            uniqueSerial: `W7F${fileNumber}-S${serialNum}`,
            serialNumber: serialNum,
            age: age,
            gender: gender,
            ward: "7",
            booth: fileNumber.toString()
          };
          
          voters.push(voter);
          voterMap.set(voterId, true);
        }
      }
    }
  }
  
  console.log(`  ✅ Extracted ${voters.length} unique voters from ${filename}`);
  return voters;
}

// Extract from all three files
const allVoters = [];

const file1Voters = extractVotersFromFile('W7F1.txt', 1);
allVoters.push(...file1Voters);

const file2Voters = extractVotersFromFile('W7F2.txt', 2);
allVoters.push(...file2Voters);

const file3Voters = extractVotersFromFile('W7F3.txt', 3);
allVoters.push(...file3Voters);

console.log(`\n📊 Total voters extracted: ${allVoters.length}`);
console.log(`   - W7F1: ${file1Voters.length} voters`);
console.log(`   - W7F2: ${file2Voters.length} voters`);
console.log(`   - W7F3: ${file3Voters.length} voters`);

// Assign sequential anukramank
allVoters.forEach((voter, index) => {
  voter.anukramank = index + 1;
});

// Display sample
console.log('\n📋 First 5 voters:');
allVoters.slice(0, 5).forEach(v => {
  console.log(`  अ.क्र. ${v.anukramank} | ${v.uniqueSerial} | ${v.name} | ${v.age}y ${v.gender}`);
});

console.log('\n📋 Last 5 voters:');
allVoters.slice(-5).forEach(v => {
  console.log(`  अ.क्र. ${v.anukramank} | ${v.uniqueSerial} | ${v.name} | ${v.age}y ${v.gender}`);
});

// Create backup
const votersFilePath = './public/data/voters.json';
if (fs.existsSync(votersFilePath)) {
  const currentData = JSON.parse(fs.readFileSync(votersFilePath, 'utf8'));
  if (currentData.length > 0) {
    const backupPath = `${votersFilePath}.backup-${Date.now()}`;
    fs.copyFileSync(votersFilePath, backupPath);
    console.log(`\n✅ Backup created: ${backupPath}`);
  }
}

// Ensure directory exists
const dataDir = './public/data';
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Save to voters.json
fs.writeFileSync(votersFilePath, JSON.stringify(allVoters, null, 2));

console.log(`\n✅ Successfully imported ${allVoters.length} voters to ${votersFilePath}`);
console.log('=== Import Complete! ===\n');
