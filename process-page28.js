const fs = require('fs');

const voters = [
  { serial: 746, voterId: 'XUA8818791', name: 'समृद्ध श्रीहरी कोकरे', father: 'श्रीहरी कोकरे', age: 27, gender: 'M' },
  { serial: 747, voterId: 'XUA8823809', name: 'वैश्याली मनोज मोरे', husband: 'मनोज प्रकाश मोरे', age: 46, gender: 'F', uncertain: 'Surname "मोरे मोरे" repeated in source text' },
  { serial: 748, voterId: 'XUA8827313', name: 'ज्योती रामचंद्र इंगळे', husband: 'रामचंद्र इंगळे', age: 34, gender: 'F' },
  { serial: 749, voterId: 'XUA8827818', name: 'सुहास वसंतराव कुलकर्णी', father: 'वसंतराव कुलकर्णी', age: 70, gender: 'M' },
  { serial: 750, voterId: 'XUA8828303', name: 'प्राची तोडकर', father: 'सुनील तोडकर', age: 19, gender: 'F' }
];

const processedVoters = voters.map(v => ({
  ...v,
  ward: '7',
  booth: '1'
}));

fs.writeFileSync('temp-page-data.json', JSON.stringify(processedVoters, null, 2), 'utf8');

console.log('\n📄 Processing PDF Pages 30-34 - Ward 7, Booth 1\n');
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
