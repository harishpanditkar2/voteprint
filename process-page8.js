const fs = require('fs');

console.log('\n📄 Processing Page 8 - Ward 7, Booth 1\n');

const voters = [
  { serial: 211, voterId: 'CRM2024172', name: 'गंगाधर श्रीपतराव काळे', age: 88, gender: 'M' },
  { serial: 212, voterId: 'XUA2658896', name: 'मीना गंगाधर काळे', age: 75, gender: 'F' },
  { serial: 213, voterId: 'CRM2022473', name: 'गिराष गंगाधर काळे', age: 51, gender: 'M', uncertain: 'Name shows "गिराष" - may be गिरीश' },
  { serial: 214, voterId: 'CRM1409242', name: 'सुहासिनी गिरीश काळे', age: 46, gender: 'F' },
  { serial: 215, voterId: '2008061608', name: 'नम्रता सुडीत तावरे', age: 30, gender: 'F', uncertain: 'Husband name shows "सुडीत" - may be सुदीप' },
  { serial: 216, voterId: 'XUA8063406', name: 'शिवानी वैभव तावरे', age: 33, gender: 'F', uncertain: 'Age showed "7733" - estimated as 33' },
  { serial: 217, voterId: 'XUA7753544', name: 'तेजश्री वैभव तावरे', age: 25, gender: 'F' },
  { serial: 218, voterId: 'CRM2062297', name: 'शिला रमेश गांधी', age: 70, gender: 'F' },
  { serial: 219, voterId: 'CRM1263706', name: 'मंजुषा सुरेश गांधी', age: 68, gender: 'F', uncertain: 'Husband name shows "सुरेक्ष" - using सुरेश' },
  { serial: 220, voterId: 'CRM2062222', name: 'अर्चना स्वप्नील गांधी', age: 47, gender: 'F' },
  { serial: 221, voterId: 'CRM2276632', name: 'स्वप्नील रमेश गांधी', age: 46, gender: 'M', uncertain: 'Father name shows "रमेक्ष" - using रमेश' },
  { serial: 222, voterId: 'CRM2062198', name: 'संजोग रमेश गांधी', age: 45, gender: 'M', uncertain: 'Father name shows "रमेक्ष" - using रमेश' },
  { serial: 223, voterId: 'CRM2062255', name: 'साधना संजू गांधी', age: 43, gender: 'F' },
  { serial: 224, voterId: 'CRM1890755', name: 'समीर सुरेश गांधी', age: 34, gender: 'M' },
  { serial: 225, voterId: 'CRM2276764', name: 'रमेश वामनराव जोशी', age: 79, gender: 'M' },
  { serial: 226, voterId: 'CRM2276012', name: 'माधवराव वामन जोशी', age: 77, gender: 'M' },
  { serial: 227, voterId: 'CRM2061927', name: 'मदुरा माधव जोशी', age: 75, gender: 'F' },
  { serial: 228, voterId: 'CRM2061901', name: 'उमेश वामन जोशी', age: 72, gender: 'M' },
  { serial: 229, voterId: 'CRM2276756', name: 'राजश्री रमेश जोशी', age: 66, gender: 'F' },
  { serial: 230, voterId: 'CRM2061919', name: 'ज्योती उमेश जोशी', age: 64, gender: 'F' },
  { serial: 231, voterId: 'CRM2276699', name: 'रविंद्र रमेश जोशी', age: 45, gender: 'M' },
  { serial: 232, voterId: 'CRM2276616', name: 'मंगेश्ञ माधव जोशी', age: 44, gender: 'M', uncertain: 'Name shows "मंगेश्ञ" - may be मंगेश' },
  { serial: 233, voterId: 'CRM2277689', name: 'अरविंद मोतीचंद शहा', age: 82, gender: 'M' },
  { serial: 234, voterId: 'CRM2061968', name: 'रुक्मीणी साहेबराव पांढरे', age: 78, gender: 'F', uncertain: 'Gender marker incomplete in text' },
  { serial: 235, voterId: 'CRM2061950', name: 'पद्मा वासुदेव पांढरे', age: 67, gender: 'F' },
  { serial: 236, voterId: 'CRM2061976', name: 'सुधाकर साहेबराव पांढरे', age: 67, gender: 'M' },
  { serial: 237, voterId: 'CRM2276855', name: 'राजश्री सुधाकर पांढरे', age: 64, gender: 'F' },
  { serial: 238, voterId: 'XUA2324432', name: 'रत्नाकर साहेबराव पांढरे', age: 58, gender: 'M' },
  { serial: 239, voterId: 'CRM2276517', name: 'संगिता मधुकर पांढरे', age: 54, gender: 'F' },
  { serial: 240, voterId: 'XUA2324440', name: 'तेजश्री रत्नाकर पांढरे', age: 52, gender: 'F' }
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
console.log('   Serial range: 211 to 240');
if (uncertain > 0) {
  console.log('\n⚠️  UNCERTAIN DATA: ' + uncertain + ' voters need manual verification');
}

console.log('\n✅ Data ready to save!\n');
