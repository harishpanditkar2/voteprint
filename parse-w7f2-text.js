const fs = require('fs');
const path = require('path');

function parseW7F2Text() {
  const textPath = path.join(__dirname, 'pdflist', 'W7F2.txt');
  const text = fs.readFileSync(textPath, 'utf8');
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);

  const voters = [];
  let currentVoter = null;
  let serial = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip header lines and metadata
    if (line.includes('राज्य निवडणूक आयोग') ||
        line.includes('मतदान केंद्रनिहाय मतदार यादी') ||
        line.includes('प्रभाग क्र.') ||
        line.includes('मतदान केंद्र') ||
        line.includes('अनुक्रमांक') ||
        line.includes('एकूण निव्वळ मतदार') ||
        line.includes('प्रभागाचा परिसर') ||
        line.includes('पृष्ठ') ||
        line.includes('बारामती नगर परिषद') ||
        line.includes('यादी भाग क्र.') ||
        line.includes('दिनांक') ||
        line.includes('पत्ता') ||
        line.includes('* DELETED') ||
        line.includes('पुरवणीनुसार वगळलेले मतदार') ||
        line.includes('संभाव्य दुवार नाव')) {
      continue;
    }

    // Check for serial number and voter ID
    const serialMatch = line.match(/^(\d+)\s+(XUA\d+)\s+(.+)$/);
    if (serialMatch) {
      // Save previous voter if exists
      if (currentVoter) {
        voters.push(currentVoter);
      }

      serial = parseInt(serialMatch[1]);
      const voterId = serialMatch[2];
      const code = serialMatch[3];

      currentVoter = {
        serial: serial,
        voterId: voterId,
        code: code,
        ward: '7',
        booth: '2',
        actualWard: '7',
        actualBooth: '2',
        partNumber: code,
        uniqueSerial: `W7B2S${serial.toString().padStart(3, '0')}`,
        serialNumber: serial.toString()
      };
      continue;
    }

    // Parse voter details
    if (currentVoter && line.includes('मतदाराचे पूर्ण')) {
      const nameMatch = line.match(/मतदाराचे पूर्ण\s*:\s*(.+)/);
      if (nameMatch) {
        currentVoter.name = nameMatch[1].trim();
      }
    }

    if (currentVoter && line.includes('वडिलांचे नाव')) {
      const fatherMatch = line.match(/वडिलांचे नाव\s*:\s*(.+)/);
      if (fatherMatch) {
        currentVoter.father = fatherMatch[1].trim();
      }
    }

    if (currentVoter && line.includes('पतीचे नाव')) {
      const husbandMatch = line.match(/पतीचे नाव\s*:\s*(.+)/);
      if (husbandMatch) {
        currentVoter.husband = husbandMatch[1].trim();
      }
    }

    if (currentVoter && line.includes('घर क्रमांक')) {
      const houseMatch = line.match(/घर क्रमांक\s*:\s*(.+)/);
      if (houseMatch) {
        currentVoter.houseNumber = houseMatch[1].trim();
      }
    }

    if (currentVoter && line.includes('वय') && line.includes('लिंग')) {
      const ageGenderMatch = line.match(/वय\s*:\s*(\d+)\s*लिंग\s*:\s*(.+)/);
      if (ageGenderMatch) {
        currentVoter.age = parseInt(ageGenderMatch[1]);
        const gender = ageGenderMatch[2].trim();
        if (gender === 'पु' || gender === 'पुरुष') {
          currentVoter.gender = 'M';
        } else if (gender === 'स्त्री' || gender === 'स्री') {
          currentVoter.gender = 'F';
        } else {
          currentVoter.gender = gender;
        }
      }
    }
  }

  // Save last voter
  if (currentVoter) {
    voters.push(currentVoter);
  }

  // Clean up data
  voters.forEach(voter => {
    if (!voter.name) voter.name = '';
    if (!voter.father) voter.father = '';
    if (!voter.husband) voter.husband = '';
    if (!voter.houseNumber) voter.houseNumber = '';
    if (!voter.age) voter.age = '';
    if (!voter.gender) voter.gender = '';

    // Set anukramank
    voter.anukramank = voter.serial;
  });

  console.log(`Extracted ${voters.length} voters from W7F2`);
  return voters;
}

// Run extraction
const voters = parseW7F2Text();

// Save to JSON
fs.writeFileSync(path.join(__dirname, 'public', 'data', 'w7f2-voters.json'), JSON.stringify(voters, null, 2));
console.log('Saved W7F2 voters to public/data/w7f2-voters.json');

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