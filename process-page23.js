const fs = require('fs');

const voters = [
  { serial: 686, voterId: 'XUA8741613', name: 'फ़िज़ा शहबाज़ बागवान', husband: 'असलम बागवान', age: 28, gender: 'F' },
  { serial: 687, voterId: 'BSV1127133', name: 'अमिता अनुप दोभाडा', husband: 'अनुप दोभाडा', age: 45, gender: 'F' },
  { serial: 688, voterId: 'XUA8743197', name: 'कीर्ती शुभंकर इंगळे', husband: 'शुभंकर इंगळे', age: 27, gender: 'F' },
  { serial: 689, voterId: 'XUX7182108', name: 'निधार सुयोग पोतदार', husband: 'सुयोग संजीव पोतदार', age: 35, gender: 'F', uncertain: 'Name shows "fivar" (corrupted text), age unclear - estimated 35' },
  { serial: 690, voterId: 'XUA8745671', name: 'हेमंत प्रभाकर मोरे', father: 'प्रभाकर मोरे', age: 43, gender: 'M' },
  { serial: 691, voterId: 'XUA8746372', name: 'हितेंद्र हनुमंत खरात', mother: 'मनीषा हितेंद्र खरात', age: 57, gender: 'M' },
  { serial: 692, voterId: 'XUA8748469', name: 'दीपा अभिजीत ससाणे', husband: 'अभिजीत ससाणे', age: 52, gender: 'F' },
  { serial: 693, voterId: 'XUA8750325', name: 'अक्षय कुमार पवार', father: 'कुमार राजेंद्र पवार', age: 21, gender: 'M' },
  { serial: 694, voterId: 'XUA8754848', name: 'कोमल राऊत', husband: 'तुषार राऊत', age: 34, gender: 'F' },
  { serial: 695, voterId: 'XUA8754871', name: 'शुभम मगर', father: 'विजय मगर', age: 20, gender: 'M' },
  { serial: 696, voterId: 'XUA8755597', name: 'अथर्व संपत मोहिते', father: 'संपत मोहिते', age: 21, gender: 'M' },
  { serial: 697, voterId: 'XUA8755357', name: 'युवराज पवार', mother: 'सोनाली पवार', age: 53, gender: 'M', uncertain: 'Age 53 seems unusual for mother relationship - may need verification' },
  { serial: 698, voterId: 'XUA8755621', name: 'नेहा गायकवाड', husband: 'संदेश गायकवाड', age: 40, gender: 'F' },
  { serial: 699, voterId: 'XUA8761355', name: 'पूर्वा मनोज जाधव', father: 'मनोज जाधव', age: 19, gender: 'F' },
  { serial: 700, voterId: 'XUA8762817', name: 'ओंकार नितिन खंडागळे', father: 'नितिन खंडागळे', age: 26, gender: 'M' },
  { serial: 701, voterId: 'XUA8763146', name: 'योगिनी खिरवडकर', husband: 'उदय खिरवडकर', age: 40, gender: 'F' },
  { serial: 702, voterId: 'XUA8763161', name: 'उदय खिरवडकर', father: 'भगवान खिरवडकर', age: 43, gender: 'M', uncertain: 'Relation marked as "इतर" - assuming father' },
  { serial: 703, voterId: 'XUA8763484', name: 'प्रशांत सुहास कुलकर्णी', father: 'सुहास वसंतराव कुलकर्णी', age: 25, gender: 'M', uncertain: 'Name shows "प्रश्षांत" - corrected to प्रशांत' },
  { serial: 704, voterId: 'XUA8763708', name: 'अमोल गोरखनाथ गुलीक', father: 'गोरखनाथ गुलीक', age: 33, gender: 'M' },
  { serial: 705, voterId: 'XUA8764003', name: 'पनिका बाबासाहेब कांबळे', mother: 'शोभा श्रीमंत कांबळे', age: 42, gender: 'F', uncertain: 'Age unclear in source - estimated 42' },
  { serial: 706, voterId: 'XUA8765737', name: 'रीत खन्ना', father: 'सुमित खन्ना', age: 18, gender: 'F' },
  { serial: 707, voterId: 'XUA8766123', name: 'तन्वी अनुप दोभाडा', father: 'अनुप सुरेश दोभाडा', age: 18, gender: 'F' },
  { serial: 708, voterId: 'XUA8766453', name: 'तन्वी अनुप दोभाडा', father: 'अनुप सुरेश दोभाडा', age: 18, gender: 'F', uncertain: 'DUPLICATE - Same name and voter ID as serial 707 but different voter ID' },
  { serial: 709, voterId: 'XUAB768574', name: 'वैलेश श्रीधर पोटे', father: 'श्रीधर पोटे', age: 50, gender: 'M', uncertain: 'Name shows "वैलेश्" with extra character - corrected' },
  { serial: 710, voterId: 'XUA8769309', name: 'प्रिया अतुल चव्हाण', father: 'अतुल चव्हाण', age: 21, gender: 'F', uncertain: 'Name shows "3T अतुल" - text corrupted, assuming प्रिया' },
  { serial: 711, voterId: 'XUA8771958', name: 'मीरा विठ्ठल राऊत', father: 'विठ्ठल राऊत', age: 18, gender: 'F' },
  { serial: 712, voterId: 'XUA8773145', name: 'प्रशांत सुभाष गायकवाड', father: 'सुभाष गायकवाड', age: 26, gender: 'M', uncertain: 'Father shows "प्रश्ञांत गायकवाड" - should be सुभाष (text corrupted)' },
  { serial: 713, voterId: 'XUA8773558', name: 'राजश्री अनिल सोनावणे', husband: 'अनिल सोनावणे', age: 42, gender: 'F' },
  { serial: 714, voterId: 'XUA8773897', name: 'अनिल भास्कर सोनावणे', father: 'भास्कर सोनावणे', age: 48, gender: 'M' },
  { serial: 715, voterId: 'XUA8776379', name: 'रागिणी खरात', mother: 'सरला वाघमोडे खरात', age: 46, gender: 'F' }
];

const processedVoters = voters.map(v => ({
  ...v,
  ward: '7',
  booth: '1'
}));

fs.writeFileSync('temp-page-data.json', JSON.stringify(processedVoters, null, 2), 'utf8');

console.log('\n📄 Processing PDF Page 25 - Ward 7, Booth 1\n');
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
