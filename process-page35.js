const fs = require('fs');
const path = require('path');

// Voter data from PDF page processing
const voters = [
  { serial: 772, voterId: 'XUA8853285', name: 'राजाबाई दशरथ भोपळे', husband: 'दशरथ भोपळे', age: 54, gender: 'F' },
  { serial: 773, voterId: 'XUA8855843', name: 'मोहम्मद सुफ़ियान सलीम बागवान', father: 'सलीम मोहम्मद बाबालाल बागवान', age: 33, gender: 'M' },
  { serial: 774, voterId: 'XUA8860694', name: 'सांची संदीप गलांडे', father: 'संदीप अरुण गलांडे', age: 18, gender: 'F' },
  { serial: 775, voterId: 'BFD0863308', name: 'वैशाली अमोल सावंत', husband: 'अमोल सावंत', age: 41, gender: 'F' },
  { serial: 776, voterId: 'XUA8865503', name: 'काजल गणेश टिंगरे', husband: 'गणेश टिंगरे', age: 24, gender: 'F' },
  { serial: 777, voterId: 'XUA8866873', name: 'श्रुति संतोष पडकर', father: 'संतोष पडकर', age: 23, gender: 'F' },
  { serial: 778, voterId: 'XUA8866931', name: 'अंकिता समकित मुथा', husband: 'समकित मुथा', age: 33, gender: 'F' },
  { serial: 779, voterId: 'XUA8867129', name: 'मीनाबानो शहज़ाद अली कुरेशी', husband: 'शहज़ाद अली कुरेशी', age: 34, gender: 'F' },
  { serial: 780, voterId: 'XUA8867012', name: 'राहुल सुरेश निबंधे', father: 'सुरेश निबंधे', age: 43, gender: 'M' },
  { serial: 781, voterId: 'XUA8868861', name: 'रोहिणी विजय कडगंची', husband: 'विजय शिवशरण कडगंची', age: null, gender: 'F', uncertain: 'Age not visible in OCR' },
  { serial: 782, voterId: 'XUA8872525', name: 'संस्कार संजय शितोळे', father: 'संजय शितोळे', age: 19, gender: 'M' }
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