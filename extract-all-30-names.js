const fs = require('fs');

const pdfText = `आपका टेक्स्ट यहां`;

// Manual extraction for page 2 (voters 1-30)
const correctNames = [
  { voterId: 'XUA7224868', name: 'गजानन यशवंत अनासपुरे' },
  { voterId: 'XUA7224850', name: 'मंदा गजानन अनासपुरे' },
  { voterId: 'XUA7225139', name: 'तनुजा जावेद बागवान' },
  { voterId: 'XUA7224801', name: 'खुश्बू मोहम्मदरफीक बागवान' },
  { voterId: 'XUA7224645', name: 'अंजुम गणी बागवान' },
  { voterId: 'XUA7225162', name: 'इम्रान शब्बीर बागवान' },
  { voterId: 'XUA7224819', name: 'करिश्मा शब्बीर बागवान' },
  { voterId: 'XUA7224942', name: 'अनिता नविनकुमार बखडा' },
  { voterId: 'XUA7224959', name: 'श्रेयंस नविनकुमार बखडा' },
  { voterId: 'XUA7224785', name: 'जयश्री अतुल भुजबळ' },
  { voterId: 'XUA7351711', name: 'रसिका शंकरराव भुजबळ' },
  { voterId: 'XUA7224694', name: 'शिल्पा कुणाल बोरा' },
  { voterId: 'XUA7351448', name: 'संदिप महावीर बोराळकर' },
  { voterId: 'XUA7351463', name: 'अमृता संदिप बोराळकर' },
  { voterId: 'XUA7670524', name: 'सई निलेश चिवटे' },
  { voterId: 'XUA7224678', name: 'धनश्री प्रकाश दळवी' },
  { voterId: 'XUA7225063', name: 'सिमा विजय दासरवार' },
  { voterId: 'XUA7793805', name: 'अमृता हिराचंद देशमुख' },
  { voterId: 'XUA7793813', name: 'आकाश हिराचंद देशमुख' },
  { voterId: 'XUA7670508', name: 'देवदत्त जगदीश देशपांडे' },
  { voterId: 'XUA7556418', name: 'अपूर्वा राजेंद्र देशपांडे' },
  { voterId: 'XUA7224892', name: 'पराग दिलीपकुमार दोशी' },
  { voterId: 'XUA7224900', name: 'काजल पराग दोशी' },
  { voterId: 'XUA7670482', name: 'मयुर सुधाकर गाडे' },
  { voterId: 'XUA7670474', name: 'मंदार सुधाकर गाडे' },
  { voterId: 'XUA7224637', name: 'लालासाहेब कृष्णराव गाडेकर' },
  { voterId: 'XUA7225089', name: 'लता लालासाहेब गाडेकर' },
  { voterId: 'XUA7224546', name: 'रोहिणी लालासाहेब गाडेकर' },
  { voterId: 'XUA7224561', name: 'रणजीत लालासाहेब गाडेकर' },
  { voterId: 'XUA7670540', name: 'कामिनी शैलेश गलांडे' }
];

console.log('🔧 Updating 30 Voters from Page 2\n');
console.log('='.repeat(70));

const votersPath = './public/data/voters.json';
const voters = JSON.parse(fs.readFileSync(votersPath, 'utf8'));

// Backup
const backupPath = `./public/data/voters.json.backup-page2-fix-${Date.now()}`;
fs.writeFileSync(backupPath, JSON.stringify(voters, null, 2));
console.log(`✅ Backup: ${backupPath}\n`);

// Update
let updated = 0;
correctNames.forEach(correct => {
  const idx = voters.findIndex(v => v.voterId === correct.voterId);
  if (idx !== -1) {
    const oldName = voters[idx].name;
    voters[idx].name = correct.name;
    updated++;
    console.log(`✓ ${correct.voterId}: "${oldName}" → "${correct.name}"`);
  } else {
    console.log(`✗ ${correct.voterId}: NOT FOUND`);
  }
});

// Save
fs.writeFileSync(votersPath, JSON.stringify(voters, null, 2));

console.log('\n' + '='.repeat(70));
console.log(`✅ SUCCESS! Updated ${updated}/30 voter names`);
console.log('='.repeat(70));
