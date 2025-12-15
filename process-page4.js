const fs = require('fs');

console.log('\n📄 Processing Page 4 - Ward 7, Booth 1\n');

const voters = [
  { serial: 91, voterId: 'XUA7224918', name: 'प्रथ्वीराज ज्ांताराम पिंगळे', age: 29, gender: 'M', uncertain: 'Name shows "ज्ांताराम" - may be शांताराम' },
  { serial: 92, voterId: 'XUA7225030', name: 'सुभाष A रावळ', age: 73, gender: 'M', uncertain: 'Name shows "A" - middle name missing' },
  { serial: 93, voterId: 'XUA7225048', name: 'विनय विवेक रावळ', age: 37, gender: 'M' },
  { serial: 94, voterId: 'XUA7224736', name: 'पियुष बाबुराव रूपनवर', age: 30, gender: 'M' },
  { serial: 95, voterId: 'XUA7224512', name: 'संतोष दत्तात्रय सणस', age: 50, gender: 'M' },
  { serial: 96, voterId: 'XUA7225121', name: 'सपना महावीर संचेती', age: 36, gender: 'F' },
  { serial: 97, voterId: 'XUA7750441', name: 'साहिल संजय संचेती', age: 28, gender: 'M' },
  { serial: 98, voterId: 'XUA7224447', name: 'सौरभ राजेंद्र सस्ते', age: 33, gender: 'M' },
  { serial: 99, voterId: 'XUA7224421', name: 'सायली राजेंद्र सस्ते', age: 29, gender: 'F' },
  { serial: 100, voterId: 'XUA7225055', name: 'संजय मोतीचंद शहा', age: 65, gender: 'M' },
  { serial: 101, voterId: 'XUA7670433', name: 'सागर अरविंद शहा', age: 48, gender: 'M' },
  { serial: 102, voterId: 'XUA7224967', name: 'नुपूर संजय शहा', age: 30, gender: 'F' },
  { serial: 103, voterId: 'XUA7556426', name: 'पुजा शिरिष शहा', age: 28, gender: 'F' },
  { serial: 104, voterId: 'XUA7224603', name: 'श्रीमती प्रकाश शहा', age: 78, gender: 'F' },
  { serial: 105, voterId: 'XUA7224611', name: 'सुदर्शन प्रकाश शहा', age: 49, gender: 'M' },
  { serial: 106, voterId: 'XUA7351455', name: 'सोनाली सागर शहा', age: 45, gender: 'F' },
  { serial: 107, voterId: 'XUA7670490', name: 'प्रदिप ज्ञानदेव सुर्वे', age: 28, gender: 'M' },
  { serial: 108, voterId: 'XUA7351505', name: 'अनिता अजय तलवाड', age: 54, gender: 'F' },
  { serial: 109, voterId: 'XUA7351489', name: 'साक्षी अजय तलवाड', age: 32, gender: 'F' },
  { serial: 110, voterId: 'XUA7351471', name: 'शिवानी अजय तलवाड', age: 29, gender: 'F' },
  { serial: 111, voterId: 'XUA7224793', name: 'दीलनवाझ शब्बीर तांबोळी', age: 31, gender: 'F' },
  { serial: 112, voterId: 'XUA7224538', name: 'हर्षद चंद्रकांत तीसगांवकर', age: 31, gender: 'M' },
  { serial: 113, voterId: 'XUA7224983', name: 'स्वप्नील राजकुमार उपाध्ये', age: 38, gender: 'M' },
  { serial: 114, voterId: 'XUA7225071', name: 'सुरज राजकुमार उपाध्ये', age: 38, gender: 'M' },
  { serial: 115, voterId: 'XUA7351513', name: 'शर्वरी प्रदिप व्होरा', age: 30, gender: 'F' },
  { serial: 116, voterId: 'XUA7224934', name: 'मिनल वैभव व्होरा', age: 39, gender: 'F' },
  { serial: 117, voterId: 'XUA7224835', name: 'कल्पना हावप्पा वड्डे', age: 59, gender: 'F' },
  { serial: 118, voterId: 'XUA7225006', name: 'सोनल हावप्पा वड्डे', age: 34, gender: 'F' },
  { serial: 119, voterId: 'XUA7224843', name: 'मिनल हावप्पा वड्डे', age: 32, gender: 'F', uncertain: 'Age showed "R" - estimated as 32' },
  { serial: 120, voterId: 'XUA7615479', name: 'पुजा दिपक वडगांवकर', age: 33, gender: 'F' }
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
console.log('   Serial range: 91 to 120');
if (uncertain > 0) {
  console.log('\n⚠️  UNCERTAIN DATA: ' + uncertain + ' voters need manual verification');
}

console.log('\n✅ Data ready to save!\n');
