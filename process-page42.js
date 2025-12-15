const fs = require('fs');
const path = require('path');

// Voter data from PDF page processing
const voters = [
  { serial: 972, voterId: 'XUA7225394', name: 'हरिदास चंदर राऊत', father: 'चंदर राऊत', age: 43, gender: 'M' },
  { serial: 973, voterId: 'XUA7352339', name: 'हरिदास राउत', husband: 'हरिदास राउत', age: 30, gender: 'F' },
  { serial: 974, voterId: 'XUA2326015', name: 'शहाजी किसनराव वाळुंज', father: 'किसनराव वाळुंज', age: 62, gender: 'M' },
  { serial: 975, voterId: 'XUA2326023', name: 'सोमप्रभा शहाजी वाळुंज', husband: 'शहाजी वाळुंज', age: 54, gender: 'F' },
  { serial: 976, voterId: 'XUA7850928', name: 'छाया प्रदिप सुर्वे', husband: 'प्रदिप सुर्वे', age: 29, gender: 'F' },
  { serial: 977, voterId: 'XUA7850910', name: 'विष्णु ज्ञानदेव सुर्वे', father: 'ज्ञानदेव सुर्वे', age: 26, gender: 'M' },
  { serial: 978, voterId: 'XUA4606554', name: 'अवधुत चंद्रकांत राजे', father: 'चंद्रकांत राजे', age: null, gender: 'M', uncertain: 'Age not clearly visible in OCR' },
  { serial: 979, voterId: 'XUA7352164', name: 'वृषभ योगेश दोशी', father: 'योगेश दोशी', age: 29, gender: 'M' },
  { serial: 980, voterId: 'XUA7794118', name: 'रेखा सुहास जगताप', husband: 'सुहास जगताप', age: 52, gender: 'F' },
  { serial: 981, voterId: 'XUA7794100', name: 'ज्ञानेश्‍वरी सुहास जगताप', father: 'सुहास जगताप', age: 30, gender: 'F' },
  { serial: 982, voterId: 'XUA7794092', name: 'शिवात्मीका सुहास जगताप', father: 'सुहास जगताप', age: 26, gender: 'F' },
  { serial: 983, voterId: 'CRM2820462', name: 'राजेंद्र सुधाकर देशपांडे', father: 'सुधाकर देशपांडे', age: 47, gender: 'M' },
  { serial: 984, voterId: 'CRM2820470', name: 'स्नेहा राजेंद्र देशपांडे', husband: 'राजेंद्र देशपांडे', age: 42, gender: 'F' },
  { serial: 985, voterId: 'XUA2326031', name: 'अभिजित राजेंद्र देशपांडे', father: 'राजेंद्र देशपांडे', age: 36, gender: 'M' },
  { serial: 986, voterId: 'CRM1264597', name: 'शुभांगी कलप्पा कबाडे', husband: 'कलप्पा कबाडे', age: 52, gender: 'F' },
  { serial: 987, voterId: 'CRM2821874', name: 'संजय दिवाकर कुलकर्णी', father: 'दिवाकर कुलकर्णी', age: 48, gender: 'M' },
  { serial: 988, voterId: 'CRM2188423', name: 'मानसी संजय कुलकर्णी', husband: 'संजय कुलकर्णी', age: 43, gender: 'F' },
  { serial: 989, voterId: 'CRM2187359', name: 'शाम केशव पराडकर', father: 'केशव पराडकर', age: 72, gender: 'M' },
  { serial: 990, voterId: 'CRM2820736', name: 'अनधा शाम पराडकर', husband: 'शाम पराडकर', age: 62, gender: 'F' },
  { serial: 991, voterId: 'CRM2820959', name: 'सुजीत शाम पराडकर', father: 'शाम पराडकर', age: 50, gender: 'M' }
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