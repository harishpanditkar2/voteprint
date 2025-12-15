const fs = require('fs');

console.log('\n📄 Processing Page 5 - Ward 7, Booth 1\n');

const voters = [
  { serial: 121, voterId: 'XUA7224371', name: 'प्रविण हनुमंत वाघमारे', age: 30, gender: 'M' },
  { serial: 122, voterId: 'XUA7224827', name: 'राजेंद्र माणिकराव वाघमोडे', age: 55, gender: 'M' },
  { serial: 123, voterId: 'XUA7225154', name: 'वैशाली राजेंद्र वाघमोडे', age: 45, gender: 'F' },
  { serial: 124, voterId: 'XUA7615495', name: 'प्रसाद दत्तात्रय वाघमोडे', age: 30, gender: 'M' },
  { serial: 125, voterId: 'XUA7556467', name: 'नम्रता मकरंद वारे', age: 39, gender: 'F' },
  { serial: 126, voterId: 'XUA7750417', name: 'सुहानी किरण वायसे', age: 27, gender: 'F' },
  { serial: 127, voterId: 'XUA7556434', name: 'प्रसाद सेतोष येलूरे', age: 31, gender: 'M', uncertain: 'Father name shows "सेतोष" - may be संतोष' },
  { serial: 128, voterId: 'XUA7556442', name: 'मधुसुदन संतोष युलूरे', age: 28, gender: 'M' },
  { serial: 129, voterId: 'XUA8057416', name: 'अश्‍विन महादेव कांबळे', age: 24, gender: 'M' },
  { serial: 130, voterId: 'XUA8009771', name: 'इवेता देवीचंद कटारिया', age: 22, gender: 'F' },
  { serial: 131, voterId: 'XUA8063356', name: 'सिद्धी मिलिंद संगई', age: 23, gender: 'F' },
  { serial: 132, voterId: 'XUA8172504', name: 'जैनाब नासिकवाला', age: 27, gender: 'F' },
  { serial: 133, voterId: 'XUA8566267', name: 'चिराग संजय आहुजा', age: 19, gender: 'M' },
  { serial: 134, voterId: 'XUA8532541', name: 'जतीन विजय रोहणी', age: 23, gender: 'M' },
  { serial: 135, voterId: 'XUA8609182', name: 'इवेत जगताप', age: 20, gender: 'M', uncertain: 'Name shows "इवेत" and father "योगेज्ञ" - check spelling' },
  { serial: 136, voterId: 'XUA8541831', name: 'प्रांजली संजोग पवार', age: 21, gender: 'F' },
  { serial: 137, voterId: 'XUA8537615', name: 'सुहासिनी विक्रमादित्य गायकवाड', age: 29, gender: 'F' },
  { serial: 138, voterId: 'XUA7750375', name: 'काजल विनोदकुमार गांधी', age: 30, gender: 'F' },
  { serial: 139, voterId: 'XUA7750490', name: 'अक्षय विनोद गांधी', age: 26, gender: 'M' },
  { serial: 140, voterId: 'XUA8079337', name: 'दीप्ति दिपक गांधी', age: 23, gender: 'F' },
  { serial: 141, voterId: 'CRM2063048', name: 'आशुतोष भानुदास जोशी', age: 52, gender: 'M' },
  { serial: 142, voterId: 'CRM2063055', name: 'आश्‍्विनी आशुतोष जोशी', age: 46, gender: 'F' },
  { serial: 143, voterId: 'XUA8001505', name: 'रमा जगदीश्ष देशपांडे', age: 25, gender: 'F', uncertain: 'Name shows "जगदीश्ष" - may be जगदीश' },
  { serial: 144, voterId: 'XUA7793789', name: 'पायल अनिल कोर्डे', age: 29, gender: 'F' },
  { serial: 145, voterId: 'XUA7351398', name: 'कल्पेश श्रेयांस शहा', age: 30, gender: 'M' },
  { serial: 146, voterId: 'XUA7750482', name: 'माधुरी संभाजी कोकणे', age: 50, gender: 'F' },
  { serial: 147, voterId: 'XUA2324564', name: 'संभाजी लक्ष्मण कोकणे', age: 61, gender: 'M' },
  { serial: 148, voterId: 'CRM1265420', name: 'दिनकर रामचंद्र पवार', age: 78, gender: 'M' },
  { serial: 149, voterId: 'CRM1265412', name: 'इंदुमती दिनकर पवार', age: 70, gender: 'F' },
  { serial: 150, voterId: 'CRM2026169', name: 'अमरसिंग दिनकर पवार', age: 53, gender: 'M' }
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
console.log('   Serial range: 121 to 150');
if (uncertain > 0) {
  console.log('\n⚠️  UNCERTAIN DATA: ' + uncertain + ' voters need manual verification');
}

console.log('\n✅ Data ready to save!\n');
