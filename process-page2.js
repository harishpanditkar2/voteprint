const fs = require('fs');

console.log('\n📄 Processing Page 2 - Ward 7, Booth 1\n');

const voters = [
  { serial: 31, voterId: 'XUA7670532', name: 'नेहा रोहित गानबोटे', age: 34, gender: 'F' },
  { serial: 32, voterId: 'XUA7224579', name: 'सायली रमेश गानबोटे', age: 32, gender: 'F', uncertain: 'Age showed "R" - estimated as 32' },
  { serial: 33, voterId: 'XUA7224504', name: 'भद्रबाहु मगनलाल गांधी', age: 75, gender: 'M' },
  { serial: 34, voterId: 'XUA7224462', name: 'सुरेखा भद्रबाहु गांधी', age: 74, gender: 'F' },
  { serial: 35, voterId: 'XUA7224454', name: 'श्रध्दा भद्रबाहु गांधी', age: 46, gender: 'F' },
  { serial: 36, voterId: 'XUA7750508', name: 'पुजा विनोद गांधी', age: 28, gender: 'F' },
  { serial: 37, voterId: 'XUA7556400', name: 'तुषार गोविदं गदादे', age: 41, gender: 'M' },
  { serial: 38, voterId: 'XUA7224405', name: 'प्रतिक रघुनाथ गावडे', age: 31, gender: 'M' },
  { serial: 39, voterId: 'XUA7750425', name: 'प्रियांका शंकर गावडे', age: 30, gender: 'F' },
  { serial: 40, voterId: 'XUA7224413', name: 'अनिल विश्‍वनाथ गवळी', age: 47, gender: 'M' },
  { serial: 41, voterId: 'XUA7225014', name: 'मयुर जयकुमार घाडगे', age: 32, gender: 'M' },
  { serial: 42, voterId: 'XUA7670557', name: 'सुरज मोहनराव घुले', age: 34, gender: 'M' },
  { serial: 43, voterId: 'XUA7491897', name: 'किशोर महादेव गोंजारी', age: 55, gender: 'M' },
  { serial: 44, voterId: 'XUA7491905', name: 'च्हाया किशोर गोंजारी', age: 52, gender: 'F', uncertain: 'Name shows "च्हाया" - may be छाया' },
  { serial: 45, voterId: 'XUA7491913', name: 'श्रुति किशोर गोंजारी', age: 29, gender: 'F' },
  { serial: 46, voterId: 'XUA8244303', name: 'सिद्धी किशोर गोंजारी', age: 27, gender: 'F' },
  { serial: 47, voterId: 'XUA7615487', name: 'वंदना प्रश्षांत गुरव', age: 32, gender: 'F', uncertain: 'Name shows "प्रश्षांत" - may be प्रशांत' },
  { serial: 48, voterId: 'XUA7351810', name: 'दुर्या मुस्ताफा हवेलीवाला', age: 32, gender: 'F', uncertain: 'Name shows "दुर्या" - check spelling' },
  { serial: 49, voterId: 'XUA7224397', name: 'संताजी मुरलीधर होवाळ', age: 50, gender: 'M' },
  { serial: 50, voterId: 'XUA7224389', name: 'सोनिया संगिता होवाळ', age: 37, gender: 'F' },
  { serial: 51, voterId: 'XUA7670441', name: 'अमित अजित इंगळे', age: 44, gender: 'M' },
  { serial: 52, voterId: 'XUA7224876', name: 'वसंत मारूती जगदाळे', age: 54, gender: 'M' },
  { serial: 53, voterId: 'XUA7224769', name: 'विजया वसंत जगदाळे', age: 47, gender: 'F' },
  { serial: 54, voterId: 'XUA7224777', name: 'दिक्षा वसंत जगदाळे', age: 29, gender: 'F' },
  { serial: 55, voterId: 'XUA7750391', name: 'योगेश झुंझारराव जगताप', age: 48, gender: 'M' },
  { serial: 56, voterId: 'XUA7750409', name: 'कावेरी योगेश जगताप', age: 46, gender: 'F' },
  { serial: 57, voterId: 'XUA7750474', name: 'मुर्तुजा मुस्तुफा जिनियावाला', age: 27, gender: 'M' },
  { serial: 58, voterId: 'XUA7224884', name: 'योगिता चेतन कदम', age: 49, gender: 'F' },
  { serial: 59, voterId: 'XUA7615420', name: 'राहुल शांताराम काळभोर', age: 49, gender: 'M' },
  { serial: 60, voterId: 'XUA7615438', name: 'जयश्री राहुल काळभोर', age: 46, gender: 'F' }
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
console.log('   Serial range: 31 to 60');
if (uncertain > 0) {
  console.log('\n⚠️  UNCERTAIN DATA: ' + uncertain + ' voters need manual verification');
}

console.log('\n✅ Data ready to save!');
console.log('\n❓ Review the output above. If correct, run: node save-page-data.js\n');
const finalVoters = voters.map(v => ({
  ...v,
  serialNumber: v.serial,
  ward: '7',
  booth: '1'
}));

// Save to temp
fs.writeFileSync('./temp-page-data.json', JSON.stringify(finalVoters, null, 2));

console.log(`\n✅ Data ready to save!`);
console.log(`\n❓ Ready to save? Run: node save-page-data.js\n`);
