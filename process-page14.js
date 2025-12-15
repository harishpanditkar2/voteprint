const fs = require('fs');

console.log('\n📄 Processing Page 14 - Ward 7, Booth 1\n');

const voters = [
  { serial: 416, voterId: 'XUA7351570', name: 'रिजवान समीर बागवान', age: 40, gender: 'F' },
  { serial: 417, voterId: 'XUA7351927', name: 'अस्मिता अमोल भगत', age: 41, gender: 'F' },
  { serial: 418, voterId: 'XUA7225295', name: 'चंद्रशेखर चांगदेव भोसले', age: 41, gender: 'M', uncertain: 'Name shows "चंद्रवोखर" - using चंद्रशेखर' },
  { serial: 419, voterId: 'XUA7615560', name: 'शुभम संजय चव्हाण', age: 26, gender: 'M' },
  { serial: 420, voterId: 'CRM2061778', name: 'स्वाती संजय चिंबळकर', age: 55, gender: 'F' },
  { serial: 421, voterId: 'XUA7670623', name: 'शितल विश्वनाथ गाडे', age: 30, gender: 'F', uncertain: 'Father name shows "विकवनाथ" - using विश्वनाथ' },
  { serial: 422, voterId: 'XUA7351679', name: 'स्नेहा धवल गांधी', age: 38, gender: 'F' },
  { serial: 423, voterId: 'XUA7225311', name: 'भक्ती सुशिल गांधी', age: 36, gender: 'F', uncertain: 'Husband name shows "सुकिल" - using सुशिल' },
  { serial: 424, voterId: 'XUA7670649', name: 'गौरी पोपटराव जगताप', age: 35, gender: 'F', uncertain: 'Age shows "R" - estimated 35' },
  { serial: 425, voterId: 'XUA7670607', name: 'दिपक विश्वनाथ कानडे', age: 54, gender: 'M' },
  { serial: 426, voterId: 'XUA7670615', name: 'तेजस्विनी दिपक कानडे', age: 27, gender: 'F' },
  { serial: 427, voterId: 'XUA7615578', name: 'ज्ञानदेव महादेव केंगार', age: 60, gender: 'M' },
  { serial: 428, voterId: 'XUA7615537', name: 'गणेश ज्ञानदेव केंगार', age: 33, gender: 'M', uncertain: 'Name shows "गणेज्ञ" - using गणेश' },
  { serial: 429, voterId: 'XUA7615529', name: 'ज्योती ज्ञानदेव केंगार', age: 29, gender: 'F' },
  { serial: 430, voterId: 'XUA7615511', name: 'आर्या अभय खंडागळे', age: 28, gender: 'F' },
  { serial: 431, voterId: 'XUA7670631', name: 'शुभम किरण किणिंगे', age: 27, gender: 'M' },
  { serial: 432, voterId: 'XUA7491962', name: 'हृषीकेश प्रद्युम्न क्षीरसागर', age: 30, gender: 'M', uncertain: 'Name shows "हृषीकेवा" - using हृषीकेश' },
  { serial: 433, voterId: 'XUA7670599', name: 'निकिता चंद्रशेखर कुलकर्णी', age: 28, gender: 'F', uncertain: 'Father name shows "चंद्रवोखर" and "चंद्रदोखर" - using चंद्रशेखर' },
  { serial: 434, voterId: 'XUA7615552', name: 'रजत बळीराम निकम', age: 29, gender: 'M' },
  { serial: 435, voterId: 'XUA7615503', name: 'प्रतिम हर्षवर्धन पाटील', age: 28, gender: 'M' },
  { serial: 436, voterId: 'XUA7937352', name: 'प्रज्ञा हरिदास पवार', age: 28, gender: 'F' },
  { serial: 437, voterId: 'XUA7351554', name: 'अक्षय रमेश साबळे', age: 30, gender: 'M', uncertain: 'Father name shows "रमेद0ा" - using रमेश' },
  { serial: 438, voterId: 'XUA7351828', name: 'नमिता अभिषेक संघवी', age: 35, gender: 'F' },
  { serial: 439, voterId: 'XUA7351844', name: 'अभिषेक दिलीप संघवी', age: 34, gender: 'M' },
  { serial: 440, voterId: 'XUA7351836', name: 'यज्ञ दिलीप संघवी', age: 29, gender: 'M' },
  { serial: 441, voterId: 'XUA7670573', name: 'कोमल विनितकुमार शहा', age: 32, gender: 'F', uncertain: 'Age shows "R" - estimated 32' },
  { serial: 442, voterId: 'XUA7850753', name: 'राधिका मिलिंद शहा', age: 31, gender: 'F' },
  { serial: 443, voterId: 'XUA7670581', name: 'केवल विनितकुमार शहा', age: 30, gender: 'M' },
  { serial: 444, voterId: 'XUA7850761', name: 'सोनिया चकोर शहा', age: 29, gender: 'F' },
  { serial: 445, voterId: 'XUA7850779', name: 'रितु चकोर शहा', age: 28, gender: 'F' }
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
console.log('   Serial range: 416 to 445');
if (uncertain > 0) {
  console.log('\n⚠️  UNCERTAIN DATA: ' + uncertain + ' voters need manual verification');
}

console.log('\n✅ Data ready to save!\n');
