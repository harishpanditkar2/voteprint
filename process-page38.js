const fs = require('fs');
const path = require('path');

// Voter data from PDF page processing
const voters = [
  { serial: 822, voterId: 'XUA7671019', name: 'रुचिरा दिपक आपुणे', husband: 'दिपक आपुणे', age: 30, gender: 'F' },
  { serial: 823, voterId: 'XUA7937527', name: 'साद सरवर बागवान', father: 'सरवर बागवान', age: 25, gender: 'M' },
  { serial: 824, voterId: 'XUA7352438', name: 'आरती धनंजय भोईटे', husband: 'धनंजय भोईटे', age: 41, gender: 'F' },
  { serial: 825, voterId: 'XUA7352412', name: 'स्वाती चंदन भुजबळ', husband: 'चंदन भुजबळ', age: 35, gender: 'F' },
  { serial: 826, voterId: 'XUA4591269', name: 'श्रध्दा सुधिर बिराजदार', father: 'सुधिर बिराजदार', age: 34, gender: 'F' },
  { serial: 827, voterId: 'XUA7706062', name: 'अदित्य दुर्गेश बिवडकर', father: 'दुर्गेश बिवडकर', age: 39, gender: 'M' },
  { serial: 828, voterId: 'XUA7850936', name: 'राजश्री मधुसुदन चौधरी', father: 'मधुसुदन चौधरी', age: 42, gender: 'F' },
  { serial: 829, voterId: 'XUA7671084', name: 'आकाश अरविंद देवकाते', father: 'अरविंद देवकाते', age: 30, gender: 'M' },
  { serial: 830, voterId: 'XUA7670979', name: 'अमित सुभाषराव देशपांडे', father: 'सुभाषराव देशपांडे', age: 42, gender: 'M' },
  { serial: 831, voterId: 'XUA7671001', name: 'अश्‍विनी अमित देशपांडे', husband: 'अमित देशपांडे', age: 38, gender: 'F' },
  { serial: 832, voterId: 'XUA7989858', name: 'गौरव गिरीज्ष देशपांडे', father: 'गिरीक्ष देशपांडे', age: 28, gender: 'M' },
  { serial: 833, voterId: 'XUA7671092', name: 'बाळासाहेब राजाराम धायगुडे', father: 'राजाराम धायगुडे', age: 63, gender: 'M' },
  { serial: 834, voterId: 'XUA7671100', name: 'संगिता बाळासाहेब धायगुडे', husband: 'बाळासाहेब धायगुडे', age: 53, gender: 'F' },
  { serial: 835, voterId: 'XUA7671050', name: 'राजेंद्र शांतीलाल दोशी', father: 'शांतीलाल दोशी', age: 52, gender: 'M' },
  { serial: 836, voterId: 'XUA7671043', name: 'सविता राजेंद्र दोशी', husband: 'राजेंद्र दोशी', age: 41, gender: 'F' },
  { serial: 837, voterId: 'XUA7615834', name: 'संदिप सुभाषचंद्र दुरुगकर', father: 'सुभाषचंद्र दुरुगकर', age: 51, gender: 'M' },
  { serial: 838, voterId: 'XUA7615842', name: 'अंजली संदिप दुरुगकर', husband: 'संदिप दुरुगकर', age: 48, gender: 'F' },
  { serial: 839, voterId: 'XUA4607743', name: 'रोहित मोहन गानबोटे', father: 'मोहन गानबोटे', age: 35, gender: 'M' },
  { serial: 840, voterId: 'XUA4607636', name: 'स्वप्नील मोहन गानबोटे', father: 'मोहन गानबोटे', age: null, gender: 'M', uncertain: 'Age not clearly visible in OCR' },
  { serial: 841, voterId: 'XUA7352198', name: 'लक्ष्मी समीर गांधी', husband: 'समीर गांधी', age: 39, gender: 'F' },
  { serial: 842, voterId: 'XUA7750607', name: 'निकीता श्रीनिवास घोलप', father: 'श्रीनिवास घोलप', age: 26, gender: 'F' },
  { serial: 843, voterId: 'XUA7556632', name: 'कोमल रोहित जाधव', husband: 'रोहित जाधव', age: 30, gender: 'F' },
  { serial: 844, voterId: 'XUA7671035', name: 'राहुल रमेश जोशी', father: 'रमेश जोशी', age: 49, gender: 'M' },
  { serial: 845, voterId: 'XUA7671027', name: 'अपर्णा राहुल जोशी', husband: 'राहुल जोशी', age: 47, gender: 'F' },
  { serial: 846, voterId: 'XUA7671068', name: 'तनुजा रविंद्र जोशी', husband: 'रविंद्र जोशी', age: 42, gender: 'F' },
  { serial: 847, voterId: 'XUA7670995', name: 'स्नेहा राजेंद्र खामकर', husband: 'राजेंद्र खामकर', age: 37, gender: 'F' },
  { serial: 848, voterId: 'XUA7670987', name: 'स्वप्नील राजेंद्र खामकर', father: 'राजेंद्र खामकर', age: 30, gender: 'M' },
  { serial: 849, voterId: 'XUA7850902', name: 'विशाल आण्णासाहेब खोमणे', father: 'आण्णासाहेब खोमणे', age: 33, gender: 'M' },
  { serial: 850, voterId: 'XUA7615826', name: 'निकीता नभिराज कोठारी', father: 'नभिराज कोठारी', age: null, gender: 'F', uncertain: 'Age not clearly visible in OCR' },
  { serial: 851, voterId: 'XUA7556616', name: 'प्रांजली प्रसाद कुलकर्णी', father: 'प्रसाद कुलकर्णी', age: null, gender: 'F', uncertain: 'Age not clearly visible in OCR' }
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