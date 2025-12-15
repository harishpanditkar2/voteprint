const fs = require('fs');

console.log('\n📄 Processing Page 10 - Ward 7, Booth 1\n');

const voters = [
  { serial: 271, voterId: 'CRM2062065', name: 'अतुल दत्तात्रय भुजबळ', age: 44, gender: 'M' },
  { serial: 272, voterId: 'CRM2023786', name: 'अर्चना दत्तात्रय भुजबळ', age: 41, gender: 'F' },
  { serial: 273, voterId: 'CRM1264563', name: 'अभिजीत बाळकृष्ण लोणकर', age: 45, gender: 'M' },
  { serial: 274, voterId: 'CRM2062289', name: 'सचिन विठ्ठल लोणकर', age: 42, gender: 'M' },
  { serial: 275, voterId: 'CRM2062305', name: 'सुप्रिया विठ्ठल लोणकर', age: 40, gender: 'F' },
  { serial: 276, voterId: 'CRM2062388', name: 'तसलीम मुस्तफा जिनीयावाला', age: 57, gender: 'F' },
  { serial: 277, voterId: 'CRM2062370', name: 'मुरार हतिगमुदीन जिनियावाला', age: 54, gender: 'M', uncertain: 'Name shows "मुरार हतिगमुदीन" - may be मुरारी हकिमुद्दीन' },
  { serial: 278, voterId: 'XUA8172512', name: 'अर्वा जिनियावाला', age: 22, gender: 'F', uncertain: 'Name shows "अर्वा" - incomplete/check spelling' },
  { serial: 279, voterId: 'XUA2658946', name: 'सुप्रिया मधुकर पवार', age: 37, gender: 'F' },
  { serial: 280, voterId: 'CRM2277176', name: 'माधव मारुतराव ढेरे', age: 59, gender: 'M' },
  { serial: 281, voterId: 'CRM2277168', name: 'शिला माधव ढेरे', age: 50, gender: 'F' },
  { serial: 282, voterId: 'CRM2063170', name: 'अरुण बबन गलांडे', age: 75, gender: 'M' },
  { serial: 283, voterId: 'CRM2022440', name: 'अशोक बबनराव गलांडे', age: 70, gender: 'M' },
  { serial: 284, voterId: 'CRM1263417', name: 'अनिल बबनराव गलांडे', age: 69, gender: 'M' },
  { serial: 285, voterId: 'CRM2063162', name: 'नलीनी अरुण गलांडे', age: 68, gender: 'F' },
  { serial: 286, voterId: 'CRM2062271', name: 'आइवीनी अशोक गलांडे', age: 65, gender: 'F', uncertain: 'Name shows "आइवीनी" and husband "अजशोक" - check spelling' },
  { serial: 287, voterId: 'CRM2277937', name: 'अविनाश बबनराव गलांडे', age: 61, gender: 'M' },
  { serial: 288, voterId: 'CRM1263599', name: 'जयश्री अनिल गलांडे', age: 57, gender: 'F' },
  { serial: 289, voterId: 'CRM2277945', name: 'सविता अविनाश गलांडे', age: 56, gender: 'F' },
  { serial: 290, voterId: 'CRM2062149', name: 'हृषीकेश अशोक गलांडे', age: 47, gender: 'M', uncertain: 'Name shows "्र्षीकेश" - using हृषीकेश' },
  { serial: 291, voterId: 'CRM2062958', name: 'संदीप अरुण गलांडे', age: 47, gender: 'M' },
  { serial: 292, voterId: 'CRM2063154', name: 'कविता अरुण गलांडे', age: 43, gender: 'F' },
  { serial: 293, voterId: 'XUA2658938', name: 'पुजा अविनाश गलांडे', age: 35, gender: 'F', uncertain: 'Age shows "3y" - estimated 35' },
  { serial: 294, voterId: 'CRM2278182', name: 'सादीकअली कादरभाई नासिकवाला', age: 73, gender: 'M' },
  { serial: 295, voterId: 'CRM1892140', name: 'अमीन सादीकअली नासिकवाला', age: 68, gender: 'F' },
  { serial: 296, voterId: 'CRM2062479', name: 'मंहमद सादीकअली नासिकवाला', age: 47, gender: 'M' },
  { serial: 297, voterId: 'CRM2061869', name: 'ताहेरभाई कादरभाई नासिकवाला', age: 82, gender: 'M' },
  { serial: 298, voterId: 'XUA2324507', name: 'लिना जितेश चिवटे', age: 39, gender: 'F' },
  { serial: 299, voterId: 'CRM2276293', name: 'काशिनाथ गोपाल चीवटे', age: 75, gender: 'M', uncertain: 'Surname "चीवटे" vs "चिवटे" - inconsistent' },
  { serial: 300, voterId: 'CRM2276350', name: 'पुष्पा काशिनाथ चीवटे', age: 69, gender: 'F', uncertain: 'Surname "चीवटे" vs "चिवटे" - inconsistent' }
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
console.log('   Serial range: 271 to 300');
if (uncertain > 0) {
  console.log('\n⚠️  UNCERTAIN DATA: ' + uncertain + ' voters need manual verification');
}

console.log('\n✅ Data ready to save!\n');
