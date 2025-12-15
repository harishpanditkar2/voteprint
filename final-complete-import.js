const fs = require('fs');

console.log('═══════════════════════════════════════════════════');
console.log('  WARD 7 COMPLETE IMPORT - FINAL EXTRACTION');
console.log('  From W7F1.txt, W7F2.txt, W7F3.txt');
console.log('═══════════════════════════════════════════════════\n');

function parseTextFile(filePath, fileNumber, expectedCount) {
  console.log(`\nProcessing: ${filePath}`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const voters = [];
  const voterMap = new Map();
  
  // Extract all voter IDs with their positions
  const voterIdPattern = /XUA\d{7}/g;
  let match;
  const voterData = [];
  
  while ((match = voterIdPattern.exec(content)) !== null) {
    voterData.push({
      id: match[0],
      pos: match.index
    });
  }
  
  console.log(`  Found ${voterData.length} voter IDs`);
  
  // Process each voter
  for (const voter of voterData) {
    if (voterMap.has(voter.id)) continue;
    
    // Get context around voter ID (500 chars before, 800 after)
    const start = Math.max(0, voter.pos - 500);
    const end = Math.min(content.length, voter.pos + 800);
    const context = content.substring(start, end);
    
    // Find serial number - look for pattern like "4 XUA..." or line with serial before ID
    let serialNumber = null;
    
    // Try to find serial number immediately before voter ID
    const beforeId = context.substring(0, context.indexOf(voter.id));
    const serialMatches = beforeId.match(/(\d+)\s*$/);
    if (serialMatches) {
      const num = parseInt(serialMatches[1]);
      if (num > 0 && num < 1000) {
        serialNumber = num.toString();
      }
    }
    
    if (!serialNumber) continue;
    
    // Extract name - find Marathi text after "मतदाराचे पूर्ण" pattern
    let name = '';
    const afterId = context.substring(context.indexOf(voter.id) + 10);
    
    // Look backwards from voter ID for name
    const namePatterns = [
      /मतदाराचे\s*पूर्ण[^:]*:\s*([ऀ-ॿ\s]+?)(?=\s*XUA)/,
      /मतदाराचे\s*पुर्ण[^:]*:\s*([ऀ-ॿ\s]+?)(?=\s*XUA)/,
      /पूर्ण[^:]*:\s*([ऀ-ॿ\s]+?)(?=\s*XUA)/
    ];
    
    for (const pattern of namePatterns) {
      const nameMatch = beforeId.match(pattern);
      if (nameMatch && nameMatch[1].trim().length >= 5) {
        name = nameMatch[1].trim().replace(/\s+/g, ' ');
        // Remove any leftover English/numbers
        name = name.replace(/[a-zA-Z0-9]+/g, '').trim();
        if (name.length >= 5) break;
      }
    }
    
    if (!name || name.length < 5) continue;
    
    // Extract age - look in text after voter ID
    let age = '30';
    const agePattern = /वय\s*[:：]?\s*([०-९\d]+)/;
    const ageMatch = afterId.match(agePattern);
    if (ageMatch) {
      age = ageMatch[1]
        .replace(/०/g, '0').replace(/१/g, '1').replace(/२/g, '2')
        .replace(/३/g, '3').replace(/४/g, '4').replace(/५/g, '5')
        .replace(/६/g, '6').replace(/७/g, '7').replace(/८/g, '8')
        .replace(/९/g, '9');
    }
    
    // Extract gender
    let gender = 'M';
    const genderPattern = /लिंग\s*[:：]?\s*(पु|स्री|ख्री|सरी|ol|oot|it)/;
    const genderMatch = afterId.match(genderPattern);
    if (genderMatch) {
      const g = genderMatch[1];
      gender = (g === 'पु') ? 'M' : 'F';
    } else if (context.includes('पतीचे नाव') || context.includes('पतीचे')) {
      gender = 'F';
    }
    
    voters.push({
      voterId: voter.id,
      name: name,
      uniqueSerial: `W7F${fileNumber}-S${serialNumber}`,
      serialNumber: serialNumber,
      age: age,
      gender: gender,
      ward: "7",
      booth: fileNumber.toString()
    });
    
    voterMap.set(voter.id, true);
  }
  
  // Sort by serial number
  voters.sort((a, b) => parseInt(a.serialNumber) - parseInt(b.serialNumber));
  
  console.log(`  ✅ Extracted: ${voters.length} voters (expected ${expectedCount})`);
  
  if (voters.length > 0) {
    console.log(`  First: ${voters[0].name}`);
    console.log(`  Last: ${voters[voters.length - 1].name}`);
  }
  
  return voters;
}

// Main execution
try {
  const allVoters = [];
  
  const file1 = parseTextFile('./pdflist/W7F1.txt', 1, 991);
  allVoters.push(...file1);
  
  const file2 = parseTextFile('./pdflist/W7F2.txt', 2, 861);
  allVoters.push(...file2);
  
  const file3 = parseTextFile('./pdflist/W7F3.txt', 3, 863);
  allVoters.push(...file3);
  
  console.log('\n' + '═'.repeat(50));
  console.log(`📊 TOTAL: ${allVoters.length} voters`);
  console.log(`   Target: 2,715 voters`);
  console.log(`   Coverage: ${((allVoters.length / 2715) * 100).toFixed(1)}%`);
  console.log('═'.repeat(50));
  
  // Assign anukramank
  allVoters.forEach((voter, index) => {
    voter.anukramank = index + 1;
  });
  
  // Check duplicates
  const ids = allVoters.map(v => v.voterId);
  const unique = new Set(ids);
  console.log(`\n✅ Unique voters: ${unique.size}`);
  
  // Sample
  console.log('\n📋 Sample voters:');
  [0, 1, 2, allVoters.length - 3, allVoters.length - 2, allVoters.length - 1].forEach(i => {
    if (allVoters[i]) {
      console.log(`  अ.क्र. ${allVoters[i].anukramank} | ${allVoters[i].uniqueSerial} | ${allVoters[i].name}`);
    }
  });
  
  // Backup and save
  const votersPath = './public/data/voters.json';
  if (fs.existsSync(votersPath)) {
    const existing = JSON.parse(fs.readFileSync(votersPath, 'utf8'));
    if (existing.length > 0) {
      fs.writeFileSync(`${votersPath}.backup-${Date.now()}`, JSON.stringify(existing, null, 2));
      console.log('\n✅ Backup created');
    }
  }
  
  fs.writeFileSync(votersPath, JSON.stringify(allVoters, null, 2));
  console.log(`✅ Saved ${allVoters.length} voters to database`);
  
  // Summary by booth
  console.log('\n📊 By Booth:');
  [1, 2, 3].forEach(booth => {
    const count = allVoters.filter(v => v.booth === booth.toString()).length;
    console.log(`   Booth ${booth}: ${count} voters`);
  });
  
  console.log('\n' + '═'.repeat(50));
  console.log('  ✅ IMPORT COMPLETE!');
  console.log('═'.repeat(50));
  console.log('\n  Next: npm run dev');
  console.log('  URL: http://localhost:3000\n');
  
} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}
