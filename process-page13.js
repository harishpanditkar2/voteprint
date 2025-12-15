const fs = require('fs');

console.log('\n📄 Processing Page 13 - Ward 7, Booth 1\n');

const voters = [
  { serial: 391, voterId: 'CRM2276079', name: 'तस्मीम अब्दुलकादर खोकावाला', age: 54, gender: 'F' },
  { serial: 392, voterId: 'CRM2025971', name: 'साधना धनंजय बिचकर', age: 58, gender: 'F' },
  { serial: 393, voterId: 'CRM2026219', name: 'अरुणा जय बिचकर', age: 43, gender: 'F', uncertain: 'Husband name shows "बिचिकर" - using बिचकर' },
  { serial: 394, voterId: 'CRM1408798', name: 'विमल लक्ष्मण बिचकर', age: 88, gender: 'F' },
  { serial: 395, voterId: 'CRM2025963', name: 'भाग्यश्री लक्ष्मण बिचकर', age: 66, gender: 'F' },
  { serial: 396, voterId: 'CRM2026037', name: 'अजय लक्ष्मण बिचकर', age: 64, gender: 'M' },
  { serial: 397, voterId: 'CRM2025930', name: 'ज्योती अजय बिचकर', age: 58, gender: 'F' },
  { serial: 398, voterId: 'CRM2026201', name: 'जय लक्ष्मण बिचकर', age: 54, gender: 'M' },
  { serial: 399, voterId: 'XUA2324531', name: 'राहुल रत्नाकर पवार', age: 56, gender: 'M' },
  { serial: 400, voterId: 'CRM2059962', name: 'समीर सुरेश सराफ', age: 56, gender: 'M' },
  { serial: 401, voterId: 'CRM2276640', name: 'धनराज मोहनलाल बेदमुथा', age: 64, gender: 'M' },
  { serial: 402, voterId: 'CRM2276848', name: 'शोभा धनराज बेदमुथा', age: 60, gender: 'F' },
  { serial: 403, voterId: 'CRM2277671', name: 'प्रशांत दिलीप गुरव', age: 40, gender: 'M' },
  { serial: 404, voterId: 'XUA8694028', name: 'सौम्या तुषार ओंबासे', age: 18, gender: 'F', uncertain: 'Father name shows "यज्षवंत" - may be यशवंत' },
  { serial: 405, voterId: 'XUA8703449', name: 'प्रफुल्ल दत्तात्रय गावडे', age: 46, gender: 'M' },
  { serial: 406, voterId: 'XUA8703522', name: 'सोनाली प्रफुल्ल गावडे', age: 40, gender: 'F' },
  { serial: 407, voterId: 'XUA8703621', name: 'सायली प्रफुल्ल गावडे', age: 19, gender: 'F' },
  { serial: 408, voterId: 'XUA8712069', name: 'हीर जिग्नेश मोता', age: 18, gender: 'F' },
  { serial: 409, voterId: 'MMQ1829084', name: 'रुपाली रमेश खाडे', age: 40, gender: 'F', uncertain: 'Husband name shows "रमेज्ञ" - using रमेश' },
  { serial: 410, voterId: 'XUA8748618', name: 'मानस विनोद सोरटे', age: 22, gender: 'M' },
  { serial: 411, voterId: 'XUA8760837', name: 'रिज़वान तांबोळी', age: 29, gender: 'F', uncertain: 'First name unclear "eI" in text, husband "रिछ़वान बशीर"' },
  { serial: 412, voterId: 'XUA8785974', name: 'सुकमिता पवार', age: 18, gender: 'F' },
  { serial: 413, voterId: 'XUA8789935', name: 'योगिता अमिताभ दोशी', age: 45, gender: 'F' },
  { serial: 414, voterId: 'XUA8789984', name: 'अमिताभ सुभाष दोशी', age: 47, gender: 'M' },
  { serial: 415, voterId: 'RNR0095109', name: 'पूनम गुप्ता', age: 34, gender: 'F', uncertain: 'Father name shows "अशोकगुप्ता" repeated - may be अशोक गुप्ता' }
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
console.log('   Serial range: 391 to 415');
if (uncertain > 0) {
  console.log('\n⚠️  UNCERTAIN DATA: ' + uncertain + ' voters need manual verification');
}

console.log('\n✅ Data ready to save!\n');
