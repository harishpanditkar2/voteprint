const fs = require('fs');
const path = require('path');

console.log('🔍 Comprehensive Voter Data Verification\n');

// Read current database
const voters = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf-8'));

// Separate by booth
const w7f1 = voters.filter(v => v.ward === '7' && v.booth === '1').sort((a, b) => parseInt(a.serial) - parseInt(b.serial));
const w7f2 = voters.filter(v => v.ward === '7' && v.booth === '2').sort((a, b) => parseInt(a.serial) - parseInt(b.serial));
const w7f3 = voters.filter(v => v.ward === '7' && v.booth === '3').sort((a, b) => parseInt(a.serial) - parseInt(b.serial));

console.log('📊 Current Database Status:');
console.log(`W7F1 (Booth 1): ${w7f1.length} voters`);
console.log(`W7F2 (Booth 2): ${w7f2.length} voters`);
console.log(`W7F3 (Booth 3): ${w7f3.length} voters`);
console.log(`Total: ${voters.length} voters\n`);

// Data quality checks
console.log('🔎 Data Quality Analysis:\n');

function analyzeBoothData(boothVoters, boothName) {
  console.log(`\n${boothName}:`);
  console.log(`─────────────────────────────────────`);
  
  // Check for missing names
  const missingNames = boothVoters.filter(v => !v.name || v.name === 'N/A' || v.name.trim() === '');
  console.log(`✓ Voters with valid names: ${boothVoters.length - missingNames.length}/${boothVoters.length}`);
  if (missingNames.length > 0) {
    console.log(`  ⚠️  Missing names: ${missingNames.length}`);
    console.log(`     Serials: ${missingNames.slice(0, 10).map(v => v.serial).join(', ')}${missingNames.length > 10 ? '...' : ''}`);
  }
  
  // Check for missing ages
  const missingAges = boothVoters.filter(v => !v.age || v.age === 'N/A' || (typeof v.age === 'string' && v.age.trim() === ''));
  console.log(`✓ Voters with valid ages: ${boothVoters.length - missingAges.length}/${boothVoters.length}`);
  if (missingAges.length > 0) {
    console.log(`  ⚠️  Missing ages: ${missingAges.length}`);
  }
  
  // Check for missing genders
  const missingGenders = boothVoters.filter(v => !v.gender || v.gender === 'N/A' || (v.gender !== 'M' && v.gender !== 'F'));
  console.log(`✓ Voters with valid genders: ${boothVoters.length - missingGenders.length}/${boothVoters.length}`);
  if (missingGenders.length > 0) {
    console.log(`  ⚠️  Missing/invalid genders: ${missingGenders.length}`);
  }
  
  // Check for missing voter IDs
  const missingIds = boothVoters.filter(v => !v.voterId || v.voterId === 'N/A' || v.voterId.trim() === '');
  console.log(`✓ Voters with valid IDs: ${boothVoters.length - missingIds.length}/${boothVoters.length}`);
  if (missingIds.length > 0) {
    console.log(`  ⚠️  Missing voter IDs: ${missingIds.length}`);
  }
  
  // Check for duplicate voter IDs
  const voterIdCounts = {};
  boothVoters.forEach(v => {
    if (v.voterId && v.voterId !== 'N/A') {
      voterIdCounts[v.voterId] = (voterIdCounts[v.voterId] || 0) + 1;
    }
  });
  const duplicateIds = Object.entries(voterIdCounts).filter(([id, count]) => count > 1);
  if (duplicateIds.length > 0) {
    console.log(`  ⚠️  Duplicate voter IDs: ${duplicateIds.length}`);
    duplicateIds.slice(0, 5).forEach(([id, count]) => {
      console.log(`     ${id}: appears ${count} times`);
    });
  }
  
  // Check serial number sequence
  const serials = boothVoters.map(v => parseInt(v.serial));
  const minSerial = Math.min(...serials);
  const maxSerial = Math.max(...serials);
  const gaps = [];
  for (let i = minSerial; i <= maxSerial; i++) {
    if (!serials.includes(i)) {
      gaps.push(i);
    }
  }
  console.log(`✓ Serial range: ${minSerial} to ${maxSerial}`);
  if (gaps.length > 0) {
    console.log(`  ℹ️  Gaps in sequence: ${gaps.length} missing serials`);
    if (gaps.length <= 20) {
      console.log(`     Missing: ${gaps.join(', ')}`);
    } else {
      console.log(`     First 20 missing: ${gaps.slice(0, 20).join(', ')}...`);
    }
  }
  
  // Check for OCR corruption patterns
  const corruptionPatterns = [
    { pattern: /[०-९]{3,}/, name: 'Marathi numerals in name' },
    { pattern: /\s{5,}/, name: 'Excessive spaces' },
    { pattern: /[।॥]+/, name: 'Devanagari punctuation' },
    { pattern: /^[a-zA-Z\s]{2,}$/, name: 'English-only name' }
  ];
  
  const suspiciousNames = [];
  boothVoters.forEach(v => {
    if (v.name && v.name !== 'N/A') {
      for (let { pattern, name: patternName } of corruptionPatterns) {
        if (pattern.test(v.name)) {
          suspiciousNames.push({ serial: v.serial, name: v.name, issue: patternName });
          break;
        }
      }
    }
  });
  
  if (suspiciousNames.length > 0) {
    console.log(`  ⚠️  Suspicious names (possible OCR errors): ${suspiciousNames.length}`);
    suspiciousNames.slice(0, 5).forEach(s => {
      console.log(`     Serial ${s.serial}: ${s.name.substring(0, 40)} (${s.issue})`);
    });
  }
  
  return {
    total: boothVoters.length,
    missingNames: missingNames.length,
    missingAges: missingAges.length,
    missingGenders: missingGenders.length,
    missingIds: missingIds.length,
    duplicateIds: duplicateIds.length,
    gaps: gaps.length,
    suspiciousNames: suspiciousNames.length
  };
}

const w7f1Stats = analyzeBoothData(w7f1, 'W7F1 (Booth 1)');
const w7f2Stats = analyzeBoothData(w7f2, 'W7F2 (Booth 2)');
const w7f3Stats = analyzeBoothData(w7f3, 'W7F3 (Booth 3)');

// Summary
console.log('\n\n📈 Overall Summary:');
console.log('═════════════════════════════════════');
const totalIssues = 
  w7f1Stats.missingNames + w7f1Stats.missingAges + w7f1Stats.missingGenders + w7f1Stats.missingIds + w7f1Stats.duplicateIds + w7f1Stats.suspiciousNames +
  w7f2Stats.missingNames + w7f2Stats.missingAges + w7f2Stats.missingGenders + w7f2Stats.missingIds + w7f2Stats.duplicateIds + w7f2Stats.suspiciousNames +
  w7f3Stats.missingNames + w7f3Stats.missingAges + w7f3Stats.missingGenders + w7f3Stats.missingIds + w7f3Stats.duplicateIds + w7f3Stats.suspiciousNames;

if (totalIssues === 0) {
  console.log('✅ All data looks good! No issues found.');
} else {
  console.log(`⚠️  Total issues found: ${totalIssues}`);
  console.log('\nIssue breakdown:');
  console.log(`  • Missing names: ${w7f1Stats.missingNames + w7f2Stats.missingNames + w7f3Stats.missingNames}`);
  console.log(`  • Missing ages: ${w7f1Stats.missingAges + w7f2Stats.missingAges + w7f3Stats.missingAges}`);
  console.log(`  • Missing genders: ${w7f1Stats.missingGenders + w7f2Stats.missingGenders + w7f3Stats.missingGenders}`);
  console.log(`  • Missing voter IDs: ${w7f1Stats.missingIds + w7f2Stats.missingIds + w7f3Stats.missingIds}`);
  console.log(`  • Duplicate voter IDs: ${w7f1Stats.duplicateIds + w7f2Stats.duplicateIds + w7f3Stats.duplicateIds}`);
  console.log(`  • Suspicious names: ${w7f1Stats.suspiciousNames + w7f2Stats.suspiciousNames + w7f3Stats.suspiciousNames}`);
  console.log(`  • Serial gaps: ${w7f1Stats.gaps + w7f2Stats.gaps + w7f3Stats.gaps} (informational)`);
}

// Check text file availability
console.log('\n\n📄 Source Files Available:');
console.log('═════════════════════════════════════');
const textFiles = [
  { name: 'W7F1.txt', path: './pdflist/W7F1.txt' },
  { name: 'W7F2.txt', path: './pdflist/W7F2.txt' },
  { name: 'W7F3.txt', path: './pdflist/W7F3.txt' }
];

textFiles.forEach(({ name, path: filePath }) => {
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').length;
    console.log(`✓ ${name}: ${(stats.size / 1024).toFixed(1)} KB, ${lines} lines`);
  } else {
    console.log(`✗ ${name}: Not found`);
  }
});

const pdfFiles = [
  { name: 'Booth 1 PDF', path: './pdflist/BoothVoterList_A4_Ward_7_Booth_1 - converted.pdf' },
  { name: 'Booth 2 PDF', path: './pdflist/BoothVoterList_A4_Ward_7_Booth_2 - converted.pdf' },
  { name: 'Booth 3 PDF', path: './pdflist/BoothVoterList_A4_Ward_7_Booth_3 - converted.pdf' }
];

pdfFiles.forEach(({ name, path: filePath }) => {
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✓ ${name}: ${(stats.size / 1024 / 1024).toFixed(1)} MB`);
  } else {
    console.log(`✗ ${name}: Not found`);
  }
});

console.log('\n\n💡 Recommendations:');
console.log('═════════════════════════════════════');
if (totalIssues > 0) {
  console.log('1. Review voters with missing names/ages/genders');
  console.log('2. Check original PDFs for voters with suspicious names');
  console.log('3. Verify duplicate voter IDs are intentional');
  console.log('4. Consider manual verification for critical issues');
} else {
  console.log('✓ Data quality is excellent!');
  console.log('✓ All voters have complete information');
  console.log('✓ Ready for production use');
}

console.log('\n✅ Verification complete!\n');
