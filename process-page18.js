const fs = require('fs');

console.log('\n📄 Processing Page 18 - Ward 7, Booth 1\n');

const voters = [
  { serial: 536, voterId: 'XUA8596793', name: 'स्नेहल शहा', age: 35, gender: 'F' },
  { serial: 537, voterId: 'XUA8173189', name: 'निकेत उबाळे', age: 24, gender: 'M' },
  { serial: 538, voterId: 'XUA8118861', name: 'मनीषा खरात', age: 46, gender: 'F' },
  { serial: 539, voterId: 'XUA8118952', name: 'हर्षली खरात', age: 23, gender: 'F' },
  { serial: 540, voterId: 'XUA8574402', name: 'दिनेश मच्छिंद्र कसबे', age: 44, gender: 'M' },
  { serial: 541, voterId: 'XUA8119166', name: 'ओंकार जाधव', age: 26, gender: 'M', uncertain: 'Name shows "ऑओंकार" - using ओंकार' },
  { serial: 542, voterId: 'XUA8119133', name: 'शिवम जाधव', age: 23, gender: 'M' },
  { serial: 543, voterId: 'XUA8108672', name: 'अभिषेक वाघ', age: 25, gender: 'M' },
  { serial: 544, voterId: 'XUA8108680', name: 'अनिकेत वाघ', age: 22, gender: 'M' },
  { serial: 545, voterId: 'XUA8175044', name: 'अथर्व साळुंखे', age: 22, gender: 'M' },
  { serial: 546, voterId: 'XUA8122921', name: 'हर्षदा नरुळे', age: 23, gender: 'F' },
  { serial: 547, voterId: 'XUA8239741', name: 'काजल शिंदे', age: 39, gender: 'F', uncertain: 'Husband name shows "अतिंद्र" - unclear spelling' },
  { serial: 548, voterId: 'XUA8230476', name: 'वर्षादेवी खन्ना', age: 69, gender: 'F' },
  { serial: 549, voterId: '8000858373', name: 'वामन शंकर लोंढे', age: 66, gender: 'M', uncertain: 'Father name shows "ग्ंकर" - may be शंकर' },
  { serial: 550, voterId: '8700858365', name: 'चंद्रकला वामन लोंढे', age: 56, gender: 'F' },
  { serial: 551, voterId: 'NJV2562759', name: 'संकेत वामन लोंढे', age: 39, gender: 'M' },
  { serial: 552, voterId: 'XUA8522724', name: 'रिया सादिक खान', age: 37, gender: 'F' },
  { serial: 553, voterId: 'XUA8161945', name: 'कोमल अरुण बोरेटे', age: 22, gender: 'F', uncertain: 'Father name shows "बोरेटे बोरेटे" repeated' },
  { serial: 554, voterId: 'XUA8161796', name: 'ऑंकार पूरवत', age: 28, gender: 'M' },
  { serial: 555, voterId: 'XUA8257933', name: 'रिया गांधी', age: 23, gender: 'F' },
  { serial: 556, voterId: 'XUA8531550', name: 'नंदिनी प्रमोद पाटील', age: 19, gender: 'F' },
  { serial: 557, voterId: 'XUA8600033', name: 'गंगादिपक साळवे', age: 21, gender: 'F' },
  { serial: 558, voterId: 'XUA8155996', name: 'आसावरी डोंबळे', age: 33, gender: 'F' },
  { serial: 559, voterId: 'XUA8156515', name: 'संज्योत खंडागळे', age: 44, gender: 'F' },
  { serial: 560, voterId: 'XUA8183139', name: 'श्रेयस पाटील', age: 22, gender: 'M', uncertain: 'Father name shows "योगेश्ञ" - may be योगेश' },
  { serial: 561, voterId: 'XUA8114357', name: 'विरेन ताम्हाणे', age: 22, gender: 'M' },
  { serial: 562, voterId: 'XUA8172041', name: 'शहा', age: 23, gender: 'M', uncertain: 'First name shows "ot 7" - unclear, using surname only' },
  { serial: 563, voterId: 'XUA8342875', name: 'शालिनी जगन डोके', age: 57, gender: 'F' },
  { serial: 564, voterId: 'XUA8161895', name: 'प्राजक्ता बनकर', age: 28, gender: 'F' },
  { serial: 565, voterId: 'XUA7671233', name: 'प्रशांत कुलकर्णी', age: 57, gender: 'M' }
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
console.log('   Serial range: 536 to 565');
if (uncertain > 0) {
  console.log('\n⚠️  UNCERTAIN DATA: ' + uncertain + ' voters need manual verification');
}

console.log('\n✅ Data ready to save!\n');
