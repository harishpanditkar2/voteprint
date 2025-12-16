const fs = require('fs');

console.log('📸 Adding W7F2 Voters from Images (Serials 615-660)');
console.log('════════════════════════════════════════════════════════\n');

// Voter data extracted from images
const newVoters = [
  // Image 1 - Serials 615-630
  {serial: 615, voterId: 'CRM0129650', name: 'निर्मल राजेश झालोके', relation: 'राजेश झालोके', house: '८३१', age: '57', gender: 'F', partNumber: '201/118/200'},
  {serial: 616, voterId: 'XUA1830173', name: 'श्रीभाऊ रघुनाथ शहा', relation: 'रघुनाथ शहा', house: '८३१', age: '48', gender: 'M', partNumber: '201/118/201'},
  {serial: 617, voterId: 'XUA1830181', name: 'प्रांजली श्रीभाऊ शहा', relation: 'श्रीभाऊ शहा', house: '८३१', age: '47', gender: 'F', partNumber: '201/118/202'},
  {serial: 618, voterId: 'XUA2657286', name: 'अजिंक्य हरीसिंद पवार', relation: 'हरीसिंद पवार', house: '८३२', age: '45', gender: 'M', partNumber: '201/118/203'},
  {serial: 619, voterId: 'XUA1539550', name: 'प्रफुल्ल गजानन गायत', relation: 'गजानन गायत', house: 'NA', age: '37', gender: 'M', partNumber: '201/118/204'},
  {serial: 620, voterId: 'CRM2041879', name: 'चंद्री दादा गाळी', relation: 'दादा गाळी', house: '४६८', age: '49', gender: 'F', partNumber: '201/118/208'},
  {serial: 621, voterId: 'XUA1539600', name: 'पूजिल विद्यादान रावळ', relation: 'विद्यादान रावळ', house: 'NA', age: '45', gender: 'M', partNumber: '201/118/209'},
  {serial: 622, voterId: 'CRM2042000', name: 'मीना रमेशचंद्र पोरवडे', relation: 'रमेशचंद्र पोरवडे', house: '४६३', age: '48', gender: 'F', partNumber: '201/118/213'},
  {serial: 623, voterId: 'XUA7123573', name: 'विजय कदमबा माके', relation: 'कदमबा माके', house: '४९६', age: '64', gender: 'M', partNumber: '201/118/214'},
  {serial: 624, voterId: 'XUA4609285', name: 'सुनिता निवेदिता देवसर्मा', relation: 'निवेदिता देवसर्मा', house: '४९८८', age: '48', gender: 'F', partNumber: '201/118/224'},
  {serial: 625, voterId: 'XUA4609293', name: 'मनिषा शंकर देवसर्मा', relation: 'शंकर देवसर्मा', house: '४९८८', age: '48', gender: 'F', partNumber: '201/118/225'},
  {serial: 626, voterId: 'CRM2040970', name: 'संतोष बाबुलाल बोरा', relation: 'बाबुलाल बोरा', house: '६६५/२', age: '38', gender: 'M', partNumber: '201/118/226'},
  {serial: 627, voterId: 'CRM1700210', name: 'जयश्री संतोष बोरा', relation: 'संतोष बोरा', house: '६६५/२', age: '37', gender: 'F', partNumber: '201/118/227'},
  {serial: 628, voterId: 'CRM1698406', name: 'हृषीकेश गणपात गाळे', relation: 'गणपात गाळे', house: '४९४९', age: '65', gender: 'M', partNumber: '201/118/228'},
  {serial: 629, voterId: 'CRM1698398', name: 'निशिता हृषीकेश गाळे', relation: 'हृषीकेश गाळे', house: '४९४९', age: '45', gender: 'F', partNumber: '201/118/229'},
  {serial: 630, voterId: 'XUA1539618', name: 'माडुर्या गोविंद झालोके', relation: 'गोविंद झालोके', house: '८४८/१', age: '85', gender: 'F', partNumber: '201/118/230'},
  
  // Image 2 - Serials 631-659
  {serial: 631, voterId: 'XUA1539626', name: 'मोहन मारुति झालोके', relation: 'मारुति झालोके', house: '८४८/१', age: '66', gender: 'M', partNumber: '201/118/231'},
  {serial: 632, voterId: 'CRM2042281', name: 'माडुर्या मोहन झालोके', relation: 'मोहन झालोके', house: '८४८/१', age: '62', gender: 'F', partNumber: '201/118/232'},
  {serial: 633, voterId: 'XUA1539634', name: 'गौरी मोहन झालोके', relation: 'मोहन झालोके', house: '८४८/१', age: '56', gender: 'F', partNumber: '201/118/233'},
  {serial: 634, voterId: 'CRM2042299', name: 'आशा हरिकृष्ण झालोके', relation: 'हरिकृष्ण झालोके', house: '८४८/१', age: '47', gender: 'F', partNumber: '201/118/234'},
  {serial: 635, voterId: 'CRM2042307', name: 'सुशीला गोपाळ झालोके', relation: 'गोपाळ झालोके', house: '८४८/१', age: '47', gender: 'F', partNumber: '201/118/235'},
  {serial: 636, voterId: 'CRM1700343', name: 'निवेदिता हरिकृष्ण गाळके', relation: 'हरिकृष्ण गाळके', house: '८४८/१', age: '37', gender: 'F', partNumber: '201/118/236'},
  {serial: 637, voterId: 'XUA1539642', name: 'वाडगावल्या वासुदेव घोङकळे', relation: 'वासुदेव घोङकळे', house: '८४८/१', age: '67', gender: 'M', partNumber: '201/118/237'},
  {serial: 638, voterId: 'CRM2577221', name: 'सुजाता पंढरीनाथ जगदाळे', relation: 'पंढरीनाथ जगदाळे', house: 'NA', age: '47', gender: 'F', partNumber: '201/118/239'},
  {serial: 639, voterId: 'XUA1539667', name: 'बाळेश्री तवसा रोकडे', relation: 'तवसा रोकडे', house: '४९४९', age: '45', gender: 'M', partNumber: '201/118/240'},
  {serial: 640, voterId: 'CRM1700608', name: 'परेश मार्तिक सोनावणी', relation: 'मार्तिक सोनावणी', house: '१९९५', age: '47', gender: 'M', partNumber: '201/118/241'},
  {serial: 641, voterId: 'CRM1539675', name: 'सुरेखा मार्तिक सोनावणी', relation: 'मार्तिक सोनावणी', house: '१९९५', age: '45', gender: 'F', partNumber: '201/118/242'},
  {serial: 642, voterId: 'CRM1700723', name: 'निशा वभिषा गाळे', relation: 'वभिषा गाळे', house: '४९३१', age: '47', gender: 'F', partNumber: '201/118/243'},
  {serial: 643, voterId: 'XUA2657294', name: 'श्रीधर कोळी काभारे', relation: 'कोळी काभारे', house: '८३२१', age: '47', gender: 'M', partNumber: '201/118/244'},
  {serial: 644, voterId: 'CRM1699982', name: 'दरवाव्य लिते', relation: 'दरवाव्य लिते', house: '९३७१', age: '64', gender: 'F', partNumber: '201/118/250'},
  {serial: 645, voterId: 'CRM1699990', name: 'तीरबाव्यी भोरे लिते', relation: 'भोरे लिते', house: '९३७१', age: '54', gender: 'F', partNumber: '201/118/251'},
  {serial: 646, voterId: 'XUA2657310', name: 'पशुपतिन कल्याणसिंद येडपत्र', relation: 'कल्याणसिंद येडपत्र', house: '९१८१', age: '42', gender: 'M', partNumber: '201/118/252'},
  {serial: 647, voterId: 'CRM2042158', name: 'मितिळा पशुपतिन येडपत्र', relation: 'पशुपतिन येडपत्र', house: '९१८१', age: '42', gender: 'F', partNumber: '201/118/253'},
  {serial: 648, voterId: 'CRM1698901', name: 'मार्तिक कल्याणसिंद गटांके', relation: 'कल्याणसिंद गटांके', house: '८३९१', age: '63', gender: 'M', partNumber: '201/118/254'},
  {serial: 649, voterId: 'CRM1698893', name: 'रामाबाई मार्तिक गटांके', relation: 'मार्तिक गटांके', house: '९३९१', age: '47', gender: 'F', partNumber: '201/118/255'},
  {serial: 650, voterId: 'CRM2041309', name: 'लाललाबे कल्याणसिंद परगावे', relation: 'कल्याणसिंद परगावे', house: 'NA', age: '58', gender: 'F', partNumber: '201/118/266'},
  {serial: 651, voterId: 'XUA8508199', name: 'माडुर्या लाललाबे परगावे', relation: 'लाललाबे परगावे', house: '४९४९', age: '42', gender: 'F', partNumber: '201/118/267'},
  {serial: 652, voterId: 'CRM1698612', name: 'मोनचंद नारायण नाम', relation: 'नारायण नाम', house: '१९९५', age: '47', gender: 'M', partNumber: '201/118/268'},
  {serial: 653, voterId: 'CRM1698661', name: 'श्रीधराबे माडकर नाम', relation: 'माडकर नाम', house: '१९९५', age: '47', gender: 'F', partNumber: '201/118/269'},
  {serial: 654, voterId: 'XUA7121516', name: 'मोहन रमेश साभाशीव', relation: 'रमेश साभाशीव', house: '१९८९', age: '47', gender: 'M', partNumber: '201/118/289'},
  {serial: 655, voterId: 'XUA8412769', name: 'विजय पाटिल', relation: 'विजय पाटिल', house: 'S.NO. ९८/१ Metro 307', age: '47', gender: 'M', partNumber: '201/118/290'},
  {serial: 656, voterId: 'XUA8714230', name: 'रोज फॉरेस्ट कोर्टे', relation: 'XPLUSH DEVATA NAGAR', house: 'NA', age: '38', gender: 'F', partNumber: '201/118/292'},
  {serial: 657, voterId: 'XUA8809550', name: 'सुनाता भोरे कुलकर्णी', relation: 'भोरे कुलकर्णी', house: 'PLOT NO. ४३ GAT NO. ५६५', age: '27', gender: 'F', partNumber: '201/118/796'},
  {serial: 658, voterId: 'XUA8838351', name: 'उज्ज्वली सोनावळी', relation: 'सरवीश सोनावळी', house: 'Dawish Nagar', age: '33', gender: 'F', partNumber: '201/118/797'},
  {serial: 659, voterId: 'ZSL6466338', name: 'प्रतिक प्रभु देवसर्के', relation: 'प्रभु देवसर्के', house: '४०६', age: '36', gender: 'M', partNumber: '201/118/840'},
  
  // Image 3 - Serial 660
  {serial: 660, voterId: 'CRM2546638', name: 'मानवांड वासूदेव गायकवाड', relation: 'वासूदेव गायकवाड', house: '४६९', age: '82', gender: 'F', partNumber: '201/128/432'}
];

console.log(`Extracted ${newVoters.length} voters from images`);
console.log(`Serial range: ${newVoters[0].serial} - ${newVoters[newVoters.length-1].serial}\n`);

// Step 1: Load current database
console.log('Step 1: Loading current database...');
const data = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf8'));
const currentW7F2 = data.filter(v => v.booth === '2');
console.log(`   Current total: ${data.length}`);
console.log(`   Current W7F2: ${currentW7F2.length}\n`);

// Step 2: Check for duplicates in new data
console.log('Step 2: Checking for duplicates in new voter data...');
const newVoterIds = new Set();
const duplicatesInNew = [];
newVoters.forEach(v => {
  if (newVoterIds.has(v.voterId)) {
    duplicatesInNew.push(v.voterId);
  }
  newVoterIds.add(v.voterId);
});

if (duplicatesInNew.length > 0) {
  console.log(`❌ Found ${duplicatesInNew.length} duplicates in new data:`);
  duplicatesInNew.forEach(id => console.log(`   ${id}`));
  process.exit(1);
}
console.log(`✅ No duplicates in new data\n`);

// Step 3: Check for conflicts with existing data
console.log('Step 3: Checking for conflicts with existing data...');
const existingVoterIds = new Set(data.map(v => v.voterId));
const conflicts = newVoters.filter(v => existingVoterIds.has(v.voterId));

if (conflicts.length > 0) {
  console.log(`⚠️  Found ${conflicts.length} voter IDs already in database:`);
  conflicts.forEach(v => console.log(`   Serial ${v.serial}: ${v.voterId} - ${v.name}`));
  console.log('\n   These will NOT be added to avoid duplicates\n');
}

const safeToAdd = newVoters.filter(v => !existingVoterIds.has(v.voterId));
console.log(`✅ Safe to add: ${safeToAdd.length} voters\n`);

// Step 4: Check for serial conflicts
const existingSerials = new Set(currentW7F2.map(v => v.serial));
const serialConflicts = safeToAdd.filter(v => existingSerials.has(v.serial));

if (serialConflicts.length > 0) {
  console.log(`⚠️  Serial number conflicts: ${serialConflicts.length}`);
  serialConflicts.slice(0, 5).forEach(v => {
    const existing = currentW7F2.find(e => e.serial === v.serial);
    console.log(`   Serial ${v.serial}:`);
    console.log(`     Existing: ${existing.voterId} - ${existing.name}`);
    console.log(`     New: ${v.voterId} - ${v.name}`);
  });
  console.log('\n   Existing voters will be removed first\n');
}

// Step 5: Create backup
console.log('Step 5: Creating backup...');
const backupFile = `./public/data/voters.json.backup-add-615-660-${Date.now()}`;
fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
console.log(`✅ Backup: ${backupFile}\n`);

// Step 6: Remove conflicting serials and add new voters
console.log('Step 6: Adding new voters to database...');
const cleanData = data.filter(v => {
  if (v.booth !== '2') return true;
  return !serialConflicts.some(nv => nv.serial === v.serial);
});

const votersToAdd = safeToAdd.map(v => ({
  voterId: v.voterId,
  name: v.name,
  age: v.age,
  gender: v.gender,
  ward: '7',
  booth: '2',
  serial: v.serial,
  relation: v.relation,
  house: v.house,
  partNumber: v.partNumber,
  uniqueSerial: `W7F2-S${v.serial}`
}));

const finalData = [...cleanData, ...votersToAdd];

// Sort by booth and serial
finalData.sort((a, b) => {
  if (a.booth !== b.booth) return a.booth.localeCompare(b.booth);
  return (a.serial || 0) - (b.serial || 0);
});

fs.writeFileSync('./public/data/voters.json', JSON.stringify(finalData, null, 2));
console.log(`✅ Database updated`);
console.log(`   Previous total: ${data.length}`);
console.log(`   Removed conflicts: ${data.length - cleanData.length}`);
console.log(`   Added new voters: ${votersToAdd.length}`);
console.log(`   New total: ${finalData.length}\n`);

// Step 7: Final verification
console.log('════════════════════════════════════════════════════════');
console.log('Step 7: Final Verification');
console.log('════════════════════════════════════════════════════════\n');

const finalW7F2 = finalData.filter(v => v.booth === '2');
console.log(`W7F2 voters: ${finalW7F2.length} (expected: 861)`);
console.log(`Missing: ${861 - finalW7F2.length} voters (serials 661-861)\n`);

// Check serials coverage
const serials = finalW7F2.map(v => v.serial).sort((a, b) => a - b);
console.log(`Serial range: ${serials[0]} - ${serials[serials.length-1]}`);

// Find gaps
const gaps = [];
for (let i = 1; i <= 861; i++) {
  if (!serials.includes(i)) {
    if (gaps.length === 0 || gaps[gaps.length-1].to !== i-1) {
      gaps.push({from: i, to: i});
    } else {
      gaps[gaps.length-1].to = i;
    }
  }
}

if (gaps.length > 0) {
  console.log(`\nMissing serial ranges (${gaps.reduce((sum, g) => sum + (g.to - g.from + 1), 0)} total):`);
  gaps.slice(0, 5).forEach(g => {
    if (g.from === g.to) {
      console.log(`   ${g.from}`);
    } else {
      console.log(`   ${g.from}-${g.to} (${g.to - g.from + 1} serials)`);
    }
  });
  if (gaps.length > 5) {
    console.log(`   ... and ${gaps.length - 5} more gaps`);
  }
}

// Check duplicates
const voterIdMap = {};
finalW7F2.forEach(v => {
  if (!voterIdMap[v.voterId]) voterIdMap[v.voterId] = [];
  voterIdMap[v.voterId].push(v.serial);
});
const dupes = Object.keys(voterIdMap).filter(id => voterIdMap[id].length > 1);

if (dupes.length > 0) {
  console.log(`\n⚠️  Duplicate voter IDs: ${dupes.length}`);
  dupes.forEach(id => {
    console.log(`   ${id}: serials ${voterIdMap[id].join(', ')}`);
  });
} else {
  console.log(`\n✅ No duplicate voter IDs`);
}

console.log('\n🎉 Successfully added voters from images!');
console.log('════════════════════════════════════════════════════════\n');
