const fs = require('fs');
const path = require('path');

// Voter data from PDF page processing
const voters = [
  { serial: 942, voterId: 'XUA8192171', name: 'अंकिता राहुल शाह', husband: 'राहुल शाह', age: 31, gender: 'F' },
  { serial: 943, voterId: 'XUA7492093', name: 'प्रीतम रणजित तोरडमल', husband: 'रणजित तोरडमल', age: 35, gender: 'F' },
  { serial: 944, voterId: 'XUA7492085', name: 'रणजित अरुण तोरडमल', father: 'अरुण तोरडमल', age: 41, gender: 'M' },
  { serial: 945, voterId: 'XUA4595542', name: 'अक्षय राजेश्वर राईकवार', father: 'राजेश्वर राईकवार', age: null, gender: 'M', uncertain: 'Age not clearly visible in OCR' },
  { serial: 946, voterId: 'XUA8103889', name: 'अजिंक्य वैभव शाह', father: 'वैभव शाह', age: 39, gender: 'M' },
  { serial: 947, voterId: 'XUA4595567', name: 'नेहा सुयष कोठारी', husband: 'सुयष कोठारी', age: 34, gender: 'F' },
  { serial: 948, voterId: 'XUA4595575', name: 'शितल नवनाथ देशमुख', husband: 'नवनाथ देशमुख', age: 35, gender: 'F' },
  { serial: 949, voterId: 'XUA7991250', name: 'निशिगंधा सुहास कुलकर्णी', father: 'सुहास कुलकर्णी', age: 23, gender: 'F' },
  { serial: 950, voterId: 'XUA4595583', name: 'नवनाथ जगन्नाथ देशमुख', father: 'जगन्नाथ देशमुख', age: 44, gender: 'M' },
  { serial: 951, voterId: 'XUA8534893', name: 'घोषाल हेमंत शाह', father: 'हेमंत शाह', age: 21, gender: 'M' },
  { serial: 952, voterId: 'XUA8094922', name: 'सुरज उमेश भिंगे', father: 'उमेश भिंगे', age: 23, gender: 'M' },
  { serial: 953, voterId: 'XUA8118630', name: 'अविनाक्ष रामा गाडे', father: 'रामा गाडे', age: 40, gender: 'M' },
  { serial: 954, voterId: 'XUA7352255', name: 'तृप्ती नंदकुमार माळी', father: 'नंदकुमार माळी', age: 31, gender: 'F' },
  { serial: 955, voterId: 'XUA7352214', name: 'अशिष नंदकुमार माळी', father: 'नंदकुमार माळी', age: 28, gender: 'M' },
  { serial: 956, voterId: 'XUA7352354', name: 'संपतलाल रामचंद्र गादीया', father: 'रामचंद्र गादीया', age: 69, gender: 'M' },
  { serial: 957, voterId: 'XUA2325991', name: 'सचिन हंबीरराव माने', father: 'हंबीरराव माने', age: 50, gender: 'M' },
  { serial: 958, voterId: 'XUA2326007', name: 'शुभांगी सचिन माने', husband: 'सचिन माने', age: 48, gender: 'F' },
  { serial: 959, voterId: 'CRM1496793', name: 'रंजना दिपक काटे', husband: 'दिपक काटे', age: 43, gender: 'F' },
  { serial: 960, voterId: 'XUA8445850', name: 'गौरव दीपक काटे', father: 'दीपक काटे', age: 21, gender: 'M' },
  { serial: 961, voterId: 'XUA7748924', name: 'विवेक दीपक काटे', father: 'दीपक काटे', age: 26, gender: 'M' },
  { serial: 962, voterId: 'XUA4606497', name: 'अशोक कृष्णराव मेमाणे', father: 'कृष्णराव मेमाणे', age: 67, gender: 'M' },
  { serial: 963, voterId: 'XUA4606505', name: 'मानिनी अशोक मेमाणे', husband: 'अशोक मेमाणे', age: 50, gender: 'F' },
  { serial: 964, voterId: 'XUA4606513', name: 'केतन अशोक मेमाणे', father: 'अशोक मेमाणे', age: 38, gender: 'M' },
  { serial: 965, voterId: 'XUA7352446', name: 'सायसिंग मालजी वसावे', father: 'मालजी वसावे', age: 40, gender: 'M' },
  { serial: 966, voterId: 'XUA7352206', name: 'कविता सायसिंग वसावे', husband: 'सायसिंग वसावे', age: 30, gender: 'F' },
  { serial: 967, voterId: 'XUA7352289', name: 'मगन दामजा पाडवी', father: 'दामजा पाडवी', age: 43, gender: 'M' },
  { serial: 968, voterId: 'XUA7352305', name: 'गणेश दामजा पाडवी', father: 'दामजा पाडवी', age: 35, gender: 'M' },
  { serial: 969, voterId: 'XUA4606539', name: 'मदन जहॉगीर पाडवी', father: 'जहॉगीर पाडवी', age: 50, gender: 'M' },
  { serial: 970, voterId: 'XUA4606547', name: 'वंदना मदन पाडवी', husband: 'मदन पाडवी', age: 44, gender: 'F' },
  { serial: 971, voterId: 'XUA7352248', name: 'जयश्री मगन पाडवी', husband: 'मगन पाडवी', age: 35, gender: 'F' }
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