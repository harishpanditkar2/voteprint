const fs = require('fs');

console.log('\n📄 Processing Page 9 - Ward 7, Booth 1\n');

const voters = [
  { serial: 241, voterId: 'CRM2276889', name: 'अक्षदा सुधाकर पांढरे', age: 35, gender: 'F' },
  { serial: 242, voterId: 'CRM2276145', name: 'बाबुराव पांडुरंग रुपनावर', age: 57, gender: 'M' },
  { serial: 243, voterId: 'CRM2276137', name: 'कंचन बाबुराव रुपनावर', age: 57, gender: 'F' },
  { serial: 244, voterId: 'CRM1265040', name: 'सुभाष सुधाकर फडणीस', age: 58, gender: 'M' },
  { serial: 245, voterId: 'CRM2062040', name: 'सुभाष जिवराज मुथा', age: 75, gender: 'M' },
  { serial: 246, voterId: 'XUA2658912', name: 'राजेंद्र जिवराज मुथा', age: 68, gender: 'M' },
  { serial: 247, voterId: 'XUA2658920', name: 'जयश्री राजेंद्र मुथा', age: 63, gender: 'F' },
  { serial: 248, voterId: 'CRM2062347', name: 'सुवर्णा सुभाष मुथा', age: 63, gender: 'F' },
  { serial: 249, voterId: 'CRM2062024', name: 'भारत सुभाष मुथा', age: 42, gender: 'M' },
  { serial: 250, voterId: 'CRM2061885', name: 'निलेश सुभाष मुथा', age: 40, gender: 'M' },
  { serial: 251, voterId: 'CRM2276871', name: 'रमणलाल जिवराज सुंदेचामुथा', age: 67, gender: 'M' },
  { serial: 252, voterId: 'CRM2276947', name: 'विजया रमणलाल सुंदेचामुथा', age: 62, gender: 'F' },
  { serial: 253, voterId: 'CRM2275907', name: 'सतिश रमणलाल सुंदेचामुथा', age: 47, gender: 'M' },
  { serial: 254, voterId: 'XUA2604221', name: 'स्वप्ना सतिश सुंदेचामुथा', age: 43, gender: 'F' },
  { serial: 255, voterId: 'CRM2025054', name: 'विनोद बाळासाहेब सोरेटे', age: 51, gender: 'M' },
  { serial: 256, voterId: 'CRM2025047', name: 'कषिला विनोद सोरटे', age: 48, gender: 'F', uncertain: 'Name shows "कषिला" - check spelling' },
  { serial: 257, voterId: 'XUA2324457', name: 'रंजना बचुलाल शहा', age: 67, gender: 'F' },
  { serial: 258, voterId: 'XUA2324481', name: 'शिरिष मोतीलाल शहा', age: 59, gender: 'M' },
  { serial: 259, voterId: 'XUA2324473', name: 'निलीमा शिरष शहा', age: 57, gender: 'F', uncertain: 'Husband name shows "क्शिरिष" - should be शिरिष' },
  { serial: 260, voterId: 'XUA2324465', name: 'स्वप्नील बचुलाल शहा', age: 48, gender: 'M' },
  { serial: 261, voterId: 'CRM1408699', name: 'विलास वामनराव गोसावी', age: 75, gender: 'M' },
  { serial: 262, voterId: 'CRM1408731', name: 'वैशाली विलास गोसावी', age: 70, gender: 'F' },
  { serial: 263, voterId: 'CRM2062073', name: 'सुभाष नेमचंद दोशी', age: 83, gender: 'M' },
  { serial: 264, voterId: 'CRM2024081', name: 'अमृता सुभाष दोशी', age: 75, gender: 'F' },
  { serial: 265, voterId: 'CRM2062081', name: 'अभिजीत सुभाष दोशी', age: 52, gender: 'M' },
  { serial: 266, voterId: 'CRM2062446', name: 'मेघना अभिजीत दोशी', age: 50, gender: 'F' },
  { serial: 267, voterId: 'CRM2275956', name: 'अमिताभ सुभाष दोशी', age: 47, gender: 'M' },
  { serial: 268, voterId: 'CRM2025351', name: 'दत्तात्रय धोंडीबा भुजबळ', age: 72, gender: 'M' },
  { serial: 269, voterId: 'CRM2025369', name: 'विमल दत्तात्रय भुजबळ', age: 67, gender: 'F' },
  { serial: 270, voterId: 'CRM2023794', name: 'अमोल दत्तात्रय भुजबळ', age: 47, gender: 'M' }
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
console.log('   Serial range: 241 to 270');
if (uncertain > 0) {
  console.log('\n⚠️  UNCERTAIN DATA: ' + uncertain + ' voters need manual verification');
}

console.log('\n✅ Data ready to save!\n');
