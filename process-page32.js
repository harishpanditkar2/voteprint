const fs = require('fs');

const voters = [
  { serial: 755, voterId: 'XUA8832875', name: 'वर्षा प्रशांत जगताप', husband: 'प्रशांत जगताप', age: 48, gender: 'F', uncertain: 'Husband shows "प्रश्ञांत" - corrected to प्रशांत' },
  { serial: 756, voterId: 'XUA8831018', name: 'भूमी कुदळे', father: 'गौतम कुदळे', age: 18, gender: 'F' },
  { serial: 757, voterId: 'LKW1240415', name: 'विमल सखाराम गवळी', husband: 'सखाराम गवळी', age: 77, gender: 'F' },
  { serial: 758, voterId: 'XUA8831646', name: 'स्वरूप सुरेश म्हसवडे', father: 'सुरेश बापूराव म्हसवडे', age: 27, gender: 'M', uncertain: 'Father shows "सुरेक्" - corrected to सुरेश' },
  { serial: 759, voterId: 'XUA8833386', name: 'संवर्धिनी निलेश मगर', father: 'निलेश मगर', age: 18, gender: 'F', uncertain: 'Father shows "निलेक्ष" - corrected to निलेश' },
  { serial: 760, voterId: 'XUA8834228', name: 'रूचिता ओसवाल', husband: 'मेहुल ओसवाल', age: 33, gender: 'F' },
  { serial: 761, voterId: 'XUA8835068', name: 'दिपीका शहा', husband: 'जितेंद्र शहा', age: 36, gender: 'F' },
  { serial: 762, voterId: 'XUA8835449', name: 'अथर्व दिलीप पाटील', father: 'दिलीप पाटील', age: 25, gender: 'M' },
  { serial: 763, voterId: 'XUA8835456', name: 'तनिष्का सुमित तिवाटणे', mother: 'अंतिमा तिवाटणे', age: 20, gender: 'F', uncertain: 'Age shows "R" - estimated 20' },
  { serial: 764, voterId: 'XUA8835514', name: 'पार्थ दिलीप पाटील', father: 'दिलीप पाटील', age: 22, gender: 'M' },
  { serial: 765, voterId: 'AEC2885754', name: 'अज्ञात', father: 'अज्ञात', age: 30, gender: 'F', uncertain: 'Name and father both completely missing in source' },
  { serial: 766, voterId: 'XUA8840019', name: 'रूतिका सावंत', father: 'चंद्रकांत सावंत', age: 21, gender: 'F' }
];

const processedVoters = voters.map(v => ({
  ...v,
  ward: '7',
  booth: '1'
}));

fs.writeFileSync('temp-page-data.json', JSON.stringify(processedVoters, null, 2), 'utf8');

console.log('\n📄 Processing PDF Pages 38-43 - Ward 7, Booth 1\n');
console.log('💾 EXTRACTED DATA:\n');

let maleCount = 0;
let femaleCount = 0;
let uncertainCount = 0;

processedVoters.forEach(v => {
  const icon = v.gender === 'M' ? '👨' : '👩';
  const flag = v.uncertain ? ' ⚠️' : '✅';
  console.log(`${flag} ${v.serial} | ${v.voterId} | ${v.name.padEnd(30)} | ${v.age} | ${icon} ${v.gender}`);
  
  if (v.uncertain) {
    console.log(`   ⚠️  ISSUE: ${v.uncertain}`);
    uncertainCount++;
  }
  
  if (v.gender === 'M') maleCount++;
  else femaleCount++;
});

console.log(`\n📊 SUMMARY:`);
console.log(`   Total voters: ${processedVoters.length}`);
console.log(`   Male: ${maleCount}`);
console.log(`   Female: ${femaleCount}`);
console.log(`   Serial range: ${processedVoters[0].serial} to ${processedVoters[processedVoters.length - 1].serial}`);

if (uncertainCount > 0) {
  console.log(`\n⚠️  UNCERTAIN DATA: ${uncertainCount} voters need manual verification`);
}

console.log('\n✅ Data ready to save!');
