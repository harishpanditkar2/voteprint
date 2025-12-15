const fs = require('fs');

// Get text from command line argument
const text = process.argv[2];
const pageNum = parseInt(process.argv[3]) || 1;
const ward = process.argv[4] || '7';
const booth = process.argv[5] || '1';

if (!text) {
  console.log('❌ No text provided');
  console.log('Usage: node process-page-text.js "<text>" <pageNum> <ward> <booth>');
  process.exit(1);
}

console.log(`\n📄 Processing Page ${pageNum} - Ward ${ward}, Booth ${booth}\n`);

const lines = text.split('\n');
const voters = [];
const issues = [];

// Extract all voter IDs with serials
const voterMatches = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const matches = [...line.matchAll(/(\d+)\s+XUA(\d{7})/g)];
  
  for (const match of matches) {
    voterMatches.push({
      lineNum: i,
      serial: match[1],
      voterId: 'XUA' + match[2],
      position: match.index
    });
  }
}

console.log(`🔍 Found ${voterMatches.length} voter IDs\n`);

// Process each voter
for (const vm of voterMatches) {
  let name = '';
  let age = '30';
  let gender = 'M';
  
  // Look for name in previous lines
  for (let lookback = 1; lookback <= 3; lookback++) {
    const prevLineNum = vm.lineNum - lookback;
    if (prevLineNum < 0) break;
    
    const prevLine = lines[prevLineNum];
    
    if (prevLine.includes('मतदाराचे पूर्ण') || prevLine.includes('मतदाराचे पुर्ण')) {
      const nameMatch = prevLine.match(/(?:मतदाराचे\s*पूर्ण|मतदाराचे\s*पुर्ण)\s*[:\s:]+([ऀ-ॿ\s]+?)$/);
      if (nameMatch) {
        name = nameMatch[1].trim().replace(/\s+/g, ' ').replace(/नांव/g, '').trim();
        if (name.length >= 5 && name.length < 80) {
          break;
        }
      }
    }
  }
  
  if (!name || name.length < 3) {
    name = '[Name needs review]';
    issues.push(`Serial ${vm.serial}: Name not found`);
  }
  
  // Extract age
  for (let lookahead = 0; lookahead <= 5; lookahead++) {
    const nextLineNum = vm.lineNum + lookahead;
    if (nextLineNum >= lines.length) break;
    
    const nextLine = lines[nextLineNum];
    const ageMatches = [...nextLine.matchAll(/वय\s*[:：]?\s*([०-९\d]+)/g)];
    if (ageMatches.length > 0) {
      age = ageMatches[0][1]
        .replace(/०/g, '0').replace(/१/g, '1').replace(/२/g, '2')
        .replace(/३/g, '3').replace(/४/g, '4').replace(/५/g, '5')
        .replace(/६/g, '6').replace(/७/g, '7').replace(/८/g, '8')
        .replace(/९/g, '9');
      break;
    }
  }
  
  // Extract gender
  for (let lookahead = 0; lookahead <= 5; lookahead++) {
    const nextLineNum = vm.lineNum + lookahead;
    if (nextLineNum >= lines.length) break;
    
    const nextLine = lines[nextLineNum];
    const genderMatches = [...nextLine.matchAll(/लिंग\s*[:：]?\s*(पु|स्री|ख्री|सरी)/g)];
    if (genderMatches.length > 0) {
      gender = (genderMatches[0][1] === 'पु') ? 'M' : 'F';
      break;
    }
  }
  
  voters.push({
    voterId: vm.voterId,
    name: name,
    serialNumber: vm.serial,
    age: age,
    gender: gender,
    ward: ward,
    booth: booth
  });
}

// Sort by serial
voters.sort((a, b) => parseInt(a.serialNumber) - parseInt(b.serialNumber));

// Show what we're saving
console.log('💾 VOTERS TO SAVE:\n');
voters.forEach((v, idx) => {
  const status = v.name.includes('[Name needs review]') ? '⚠️ ' : '✅';
  console.log(`${status} ${v.serialNumber.padStart(3)} | ${v.voterId} | ${v.name.substring(0, 40)} | ${v.age} | ${v.gender}`);
});

console.log(`\n📊 SUMMARY:`);
console.log(`   Total voters: ${voters.length}`);
console.log(`   Male: ${voters.filter(v => v.gender === 'M').length}`);
console.log(`   Female: ${voters.filter(v => v.gender === 'F').length}`);

if (issues.length > 0) {
  console.log(`\n⚠️  ISSUES FOUND:`);
  issues.forEach(issue => console.log(`   ${issue}`));
}

// Save to temp file for review
fs.writeFileSync('./temp-page-data.json', JSON.stringify(voters, null, 2));

console.log(`\n✅ Data prepared and saved to temp-page-data.json`);
console.log(`\nTo save to database, run:`);
console.log(`   node save-page-data.js\n`);
