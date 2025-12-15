const fs = require('fs');

console.log('\n📄 Processing Page 12 - Ward 7, Booth 1\n');

const voters = [
  { serial: 331, voterId: 'CRM2063642', name: 'श्रेणीक शरदकुमार शहा', age: 70, gender: 'M', uncertain: 'Father name shows "श्रदकुमार वहा" - using शरदकुमार शहा' },
  { serial: 332, voterId: 'CRM2063527', name: 'शुभदा श्रेणीक शहा', age: 61, gender: 'F' },
  { serial: 333, voterId: 'CRM2025229', name: 'भानुदास विश्वनाथ रोहिदास', age: 84, gender: 'M', uncertain: 'Father name shows "विश्‍वनाथ" with special character' },
  { serial: 334, voterId: 'CRM2025211', name: 'उषा भानुदास रोहिदास', age: 74, gender: 'F' },
  { serial: 335, voterId: 'XUA2324523', name: 'गणेश रत्नाकर पवार', age: 57, gender: 'M' },
  { serial: 336, voterId: 'CRM2276723', name: 'रत्नाकर शंकरराव पवार', age: 74, gender: 'M', uncertain: 'Father name shows "झ्लंकरराव" - using शंकरराव' },
  { serial: 337, voterId: 'CRM2276772', name: 'पुष्पलता रत्नाकर पवार', age: 68, gender: 'F' },
  { serial: 338, voterId: 'CRM2062511', name: 'दत्तात्रय केशव कुलकर्णा', age: 91, gender: 'M', uncertain: 'Father name shows "केश्वव" - using केशव' },
  { serial: 339, voterId: 'CRM2062529', name: 'नलिनी दत्तात्रय कुलकर्णा', age: 82, gender: 'F' },
  { serial: 340, voterId: 'CRM2062321', name: 'रजनी दत्तात्रय कुलकर्णा', age: 59, gender: 'F' },
  { serial: 341, voterId: 'CRM2276939', name: 'मधुकर शंकर पवार', age: 78, gender: 'M', uncertain: 'Father name shows "्लंकर" - using शंकर' },
  { serial: 342, voterId: 'CRM2062826', name: 'सुंदर मधुकर पवार', age: 68, gender: 'F' },
  { serial: 343, voterId: 'CRM2276285', name: 'राजन दिगंबर सदरे', age: 56, gender: 'M' },
  { serial: 344, voterId: 'CRM2276319', name: 'स्वाती राजेंद्र सदरे', age: 54, gender: 'F' },
  { serial: 345, voterId: 'XUA2324549', name: 'हेमंत रामचंद्र मोघे', age: 48, gender: 'M' },
  { serial: 346, voterId: 'XUA2324556', name: 'अनिता हेमंत मोघे', age: 44, gender: 'F' },
  { serial: 347, voterId: 'CRM2062859', name: 'रामचंद्र सोपाना मोघे', age: 95, gender: 'M' },
  { serial: 348, voterId: 'CRM2062818', name: 'पुष्पा रामचंद्र मोघे', age: 82, gender: 'F' },
  { serial: 349, voterId: 'CRM2062990', name: 'अलीहुसेन ईस्माइल अत्तरवाला', age: 78, gender: 'M' },
  { serial: 350, voterId: 'CRM2063006', name: 'नफीसा अलीहुसेन अत्तरवाला', age: 75, gender: 'F', uncertain: 'Husband name shows "अतीहइ्सेन" - using अलीहुसेन' },
  { serial: 351, voterId: 'CRM1265818', name: 'संग्राम नंदकुमार निकम', age: 70, gender: 'M' },
  { serial: 352, voterId: 'CRM1265149', name: 'नंदकुमार जयसिंगराव निकम', age: 70, gender: 'M' },
  { serial: 353, voterId: 'CRM2277952', name: 'माधुरी नंदकुमार निकम', age: 60, gender: 'F' },
  { serial: 354, voterId: 'CRM2063998', name: 'सम्राट नंदकुमार निकम', age: 39, gender: 'M' },
  { serial: 355, voterId: 'CRM2025559', name: 'अमी मलय पटेल', age: 49, gender: 'F' },
  { serial: 356, voterId: 'CRM2025567', name: 'बसंती जिगर पटेल', age: 45, gender: 'F' },
  { serial: 357, voterId: 'CRM2025526', name: 'जयंतीभाई बाबुलाल पटेल', age: 73, gender: 'M' },
  { serial: 358, voterId: 'CRM2025542', name: 'पार्वतीबेन जयंतीभाई पटेल', age: 68, gender: 'F' },
  { serial: 359, voterId: 'CRM2024990', name: 'मलयकुमार जयंतीलाल पटेल', age: 49, gender: 'M' },
  { serial: 360, voterId: 'CRM2025534', name: 'जीगर जयंतीलाल पटेल', age: 47, gender: 'M' }
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
console.log('   Serial range: 331 to 360');
if (uncertain > 0) {
  console.log('\n⚠️  UNCERTAIN DATA: ' + uncertain + ' voters need manual verification');
}

console.log('\n✅ Data ready to save!\n');
