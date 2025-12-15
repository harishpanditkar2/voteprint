const fs = require('fs');

console.log('\n📄 Processing Page 3 - Ward 7, Booth 1\n');

const voters = [
  { serial: 61, voterId: 'XUA7750383', name: 'अक्षय देवीचंद कटारिया', age: 26, gender: 'M' },
  { serial: 62, voterId: 'XUA7225287', name: 'विनय महाउंगाप्पा कोलकी', age: 55, gender: 'M' },
  { serial: 63, voterId: 'XUA7225279', name: 'उमा विनय कोलकी', age: 45, gender: 'F' },
  { serial: 64, voterId: 'XUA7615453', name: 'जगन्नाथ नारायण कुंभार', age: 59, gender: 'M' },
  { serial: 65, voterId: 'XUA7615461', name: 'तेजश्री जगन्नाथ कुंभार', age: 48, gender: 'F' },
  { serial: 66, voterId: 'XUA7224728', name: 'ओंकार जगन्नाथ कुंभार', age: 39, gender: 'M' },
  { serial: 67, voterId: 'XUA7224710', name: 'रूपेश जगन्नाथ कुंभार', age: 28, gender: 'M', uncertain: 'Name showed "3 जगन्नाथ कुंभार" - used रूपेश' },
  { serial: 68, voterId: 'XUA8244345', name: 'प्रियांका हनुमंत लकडे', age: 30, gender: 'F' },
  { serial: 69, voterId: 'XUA7224991', name: 'पद्मनाथ महेश लंके', age: 30, gender: 'M' },
  { serial: 70, voterId: 'XUA7351935', name: 'अनिराध्द महेश लंके', age: 29, gender: 'M', uncertain: 'Name shows "अनिराध्द" - may be अनिरुद्ध' },
  { serial: 71, voterId: 'XUA7670516', name: 'सोनाली सचिन लोणकर', age: 32, gender: 'F' },
  { serial: 72, voterId: 'XUA7224496', name: 'सचिन भास्कर महाजन', age: 42, gender: 'M' },
  { serial: 73, voterId: 'XUA7351422', name: 'श्रीकुमार विजयकुमार महामुनी', age: 50, gender: 'M' },
  { serial: 74, voterId: 'XUA7351430', name: 'स्मिता श्रीकुमार महामुनी', age: 50, gender: 'F' },
  { serial: 75, voterId: 'XUA7224553', name: 'धन्यकुमार भगवान माने', age: 62, gender: 'M' },
  { serial: 76, voterId: 'XUA7224439', name: 'रेखा धन्यकुमार माने', age: 53, gender: 'F' },
  { serial: 77, voterId: 'XUA7225105', name: 'अजिंक्य धन्यकुमार माने', age: 39, gender: 'M' },
  { serial: 78, voterId: 'XUA7224488', name: 'मुनीरा मोहमद नासीकवाला', age: 43, gender: 'F' },
  { serial: 79, voterId: 'XUA7224470', name: 'हुसेन सादिक नाशिकवाला', age: 32, gender: 'M' },
  { serial: 80, voterId: 'XUA7225329', name: 'निलीमा मारूतराव नेवसे', age: 52, gender: 'F' },
  { serial: 81, voterId: 'XUA7750433', name: 'सारिका अमित ओसवाल', age: 41, gender: 'F' },
  { serial: 82, voterId: 'XUA7750458', name: 'आज्ञा समकित ओसवाल', age: 32, gender: 'F', uncertain: 'Age showed "R" - estimated as 32' },
  { serial: 83, voterId: 'XUA7750466', name: 'सय्यम जयंतीलाल ओसवाल', age: 26, gender: 'M' },
  { serial: 84, voterId: 'XUA7491939', name: 'प्रीती मधुकर पांढरे', age: 30, gender: 'F' },
  { serial: 85, voterId: 'XUA7850738', name: 'किर्ती सुजीत पराडकर', age: 44, gender: 'F' },
  { serial: 86, voterId: 'XUA7224595', name: 'अजय घनश्याम पटेल', age: 45, gender: 'M' },
  { serial: 87, voterId: 'XUA7224587', name: 'वैशाली अजय पटेल', age: 40, gender: 'F' },
  { serial: 88, voterId: 'XUA7615446', name: 'सिद्धार्थ ज्ञानेश्‍वर फराटे', age: 28, gender: 'M' },
  { serial: 89, voterId: 'XUA7351851', name: 'शांताराम बबन पिंगळे', age: 62, gender: 'M' },
  { serial: 90, voterId: 'XUA7225022', name: 'सुनिता शांताराम पिंगळे', age: 49, gender: 'F' }
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
  console.log(`${flag} ${v.serial.toString().padStart(2)} | ${v.voterId} | ${v.name.padEnd(30)} | ${v.age} | ${icon} ${v.gender}`);
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
console.log('   Serial range: 61 to 90');
if (uncertain > 0) {
  console.log('\n⚠️  UNCERTAIN DATA: ' + uncertain + ' voters need manual verification');
}

console.log('\n✅ Data ready to save!\n');
