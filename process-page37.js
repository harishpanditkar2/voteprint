const fs = require('fs');
const path = require('path');

// Voter data from PDF page processing
const voters = [
  { serial: 815, voterId: 'XUA8902850', name: 'सुप्रिया दादा गायकवाड', husband: 'दादा गायकवाड', age: 25, gender: 'F' },
  { serial: 816, voterId: 'XUA8904898', name: 'मुस्तफा मुर्तजा नासिकवाला', father: 'मुर्तज़ा जोहर नासिकवाला', age: 20, gender: 'M' },
  { serial: 817, voterId: 'XUA8918062', name: 'शरण्या समकित गुगळे', father: 'समकित गुगळे', age: 18, gender: 'F' },
  { serial: 818, voterId: 'XUA8917213', name: 'श्रद्धा मधुसूदन सावंत', husband: 'मधुसूदन सावंत', age: 29, gender: 'F' },
  { serial: 819, voterId: 'XUAB922916', name: 'अनिता अभिनव ढोले', husband: 'अभिनव ढोले', age: 50, gender: 'F' },
  { serial: 820, voterId: 'XUA8939050', name: 'सुप्रिया सचिन मोरे', husband: 'सचिन मोरे', age: 29, gender: 'F' },
  { serial: 821, voterId: 'XUA8945156', name: 'सारा शहीर दख', father: 'शहीर दोख', age: 18, gender: 'F' }
];

// Process voters
const processedVoters = voters.map(voter => {
  const processed = {
    voterId: voter.voterId,
    name: voter.name,
    serial: voter.serial,
    age: voter.age,
    gender: voter.gender,
    ward: '7',
    booth: '1'
  };

  // Add relationship field based on gender
  if (voter.gender === 'F') {
    processed.husband = voter.husband || '';
  } else {
    processed.father = voter.father || '';
  }

  // Add uncertain flag if present
  if (voter.uncertain) {
    processed.uncertain = voter.uncertain;
  }

  return processed;
});

// Write to temp file
fs.writeFileSync('temp-page-data.json', JSON.stringify(processedVoters, null, 2), 'utf8');

console.log(`Processed ${processedVoters.length} voters from page data`);
console.log('Data saved to temp-page-data.json');

// Display summary
processedVoters.forEach(voter => {
  const genderIcon = voter.gender === 'M' ? '♂️' : '♀️';
  const relation = voter.husband ? ` (Husband: ${voter.husband})` : voter.father ? ` (Father: ${voter.father})` : '';
  const uncertainNote = voter.uncertain ? ` [UNCERTAIN: ${voter.uncertain}]` : '';
  console.log(`${genderIcon} Serial ${voter.serial}: ${voter.name}${relation}${uncertainNote}`);
});