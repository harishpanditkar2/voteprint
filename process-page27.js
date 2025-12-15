const fs = require('fs');

const voters = [
  { serial: 742, voterId: 'XUA8812653', name: 'वृषाली शंतनु कुंभार', husband: 'शंतनु जगन्नाथ कुंभार', age: 25, gender: 'F', uncertain: 'Surname "कुंभार कुंभार" repeated in source text' },
  { serial: 743, voterId: 'XUA8813453', name: 'पूजा ओंकार कुंभार', husband: 'ओंकार जगन्नाथ कुंभार', age: 27, gender: 'F', uncertain: 'Husband shows "ऑकार" - corrected to ओंकार, "कुंभार कुंभार" repeated in source' },
  { serial: 744, voterId: 'XUA8814956', name: 'अभिषेक संजय जगताप', father: 'संजय जगताप', age: 24, gender: 'M' },
  { serial: 745, voterId: 'XUA8818544', name: 'पूरन बोहरा', father: 'टेकराम बोहरा', age: 24, gender: 'M' }
];

const processedVoters = voters.map(v => ({
  ...v,
  ward: '7',
  booth: '1'
}));

fs.writeFileSync('temp-page-data.json', JSON.stringify(processedVoters, null, 2), 'utf8');

console.log('\n📄 Processing PDF Page 29 - Ward 7, Booth 1\n');
console.log('💾 EXTRACTED DATA:\n');

let maleCount = 0;
let femaleCount = 0;
let uncertainCount = 0;

processedVoters.forEach(v => {
  const icon = v.gender === 'M' ? '👨' : '👩';
  const flag = v.uncertain ? ' ⚠️' : '✅';
  console.log(`${flag} ${v.serial} | ${v.voterId} | ${v.name.padEnd(30)} | ${v.age} | ${icon} ${v.gender}`);
  
  if (v.uncertain) {
    console.log(`   ⚠️  ISSUE: ${v.uncertain}`);
    uncertainCount++;
  }
  
  if (v.gender === 'M') maleCount++;
  else femaleCount++;
});

console.log(`\n📊 SUMMARY:`);
console.log(`   Total voters: ${processedVoters.length}`);
console.log(`   Male: ${maleCount}`);
console.log(`   Female: ${femaleCount}`);
console.log(`   Serial range: ${processedVoters[0].serial} to ${processedVoters[processedVoters.length - 1].serial}`);

if (uncertainCount > 0) {
  console.log(`\n⚠️  UNCERTAIN DATA: ${uncertainCount} voters need manual verification`);
}

console.log('\n✅ Data ready to save!');
