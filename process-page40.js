const fs = require('fs');
const path = require('path');

// Voter data from PDF page processing
const voters = [
  { serial: 882, voterId: 'XUA7996739', name: 'प्रियांका संजय पोटे', husband: 'संजय पोटे', age: 28, gender: 'F' },
  { serial: 883, voterId: 'XUA8047110', name: 'सारंग विनीत शाह', husband: 'विनीत शाह', age: 33, gender: 'F' },
  { serial: 884, voterId: 'XUA8054124', name: 'पायल अजिंक्य शाह', father: 'अजिंक्य शाह', age: 30, gender: 'F' },
  { serial: 885, voterId: 'XUA8103970', name: 'अक्षय वैभव शाह', father: 'वैभव शाह', age: 39, gender: 'M' },
  { serial: 886, voterId: 'XUA8047094', name: 'स्वाराळी अक्षय शाह', husband: 'अक्षय शाह', age: 29, gender: 'F' },
  { serial: 887, voterId: 'CRM1409101', name: 'मनोज सुरेश मेहता', father: 'सुरेश मेहता', age: 63, gender: 'M' },
  { serial: 888, voterId: 'CRM1409119', name: 'पुर्वा मनोज मेहता', husband: 'मनोज मेहता', age: 44, gender: 'F' },
  { serial: 889, voterId: 'XUA8147738', name: 'मयूर आत्माराम बनकर', father: 'आत्माराम बनकर', age: 24, gender: 'M' },
  { serial: 890, voterId: 'XUA8147076', name: 'अक्षता मेहुल दोशी', father: 'मेहुल दोशी', age: 22, gender: 'F' },
  { serial: 891, voterId: 'XUA8147753', name: 'दिव्येश दीपक गांधी', father: 'दीपक गांधी', age: 24, gender: 'M' },
  { serial: 892, voterId: 'XUA8147167', name: 'स्वानंद उद्धव गावडे', father: 'उद्धव गावडे', age: 22, gender: 'M' },
  { serial: 893, voterId: 'XUA8147068', name: 'लता सुभाष कांबळे', husband: 'सुभाष कांबळे', age: 58, gender: 'F' },
  { serial: 894, voterId: 'XUA8404675', name: 'सुश्रुत संदीप कुलकर्णी', father: 'संदीप कुलकर्णी', age: 23, gender: 'M' },
  { serial: 895, voterId: 'XUA8147803', name: 'ताई तुषार निंबाळकर', husband: 'तुषार निंबाळकर', age: 30, gender: 'F' },
  { serial: 896, voterId: 'XUA8288797', name: 'अमिता भास्कर साने', husband: 'भास्कर साने', age: 47, gender: 'F' },
  { serial: 897, voterId: 'XUA8147118', name: 'संकेत अनिल उघडे', father: 'अनिल उघडे', age: 25, gender: 'M', uncertain: 'Relationship is mother instead of father' },
  { serial: 898, voterId: 'XUA8134421', name: 'माधुरी विष्णू सुर्वे', husband: 'विष्णू सुर्वे', age: 24, gender: 'F' },
  { serial: 899, voterId: 'XUA8589772', name: 'राजकुमार गुलाबराव देशमुख', father: 'गुलाबराव किसनराव देशमुख', age: 42, gender: 'M' },
  { serial: 900, voterId: 'XUA8589996', name: 'देवकी राजकुमार देशमुख', husband: 'राजकुमार गुलाबराव देशमुख', age: 39, gender: 'F' },
  { serial: 901, voterId: 'XUA8191124', name: 'अथर्व राजेव्व कोकरे', father: 'राजेव्व कोकरे', age: 22, gender: 'M' },
  { serial: 902, voterId: 'XUA8624785', name: 'समय सागर शहा', father: 'सागर शहा', age: null, gender: 'M', uncertain: 'Age not clearly visible in OCR' },
  { serial: 903, voterId: 'XUA8113680', name: 'स्नेहल अविनाश ओसवाल', husband: 'अविनाश ओसवाल', age: 30, gender: 'F' },
  { serial: 904, voterId: 'XUA8135840', name: 'सोमनाथ राजेंद्र झोंबाडे', father: 'राजेंद्र झोंबाडे', age: 37, gender: 'M' },
  { serial: 905, voterId: 'XUA8129421', name: 'साक्षी दत्तात्रय शिंदे', father: 'दत्तात्रय शिंदे', age: 22, gender: 'F' },
  { serial: 906, voterId: 'XUA8522344', name: 'सोनाली मानस पाटील', husband: 'मानस पाटील', age: 34, gender: 'F' },
  { serial: 907, voterId: 'XUA8622425', name: 'स्तुती अमित शहा', father: 'अमित शहा', age: 20, gender: 'F', uncertain: 'Relationship is mother instead of husband' },
  { serial: 908, voterId: 'XUA8628877', name: 'स्तुती अमित शाह', father: 'अमित शाह', age: 20, gender: 'F' },
  { serial: 909, voterId: 'XUA4595443', name: 'मोनिका बाळासो दाहिगुडे', father: 'बाळासो दाहिगुडे', age: 37, gender: 'F' },
  { serial: 910, voterId: 'XUA4595450', name: 'विदुला बाळासो दाहिगुडे', father: 'बाळासो दाहिगुडे', age: 37, gender: 'F' },
  { serial: 911, voterId: 'XUA4595468', name: 'विराज बाळासो दाहिगुडे', father: 'बाळासो दाहिगुडे', age: 33, gender: 'M' }
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