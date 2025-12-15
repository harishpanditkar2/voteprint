const fs = require('fs');

console.log('\n📄 Processing Page 15 - Ward 7, Booth 1\n');

const voters = [
  { serial: 446, voterId: 'XUA7351737', name: 'संकेत दिपक वाडगांवकर', age: 32, gender: 'M', uncertain: 'Age shows "R" - estimated 32' },
  { serial: 447, voterId: 'XUA7556475', name: 'जयश्री विठ्ठल वाघोलीकर', age: 57, gender: 'F' },
  { serial: 448, voterId: 'XUA7491947', name: 'रणजीत विठ्ठल वाघोळीकर', age: 41, gender: 'M' },
  { serial: 449, voterId: 'XUA7491954', name: 'अमृत रणजीत वाघोळीकर', age: 34, gender: 'F' },
  { serial: 450, voterId: 'AL1444678', name: 'शुभम घुगे', age: 22, gender: 'M' },
  { serial: 451, voterId: 'XUA8600355', name: 'कोमल घुगे', age: 22, gender: 'F' },
  { serial: 452, voterId: 'XUA8478505', name: 'प्रथमेश राजेंद्र खैरे', age: 20, gender: 'M' },
  { serial: 453, voterId: 'XUA8086191', name: 'श्रीयश बन्दोपंत सकोजी', age: 40, gender: 'M', uncertain: 'Name shows "श्रीयुक्ष" - using श्रीयश' },
  { serial: 454, voterId: 'XUA8085961', name: 'सुप्रिया श्रीयश सकोजी', age: 33, gender: 'F' },
  { serial: 455, voterId: 'XUA8108920', name: 'अमन रहिमान शोख', age: 24, gender: 'M' },
  { serial: 456, voterId: 'XUA8167850', name: 'रिया आहुजा', age: 28, gender: 'F' },
  { serial: 457, voterId: 'XUA8164295', name: 'गणेश दादा पाथरकर', age: 24, gender: 'M' },
  { serial: 458, voterId: 'XUA7565823', name: 'प्रणाली महादेव भोसले', age: 39, gender: 'F', uncertain: 'Name prefix shows "o7" in text' },
  { serial: 459, voterId: 'XUA8051054', name: 'प्रीतम अनिल जावळे', age: 22, gender: 'M' },
  { serial: 460, voterId: 'XUA8044737', name: 'शाम अभिनव किर्वे', age: 25, gender: 'M', uncertain: 'Age shows "R" - estimated 25' },
  { serial: 461, voterId: 'XUA8323479', name: 'सोनाली गावडे', age: 22, gender: 'F' },
  { serial: 462, voterId: 'XUA8530784', name: 'सविता सिदराम मखनकर', age: 48, gender: 'F' },
  { serial: 463, voterId: 'XUA7750516', name: 'आकाश भातमोडे', age: 28, gender: 'M' },
  { serial: 464, voterId: 'XUA8190704', name: 'सृष्टी व्होरा', age: 22, gender: 'F' },
  { serial: 465, voterId: 'XUA8519597', name: 'संघमित्रा कसबे', age: 37, gender: 'F', uncertain: 'Husband name shows "दिनेक्ष" - may be दिनेश' },
  { serial: 466, voterId: 'XUA8239329', name: 'सदाशिव पांडुरंग होले', age: 73, gender: 'M', uncertain: 'Father name shows "सदाशिव" - check if correct' },
  { serial: 467, voterId: 'XUA8239337', name: 'कुसुम सदाशिव होले', age: 69, gender: 'F' },
  { serial: 468, voterId: 'XUA8115487', name: 'संतोष दोडमणि', age: 27, gender: 'M' },
  { serial: 469, voterId: 'XUA8532731', name: 'श्रेया राहुल पवार', age: 20, gender: 'F' },
  { serial: 470, voterId: 'XUA8520728', name: 'पूजा आनंद पोटे', age: 28, gender: 'F', uncertain: 'Age shows "R" - estimated 28' },
  { serial: 471, voterId: 'XUA8171456', name: 'अवधेश शाह', age: 26, gender: 'M', uncertain: 'Name shows "अवधेश्" - using अवधेश' },
  { serial: 472, voterId: 'XUA8599581', name: 'प्रियांका संजय कांबळे', age: 26, gender: 'F' },
  { serial: 473, voterId: 'XUA8508293', name: 'गितांजली खरात', age: 35, gender: 'F', uncertain: 'Age shows "R" - estimated 35' },
  { serial: 474, voterId: 'XUA8599763', name: 'निरज जवाहर खंदारे', age: 36, gender: 'M' },
  { serial: 475, voterId: 'XUA8124554', name: 'महादेव कुंभार', age: 66, gender: 'M' }
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
console.log('   Serial range: 446 to 475');
if (uncertain > 0) {
  console.log('\n⚠️  UNCERTAIN DATA: ' + uncertain + ' voters need manual verification');
}

console.log('\n✅ Data ready to save!\n');
