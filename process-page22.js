const fs = require('fs');

const voters = [
  { serial: 656, voterId: 'XUA8609265', name: 'अनिरूद्ध बाळासाहेब लिंबाळकर', father: 'बाळासाहेब कुमारराव लिंबाळकर', age: 21, gender: 'M' },
  { serial: 657, voterId: 'XUA8161226', name: 'इशाक ठक्कावाला', father: 'मोहम्मद ठक्कावाला', age: 93, gender: 'M', uncertain: 'Name shows "इश्ाक्र ठख्ावाला", father "मोहम्मद ठद्रावाला" - text corrupted' },
  { serial: 658, voterId: 'CRM1264670', name: 'राजेश अविनाश पाठक', father: 'अविनाश पाठक', age: 52, gender: 'M' },
  { serial: 659, voterId: 'CRM3038106', name: 'बाबा कोंडीबा गाढवे', father: 'कोंडीबा गाढवे', age: 68, gender: 'M' },
  { serial: 660, voterId: 'XUA8523441', name: 'प्रणित उत्तम कदम', father: 'उत्तम शंकर कदम', age: 24, gender: 'M' },
  { serial: 661, voterId: 'XUA8237893', name: 'अंकुर सुशील शर्मा', father: 'सुशील मदनलाल शर्मा', age: 27, gender: 'M', uncertain: 'Name shows "ज्ञर्मा" - should be शर्मा, father "सुक्लील" - should be सुशील' },
  { serial: 662, voterId: 'XUA8650897', name: 'पल्लवी अक्षय साबळे', husband: 'अक्षय रमेश साबळे', age: 30, gender: 'F' },
  { serial: 663, voterId: 'XUA8656126', name: 'योगेश दत्तात्रय भारती', father: 'जीवन छगन भारती', age: 30, gender: 'M', uncertain: 'Relation marked as "इतर" - assuming father' },
  { serial: 664, voterId: 'XUA8664211', name: 'मोहित अभय गादिया', father: 'अभय गादिया', age: 23, gender: 'M' },
  { serial: 665, voterId: 'XUA8686446', name: 'अथर्व खंडागळे', father: 'नितिन खंडागळे', age: 18, gender: 'M' },
  { serial: 666, voterId: 'XUA8686362', name: 'ओम अत्रे', father: 'मिलिंद अत्रे', age: 21, gender: 'M' },
  { serial: 667, voterId: 'XUA8686396', name: 'आर्या विभुते', father: 'हरिश विभुते', age: 20, gender: 'F', uncertain: 'Age shows "R" - estimated 20' },
  { serial: 668, voterId: 'XUA8686404', name: 'सेजल सावंत', father: 'राकेश सावंत', age: 18, gender: 'F' },
  { serial: 669, voterId: 'XUA8696817', name: 'प्रतिका शांतिकुमार शहा', husband: 'संजय शहा', age: 28, gender: 'F', uncertain: 'Name shows "प्रतिक ज्ञांतिकुमार" - gender mismatch with husband field, name corrupted' },
  { serial: 670, voterId: 'XUA8711087', name: 'अथर्व कुंभार', mother: 'रेखा कुंभार', age: 20, gender: 'M' },
  { serial: 671, voterId: 'XUA8711137', name: 'अर्चिता राजेंद्र अलिगी', mother: 'विजयलक्ष्मी अलिगी', age: 18, gender: 'F', uncertain: 'Name shows "अर्िता" - corrected to अर्चिता' },
  { serial: 672, voterId: 'XUA8714685', name: 'देवयानी हर्षवर्धन पाटील', father: 'हर्षवर्धन पाटील', age: 21, gender: 'F' },
  { serial: 673, voterId: 'XUA8714743', name: 'यश सुनील देशपांडे', father: 'सुनील', age: 18, gender: 'M' },
  { serial: 674, voterId: 'XUA8715757', name: 'राकेश साहेबराव पवार', father: 'साहेबराव पवार', age: 24, gender: 'M', uncertain: 'Name shows "राकेश्" with extra character' },
  { serial: 675, voterId: 'XUA8715690', name: 'साहेबराव गुलाब पवार', father: 'गुलाब पवार', age: 51, gender: 'M' },
  { serial: 676, voterId: 'XUA8715674', name: 'आदेश साहेबराव पवार', father: 'साहेबराव पवार', age: 23, gender: 'M', uncertain: 'Name shows "आदेश्" with extra character' },
  { serial: 677, voterId: 'XUA8720971', name: 'प्रांजल गालिंदे', husband: 'अंबिकेश गालिंदे', age: 23, gender: 'F', uncertain: 'Husband shows "अंबिकेद्श" - corrected to अंबिकेश' },
  { serial: 678, voterId: 'XUA8722027', name: 'स्वराज शेळके', father: 'सुदाम शेळके', age: 19, gender: 'M' },
  { serial: 679, voterId: 'XUA8728487', name: 'हर्षदा धुमाळ', mother: 'रूपाली धुमाळ', age: 20, gender: 'F' },
  { serial: 680, voterId: 'BSV1127752', name: 'अनुप सुरेश दोभाडा', father: 'सुरेश दोभाडा', age: 46, gender: 'M', uncertain: 'Father shows "सुरेश्" with extra character' },
  { serial: 681, voterId: 'CRMO0710640', name: 'समृद्धी अशोक मालेगांवकर', husband: 'अशोक मालेगांवकर', age: 53, gender: 'F' },
  { serial: 682, voterId: 'XUA8730582', name: 'पायल शिंदे', father: 'लक्ष्मण शिंदे', age: 24, gender: 'F' },
  { serial: 683, voterId: 'XUA8736555', name: 'अनुष्का सचिन भंडारे', father: 'सचिन रमेश भंडारे', age: 18, gender: 'F' },
  { serial: 684, voterId: 'XUA8737124', name: 'श्रावणी श्रीनिवास जगताप', father: 'श्रीनिवास जगताप', age: 21, gender: 'F' },
  { serial: 685, voterId: 'XUA8739344', name: 'तुषार शिवाजी बडे', father: 'शिवाजी बडे', age: 18, gender: 'M', uncertain: 'Father shows "श्शिवाजी" with extra character - should be शिवाजी' }
];

const processedVoters = voters.map(v => ({
  ...v,
  ward: '7',
  booth: '1'
}));

fs.writeFileSync('temp-page-data.json', JSON.stringify(processedVoters, null, 2), 'utf8');

console.log('\n📄 Processing Page 22 - Ward 7, Booth 1\n');
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
