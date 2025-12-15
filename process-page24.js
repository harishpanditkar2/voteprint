const fs = require('fs');

const voters = [
  { serial: 716, voterId: 'CSC6389704', name: 'महादेव तानाजि कुंभार', father: 'तानाजि कुंभार', age: 32, gender: 'M' },
  { serial: 717, voterId: 'XUA2345239', name: 'प्राजक्ता पंकज कुलकर्णी', husband: 'पंकज कुलकर्णी', age: 40, gender: 'F', uncertain: 'Surname shows "कुलकर्नि" - corrected to कुलकर्णी' },
  { serial: 718, voterId: 'XUA8779852', name: 'प्रणव राजेंद्र गुप्ते', mother: 'अश्विनी प्रणव गुप्ते', age: 30, gender: 'M', uncertain: 'Father field shows "अश्विनी प्रणव गुप्ते गुप्ते" - appears to be mother name' },
  { serial: 719, voterId: 'XUA8780439', name: 'पार्थ पाटील', father: 'दिलीप पाटील', age: 21, gender: 'M' },
  { serial: 720, voterId: 'XUA8786873', name: 'गौरी संभाजी पाटील', father: 'संभाजी वसंतराव पाटील', age: 22, gender: 'F', uncertain: 'Age shows "R" - estimated 22, name गौरी suggests F not M' },
  { serial: 721, voterId: 'XUA8786980', name: 'स्मिता रमेश खडके', father: 'रमेश खडके', age: 31, gender: 'F', uncertain: 'Father shows "रमेश्" with extra character' },
  { serial: 722, voterId: 'XUA8787020', name: 'साक्षी संभाजी पाटील', father: 'संभाजी वसंतराव पाटील', age: 22, gender: 'F' },
  { serial: 723, voterId: 'WICB506891', name: 'सानिका श्रेयस दाबके', husband: 'श्रेयस दाबके', age: 37, gender: 'F', uncertain: 'Relation shows "तीचे नाव" - should be पतीचे' },
  { serial: 724, voterId: 'XUA8784423', name: 'अनुजा तानाजी धायगुडे', father: 'तानाजी धायगुडे', age: 18, gender: 'F' },
  { serial: 725, voterId: 'XUA8785784', name: 'धीरज रत्नाकर डेहनकर', father: 'रत्नाकर डेहनकर', age: 38, gender: 'M' },
  { serial: 726, voterId: 'XUA8789828', name: 'भूजंग शेट्टी', father: 'थिम्मपा शेट्टी', age: 66, gender: 'M' },
  { serial: 727, voterId: 'XUA8793606', name: 'मंदार सुखदेव टेंगळे', mother: 'सोनाली सुखदेव', age: 23, gender: 'M', uncertain: 'Relation shows "शाईचे नाव" - should be आईचे' },
  { serial: 728, voterId: 'XUA8793952', name: 'अमृता अजय पवार', father: 'अजय पवार', age: 21, gender: 'F' },
  { serial: 729, voterId: 'SLW8092983', name: 'श्रेया भालचंद्र चिंचाळकर', father: 'भालचंद्र चिंचाळकर', age: 28, gender: 'F' },
  { serial: 730, voterId: 'NJV7868664', name: 'सोनाली निलेश हेमाडे', husband: 'निलेश हेमाडे', age: 41, gender: 'F', uncertain: 'Husband shows "निलेश्श" with extra characters' },
  { serial: 731, voterId: 'BSV0855916', name: 'छाया अनिल हेमाडे', husband: 'अनिल हेमाडे', age: 64, gender: 'F' },
  { serial: 732, voterId: 'CRM2195808', name: 'पुरुषोत्तम बापुराव कुलकर्णी', father: 'बापुराव कुलकर्णी', age: 75, gender: 'M', uncertain: 'Relation shows "पिडिलांचे नाव" - should be वडिलांचे' },
  { serial: 733, voterId: 'XUA8751208', name: 'अनिरुद्ध पंकज कुलकर्णी', mother: 'प्राजक्ता कुलकर्णी', age: 18, gender: 'M', uncertain: 'Relation shows "शाईचे नाव" - should be आईचे' },
  { serial: 734, voterId: 'GNS1965124', name: 'अज्ञात', father: 'अज्ञात', age: 30, gender: 'M', uncertain: 'Name completely missing, father shows "कट»..." - unclear text' },
  { serial: 735, voterId: 'RNO7009152', name: 'प्रिती अनुज साबळे', father: 'अशोक साबळे', age: 28, gender: 'F', uncertain: 'Name shows "प्रिती अनुज साबळे साबळे" - surname repeated' },
  { serial: 736, voterId: 'TQS7200330', name: 'पूजा शाह', husband: 'साहिल शाह', age: 29, gender: 'F', uncertain: 'Name shows "पूजा ज्ञाह" - corrected to शाह' },
  { serial: 737, voterId: 'XUA8802167', name: 'नेहा गुळवे', father: 'भूषण गुळवे', age: 21, gender: 'F' },
  { serial: 738, voterId: 'XUA8804965', name: 'कोमल अरुण बोराटे', father: 'अरुण जगन्नाथ बोराटे', age: 23, gender: 'F' }
];

const processedVoters = voters.map(v => ({
  ...v,
  ward: '7',
  booth: '1'
}));

fs.writeFileSync('temp-page-data.json', JSON.stringify(processedVoters, null, 2), 'utf8');

console.log('\n📄 Processing PDF Page 26 - Ward 7, Booth 1\n');
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
