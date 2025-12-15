const fs = require('fs');

console.log('\n📄 Processing Page 20 - Ward 7, Booth 1\n');

const voters = [
  { serial: 596, voterId: 'XUA2324598', name: 'दमयंती माणिकचंद शहा', age: 82, gender: 'F' },
  { serial: 597, voterId: 'XUA2324606', name: 'अजितकुमार माणिकचंद शहा', age: 75, gender: 'M', uncertain: 'Father name shows "वहा" - should be शहा' },
  { serial: 598, voterId: 'XUA2324622', name: 'शांतीकुमार माणिकलाल शहा', age: 69, gender: 'M', uncertain: 'Name shows "षांतीकुमार" - using शांतीकुमार, age shows "09" - using 69' },
  { serial: 599, voterId: 'XUA2324614', name: 'अनुपमा अजितकुमार शहा', age: 70, gender: 'F' },
  { serial: 600, voterId: 'XUA2324630', name: 'निला शांतीकुमार शहा', age: 62, gender: 'F', uncertain: 'Husband name shows "श्ांतीकुमार" - using शांतीकुमार' },
  { serial: 601, voterId: 'XUA2324648', name: 'अरिंजय अजीत शहा', age: 39, gender: 'M', uncertain: 'Name shows "अरींजय" - using अरिंजय' },
  { serial: 602, voterId: 'XUA2324671', name: 'मिलिंद राजकुमार शहा', age: 60, gender: 'M', uncertain: 'Name shows "मिलींद" - using मिलिंद' },
  { serial: 603, voterId: 'XUA2324689', name: 'संगीता मिलिंद शहा', age: 58, gender: 'F', uncertain: 'Husband "मिलींद दहा" - using मिलिंद शहा' },
  { serial: 604, voterId: 'XUA2324697', name: 'चकोर राजकुमार शहा', age: 55, gender: 'M', uncertain: 'Father "राजकुमार दहा" - using शहा' },
  { serial: 605, voterId: 'CRM2061752', name: 'संजय रामचंद्र चिंबळकर', age: 61, gender: 'M' },
  { serial: 606, voterId: 'XUA2325025', name: 'सुचित्रा संजय चिंबळकर', age: 32, gender: 'F' },
  { serial: 607, voterId: 'CRM1265768', name: 'संभाजी शिवराम दराडे', age: 80, gender: 'M' },
  { serial: 608, voterId: 'XUA2658961', name: 'रतन माणिक दराडे', age: 64, gender: 'M' },
  { serial: 609, voterId: 'CRM2062180', name: 'विनायक विश्वनाथ रंधवे', age: 39, gender: 'M', uncertain: 'Father name shows "विश्‍वनाथ" with special character' },
  { serial: 610, voterId: 'CRM2062719', name: 'सिद्धेश्वर शंकरराव भातभोडे', age: 58, gender: 'M', uncertain: 'Name shows "सिध्देइवर" - using सिद्धेश्वर, father "शञंकरराव"' },
  { serial: 611, voterId: 'CRM2062701', name: 'राजकुमार शंकरराव भातभोडे', age: 56, gender: 'M', uncertain: 'Father shows "्ंकरराव" - using शंकरराव' },
  { serial: 612, voterId: 'CRM2062693', name: 'उषा राजकुमार भातभोडे', age: 43, gender: 'F' },
  { serial: 613, voterId: 'XUA1754647', name: 'प्राजक्ता महाविर गांधी', age: 48, gender: 'F' },
  { serial: 614, voterId: 'XUA8521387', name: 'मार्टीना सारंग दीक्षीत', age: 21, gender: 'F' },
  { serial: 615, voterId: 'XUA8192494', name: 'आकाश केमधरे', age: 22, gender: 'M' },
  { serial: 616, voterId: 'XUA8158693', name: 'शिवम परदेशी', age: 23, gender: 'M', uncertain: 'Father name shows "झंकरसिंह" - may be शंकरसिंह' },
  { serial: 617, voterId: 'XUA8160905', name: 'अद्वैत तांबेकर', age: 23, gender: 'M' },
  { serial: 618, voterId: 'XUA8180945', name: 'गौरव देवेंद्र शिर्के', age: 23, gender: 'M' },
  { serial: 619, voterId: 'XUA8598054', name: 'अथर्व निन्गाप्पा किट्टद', age: 20, gender: 'M', uncertain: 'Name shows "निंन्गाप्पा" - using निन्गाप्पा' },
  { serial: 620, voterId: 'CRM2062743', name: 'लिलावती दत्तात्रय चव्हाण', age: 76, gender: 'F' },
  { serial: 621, voterId: 'CRM2276566', name: 'अतुल दत्तात्रय चव्हाण', age: 48, gender: 'M' },
  { serial: 622, voterId: 'CRM2276558', name: 'निता अतुल चव्हाण', age: 42, gender: 'F' },
  { serial: 623, voterId: 'CRM2061844', name: 'अनिता संजय चव्हाण', age: 43, gender: 'F' },
  { serial: 624, voterId: 'CRM1408855', name: 'सुजाता धन्यकुमार शहा', age: 75, gender: 'F', uncertain: 'Husband surname shows "दहा" - using शहा' },
  { serial: 625, voterId: 'XUA8001513', name: 'सुलभ संजय चव्हाण', age: 24, gender: 'M' }
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
console.log('   Serial range: 596 to 625');
if (uncertain > 0) {
  console.log('\n⚠️  UNCERTAIN DATA: ' + uncertain + ' voters need manual verification');
}

console.log('\n✅ Data ready to save!\n');
