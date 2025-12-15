const fs = require('fs');

console.log('\n📄 Processing Page 16 - Ward 7, Booth 1\n');

const voters = [
  { serial: 476, voterId: 'XUA8124323', name: 'रेखा कुंभार', age: 46, gender: 'F', uncertain: 'Husband name shows "महाादेव" with extra character' },
  { serial: 477, voterId: 'XUA8119117', name: 'पौर्णिमा हांगे', age: 23, gender: 'F', uncertain: 'Father field shows "पिडिलांचे" - unclear text' },
  { serial: 478, voterId: 'XUA8244634', name: 'शितल सचिन तावरे', age: 32, gender: 'F' },
  { serial: 479, voterId: 'XUA8171407', name: 'अभिषेक भोईटे', age: 25, gender: 'M' },
  { serial: 480, voterId: 'XUA8537490', name: 'विनोद कालुजिया', age: 38, gender: 'M', uncertain: 'Age shows "R" - estimated 38' },
  { serial: 481, voterId: 'XUA8537508', name: 'कालुजिया', age: 35, gender: 'F', uncertain: 'First name shows "gt" - unclear, using surname only' },
  { serial: 482, voterId: 'XUA8176323', name: 'अर्चना लोंढे', age: 30, gender: 'F', uncertain: 'Age shows "R" - estimated 30' },
  { serial: 483, voterId: 'XUA8156010', name: 'अथर्व काळे', age: 22, gender: 'M' },
  { serial: 484, voterId: 'XUA8165110', name: 'प्रकाश चौधरी', age: 24, gender: 'M' },
  { serial: 485, voterId: 'XUA8533309', name: 'मनोज वर्धमान संगाई', age: 56, gender: 'M' },
  { serial: 486, voterId: 'XUA8164733', name: 'साहिल भलगट', age: 22, gender: 'M' },
  { serial: 487, voterId: 'XUA8353583', name: 'गौरी संजय ताम्हाणे', age: 24, gender: 'F' },
  { serial: 488, voterId: 'XUA8156440', name: 'अदिती कदम', age: 33, gender: 'F' },
  { serial: 489, voterId: 'XUA8520157', name: 'कल्पना संतोष रंद्दे', age: 40, gender: 'F' },
  { serial: 490, voterId: 'XUA8518367', name: 'मयूर भगत', age: 19, gender: 'M' },
  { serial: 491, voterId: 'XUA8171431', name: 'काजल सोडमिसे', age: 25, gender: 'F' },
  { serial: 492, voterId: 'XUA8171951', name: 'गिरीश सोडमिसे', age: 23, gender: 'M' },
  { serial: 493, voterId: 'XUA8165318', name: 'दामाजी भिडे', age: 60, gender: 'M', uncertain: 'Age shows "T3 - ६०" - using 60' },
  { serial: 494, voterId: 'XUA8409633', name: 'रूपाली काळे', age: 25, gender: 'F' },
  { serial: 495, voterId: 'XUA8153710', name: 'हरप्रीत कौर सोडी', age: 30, gender: 'F' },
  { serial: 496, voterId: 'XUA8602062', name: 'अमृता आशिष शहा', age: 34, gender: 'F' },
  { serial: 497, voterId: 'XUA8312530', name: 'रोहित शिंदे', age: 26, gender: 'M' },
  { serial: 498, voterId: 'XUA8186470', name: 'अक्षय भिंगे', age: 28, gender: 'M' },
  { serial: 499, voterId: 'XUA8510695', name: 'प्रियंका कांबळे', age: 26, gender: 'F' },
  { serial: 500, voterId: 'XUA8609398', name: 'समीना अत्तार', age: 34, gender: 'F' },
  { serial: 501, voterId: 'XUA8276065', name: 'श्रुति पवार', age: 22, gender: 'F' },
  { serial: 502, voterId: 'XUA8140311', name: 'श्रीराम देशपांडे', age: 43, gender: 'M' },
  { serial: 503, voterId: 'XUA8142564', name: 'प्राची देशपांडे', age: 36, gender: 'F', uncertain: 'Husband name shows "e देशपांडे" - unclear' },
  { serial: 504, voterId: 'XUA8109787', name: 'स्मीतांजली अतुल पवार', age: 24, gender: 'F', uncertain: 'Name shows "स्मीतान्जअलि" - using स्मीतांजली' },
  { serial: 505, voterId: 'XUA8231581', name: 'अमर सुनिल मराळे', age: 26, gender: 'M' }
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
console.log('   Serial range: 476 to 505');
if (uncertain > 0) {
  console.log('\n⚠️  UNCERTAIN DATA: ' + uncertain + ' voters need manual verification');
}

console.log('\n✅ Data ready to save!\n');
