const fs = require('fs');

console.log('\n📄 Processing Page 11 - Ward 7, Booth 1\n');

const voters = [
  { serial: 301, voterId: 'CRM2276301', name: 'जितेश काशिनाथ चीवटे', age: 45, gender: 'M' },
  { serial: 302, voterId: 'XUA2324515', name: 'निलेश काशिनाथ चीवटे', age: 42, gender: 'M' },
  { serial: 303, voterId: 'CRM2063709', name: 'आलेफीया मुस्तजा नासीकवाला', age: 42, gender: 'F' },
  { serial: 304, voterId: 'CRM2062461', name: 'शुभांगी प्रकाश दळवी', age: 36, gender: 'F', uncertain: 'Age/gender unclear in source - estimated from context' },
  { serial: 305, voterId: 'CRM2062453', name: 'रिना प्रकाश दळवी', age: 34, gender: 'F', uncertain: 'Age/gender unclear in source - estimated from context' },
  { serial: 306, voterId: 'CRM2063691', name: 'विठ्ठल नारायण लोणकर', age: 78, gender: 'M', uncertain: 'Age/gender unclear in source - estimated from context' },
  { serial: 307, voterId: 'CRM2062636', name: 'दिपक वडगांवकर', age: 53, gender: 'M', uncertain: 'Father name shows "श्ांतीनाथ" - may be शांतीनाथ' },
  { serial: 308, voterId: 'CRM2062628', name: 'ज्योती दिपक वडगांवकर', age: 51, gender: 'F' },
  { serial: 309, voterId: 'CRM2022424', name: 'सुनिता किरण वायसे', age: 50, gender: 'F' },
  { serial: 310, voterId: 'XUA4593257', name: 'योगिनी रामकृष्ण मुळे', age: 47, gender: 'F' },
  { serial: 311, voterId: 'CRM2276962', name: 'दिप्ती संदिप कुलकर्णी', age: 40, gender: 'F' },
  { serial: 312, voterId: 'CRM3038205', name: 'प्राजक्ता शिवाजी तावरे', age: 44, gender: 'F' },
  { serial: 313, voterId: 'CRM1890284', name: 'निलेश शिवाजी तावरे', age: 42, gender: 'M', uncertain: 'Name shows "निलेश्" and father "क्षिवाजी" - using निलेश, शिवाजी' },
  { serial: 314, voterId: 'CRM2277796', name: 'ज्ञानेश्वर बाबुराव फराटे', age: 61, gender: 'M' },
  { serial: 315, voterId: 'CRM2277804', name: 'कुसुम ज्ञानेश्वर फराटे', age: 59, gender: 'F' },
  { serial: 316, voterId: 'CRM2276434', name: 'पांडुरंग एकनाथ घोरपडे', age: 88, gender: 'M' },
  { serial: 317, voterId: 'CRM2276418', name: 'रत्नमाला पांडुरंग घोरपडे', age: 83, gender: 'F' },
  { serial: 318, voterId: 'XUA2658888', name: 'मनोहर विठ्ठल धोकटे', age: 76, gender: 'M' },
  { serial: 319, voterId: 'CRM2063808', name: 'रमेश भगवानराव गानबोटे', age: 64, gender: 'M', uncertain: 'Name shows "रमेश्" - using रमेश' },
  { serial: 320, voterId: 'CRM2063816', name: 'वैशाली रमे गानबोटे', age: 55, gender: 'F', uncertain: 'Husband name shows "रमे" - should be रमेश' },
  { serial: 321, voterId: 'CRM1264498', name: 'सुवर्णा किरण भालेराव', age: 51, gender: 'F' },
  { serial: 322, voterId: 'CRM2063501', name: 'बाळकृष्ण नारायण लोणकर', age: 83, gender: 'M' },
  { serial: 323, voterId: 'CRM2063519', name: 'रत्नप्रभा बाळकृष्ण लोणकर', age: 75, gender: 'F' },
  { serial: 324, voterId: 'XUA2325017', name: 'प्रकाश नारायण दळवी', age: 63, gender: 'M' },
  { serial: 325, voterId: 'XUA2324994', name: 'शुभांगी प्रकाश दळवी', age: 36, gender: 'F', uncertain: 'Duplicate of 304 - check if different person' },
  { serial: 326, voterId: 'XUA2325009', name: 'रिना प्रकाश दळवी', age: 34, gender: 'F', uncertain: 'Duplicate of 305 - check if different person' },
  { serial: 327, voterId: 'CRM2062099', name: 'विठ्ठल नारायण लोणकर', age: 78, gender: 'M', uncertain: 'Duplicate of 306 - check if different person' },
  { serial: 328, voterId: 'CRM2062420', name: 'रेखा विठ्ठल लोणकर', age: 72, gender: 'F' },
  { serial: 329, voterId: 'CRM2063360', name: 'किरण रतनलाल शहा', age: 64, gender: 'M' },
  { serial: 330, voterId: 'CRM2063378', name: 'कल्पना किरण शहा', age: 58, gender: 'F' }
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
console.log('   Serial range: 301 to 330');
if (uncertain > 0) {
  console.log('\n⚠️  UNCERTAIN DATA: ' + uncertain + ' voters need manual verification');
}

console.log('\n✅ Data ready to save!\n');
