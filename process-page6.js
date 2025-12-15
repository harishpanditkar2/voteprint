const fs = require('fs');

console.log('\n📄 Processing Page 6 - Ward 7, Booth 1\n');

const voters = [
  { serial: 151, voterId: 'XUA2324572', name: 'वैशाली दिनकर पवार', age: 49, gender: 'F', uncertain: 'Name shows "वै्लाली" - using वैशाली' },
  { serial: 152, voterId: 'CRM2026151', name: 'स्नेहलता अमरसिंग पवार', age: 46, gender: 'F' },
  { serial: 153, voterId: 'XUA8057101', name: 'चिन्मय राजेश्वर रायकवार', age: 28, gender: 'M' },
  { serial: 154, voterId: 'XUA8057127', name: 'A विश्‍वास शेळके', age: 25, gender: 'M', uncertain: 'Name shows "A विश्‍वास" - first name missing' },
  { serial: 155, voterId: 'XUA8412611', name: 'कौसर शब्बीर बागवान', age: 22, gender: 'F' },
  { serial: 156, voterId: 'XUA8172496', name: 'रवींद्र इनामदार', age: 67, gender: 'M' },
  { serial: 157, voterId: 'XUA8172520', name: 'अनुपमा इनामदार', age: 61, gender: 'F' },
  { serial: 158, voterId: 'XUA2324317', name: 'निमिष नाभीराज कोठारी', age: 34, gender: 'M' },
  { serial: 159, voterId: 'XUA8098659', name: 'अथर्व महेश दरे', age: 24, gender: 'M' },
  { serial: 160, voterId: 'XUA8057135', name: 'अंकित सुजीत पराडकर', age: 23, gender: 'M' },
  { serial: 161, voterId: 'XUA8057358', name: 'ईशान सुजीत पराडकर', age: 23, gender: 'M' },
  { serial: 162, voterId: 'XUA2324960', name: 'ज्योती प्रणेता राजपुत', age: 45, gender: 'F' },
  { serial: 163, voterId: 'CRM2965879', name: 'शुभदा नितीन कासार', age: 49, gender: 'F' },
  { serial: 164, voterId: 'XUA8564346', name: 'प्रणव मोहन रणदीवे', age: 19, gender: 'M' },
  { serial: 165, voterId: 'XUA7937337', name: 'सुफियान सरवर बागवान', age: 28, gender: 'M' },
  { serial: 166, voterId: 'XUA7351406', name: 'रिजवान बशीर तांबोळी', age: 30, gender: 'M' },
  { serial: 167, voterId: 'XUA7850720', name: 'रसिका श्रीकांत गावडे', age: 28, gender: 'F' },
  { serial: 168, voterId: 'XUA2324325', name: 'शौरीलाल तिरथराम अहुजा', age: 85, gender: 'M' },
  { serial: 169, voterId: 'XUA2324333', name: 'अमृता शौरीलाल अहुजा', age: 79, gender: 'F' },
  { serial: 170, voterId: 'XUA2324341', name: 'प्रविण शौरीलाल अहुजा', age: 56, gender: 'M' },
  { serial: 171, voterId: 'XUA2324358', name: 'पुजा प्रविण अहुजा', age: 49, gender: 'F' },
  { serial: 172, voterId: 'XUA2324366', name: 'उमेश शौरीलाल अहुजा', age: 49, gender: 'M' },
  { serial: 173, voterId: 'XUA2324382', name: 'संजय शौरीलाल अहुजा', age: 46, gender: 'M' },
  { serial: 174, voterId: 'XUA2324374', name: 'आरती उमेश अहुजा', age: 42, gender: 'F' },
  { serial: 175, voterId: 'XUA2324978', name: 'टिना संजय आहुजा', age: 40, gender: 'F' },
  { serial: 176, voterId: 'CRM2277143', name: 'विश्वनाथ पुरषोत्तम कळंत्रे', age: 90, gender: 'M', uncertain: 'Name shows "विवनाथ" - using विश्वनाथ' },
  { serial: 177, voterId: 'CRM2277135', name: 'साधना विश्‍वनाथ कळंत्रे', age: 56, gender: 'F' },
  { serial: 178, voterId: 'CRM2277150', name: 'e विश्‍वनाथ कळंत्रे', age: 49, gender: 'M', uncertain: 'Name shows "e विश्‍वनाथ" - first name missing' },
  { serial: 179, voterId: 'CRM2278232', name: 'सायली शैलेश कळंत्रे', age: 38, gender: 'F', uncertain: 'Husband name shows "C o कळंत्रे"' },
  { serial: 180, voterId: 'XUA7351497', name: 'अजय चंद्रमोहन तलवाड', age: 59, gender: 'M' }
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
console.log('   Serial range: 151 to 180');
if (uncertain > 0) {
  console.log('\n⚠️  UNCERTAIN DATA: ' + uncertain + ' voters need manual verification');
}

console.log('\n✅ Data ready to save!\n');
