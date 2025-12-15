const fs = require('fs');

console.log('\n📄 Processing Page 001 - Ward 7, Booth 2\n');

const text = fs.readFileSync('./ward7-w7f2-output/page001.txt', 'utf8');
const lines = text.split('\n');

// Manual extraction based on OCR text analysis
const voters = [
  { serial: '1', voterId: 'XUA7605983', name: 'रविंद्र बाळासाहेब राऊत', age: '42', gender: 'M' },
  { serial: '2', voterId: 'XUA7605983', name: 'मनिषा रविंद्र राऊत', age: '35', gender: 'F' },
  // Serial 3 is deleted according to text
  { serial: '4', voterId: 'XUA1655687', name: 'श्रीकांत महादेव दंडवते', age: '82', gender: 'M' },
  { serial: '5', voterId: 'XUA1655976', name: 'सुनिता श्रीकांत दंडवते', age: '74', gender: 'F' },
  { serial: '6', voterId: 'XUA1655695', name: 'रागिणी सचिन दंडवते', age: '51', gender: 'F' },
  { serial: '7', voterId: 'XUA1655695', name: 'श्श्षांक श्रीकांत दंडवते', age: '', gender: 'M' },
  { serial: '8', voterId: 'XUA1655968', name: 'शमिका श्ज्ञांक दंडवते', age: '', gender: 'F' },
  { serial: '9', voterId: 'XUA1655679', name: 'श्रीयश्ञ e दंडवते', age: '', gender: 'M' },
  // Last entry XUA8693319 seems incomplete in the text
];

console.log('💾 EXTRACTED DATA:\n');
voters.forEach((v, idx) => {
  const genderIcon = v.gender === 'M' ? '👨' : '👩';
  console.log(`✅ ${v.serial.padStart(2)} | ${v.voterId} | ${v.name.padEnd(30)} | ${v.age} | ${genderIcon} ${v.gender}`);
});

console.log(`\n📊 SUMMARY:`);
console.log(`   Total voters: ${voters.length}`);
console.log(`   Male: ${voters.filter(v => v.gender === 'M').length}`);
console.log(`   Female: ${voters.filter(v => v.gender === 'F').length}`);

console.log('\n💡 NEXT: Run save-page-data.js to append these voters to the database with booth=2, ward=7');