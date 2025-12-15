const fs = require('fs');

console.log('\n📄 Processing Page 17 - Ward 7, Booth 1\n');

const voters = [
  { serial: 506, voterId: '8511281930', name: 'सुषमा झांबरे महाजन', age: 35, gender: 'F', uncertain: 'Husband name shows "e महाजन" - unclear' },
  { serial: 507, voterId: 'XUA8325409', name: 'तृप्ती विराज धायगुडे', age: 26, gender: 'F' },
  { serial: 508, voterId: 'XUA8116493', name: 'शिवराज पाटील', age: 26, gender: 'M', uncertain: 'Father name shows "प्रश्ञांत" - may be प्रशांत' },
  { serial: 509, voterId: 'XUA8108904', name: 'सारिका कैलास शितोळे', age: 30, gender: 'F' },
  { serial: 510, voterId: 'XUA8094302', name: 'स्नेहल आखाडे', age: 33, gender: 'F' },
  { serial: 511, voterId: 'CRM1891761', name: 'ज्ञानेश्वर बाबा गाढवे', age: 43, gender: 'M' },
  { serial: 512, voterId: 'XUA8537698', name: 'जयश्री अभिमन्यु चौधरी', age: 35, gender: 'F', uncertain: 'Age unclear in source - estimated 35' },
  { serial: 513, voterId: 'XUA8123135', name: 'सुरज गावडे', age: 23, gender: 'M' },
  { serial: 514, voterId: 'XUA8514754', name: 'स्नेहा संदीप शहाणे', age: 27, gender: 'F' },
  { serial: 515, voterId: 'XUA8530867', name: 'पार्थ दंडवते', age: 21, gender: 'M' },
  { serial: 516, voterId: 'XUA7613722', name: 'विलास गजानन शेंडगे', age: 62, gender: 'M' },
  { serial: 517, voterId: 'XUA7613730', name: 'सविता विलास शेंडगे', age: 54, gender: 'F' },
  { serial: 518, voterId: 'XUA7464100', name: 'अनुज विलास दोंडगे', age: 30, gender: 'M', uncertain: 'Father name "शेंडगे" but surname is दोंडगे' },
  { serial: 519, voterId: 'XUA8077190', name: 'हर्षदा विलास शेंडगे', age: 24, gender: 'F' },
  { serial: 520, voterId: 'XUA8531469', name: 'अथर्व परब', age: 19, gender: 'M' },
  { serial: 521, voterId: 'XUA8153587', name: 'ओमकार दरेकर', age: 25, gender: 'M', uncertain: 'Father name shows "अज्लोक" - may be अशोक' },
  { serial: 522, voterId: 'CRM2277663', name: 'शरदचंद्र साकरचंद शहा', age: 82, gender: 'M' },
  { serial: 523, voterId: 'CRM2063451', name: 'स्वप्नील शरदचंद्र शहा', age: 51, gender: 'M' },
  { serial: 524, voterId: 'CRM2063469', name: 'रिना स्वप्निल शहा', age: 45, gender: 'F', uncertain: 'Husband name shows "स्व्निल" - should be स्वप्नील' },
  { serial: 525, voterId: 'XUA8599326', name: 'सायली दिलीप सुर्वे', age: 24, gender: 'F' },
  { serial: 526, voterId: 'XUA8122863', name: 'तुषार राऊत', age: 33, gender: 'M' },
  { serial: 527, voterId: 'XUA8111601', name: 'माळशिकारे', age: 23, gender: 'M', uncertain: 'First name shows "e" - unclear, using surname only' },
  { serial: 528, voterId: 'CRM2061893', name: 'दिलीप पंडीत दंडवते', age: 72, gender: 'M' },
  { serial: 529, voterId: 'CRM2061786', name: 'सरला दिलीप दंडवते', age: 70, gender: 'F' },
  { serial: 530, voterId: 'CRM2277309', name: 'अमरजा दिलीप दंडवते', age: 41, gender: 'F' },
  { serial: 531, voterId: 'XUA8512584', name: 'सुरज कणीचे', age: 26, gender: 'M' },
  { serial: 532, voterId: 'XUA8118200', name: 'वंदना मानकर', age: 41, gender: 'F' },
  { serial: 533, voterId: 'XUA8171696', name: 'मयुरेश कांबळे', age: 22, gender: 'M' },
  { serial: 534, voterId: 'XUA8606360', name: 'सुजल शिंदे', age: 19, gender: 'M' },
  { serial: 535, voterId: 'XUA8165284', name: 'विकास राजेंद्र झोंबाडे', age: 29, gender: 'M', uncertain: 'Surname repeated "झोंबाडे झोंबडे" - using झोंबाडे' }
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
console.log('   Serial range: 506 to 535');
if (uncertain > 0) {
  console.log('\n⚠️  UNCERTAIN DATA: ' + uncertain + ' voters need manual verification');
}

console.log('\n✅ Data ready to save!\n');
