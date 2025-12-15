const fs = require('fs');

console.log('\n📄 Processing Page 1 - Ward 7, Booth 1\n');

const text = fs.readFileSync('./page1-text.txt', 'utf8');
const lines = text.split('\n');

// Manual extraction for first 3 voters (clear format)
const voters = [
  { serial: '1', voterId: 'XUA7224868', name: 'गजानन यशवंत अनासपुरे', age: '82', gender: 'M' },
  { serial: '2', voterId: 'XUA7224850', name: 'मंदा गजानन अनासपुरे', age: '75', gender: 'F' },
  { serial: '3', voterId: 'XUA7225139', name: 'तनुजा जावेद बागवान', age: '31', gender: 'F' },
  { serial: '4', voterId: 'XUA7224801', name: 'खुश्रबु मंहमदरफिक बागवान', age: '31', gender: 'F' },
  { serial: '5', voterId: 'XUA7224645', name: 'अंजुम गणी बागवान', age: '39', gender: 'F' },
  { serial: '6', voterId: 'XUA7225162', name: 'इम्रान शब्बीर बागवान', age: '29', gender: 'M' },
  { serial: '7', voterId: 'XUA7224819', name: 'करिक्मा शब्बीर बागवान', age: '28', gender: 'F' },
  { serial: '8', voterId: 'XUA7224942', name: 'अनिता नविनकुमार बखडा', age: '54', gender: 'F' },
  { serial: '9', voterId: 'XUA7224959', name: 'श्रेयंस नविनकुमार बखडा', age: '39', gender: 'M' },
  { serial: '10', voterId: 'XUA7224785', name: 'जयश्री अतुल भुजबळ', age: '37', gender: 'F' },
  { serial: '11', voterId: 'XUA7351711', name: 'रसिका शंकरराव भुजबळ', age: '31', gender: 'F' },
  { serial: '12', voterId: 'XUA7224694', name: 'शिल्पा कुणाल बोरा', age: '37', gender: 'F' },
  { serial: '13', voterId: 'XUA7351448', name: 'संदिप महावीर बोराळकर', age: '36', gender: 'M' },
  { serial: '14', voterId: 'XUA7351463', name: 'अमृता संदिप बोराळकर', age: '36', gender: 'F' },
  { serial: '15', voterId: 'XUA7670524', name: 'सई निलेज्ञ चिवटे', age: '40', gender: 'F' },
  { serial: '16', voterId: 'XUA7224678', name: 'धनश्री प्रकाश दळवी', age: '31', gender: 'F' },
  { serial: '17', voterId: 'XUA7225063', name: 'सिमा विजय दासरवार', age: '36', gender: 'F' },
  { serial: '18', voterId: 'XUA7793805', name: 'अमृता हिराचंद देशमुख', age: '29', gender: 'F' },
  { serial: '19', voterId: 'XUA7793813', name: 'आकाद्श हिराचंद देशमुख', age: '26', gender: 'M' },
  { serial: '20', voterId: 'XUA7670508', name: 'देवदत्त जगदीश देशपांडे', age: '29', gender: 'M' },
  { serial: '21', voterId: 'XUA7556418', name: 'अपूर्वा राजेंद्र देशपांडे', age: '28', gender: 'F' },
  { serial: '22', voterId: 'XUA7224892', name: 'पराग दिलीपकुमार दोशी', age: '42', gender: 'M' },
  { serial: '23', voterId: 'XUA7224900', name: 'काजल पराग दोशी', age: '37', gender: 'F' },
  { serial: '24', voterId: 'XUA7670482', name: 'मयुर सुधाकर गाडे', age: '32', gender: 'M' },
  { serial: '25', voterId: 'XUA7670474', name: 'मंदार सुधाकर गाडे', age: '30', gender: 'M' },
  { serial: '26', voterId: 'XUA7224637', name: 'लालासाहेब क्रष्णराव गाडेकर', age: '67', gender: 'M' },
  { serial: '27', voterId: 'XUA7225089', name: 'लता लालासाहेब गाडेकर', age: '58', gender: 'F' },
  { serial: '28', voterId: 'XUA7224546', name: 'रोहिणी लालासाहेब गाडेकर', age: '35', gender: 'F' },
  { serial: '29', voterId: 'XUA7224561', name: 'रणजीत लालासाहेब गाडेकर', age: '31', gender: 'M' },
  { serial: '30', voterId: 'XUA7670540', name: 'कामिनी शैलेश गलांडे', age: '30', gender: 'F' }
];

console.log('💾 EXTRACTED DATA:\n');
voters.forEach((v, idx) => {
  const genderIcon = v.gender === 'M' ? '👨' : '👩';
  console.log(`✅ ${v.serial.padStart(2)} | ${v.voterId} | ${v.name.padEnd(30)} | ${v.age} | ${genderIcon} ${v.gender}`);
});

console.log(`\n📊 SUMMARY:`);
console.log(`   Total voters: ${voters.length}`);
console.log(`   Male: ${voters.filter(v => v.gender === 'M').length}`);
console.log(`   Female: ${voters.filter(v => v.gender === 'F').length}`);
console.log(`   Serial range: ${voters[0].serial} to ${voters[voters.length-1].serial}`);

// Add ward and booth
const finalVoters = voters.map(v => ({
  ...v,
  serialNumber: v.serial,
  ward: '7',
  booth: '1'
}));

// Save to temp
fs.writeFileSync('./temp-page-data.json', JSON.stringify(finalVoters, null, 2));

console.log(`\n✅ Data ready to save!`);
console.log(`\n❓ Do you want to save this to database?`);
console.log(`   Run: node save-page-data.js\n`);
