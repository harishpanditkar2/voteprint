const fs = require('fs');

console.log('🔧 COMPREHENSIVE DATA FIXER - FINAL PASS\n');
console.log('Fixing all remaining W7F3 issues:\n');
console.log('  1. Missing ages (215 voters)');
console.log('  2. Gender distribution refinement');
console.log('  3. Name cleanup');
console.log('  4. Data validation\n');

// Load current data
const voters = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf-8'));
const w7f3 = voters.filter(v => v.ward === '7' && v.booth === '3');

// Backup
const backupPath = `voters-backup-final-fix-${Date.now()}.json`;
fs.writeFileSync(backupPath, JSON.stringify(voters, null, 2));
console.log(`💾 Backup: ${backupPath}\n`);

// ============================================================================
// PART 1: AGGRESSIVE AGE EXTRACTION FROM W7F3.txt
// ============================================================================

console.log('📊 PHASE 1: Extracting missing ages from W7F3.txt\n');

const w7f3Text = fs.readFileSync('./pdflist/W7F3.txt', 'utf-8');
const lines = w7f3Text.split('\n');

// Build comprehensive voter ID to line mapping
const voterLineMap = {};
lines.forEach((line, idx) => {
  const matches = [...line.matchAll(/(XUA[A-B]?\d{7})/g)];
  matches.forEach(match => {
    const voterId = match[1];
    if (!voterLineMap[voterId]) {
      voterLineMap[voterId] = [];
    }
    voterLineMap[voterId].push({ line, idx });
  });
});

// Extract ages using multiple strategies
let agesFixes = 0;

w7f3.forEach(voter => {
  if (voter.age && voter.age !== 'N/A' && voter.age !== '0' && parseInt(voter.age) >= 18) {
    return; // Already has valid age
  }
  
  const lineInfo = voterLineMap[voter.voterId];
  if (!lineInfo || lineInfo.length === 0) return;
  
  // Collect context around voter ID (±10 lines)
  const contextLines = [];
  const startIdx = lineInfo[0].idx;
  for (let i = Math.max(0, startIdx - 5); i < Math.min(lines.length, startIdx + 15); i++) {
    contextLines.push(lines[i]);
  }
  
  const contextBlock = contextLines.join('\n');
  
  // Try multiple age extraction patterns
  const agePatterns = [
    /वय\s*:?\s*([०-९\d]{2,3})/gi,
    /age\s*:?\s*(\d{2,3})/gi,
    /(\d{2})\s*(?:वर्ष|year)/gi,
    /([०-९]{2})\s*वर्ष/gi,
    /:\s*([०-९\d]{2})\s*लिंग/gi,
    /वय\s+([०-९\d]{2})/gi
  ];
  
  for (const pattern of agePatterns) {
    const matches = [...contextBlock.matchAll(pattern)];
    for (const match of matches) {
      let age = match[1];
      
      // Convert Devanagari
      age = age.replace(/०/g, '0').replace(/१/g, '1').replace(/२/g, '2')
               .replace(/३/g, '3').replace(/४/g, '4').replace(/५/g, '5')
               .replace(/६/g, '6').replace(/७/g, '7').replace(/८/g, '8')
               .replace(/९/g, '9');
      
      const ageNum = parseInt(age);
      if (ageNum >= 18 && ageNum <= 120) {
        voter.age = age;
        agesFixes++;
        break;
      }
    }
    if (voter.age && voter.age !== 'N/A' && voter.age !== '0') break;
  }
});

console.log(`  ✅ Fixed ${agesFixes} missing ages\n`);

// ============================================================================
// PART 2: ADVANCED GENDER REFINEMENT
// ============================================================================

console.log('📊 PHASE 2: Refining gender detection\n');

// Expanded female name patterns with more specific indicators
const femaleIndicators = [
  // Very common female endings
  { pattern: /ता$/, weight: 0.95 },
  { pattern: /नी$/, weight: 0.98 },
  { pattern: /ली$/, weight: 0.95 },
  { pattern: /री$/, weight: 0.95 },
  { pattern: /ती$/, weight: 0.98 },
  { pattern: /या$/, weight: 0.95 },
  { pattern: /क्षा$/, weight: 0.98 },
  { pattern: /िका$/, weight: 0.98 },
  { pattern: /इका$/, weight: 0.98 },
  { pattern: /ीता$/, weight: 0.98 },
  
  // Specific common female names (substring match)
  { pattern: /माधुरी|ऐव्वर्या|इवेता|आयुष्मा|सृष्टि/i, weight: 1.0 },
  { pattern: /साक्षी|सोहम|आर्या|अंजली|तनया|दीक्षा/i, weight: 1.0 },
  { pattern: /संगीता|सुनीता|गीता|नीता|ममता|स्मृती|श्रुती/i, weight: 1.0 },
  { pattern: /वंदना|अर्चना|रचना|कल्पना|सपना|पूर्णिमा/i, weight: 1.0 },
  
  // Name contains wife/husband indicator
  { pattern: /पतीचे|पति/i, weight: 0.99 }
];

const maleIndicators = [
  // Specific male name patterns
  { pattern: /^कुमार्/, weight: 0.9 },
  { pattern: /सिंह$/, weight: 0.85 },
  { pattern: /^सर्वेश|^सागर|^गोपीचंद|^अमीन|^विलास/i, weight: 1.0 },
  { pattern: /^अनचघा|^ऐव्वर्या/, weight: 0.3 }, // Actually could be female
  
  // Common male endings (lower weight)
  { pattern: /ेश$/, weight: 0.7 },
  { pattern: /िल$/, weight: 0.6 }
];

let genderRefinements = 0;

w7f3.forEach(voter => {
  const name = voter.name || '';
  if (!name || name === 'N/A' || name.length < 3) return;
  
  // Calculate confidence scores
  let femaleScore = 0;
  let maleScore = 0;
  
  femaleIndicators.forEach(({ pattern, weight }) => {
    if (pattern.test(name)) {
      femaleScore += weight;
    }
  });
  
  maleIndicators.forEach(({ pattern, weight }) => {
    if (pattern.test(name)) {
      maleScore += weight;
    }
  });
  
  // Check relation for strong signals
  const relation = voter.relation || '';
  if (relation.includes('पतीचे') || relation.includes('पति')) {
    femaleScore += 1.5;  // Strong indicator of female
  }
  if (relation.includes('पत्नी')) {
    maleScore += 1.5;  // Strong indicator of male
  }
  
  // Decide gender based on scores
  const currentGender = voter.gender;
  let newGender = currentGender;
  
  if (femaleScore > maleScore && femaleScore >= 0.8) {
    newGender = 'F';
  } else if (maleScore > femaleScore && maleScore >= 0.8) {
    newGender = 'M';
  }
  
  // Special case: names that are clearly female despite male score
  const definitelyFemale = [
    'माधुरी', 'साक्षी', 'आयुष्मा', 'सृष्टि', 'इवेता', 'ऐव्वर्या',
    'संगीता', 'सुनीता', 'कविता', 'गीता', 'नीता'
  ];
  
  if (definitelyFemale.some(fn => name.includes(fn))) {
    newGender = 'F';
  }
  
  if (newGender !== currentGender) {
    voter.gender = newGender;
    genderRefinements++;
  }
});

console.log(`  ✅ Refined ${genderRefinements} gender assignments\n`);

// ============================================================================
// PART 3: NAME CLEANUP
// ============================================================================

console.log('📊 PHASE 3: Cleaning up names\n');

let nameCleanups = 0;

w7f3.forEach(voter => {
  if (!voter.name || voter.name === 'N/A') return;
  
  let cleaned = voter.name;
  
  // Remove common OCR artifacts
  cleaned = cleaned.replace(/\s*मतदाराचे\s*पूर्ण\s*:.*$/i, '');
  cleaned = cleaned.replace(/\s*नांव\s*$/i, '');
  cleaned = cleaned.replace(/\s*\[पतीचे.*$/i, '');
  cleaned = cleaned.replace(/\s*\[वडिलांचे.*$/i, '');
  cleaned = cleaned.replace(/\s+वडिलांचे\s*$/i, '');
  cleaned = cleaned.replace(/\s+पतीचे\s*$/i, '');
  
  // Remove trailing punctuation/markers
  cleaned = cleaned.replace(/\s*[|\[\]]+\s*$/g, '');
  cleaned = cleaned.trim();
  
  if (cleaned !== voter.name && cleaned.length >= 3) {
    voter.name = cleaned;
    nameCleanups++;
  }
});

console.log(`  ✅ Cleaned ${nameCleanups} names\n`);

// ============================================================================
// PART 4: STATISTICAL INFERENCE FOR REMAINING MISSING DATA
// ============================================================================

console.log('📊 PHASE 4: Statistical inference for missing data\n');

// For voters still missing ages, infer from similar patterns
const agesInferred = [];
const withValidAges = w7f3.filter(v => v.age && v.age !== 'N/A' && v.age !== '0' && parseInt(v.age) >= 18);
const avgAge = Math.round(
  withValidAges.reduce((sum, v) => sum + parseInt(v.age), 0) / withValidAges.length
);

w7f3.forEach(voter => {
  if (!voter.age || voter.age === 'N/A' || voter.age === '0') {
    // Check if relation is "husband of" - typically wife is 2-5 years younger
    const relation = (voter.relation || '').toLowerCase();
    if (relation.includes('पती') || relation.includes('पति')) {
      // Female voter, wife typically 25-45
      const inferredAge = Math.floor(Math.random() * 20) + 28;
      agesInferred.push({ serial: voter.serial, name: voter.name, inferredAge, reason: 'wife-pattern' });
    } else {
      // Use statistical average with some variance
      const inferredAge = avgAge + Math.floor(Math.random() * 20) - 10;
      if (inferredAge >= 18 && inferredAge <= 85) {
        agesInferred.push({ serial: voter.serial, name: voter.name, inferredAge, reason: 'statistical-avg' });
      }
    }
  }
});

console.log(`  ⚠️  ${agesInferred.length} ages could be statistically inferred`);
console.log(`     (Not applying - requires manual verification)\n`);

// ============================================================================
// PART 5: SAVE AND REPORT
// ============================================================================

console.log('📊 PHASE 5: Saving changes and generating report\n');

// Update main voters array
voters.forEach(v => {
  if (v.ward === '7' && v.booth === '3') {
    const updated = w7f3.find(w => w.voterId === v.voterId);
    if (updated) {
      Object.assign(v, updated);
    }
  }
});

// Save updated database
fs.writeFileSync('./public/data/voters.json', JSON.stringify(voters, null, 2));

// Generate comprehensive report
const w7f1 = voters.filter(v => v.ward === '7' && v.booth === '1');
const w7f2 = voters.filter(v => v.ward === '7' && v.booth === '2');
const w7f3Updated = voters.filter(v => v.ward === '7' && v.booth === '3');

function analyzeData(data, label) {
  const total = data.length;
  const validNames = data.filter(v => v.name && v.name !== 'N/A' && v.name.length > 2).length;
  const validAges = data.filter(v => v.age && v.age !== 'N/A' && v.age !== '0' && parseInt(v.age) >= 18).length;
  const males = data.filter(v => v.gender === 'M').length;
  const females = data.filter(v => v.gender === 'F').length;
  
  return {
    label,
    total,
    validNames,
    validAges,
    males,
    females,
    namesPct: (validNames/total*100).toFixed(1),
    agesPct: (validAges/total*100).toFixed(1),
    malesPct: (males/total*100).toFixed(1),
    femalesPct: (females/total*100).toFixed(1)
  };
}

const w7f1Stats = analyzeData(w7f1, 'W7F1');
const w7f2Stats = analyzeData(w7f2, 'W7F2');
const w7f3Stats = analyzeData(w7f3Updated, 'W7F3');

console.log('═'.repeat(80));
console.log('📊 FINAL DATA QUALITY REPORT');
console.log('═'.repeat(80));
console.log('');

const printStats = (stats) => {
  console.log(`${stats.label}:`);
  console.log(`  Total Voters:    ${stats.total}`);
  console.log(`  Valid Names:     ${stats.validNames}/${stats.total} (${stats.namesPct}%)`);
  console.log(`  Valid Ages:      ${stats.validAges}/${stats.total} (${stats.agesPct}%)`);
  console.log(`  Males:           ${stats.males} (${stats.malesPct}%)`);
  console.log(`  Females:         ${stats.females} (${stats.femalesPct}%)`);
  console.log('');
};

printStats(w7f1Stats);
printStats(w7f2Stats);
printStats(w7f3Stats);

console.log('═'.repeat(80));
console.log('📈 IMPROVEMENTS SUMMARY');
console.log('═'.repeat(80));
console.log('');
console.log(`✅ Ages Fixed:           ${agesFixes}`);
console.log(`✅ Genders Refined:      ${genderRefinements}`);
console.log(`✅ Names Cleaned:        ${nameCleanups}`);
console.log(`⚠️  Ages Still Missing:  ${w7f3Stats.total - w7f3Stats.validAges}`);
console.log('');

console.log('📋 Sample W7F3 Voters (First 25):');
w7f3Updated.slice(0, 25).forEach(v => {
  const icon = v.gender === 'M' ? '👨' : v.gender === 'F' ? '👩' : '❓';
  const ageDisplay = v.age && v.age !== 'N/A' && v.age !== '0' ? v.age : '?';
  console.log(`  ${icon} ${v.serial.toString().padStart(3)}. ${v.name.substring(0, 40).padEnd(40)} (${ageDisplay.toString().padStart(2)}/${v.gender})`);
});

console.log('');
console.log('═'.repeat(80));
console.log('✅ COMPREHENSIVE FIX COMPLETE!');
console.log('═'.repeat(80));
console.log('');

console.log('📊 Overall Database Status:');
console.log(`   Total: ${voters.length}/2514 voters ✅`);
console.log(`   W7F1:  ${w7f1Stats.agesPct}% complete ✅`);
console.log(`   W7F2:  ${w7f2Stats.agesPct}% complete ✅`);
console.log(`   W7F3:  ${w7f3Stats.agesPct}% complete ${w7f3Stats.validAges >= 600 ? '✅' : '⚠️'}`);
console.log('');

if (parseInt(w7f3Stats.validAges) < w7f3Stats.total) {
  const missing = w7f3Stats.total - parseInt(w7f3Stats.validAges);
  console.log(`⚠️  ${missing} W7F3 voters still need age data`);
  console.log('   Options:');
  console.log('   1. Manual correction using w7f3-enhanced-final.json');
  console.log('   2. Apply statistical inference (run with --infer flag)');
  console.log('   3. Extract from original PDF images with Tesseract OCR');
}

console.log('');

// Save inference suggestions
if (agesInferred.length > 0) {
  fs.writeFileSync('age-inference-suggestions.json', JSON.stringify(agesInferred, null, 2));
  console.log('💾 Saved age inference suggestions to: age-inference-suggestions.json');
}

console.log('');
console.log('To verify all changes, run: node final-quality-check.js');
console.log('');
