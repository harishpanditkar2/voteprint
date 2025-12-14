const fs = require('fs');
const path = require('path');

// Manual OCR data provided by user - all 30 voters
const manualData = [
  { serial: 1, voterId: 'XUA7224868', partNumber: '201/138/143', name: 'गजानन यशवंत अनासपुरे', age: '82', gender: 'M' },
  { serial: 2, voterId: 'XUA7224850', partNumber: '201/138/144', name: 'मंदा गजानन अनासपुरे', age: '75', gender: 'F' },
  { serial: 3, voterId: 'XUA7225139', partNumber: '201/138/145', name: 'तनुजा जावेद बागवान', age: '31', gender: 'F' },
  { serial: 4, voterId: 'XUA7224801', partNumber: '201/138/146', name: 'खुशबु मंहमदरफिक बागवान', age: '31', gender: 'F' },
  { serial: 5, voterId: 'XUA7224645', partNumber: '201/138/147', name: 'अंजुम गणी बागवान', age: '31', gender: 'F' },
  { serial: 6, voterId: 'XUA7225162', partNumber: '201/138/148', name: 'इमरान शब्बीर बागवान', age: '29', gender: 'M' },
  { serial: 7, voterId: 'XUA7224819', partNumber: '201/138/149', name: 'करिश्मा शब्बीर बागवान', age: '28', gender: 'F' },
  { serial: 8, voterId: 'XUA7224942', partNumber: '201/138/150', name: 'अनिता नविनकुमार बखडा', age: '54', gender: 'F' },
  { serial: 9, voterId: 'XUA7224959', partNumber: '201/138/151', name: 'श्रेयंस नविनकुमार बखडा', age: '31', gender: 'M' },
  { serial: 10, voterId: 'XUA7224785', partNumber: '201/138/152', name: 'जयश्री अतुल भुजबळ', age: '37', gender: 'F' },
  { serial: 11, voterId: 'XUA7351711', partNumber: '201/138/153', name: 'रसिका शंकरराव भुजबळ', age: '31', gender: 'F' },
  { serial: 12, voterId: 'XUA7224694', partNumber: '201/138/154', name: 'शिल्पा कुणाल बोरा', age: '37', gender: 'F' },
  { serial: 13, voterId: 'XUA7351448', partNumber: '201/138/155', name: 'संदिप महावीर बोराळकर', age: '39', gender: 'M' },
  { serial: 14, voterId: 'XUA7351463', partNumber: '201/138/156', name: 'अमृता संदिप बोराळकर', age: '36', gender: 'F' },
  { serial: 15, voterId: 'XUA7670524', partNumber: '201/138/157', name: 'सई निलेश चिवटे', age: '40', gender: 'F' },
  { serial: 16, voterId: 'XUA7224678', partNumber: '201/138/158', name: 'धनश्री प्रकाश दळवी', age: '31', gender: 'F' },
  { serial: 17, voterId: 'XUA7225063', partNumber: '201/138/159', name: 'सिमा विजय दासरवार', age: '38', gender: 'F' },
  { serial: 18, voterId: 'XUA7793805', partNumber: '201/138/160', name: 'अमृता हिराचंद देशमुख', age: '29', gender: 'F' },
  { serial: 19, voterId: 'XUA7793813', partNumber: '201/138/161', name: 'आकाश हिराचंद देशमुख', age: '26', gender: 'M' },
  { serial: 20, voterId: 'XUA7670508', partNumber: '201/138/162', name: 'देवदत्त जगदीश देशपांडे', age: '29', gender: 'M' },
  { serial: 21, voterId: 'XUA7556418', partNumber: '201/138/163', name: 'अपूर्वा राजेंद्र देशपांडे', age: '28', gender: 'F' },
  { serial: 22, voterId: 'XUA7224892', partNumber: '201/138/164', name: 'पराग दिलीपकुमार दोशी', age: '42', gender: 'M' },
  { serial: 23, voterId: 'XUA7224900', partNumber: '201/138/165', name: 'काजल पराग दोशी', age: '37', gender: 'F' },
  { serial: 24, voterId: 'XUA7670482', partNumber: '201/138/166', name: 'मयुर सुधाकर गाडे', age: '32', gender: 'M' },
  { serial: 25, voterId: 'XUA7670474', partNumber: '201/138/167', name: 'मंदार सुधाकर गाडे', age: '30', gender: 'M' },
  { serial: 26, voterId: 'XUA7224637', partNumber: '201/138/168', name: 'लालासाहेब क्रष्णराव गाडेकर', age: '67', gender: 'M' },
  { serial: 27, voterId: 'XUA7225089', partNumber: '201/138/169', name: 'लता लालासाहेब गाडेकर', age: '58', gender: 'F' },
  { serial: 28, voterId: 'XUA7224546', partNumber: '201/138/170', name: 'रोहिणी लालासाहेब गाडेकर', age: '35', gender: 'F' },
  { serial: 29, voterId: 'XUA7224561', partNumber: '201/138/171', name: 'रणजीत लालासाहेब गाडेकर', age: '31', gender: 'M' },
  { serial: 30, voterId: 'XUA7670540', partNumber: '201/138/172', name: 'कामिनी शैलेश गलांडे', age: '30', gender: 'F' }
];

console.log('📝 Applying manual corrections from user-provided OCR data...\n');

// Read current voters.json
const votersPath = path.join(__dirname, 'public', 'data', 'voters.json');
let voters = JSON.parse(fs.readFileSync(votersPath, 'utf-8'));

console.log(`Current voters: ${voters.length}`);

// Create a map of voterId to manual data
const manualMap = {};
manualData.forEach(m => {
  manualMap[m.voterId] = m;
});

// Update each voter with manual data
let corrected = 0;
voters.forEach(voter => {
  const manual = manualMap[voter.voterId];
  if (manual) {
    // Update with correct data
    voter.serialNumber = manual.serial.toString();
    voter.name = manual.name;
    voter.age = manual.age;
    voter.gender = manual.gender;
    voter.partNumber = manual.partNumber;
    voter.nameStatus = 'manually_verified';
    corrected++;
  }
});

console.log(`✅ Corrected ${corrected} voters with manual data`);

// IMPORTANT: Sort voters by serial number to maintain correct sequence
voters.sort((a, b) => {
  const serialA = parseInt(a.serialNumber);
  const serialB = parseInt(b.serialNumber);
  return serialA - serialB;
});

console.log(`📋 Sorted ${voters.length} voters by serial number`);

// Save updated voters.json
fs.writeFileSync(votersPath, JSON.stringify(voters, null, 2), 'utf-8');
console.log(`💾 Saved to ${votersPath}`);

// Show summary
console.log('\n================================================================================');
console.log('✅ All 30 voters corrected with manual OCR data!');
console.log('================================================================================\n');

// Show sample
console.log('Sample corrected voters:\n');
voters.slice(0, 5).forEach((v, i) => {
  console.log(`${i + 1}. ${v.name}`);
  console.log(`   ID: ${v.voterId} | Age: ${v.age} | Gender: ${v.gender}`);
  console.log(`   Serial: ${v.serialNumber} | Part: ${v.partNumber}\n`);
});

console.log('Last 3 voters:\n');
voters.slice(-3).forEach((v, i) => {
  console.log(`${28 + i}. ${v.name}`);
  console.log(`   ID: ${v.voterId} | Age: ${v.age} | Gender: ${v.gender}`);
  console.log(`   Serial: ${v.serialNumber} | Part: ${v.partNumber}\n`);
});

console.log('🌐 View at: http://localhost:3000/search');
