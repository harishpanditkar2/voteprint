const fs = require('fs');
const path = require('path');

// Read the source file
const sourceFile = fs.readFileSync('./pdflist/W7F1.txt', 'utf8');
const lines = sourceFile.split('\n');

const voters = [];
let currentVoter = {};
let serialNumber = 0;

console.log('=== Extracting All Voters from W7F1.txt ===\n');

// Parse the file line by line
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  // Match voter ID pattern (XUA followed by 7 digits)
  const voterIdMatch = line.match(/XUA\d{7}/);
  if (voterIdMatch) {
    const voterId = voterIdMatch[0];
    
    // Look for serial number pattern in surrounding context
    const serialMatch = line.match(/201\/138\/(\d+)/);
    if (serialMatch) {
      serialNumber = parseInt(serialMatch[1]) - 142; // Offset adjustment based on first entry
      
      // Look ahead for name, age, gender
      let nameFound = false;
      let ageFound = false;
      let genderFound = false;
      
      for (let j = i; j < Math.min(i + 10, lines.length); j++) {
        const nextLine = lines[j];
        
        // Extract name (मतदाराचे पूर्ण :NAME or just after name field)
        if (!nameFound && nextLine.includes('मतदाराचे पूर्ण') || nextLine.includes('मतदाराचे पुर्ण')) {
          const nameMatch = nextLine.match(/मतदाराचे पूर्ण\s*[:：]\s*(.+?)(?:\s+XUA|$)/);
          if (!nameMatch) {
            const nameMatch2 = nextLine.match(/मतदाराचे पुर्ण\s*[:：]\s*(.+?)(?:\s+XUA|$)/);
            if (nameMatch2) {
              currentVoter.name = nameMatch2[1].trim();
              nameFound = true;
            }
          } else {
            currentVoter.name = nameMatch[1].trim();
            nameFound = true;
          }
        }
        
        // Extract age and gender (वय : XX लिंग :YY)
        if (!ageFound) {
          const ageMatch = nextLine.match(/वय\s*[:：]\s*([०-९\d]+)/);
          if (ageMatch) {
            // Convert Devanagari numbers to Arabic
            const ageStr = ageMatch[1]
              .replace(/०/g, '0')
              .replace(/१/g, '1')
              .replace(/२/g, '2')
              .replace(/३/g, '3')
              .replace(/४/g, '4')
              .replace(/५/g, '5')
              .replace(/६/g, '6')
              .replace(/७/g, '7')
              .replace(/८/g, '8')
              .replace(/९/g, '9');
            currentVoter.age = ageStr;
            ageFound = true;
          }
        }
        
        if (!genderFound && ageFound) {
          const genderMatch = nextLine.match(/लिंग\s*[:：]\s*(पु|स्री|ख्री|it|oot)/);
          if (genderMatch) {
            const genderText = genderMatch[1];
            currentVoter.gender = (genderText === 'पु') ? 'M' : 'F';
            genderFound = true;
          }
        }
        
        // If we have all data, save the voter
        if (nameFound && ageFound && genderFound && serialNumber > 0) {
          voters.push({
            voterId: voterId,
            name: currentVoter.name,
            uniqueSerial: `W7F1-S${serialNumber}`,
            serialNumber: serialNumber.toString(),
            age: currentVoter.age,
            gender: currentVoter.gender,
            ward: "7",
            booth: "1"
          });
          
          // Reset for next voter
          currentVoter = {};
          break;
        }
      }
    }
  }
}

console.log(`✅ Extracted ${voters.length} voters from source file`);
console.log(`   Serial range: ${voters[0]?.serialNumber} to ${voters[voters.length - 1]?.serialNumber}`);

// Add anukramank sequentially
voters.forEach((voter, index) => {
  voter.anukramank = index + 1;
});

console.log('\nFirst 5 voters:');
voters.slice(0, 5).forEach(v => {
  console.log(`  अ.क्र. ${v.anukramank} | ${v.uniqueSerial} | ${v.name} | Age: ${v.age} | Gender: ${v.gender}`);
});

console.log('\nLast 5 voters:');
voters.slice(-5).forEach(v => {
  console.log(`  अ.क्र. ${v.anukramank} | ${v.uniqueSerial} | ${v.name} | Age: ${v.age} | Gender: ${v.gender}`);
});

// Create backup of existing data
const votersFilePath = './public/data/voters.json';
if (fs.existsSync(votersFilePath)) {
  const backupPath = `${votersFilePath}.backup-${Date.now()}`;
  fs.copyFileSync(votersFilePath, backupPath);
  console.log(`\n✅ Backup created: ${backupPath}`);
}

// Save to voters.json
const dataDir = './public/data';
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(votersFilePath, JSON.stringify(voters, null, 2));

console.log(`\n✅ Successfully saved ${voters.length} voters to ${votersFilePath}`);
console.log('=== Import Complete! ===\n');
