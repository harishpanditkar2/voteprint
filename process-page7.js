const fs = require('fs');

console.log('\n📄 Processing Page 7 - Ward 7, Booth 1\n');

const voters = [
  { serial: 181, voterId: 'CRM2276954', name: 'संदीप सुरेश कुलकर्णी', age: 85, gender: 'M', uncertain: 'Father name shows "सुरेक्ष" - using सुरेश' },
  { serial: 182, voterId: 'CRM2276780', name: 'सुनंदा दत्तात्रय कुलकर्णी', age: 84, gender: 'F' },
  { serial: 183, voterId: 'CRM2276970', name: 'सुनिता सुरेश कुलकर्णी', age: 75, gender: 'F' },
  { serial: 184, voterId: 'CRM2276905', name: 'गिरीष दत्तात्रय कुलकर्णी', age: 60, gender: 'M' },
  { serial: 185, voterId: 'CRM2276426', name: 'शिरीष दत्तात्रय कुलकर्णी', age: 57, gender: 'M' },
  { serial: 186, voterId: 'CRM2276798', name: 'सुषमा शिरीष कुलकर्णी', age: 52, gender: 'F' },
  { serial: 187, voterId: 'XUA1984632', name: 'माधुरी अविनाश कुलकर्णी', age: 50, gender: 'F' },
  { serial: 188, voterId: 'CRM2276897', name: 'कल्याणी गिरीष कुलकर्णी', age: 50, gender: 'F' },
  { serial: 189, voterId: 'XUA8802480', name: 'अद्वैत कुलकर्णी', age: 23, gender: 'M', uncertain: 'Only shows "कुलकर्णी" with mother name' },
  { serial: 190, voterId: 'XUA7850712', name: 'अथर्व गिरीष कुलकर्णी', age: 25, gender: 'M' },
  { serial: 191, voterId: 'XUA7850704', name: 'वैष्णवी शिरीष कुलकर्णी', age: 24, gender: 'F' },
  { serial: 192, voterId: 'CRM2276830', name: 'प्रताप पांडुरंग घोरपडे', age: 47, gender: 'M' },
  { serial: 193, voterId: 'CRM2276491', name: 'चंद्रकांत चंदुलाल दोशी', age: 73, gender: 'F' },
  { serial: 194, voterId: 'CRM2276483', name: 'राजेंद्र चंदुलाल दोशी', age: 57, gender: 'M' },
  { serial: 195, voterId: 'XUA1984640', name: 'साठैरभ संतोष दोशी', age: 37, gender: 'M', uncertain: 'Name shows "साठैरभ" - check spelling' },
  { serial: 196, voterId: 'XUA2324390', name: 'अरुणा रजनीकांत शहा', age: 74, gender: 'F' },
  { serial: 197, voterId: 'XUA2324416', name: 'प्रिती मनोज शहा', age: 48, gender: 'F' },
  { serial: 198, voterId: 'XUA2324408', name: 'मनोज रजनीकांत शहा', age: 46, gender: 'M' },
  { serial: 199, voterId: 'CRM2063337', name: 'राजाराम किसन भुजवळ', age: 74, gender: 'M' },
  { serial: 200, voterId: 'CRM2276624', name: 'विश्‍वनाथ किसन भुजवळ', age: 71, gender: 'M' },
  { serial: 201, voterId: 'CRM2275923', name: 'शंकर किसन भुजवळ', age: 66, gender: 'M' },
  { serial: 202, voterId: 'CRM2277002', name: 'मालती राजाराम भुजवळ', age: 63, gender: 'F' },
  { serial: 203, voterId: 'CRM2277010', name: 'शारदा विश्‍वनाथ भुजवळ', age: 61, gender: 'F' },
  { serial: 204, voterId: 'CRM2277028', name: 'छाया AR भुजवळ', age: 57, gender: 'F', uncertain: 'Name shows "AR" - middle name unclear' },
  { serial: 205, voterId: 'CRM2276814', name: 'अविनाश विश्‍वनाथ भुजवळ', age: 38, gender: 'M' },
  { serial: 206, voterId: 'CRM2024420', name: 'कृष्णकांत राजाराम भुजबळ', age: 42, gender: 'M' },
  { serial: 207, voterId: 'CRM2062032', name: 'चंदन राजाराम भुजबळ', age: 40, gender: 'M' },
  { serial: 208, voterId: 'XUA2324424', name: 'कुंदन शंकरराव भुजबळ', age: 34, gender: 'M' },
  { serial: 209, voterId: 'CRM2062016', name: 'वैभव दिगंबर तावरे', age: 54, gender: 'M' },
  { serial: 210, voterId: 'CRM2062008', name: 'पौर्णिमा वैभव तावरे', age: 53, gender: 'F' }
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
console.log('   Serial range: 181 to 210');
if (uncertain > 0) {
  console.log('\n⚠️  UNCERTAIN DATA: ' + uncertain + ' voters need manual verification');
}

console.log('\n✅ Data ready to save!\n');
