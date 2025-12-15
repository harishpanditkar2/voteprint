const fs = require('fs');

console.log('\n📄 Processing Page 19 - Ward 7, Booth 1\n');

const voters = [
  { serial: 566, voterId: 'XUA8108698', name: 'कृतुजा राजेंद्र धुमाळ', age: 24, gender: 'F', uncertain: 'Name shows "क्रध्तुजा" - using कृतुजा' },
  { serial: 567, voterId: 'XUA8175010', name: 'दिलीप शंकरराव जगताप', age: 58, gender: 'M', uncertain: 'Father field shows "श्ंकरराव" - using शंकरराव' },
  { serial: 568, voterId: 'XUA8175002', name: 'संगीता दिलिपराव जगताप', age: 53, gender: 'F' },
  { serial: 569, voterId: 'XUA8174997', name: 'धनश्री दिलिपराव जगताप', age: 29, gender: 'F' },
  { serial: 570, voterId: 'XUA8109233', name: 'नितेश गिरीधर रोहाणी', age: 30, gender: 'M' },
  { serial: 571, voterId: 'XUA8118424', name: 'मानस शहा', age: 22, gender: 'M' },
  { serial: 572, voterId: 'XUA8186520', name: 'कांचन', age: 23, gender: 'F', uncertain: 'Only first name given, father "भारत"' },
  { serial: 573, voterId: 'XUA8164386', name: 'विनीता नरवणेकर', age: 45, gender: 'F' },
  { serial: 574, voterId: 'XUA8169435', name: 'अनिरूद्ध नरवणेकर', age: 23, gender: 'M' },
  { serial: 575, voterId: 'XUA8159527', name: 'असावरी नरवणेकर', age: 26, gender: 'F' },
  { serial: 576, voterId: 'XUA8275109', name: 'दीप्ति शिंदे', age: 21, gender: 'F' },
  { serial: 577, voterId: 'XUA8508277', name: 'अश्विनी प्रणव गुप्ते', age: 28, gender: 'F' },
  { serial: 578, voterId: 'XUA8599946', name: 'अनिकेत किशोर सादिगले', age: 23, gender: 'M' },
  { serial: 579, voterId: 'CRM1498260', name: 'राजाराम बाबुराव लोले', age: 78, gender: 'M' },
  { serial: 580, voterId: 'CRM1499508', name: 'रजनी राजाराम लोले', age: 73, gender: 'F' },
  { serial: 581, voterId: 'XUA8334310', name: 'सिद्धार्थ कांबळे', age: 22, gender: 'M' },
  { serial: 582, voterId: 'XUA8064578', name: 'हृषीकेश संजय भुजे', age: 23, gender: 'M', uncertain: 'Name shows "क्रषिकेश" - using हृषीकेश' },
  { serial: 583, voterId: 'XUA8171688', name: 'सोहम आहेरकर', age: 26, gender: 'M' },
  { serial: 584, voterId: 'XUA8176141', name: 'प्रणव हनुमंत आहेरकर', age: 23, gender: 'M' },
  { serial: 585, voterId: 'TML4691465', name: 'हनुमंत आहेरकर', age: 52, gender: 'M', uncertain: 'Father field shows "पिडिलांचे" - unclear text' },
  { serial: 586, voterId: 'XUA8602930', name: 'देवराज नामदेव रणवरे', age: 44, gender: 'M' },
  { serial: 587, voterId: 'XUA8600025', name: 'स्वप्नाली चक्रवर्ती', age: 30, gender: 'F', uncertain: 'Surname shows "TRt", husband "जयेश् चंकेववरा" - using चक्रवर्ती' },
  { serial: 588, voterId: 'XUA8276834', name: 'राजेंद्र खराडे', age: 37, gender: 'M' },
  { serial: 589, voterId: 'XUA8155756', name: 'राजुकुमार सिंह', age: 23, gender: 'M' },
  { serial: 590, voterId: 'XUA8187817', name: 'लोणकर अभिषेक हनुमंत', age: 22, gender: 'M' },
  { serial: 591, voterId: 'XUA8175689', name: 'पूर्णिमा घाडगे', age: 26, gender: 'F' },
  { serial: 592, voterId: 'XUA8531493', name: 'सुजय चव्हाण', age: 21, gender: 'M' },
  { serial: 593, voterId: 'XUA8237232', name: 'वंदना शर्मा', age: 49, gender: 'F', uncertain: 'Surname shows "र्मा" - using शर्मा' },
  { serial: 594, voterId: 'XUA8237224', name: 'सुनीलकुमार शर्मा', age: 54, gender: 'M', uncertain: 'Name shows "सुज्ीलकुमार" - using सुनीलकुमार' },
  { serial: 595, voterId: 'XUA7351562', name: 'रुबीना जमीर बागवान', age: 35, gender: 'F', uncertain: 'Age shows "3y" - estimated 35' }
];

// Add ward and booth info
const processedVoters = voters.map(v => ({
  ...v,
  ward: '7',
  booth: '1'
}));

// Save to temp file for review
fs.writeFileSync('temp-page-data.json', JSON.stringify(processedVoters, null, 2), 'utf8');

// Display formatted output
console.log('💾 EXTRACTED DATA:\n');
processedVoters.forEach(v => {
  const icon = v.gender === 'M' ? '👨' : '👩';
  const flag = v.uncertain ? ' ⚠️' : '✅';
  console.log(`${flag} ${v.serial.toString().padStart(3)} | ${v.voterId} | ${v.name.padEnd(30)} | ${v.age} | ${icon} ${v.gender}`);
  if (v.uncertain) {
    console.log(`   ⚠️  ISSUE: ${v.uncertain}`);
  }
});

// Summary
const males = processedVoters.filter(v => v.gender === 'M').length;
const females = processedVoters.filter(v => v.gender === 'F').length;
const uncertain = processedVoters.filter(v => v.uncertain).length;

console.log('\n📊 SUMMARY:');
console.log('   Total voters: ' + processedVoters.length);
console.log('   Male: ' + males);
console.log('   Female: ' + females);
console.log('   Serial range: 566 to 595');
if (uncertain > 0) {
  console.log('\n⚠️  UNCERTAIN DATA: ' + uncertain + ' voters need manual verification');
}

console.log('\n✅ Data ready to save!\n');
