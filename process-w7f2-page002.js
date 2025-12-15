const fs = require('fs');

console.log('\n📄 Processing Page 002 - Ward 7, Booth 2\n');

const text = fs.readFileSync('./ward7-w7f2-output/page002.txt', 'utf8');
const lines = text.split('\n');

// Manual extraction based on OCR text analysis
const voters = [
  { serial: '1', voterId: 'XUA8789224', name: 'रंजीत साळुंके', age: '20', gender: 'M' },
  { serial: '2', voterId: 'XUA8926842', name: 'कल्याणी गोरख नाईकनवरे', age: '32', gender: 'F' },
  { serial: '3', voterId: 'XUA8762510', name: 'सोहम राजेंद्र पवार', age: '', gender: '' },
  { serial: '4', voterId: 'XUA2312049', name: 'दीपिका राजेश भिंगारे', age: '48', gender: 'F' },
  { serial: '5', voterId: 'XUA1538735', name: 'स्वाती उमेश भिंगारे', age: '', gender: '' },
  { serial: '6', voterId: 'XUA4638425', name: 'अनिरुध्द कल्याणराव मोरे', age: '36', gender: 'M' },
  { serial: '7', voterId: 'XUA4637575', name: 'शुभांगी बाळासाहेब मोरे', age: '', gender: '' },
  { serial: '8', voterId: 'XUA4638169', name: 'रमणीक खिमजी मोता', age: '70', gender: 'M' },
  { serial: '9', voterId: 'XUA4637658', name: 'प्रितीबेन रमणिक मोता', age: '69', gender: 'F' },
  { serial: '10', voterId: 'XUA4638169', name: 'निरव नरेंद्र मोता', age: '54', gender: 'M' },
  { serial: '11', voterId: 'XUA8782781', name: 'क्रत्विक श्रीधर कांबळे', age: '', gender: '' },
];

console.log('💾 EXTRACTED DATA:\n');
voters.forEach((v, idx) => {
  const genderIcon = v.gender === 'M' ? '👨' : (v.gender === 'F' ? '👩' : '❓');
  console.log(`✅ ${v.serial.padStart(2)} | ${v.voterId} | ${v.name.padEnd(30)} | ${v.age} | ${genderIcon} ${v.gender}`);
});

console.log(`\n📊 SUMMARY:`);
console.log(`   Total voters: ${voters.length}`);
console.log(`   Male: ${voters.filter(v => v.gender === 'M').length}`);
console.log(`   Female: ${voters.filter(v => v.gender === 'F').length}`);
console.log(`   Unknown gender: ${voters.filter(v => v.gender === '').length}`);

console.log('\n💡 NEXT: Run save-page-data.js to append these voters to the database with booth=2, ward=7');