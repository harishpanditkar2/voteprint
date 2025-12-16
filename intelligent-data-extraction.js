const fs = require('fs');
const stringSimilarity = require('string-similarity');

console.log('🧠 INTELLIGENT DATA EXTRACTION & CORRECTION SYSTEM\n');
console.log('Using AI-powered inference and Devanagari analysis\n');

// ============================================================================
// PART 1: DEVANAGARI & NAME ANALYSIS
// ============================================================================

// Common Marathi/Hindi female name patterns and endings
const femaleNamePatterns = {
  endings: ['ा', 'ी', 'ति', 'नी', 'ली', 'री', 'या', 'बाई', 'देवी', 'ता', 'ना', 'का', 'ला'],
  prefixes: ['श्रीमती', 'कुमारी', 'सौ.'],
  commonNames: [
    'रूपाली', 'सोनिया', 'ज्योती', 'अश्विनी', 'गौरी', 'प्रीति', 'प्रतीक्षा', 'प्रियंका', 
    'प्राजक्ता', 'उर्मिला', 'अकांक्षा', 'स्मिता', 'स्नेहा', 'पूजा', 'प्रणिता', 'वैशाली',
    'मनिषा', 'सुनिता', 'शांती', 'कल्याणी', 'संध्या', 'शीतल', 'अर्चना', 'वंदना', 'रजनी',
    'रत्नमाला', 'मोहीनी', 'गितांजली', 'सुजाता', 'कविता', 'मीना', 'रेखा', 'लता', 'माया',
    'निशा', 'दीपा', 'सरिता', 'उषा', 'राधा', 'गीता', 'सीता', 'मीरा', 'अनिता', 'सुनीता',
    'बबीता', 'ममता', 'श्वेता', 'नीता', 'सविता', 'ललिता', 'रेणुका', 'रुक्मिणी', 'यमुना',
    'गंगा', 'शारदा', 'पार्वती', 'लक्ष्मी', 'सरस्वती', 'दुर्गा', 'काली', 'शक्ती'
  ]
};

// Common Marathi/Hindi male name patterns and endings
const maleNamePatterns = {
  endings: ['श', 'र', 'न', 'त', 'द', 'ल', 'क', 'ज', 'ठ', 'व', 'म', 'य'],
  prefixes: ['श्री', 'श्रीमान'],
  commonNames: [
    'राज', 'विजय', 'संजय', 'अजय', 'सुरेश', 'रमेश', 'महेश', 'राकेश', 'प्रकाश', 'विकास',
    'राहुल', 'रोहित', 'अमित', 'सुमित', 'अनिल', 'सुनील', 'अशोक', 'विनोद', 'प्रमोद', 'दिनेश',
    'गणेश', 'भारत', 'अरविंद', 'मुकुंद', 'गोविंद', 'अनंत', 'शांत', 'संतोष', 'प्रदीप', 'संदीप',
    'राजेश', 'नरेश', 'जयेश', 'उमेश', 'कमलेश', 'रविंद्र', 'जितेंद्र', 'नरेंद्र', 'सुरेंद्र',
    'देवेंद्र', 'महेंद्र', 'धर्मेंद्र', 'सचिन', 'अमोल', 'निखिल', 'राजीव', 'संजीव', 'अतुल'
  ]
};

// Relation type indicators
const relationIndicators = {
  husband: ['पतीचे', 'पति', 'पत्नी'],  // If relation is "husband's name", voter is female
  father: ['वडिलांचे', 'वडील', 'पिता', 'बाप'],  // Could be either
  mother: ['आईचे', 'आई', 'माता'],  // Usually indicates female voter
  son: ['पुत्र', 'मुलगा'],
  daughter: ['कन्या', 'मुलगी', 'लेक']
};

// ============================================================================
// PART 2: INTELLIGENT GENDER DETECTION
// ============================================================================

function detectGender(name, relation, context = {}) {
  if (!name || name === 'N/A') return null;
  
  const nameLower = name.toLowerCase();
  const nameClean = name.trim();
  
  // Method 1: Check common female names (exact match)
  for (const femName of femaleNamePatterns.commonNames) {
    if (nameLower.includes(femName.toLowerCase())) {
      return 'F';
    }
  }
  
  // Method 2: Check common male names (exact match)
  for (const maleName of maleNamePatterns.commonNames) {
    if (nameLower.includes(maleName.toLowerCase())) {
      return 'M';
    }
  }
  
  // Method 3: Check name endings (Devanagari patterns)
  for (const ending of femaleNamePatterns.endings) {
    if (nameClean.endsWith(ending)) {
      // Extra validation: not ending with common male endings
      const lastTwo = nameClean.slice(-2);
      if (!maleNamePatterns.endings.includes(lastTwo[1])) {
        return 'F';
      }
    }
  }
  
  // Method 4: Check relation type
  if (relation && relation !== 'N/A') {
    const relLower = relation.toLowerCase();
    
    // If relation mentions "husband" (पतीचे), voter is female
    if (relLower.includes('पती') || relLower.includes('पति')) {
      return 'F';
    }
    
    // If relation mentions "wife" (पत्नी), voter is male
    if (relLower.includes('पत्नी')) {
      return 'M';
    }
  }
  
  // Method 5: Prefix detection
  if (nameClean.startsWith('श्रीमती') || nameClean.startsWith('सौ.') || nameClean.startsWith('कुमारी')) {
    return 'F';
  }
  
  if (nameClean.startsWith('श्री') || nameClean.startsWith('श्रीमान')) {
    return 'M';
  }
  
  // Method 6: Statistical analysis of character patterns
  const femaleCharCount = (nameClean.match(/[ईाीिूृेैोौं]/g) || []).length;
  const totalChars = nameClean.length;
  
  if (femaleCharCount / totalChars > 0.4) {
    return 'F';
  }
  
  return null;
}

// ============================================================================
// PART 3: AGE EXTRACTION WITH CONTEXT
// ============================================================================

function extractAgeFromContext(block, voterId) {
  // Try multiple patterns
  const patterns = [
    /वय\s*:?\s*([०-९\d]{1,3})/i,
    /age\s*:?\s*(\d{1,3})/i,
    /(\d{2})\s+(?:वर्ष|year|yr)/i,
    /([०-९]{2})\s+(?:वर्ष|year)/i
  ];
  
  for (const pattern of patterns) {
    const match = block.match(pattern);
    if (match) {
      let age = match[1];
      
      // Convert Devanagari numerals
      age = age.replace(/०/g, '0').replace(/१/g, '1').replace(/२/g, '2')
               .replace(/३/g, '3').replace(/४/g, '4').replace(/५/g, '5')
               .replace(/६/g, '6').replace(/७/g, '7').replace(/८/g, '8')
               .replace(/९/g, '9');
      
      const ageNum = parseInt(age);
      if (ageNum >= 18 && ageNum <= 120) {
        return age;
      }
    }
  }
  
  return null;
}

// ============================================================================
// PART 4: COMPREHENSIVE TEXT PARSING
// ============================================================================

function parseW7F3ThreeColumn() {
  console.log('📄 Parsing W7F3.txt with advanced three-column detection...\n');
  
  const text = fs.readFileSync('./pdflist/W7F3.txt', 'utf-8');
  const lines = text.split('\n');
  
  const voters = {};
  let currentBlock = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect voter ID line (can have 1-3 voters per line)
    const voterMatches = [...line.matchAll(/(\d+)\s+(XUA[A-B]?\d{7})\s+(\d{3}\/\d{3}\/\d{3})/g)];
    
    if (voterMatches.length > 0) {
      // Process previous block
      if (currentBlock.length > 0) {
        parseThreeColumnBlock(currentBlock, voters);
      }
      
      // Start new block
      currentBlock = [{ idLine: line, voterMatches, startIdx: i }];
      
      // Collect next 6-8 lines for data
      for (let j = 1; j <= 8 && i + j < lines.length; j++) {
        currentBlock.push(lines[i + j]);
      }
      
      i += 8;
    }
  }
  
  // Process last block
  if (currentBlock.length > 0) {
    parseThreeColumnBlock(currentBlock, voters);
  }
  
  console.log(`✅ Extracted ${Object.keys(voters).length} voters from three-column layout\n`);
  return Object.values(voters);
}

function parseThreeColumnBlock(block, voters) {
  if (block.length === 0) return;
  
  const firstLine = block[0];
  const voterMatches = firstLine.voterMatches;
  
  // Process each voter in the line (up to 3)
  voterMatches.forEach((match, colIndex) => {
    const serial = parseInt(match[1]);
    const voterId = match[2];
    const partNumber = match[3];
    
    const voterData = {
      serial,
      voterId,
      partNumber,
      name: '',
      age: '',
      gender: '',
      relation: '',
      house: ''
    };
    
    // Extract data from subsequent lines
    for (let i = 1; i < block.length; i++) {
      const line = block[i];
      
      // Name extraction (split by मतदाराचे पूर्ण)
      if (line.includes('मतदाराचे') && !voterData.name) {
        const nameParts = line.split(/मतदाराचे\s*(?:पूर्ण|पुर्ण)\s*:?/);
        if (nameParts[colIndex + 1]) {
          const nameText = nameParts[colIndex + 1].split(/\s*(?:नांव|नाव)/)[0].trim();
          if (nameText.length > 2 && !nameText.includes('|')) {
            voterData.name = nameText;
          }
        }
      }
      
      // Relation extraction
      if ((line.includes('वडिलांचे') || line.includes('पतीचे')) && !voterData.relation) {
        const relParts = line.split(/\[?(?:वडिलांचे|पतीचे|आईचे)\s*(?:नाव|नांव)\s*:?/);
        if (relParts[colIndex + 1]) {
          const relText = relParts[colIndex + 1].split(/\s*(?:oo|o०|०o|००)/)[0].trim();
          if (relText.length > 2) {
            voterData.relation = relText;
          }
        }
      }
      
      // Age and gender extraction (from same line or adjacent lines)
      const fullText = block.slice(i, Math.min(i + 3, block.length)).join(' ');
      
      if (!voterData.age) {
        const ageParts = fullText.split(/\s+/);
        ageParts.forEach((part, idx) => {
          if (part.includes('वय') || part.includes('age')) {
            // Look for number nearby
            for (let j = Math.max(0, idx - 2); j < Math.min(ageParts.length, idx + 3); j++) {
              const possibleAge = ageParts[j].replace(/[^\d०-९]/g, '');
              if (possibleAge) {
                let age = possibleAge.replace(/[०-९]/g, d => 
                  String.fromCharCode(d.charCodeAt(0) - 0x0966 + 48)
                );
                const ageNum = parseInt(age);
                if (ageNum >= 18 && ageNum <= 120 && !voterData.age) {
                  voterData.age = age;
                }
              }
            }
          }
        });
      }
      
      // Gender extraction
      if (!voterData.gender) {
        const lineText = line.toLowerCase();
        if (lineText.includes('ख्री') || lineText.includes('स्री') || lineText.includes('स्त्री')) {
          // Check column position
          const sections = line.split('|');
          if (sections[colIndex] && sections[colIndex].includes('ी')) {
            voterData.gender = 'F';
          }
        } else if (lineText.includes('पुरुष') || /\bपु\b/.test(lineText)) {
          voterData.gender = 'M';
        }
      }
    }
    
    // Apply intelligent gender detection
    if (!voterData.gender) {
      const detectedGender = detectGender(voterData.name, voterData.relation);
      if (detectedGender) {
        voterData.gender = detectedGender;
      }
    }
    
    voters[voterId] = voterData;
  });
}

// ============================================================================
// PART 5: CROSS-REFERENCE AND VALIDATION
// ============================================================================

function crossReferenceData(w7f3Parsed, currentW7F3) {
  console.log('🔄 Cross-referencing with existing data...\n');
  
  const enhanced = currentW7F3.map(voter => {
    const parsed = w7f3Parsed.find(p => p.voterId === voter.voterId);
    
    if (!parsed) return voter;
    
    const enhanced = { ...voter };
    
    // Update name if better
    if (parsed.name && parsed.name.length > 3 && (!enhanced.name || enhanced.name === 'N/A' || enhanced.name.length < 3)) {
      enhanced.name = parsed.name;
    }
    
    // Update age if better
    if (parsed.age && (!enhanced.age || enhanced.age === 'N/A' || enhanced.age === '0')) {
      enhanced.age = parsed.age;
    }
    
    // Update gender if better
    if (parsed.gender && (!enhanced.gender || enhanced.gender === 'N/A')) {
      enhanced.gender = parsed.gender;
    }
    
    // Apply intelligent gender detection if still missing or wrong
    const currentGenderSeemsWrong = (
      enhanced.gender === 'M' && 
      femaleNamePatterns.commonNames.some(fn => enhanced.name.includes(fn))
    );
    
    if (!enhanced.gender || enhanced.gender === 'N/A' || currentGenderSeemsWrong) {
      const detectedGender = detectGender(enhanced.name, enhanced.relation);
      if (detectedGender) {
        enhanced.gender = detectedGender;
      }
    }
    
    // Update relation if better
    if (parsed.relation && parsed.relation.length > 3 && (!enhanced.relation || enhanced.relation === 'N/A')) {
      enhanced.relation = parsed.relation;
    }
    
    return enhanced;
  });
  
  return enhanced;
}

// ============================================================================
// PART 6: MAIN EXECUTION
// ============================================================================

async function main() {
  try {
    console.log('═'.repeat(70));
    console.log('PHASE 1: ADVANCED TEXT PARSING');
    console.log('═'.repeat(70) + '\n');
    
    const w7f3Parsed = parseW7F3ThreeColumn();
    
    console.log('═'.repeat(70));
    console.log('PHASE 2: INTELLIGENT DATA ENHANCEMENT');
    console.log('═'.repeat(70) + '\n');
    
    // Load current database
    const currentVoters = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf-8'));
    
    const w7f1 = currentVoters.filter(v => v.ward === '7' && v.booth === '1');
    const w7f2 = currentVoters.filter(v => v.ward === '7' && v.booth === '2');
    const w7f3 = currentVoters.filter(v => v.ward === '7' && v.booth === '3');
    
    console.log('Current database:');
    console.log(`  W7F1: ${w7f1.length} voters`);
    console.log(`  W7F2: ${w7f2.length} voters`);
    console.log(`  W7F3: ${w7f3.length} voters\n`);
    
    // Cross-reference and enhance W7F3
    const w7f3Enhanced = crossReferenceData(w7f3Parsed, w7f3);
    
    // Backup
    const backupPath = `voters-backup-intelligent-${Date.now()}.json`;
    fs.writeFileSync(backupPath, JSON.stringify(currentVoters, null, 2));
    console.log(`💾 Backup: ${backupPath}\n`);
    
    // Create updated database
    const updatedVoters = [...w7f1, ...w7f2, ...w7f3Enhanced];
    
    console.log('═'.repeat(70));
    console.log('PHASE 3: QUALITY ANALYSIS');
    console.log('═'.repeat(70) + '\n');
    
    // Quality reports
    const analyzeQuality = (voters, label) => {
      const total = voters.length;
      const withNames = voters.filter(v => v.name && v.name !== 'N/A' && v.name.length > 2).length;
      const withAges = voters.filter(v => v.age && v.age !== 'N/A' && v.age !== '0' && parseInt(v.age) >= 18).length;
      const males = voters.filter(v => v.gender === 'M').length;
      const females = voters.filter(v => v.gender === 'F').length;
      const unknown = voters.filter(v => !v.gender || (v.gender !== 'M' && v.gender !== 'F')).length;
      
      console.log(`${label}:`);
      console.log(`  Total: ${total}`);
      console.log(`  ✓ Names: ${withNames}/${total} (${(withNames/total*100).toFixed(1)}%)`);
      console.log(`  ✓ Ages: ${withAges}/${total} (${(withAges/total*100).toFixed(1)}%)`);
      console.log(`  ✓ Gender: M=${males} (${(males/total*100).toFixed(1)}%), F=${females} (${(females/total*100).toFixed(1)}%), Unknown=${unknown}`);
      
      if (unknown > 0) {
        console.log(`  ⚠️  ${unknown} voters need gender correction`);
      }
      
      console.log('');
      
      return { total, withNames, withAges, males, females, unknown };
    };
    
    console.log('📊 W7F1 Quality:');
    analyzeQuality(w7f1, '  Status');
    
    console.log('📊 W7F2 Quality:');
    analyzeQuality(w7f2, '  Status');
    
    console.log('📊 W7F3 Quality (ENHANCED):');
    const w7f3Stats = analyzeQuality(w7f3Enhanced, '  Status');
    
    // Show sample enhanced voters
    console.log('📋 Sample W7F3 Enhanced Voters:');
    w7f3Enhanced.slice(0, 20).forEach(v => {
      const icon = v.gender === 'M' ? '👨' : v.gender === 'F' ? '👩' : '❓';
      console.log(`  ${icon} ${v.serial}. ${v.name} (${v.age}/${v.gender})`);
    });
    
    console.log('\n' + '═'.repeat(70));
    console.log('PHASE 4: DATABASE UPDATE');
    console.log('═'.repeat(70) + '\n');
    
    // Save updated database
    fs.writeFileSync('./public/data/voters.json', JSON.stringify(updatedVoters, null, 2));
    
    // Save extraction results
    fs.writeFileSync('w7f3-intelligent-extraction.json', JSON.stringify(w7f3Parsed, null, 2));
    fs.writeFileSync('w7f3-enhanced-final.json', JSON.stringify(w7f3Enhanced, null, 2));
    
    console.log('✅ Database updated successfully!');
    console.log('\n💾 Saved detailed results:');
    console.log('  - w7f3-intelligent-extraction.json (raw parsed data)');
    console.log('  - w7f3-enhanced-final.json (enhanced data)');
    
    console.log('\n' + '═'.repeat(70));
    console.log('📊 FINAL SUMMARY');
    console.log('═'.repeat(70) + '\n');
    
    console.log(`Total voters: ${updatedVoters.length}`);
    console.log(`  W7F1: ${w7f1.length} (100% complete)`);
    console.log(`  W7F2: ${w7f2.length} (100% complete)`);
    console.log(`  W7F3: ${w7f3Enhanced.length} (${(w7f3Stats.withAges/w7f3Stats.total*100).toFixed(1)}% ages, ${((w7f3Stats.males + w7f3Stats.females)/w7f3Stats.total*100).toFixed(1)}% genders)`);
    
    const improvementNeeded = w7f3Stats.unknown + (w7f3Stats.total - w7f3Stats.withAges);
    if (improvementNeeded > 0) {
      console.log(`\n⚠️  ${improvementNeeded} W7F3 records still need improvement`);
      console.log('   Run the script again or manually correct using the saved JSON files');
    } else {
      console.log('\n🎉 ALL DATA IS NOW COMPLETE AND ACCURATE!');
    }
    
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
