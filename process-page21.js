const fs = require('fs');

console.log('\n📄 Processing Page 21 - Ward 7, Booth 1\n');

const voters = [
  { serial: 626, voterId: 'XUA8593659', name: 'संजय दत्तात्रय चव्हाण', age: 55, gender: 'M' },
  { serial: 627, voterId: 'CRM2022655', name: 'धन्यकुमार वालचंद शहा', age: 82, gender: 'M' },
  { serial: 628, voterId: 'CRM1408863', name: 'राजकुमार धन्यकुमार शहा', age: 60, gender: 'M' },
  { serial: 629, voterId: 'CRM1263680', name: 'रमी राजकुमार शहा', age: 56, gender: 'F' },
  { serial: 630, voterId: 'CRM1263235', name: 'संजय धन्यकुमार शहा', age: 56, gender: 'M', uncertain: 'Father name shows "वहा" - should be शहा' },
  { serial: 631, voterId: 'CRM1263227', name: 'सोनाली संजय शहा', age: 46, gender: 'F' },
  { serial: 632, voterId: 'CRM2063667', name: 'नंदकुमार दत्तात्रय मांडगे', age: 60, gender: 'M' },
  { serial: 633, voterId: 'CRM1264647', name: 'वर्षा मधुकर मांडगे', age: 59, gender: 'F' },
  { serial: 634, voterId: 'CRM2025468', name: 'मधुकर दत्तात्रय मांडगे', age: 56, gender: 'M' },
  { serial: 635, voterId: 'CRM2025625', name: 'सदाशिव दत्तात्रय मांडगे', age: 54, gender: 'M' },
  { serial: 636, voterId: 'CRM2063675', name: 'संगीता नंदकुमार मांडगे', age: 50, gender: 'F' },
  { serial: 637, voterId: 'CRM2277960', name: 'सीजाबाई राजाराम खंडागळे', age: 90, gender: 'F' },
  { serial: 638, voterId: 'CRM2276863', name: 'शिवाजी राजाराम खंडागळे', age: 72, gender: 'M' },
  { serial: 639, voterId: 'CRM2277416', name: 'उत्तम राजाराम खंडागळे', age: 72, gender: 'M' },
  { serial: 640, voterId: 'XUA2658987', name: 'हसीता शिवाजी खंडागळे', age: 71, gender: 'M', uncertain: 'Gender uncertain - name suggests F but father field indicates M' },
  { serial: 641, voterId: 'CRM2277184', name: 'कौसल्या शिवाजी खंडागळे', age: 70, gender: 'F', uncertain: 'Husband name shows "क्षिवाजी" - should be शिवाजी' },
  { serial: 642, voterId: 'CRM1265099', name: 'बाळासाहेब शिवाजी खंडाळे', age: 44, gender: 'M' },
  { serial: 643, voterId: 'XUA2324713', name: 'रूपकुमार शिवाजी खंडाळे', age: 41, gender: 'M' },
  { serial: 644, voterId: 'XUA2659001', name: 'रसीका सावळाराम काळे', age: 49, gender: 'F' },
  { serial: 645, voterId: 'CRM1264084', name: 'सुनिता पोपटराव जगताप', age: 43, gender: 'F' },
  { serial: 646, voterId: 'CRM1264878', name: 'लक्ष्मीबाई निवृत्ती पोमण', age: 82, gender: 'F' },
  { serial: 647, voterId: 'CRM1264894', name: 'राकेश शंकर पोमण', age: 40, gender: 'M', uncertain: 'Name shows "राकेश्" - using राकेश, father "श्लंकर"' },
  { serial: 648, voterId: 'XUAB238560', name: 'आदर्श भळगट', age: 22, gender: 'M', uncertain: 'Age shows "R" - estimated 22' },
  { serial: 649, voterId: 'XUAS238586', name: 'अभिषेक भळगट', age: 25, gender: 'M' },
  { serial: 650, voterId: 'CRM2024891', name: 'साधना राजकुमार शहा', age: 68, gender: 'F' },
  { serial: 651, voterId: 'CRM2024883', name: 'राजकुमार मोतीलाल शहा', age: 66, gender: 'M', uncertain: 'Father name shows "जहा" - should be शहा' },
  { serial: 652, voterId: 'CRM2062677', name: 'धन्यकुमार खेमचंद शहा', age: 82, gender: 'M', uncertain: 'Father name shows "वहा" - should be शहा' },
  { serial: 653, voterId: 'CRM2062669', name: 'धनश्री धन्यकुमार शहा', age: 78, gender: 'F' },
  { serial: 654, voterId: 'XUA8197030', name: 'आशीष कोत्तूर', age: 22, gender: 'M', uncertain: 'Mother name shows "क्ीतल कोत्ूर" - unclear spelling' },
  { serial: 655, voterId: 'XUA8113854', name: 'सुजात वैभव', age: 40, gender: 'F', uncertain: 'Name unclear "सुजात", husband shows "जाधव वैभव"' }
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
console.log('   Serial range: 626 to 655');
if (uncertain > 0) {
  console.log('\n⚠️  UNCERTAIN DATA: ' + uncertain + ' voters need manual verification');
}

console.log('\n✅ Data ready to save!\n');
