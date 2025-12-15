const fs = require('fs');

const voters = [
  { serial: 767, voterId: 'XUA8841843', name: 'वर्षा अनिल ठेंगील', husband: 'अनिल शिवाजी ठेंगील', age: 31, gender: 'F', uncertain: 'Husband shows "क्िवाजी" - corrected to शिवाजी' },
  { serial: 768, voterId: 'XUA8842254', name: 'सारिका आगवने', father: 'शिवाजी आगवने', age: 34, gender: 'F', uncertain: 'Gender marked as "it" in source - assuming F from name' },
  { serial: 769, voterId: 'XUA8B845547', name: 'सुहास भिमराव गवारे', father: 'भिमराव गवारे', age: 47, gender: 'M' },
  { serial: 770, voterId: 'XUA8845554', name: 'योगीता सुहास गवारे', husband: 'सुहास गवारे', age: 40, gender: 'F' }
];

const processedVoters = voters.map(v => ({
  ...v,
  ward: '7',
  booth: '1'
}));

fs.writeFileSync('temp-page-data.json', JSON.stringify(processedVoters, null, 2), 'utf8');

console.log('\n📄 Processing PDF Pages 44-47 - Ward 7, Booth 1\n');
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
