const fs = require('fs');
const path = require('path');

function parseW7F3Text() {
  const textPath = path.join(__dirname, 'pdflist', 'W7F3.txt');
  const text = fs.readFileSync(textPath, 'utf8');
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);

  // Collect all XUA
  const xuaList = [];
  for (const line of lines) {
    const xuaMatch = line.match(/XUA\d+/);
    if (xuaMatch) {
      xuaList.push(xuaMatch[0]);
    }
  }

  // Collect all voter names
  const nameList = [];
  for (const line of lines) {
    if (line.includes('मतदाराचे')) {
      // Extract name after मतदाराचे पूर्ण
      let name = '';
      const parts = line.split('मतदाराचे');
      for (const part of parts) {
        if (part.includes('पूर्ण')) {
          const after = part.split('पूर्ण')[1];
          if (after) {
            name = after.replace(/[:\s]+/, '').trim();
            if (name) break;
          }
        }
      }
      if (name) {
        // Clean up the name
        name = name.replace(/नांव/g, '').replace(/वडिलांचे नाव/g, '').replace(/पतीचे नाव/g, '').replace(/घर क्रमांक/g, '').trim();
        nameList.push(name);
      }
    }
  }

  console.log(`Found ${xuaList.length} XUA, ${nameList.length} names`);

  if (xuaList.length !== nameList.length) {
    console.log('Mismatch in counts, using the minimum');
  }

  const minCount = Math.min(xuaList.length, nameList.length);
  const voters = [];
  for (let i = 0; i < minCount; i++) {
    const voter = {
      serial: (i + 1).toString(),
      voterId: xuaList[i],
      name: nameList[i],
      ward: '7',
      booth: '3',
      actualWard: '7',
      actualBooth: '3',
      partNumber: '',
      uniqueSerial: `W7B3S${(i + 1).toString().padStart(3, '0')}`,
      serialNumber: (i + 1).toString(),
      anukramank: i + 1
    };
    voters.push(voter);
  }

  // Clean up data
  voters.forEach(voter => {
    if (!voter.name) voter.name = '';
    // Set default values
    voter.father = '';
    voter.husband = '';
    voter.houseNumber = '';
    voter.age = '';
    voter.gender = '';
  });

  console.log(`Extracted ${voters.length} voters from W7F3`);
  return voters;
}

// Run extraction
const voters = parseW7F3Text();

// Save to JSON
fs.writeFileSync(path.join(__dirname, 'public', 'data', 'w7f3-voters.json'), JSON.stringify(voters, null, 2));
console.log('Saved W7F3 voters to public/data/w7f3-voters.json');

// Also append to main voters.json
const mainVotersPath = path.join(__dirname, 'public', 'data', 'voters.json');
let mainVoters = [];
if (fs.existsSync(mainVotersPath)) {
  mainVoters = JSON.parse(fs.readFileSync(mainVotersPath, 'utf8'));
}

// Filter out duplicates by voterId
const existingIds = new Set(mainVoters.map(v => v.voterId));
const newVoters = voters.filter(v => !existingIds.has(v.voterId));

mainVoters.push(...newVoters);
fs.writeFileSync(mainVotersPath, JSON.stringify(mainVoters, null, 2));
console.log(`Added ${newVoters.length} new voters to main database`);