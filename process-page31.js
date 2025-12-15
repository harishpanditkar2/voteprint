const fs = require('fs');

const voters = [
  { serial: 754, voterId: 'CRM1892157', name: 'आरती प्रविण मुथा', husband: 'प्रविण मुथा', age: 44, gender: 'F', uncertain: 'Name shows "आरर्ती" - corrected to आरती' }
];

const processedVoters = voters.map(v => ({
  ...v,
  ward: '7',
  booth: '1'
}));

fs.writeFileSync('temp-page-data.json', JSON.stringify(processedVoters, null, 2), 'utf8');

console.log('\n📄 Processing PDF Page 37 - Ward 7, Booth 1\n');
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
