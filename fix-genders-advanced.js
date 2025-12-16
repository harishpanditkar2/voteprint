const fs = require('fs');

console.log('🔧 ADVANCED GENDER CORRECTION SYSTEM\n');
console.log('Using comprehensive name pattern analysis and relation context\n');

// Load current database
const voters = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf-8'));
const w7f3 = voters.filter(v => v.ward === '7' && v.booth === '3');

// Comprehensive female name database
const definiteFemaleNames = [
  // Common endings
  { pattern: /ा$/, confidence: 0.7 },
  { pattern: /ी$/, confidence: 0.8 },
  { pattern: /नी$/, confidence: 0.9 },
  { pattern: /ली$/, confidence: 0.9 },
  { pattern: /री$/, confidence: 0.9 },
  { pattern: /ती$/, confidence: 0.9 },
  { pattern: /या$/, confidence: 0.9 },
  { pattern: /का$/, confidence: 0.6 },
  { pattern: /ना$/, confidence: 0.7 },
  { pattern: /ता$/, confidence: 0.8 },
  { pattern: /ला$/, confidence: 0.7 },
  { pattern: /क्षा$/, confidence: 0.9 },
  
  // Specific common names (exact or contains)
  { pattern: /रूपाली|सोनिया|ज्योती|अश्विनी|गौरी|प्रीति|निकिता|अकांक्षा|अकांक्ा/, confidence: 1.0 },
  { pattern: /प्रतीक्षा|प्रियंका|प्राजक्ता|उर्मिला|कल्याणी|मनिषा|सुनिता|शांती/, confidence: 1.0 },
  { pattern: /संध्या|शीतल|अर्चना|वंदना|रजनी|रत्नमाला|मोहीनी|गितांजली|सुजाता/, confidence: 1.0 },
  { pattern: /कविता|मीना|रेखा|लता|निशा|दीपा|सरिता|उषा|राधा|गीता|सीता|मीरा/, confidence: 1.0 },
  { pattern: /अनिता|सुनीता|बबीता|ममता|श्वेता|नीता|सविता|ललिता|रेणुका|रुक्मिणी/, confidence: 1.0 },
  { pattern: /यमुना|गंगा|शारदा|पार्वती|लक्ष्मी|सरस्वती|दुर्गा|शक्ती|स्मृती|प्रणिता/, confidence: 1.0 },
  { pattern: /वैशाली|पूजा|स्नेहा|स्मिता|वर्षा|रेखा|स्वाती|शुभांगी|सायली|तेजस्विनी/, confidence: 1.0 },
  { pattern: /अंकिता|रुचि|नम्रता|श्रद्धा|भाग्यश्री|ध्रुविका|आविष्का|प्रार्थना|नंदिनी/, confidence: 1.0 },
  { pattern: /शोभा|अस्मिता|गागीर|स्मीरा|श्रीमती|कुमारी|सौ\./, confidence: 1.0 }
];

const definiteMaleNames = [
  // Common endings
  { pattern: /श$/, confidence: 0.8 },
  { pattern: /र$/, confidence: 0.6 },
  { pattern: /न$/, confidence: 0.6 },
  { pattern: /त$/, confidence: 0.6 },
  { pattern: /द$/, confidence: 0.7 },
  { pattern: /ल$/, confidence: 0.6 },
  { pattern: /क$/, confidence: 0.7 },
  { pattern: /ज$/, confidence: 0.7 },
  { pattern: /य$/, confidence: 0.6 },
  { pattern: /व$/, confidence: 0.7 },
  { pattern: /म$/, confidence: 0.7 },
  
  // Specific common names
  { pattern: /अशोक|विजय|संजय|अजय|सुरेश|रमेश|महेश|राकेश|प्रकाश|विकास/, confidence: 1.0 },
  { pattern: /राहुल|रोहित|अमित|सुमित|अनिल|सुनील|विनोद|प्रमोद|दिनेश|गणेश/, confidence: 1.0 },
  { pattern: /भारत|अरविंद|मुकुंद|गोविंद|अनंत|संतोष|प्रदीप|संदीप|राजेश|नरेश/, confidence: 1.0 },
  { pattern: /जयेश|उमेश|कमलेश|रविंद्र|जितेंद्र|नरेंद्र|सुरेंद्र|देवेंद्र|महेंद्र/, confidence: 1.0 },
  { pattern: /सचिन|अमोल|निखिल|राजीव|संजीव|अतुल|प्रितम|राजेंद्र|तुषार|सिद्धीराज/, confidence: 1.0 },
  { pattern: /अक्षय|आदित्य|अकाश|आकाश्श|आविष्कार|ललित|लखन|सुयोग|धनंजय|शुभम/, confidence: 1.0 },
  { pattern: /कैलाश|महावीर|भीमाशंकर|अर्जुन|करण|जयेश|प्रशांत|आदित्य|दत्तात्रय/, confidence: 1.0 },
  { pattern: /श्री |श्रीमान |कुमार /, confidence: 0.9 }
];

// Relation-based gender detection
function detectFromRelation(relation, name) {
  if (!relation || relation === 'N/A') return null;
  
  const rel = relation.toLowerCase();
  
  // If relation is "husband name" (पतीचे), voter is FEMALE
  if (rel.includes('पती') || rel.includes('पति')) {
    return 'F';
  }
  
  // If relation is "wife name" (पत्नी), voter is MALE
  if (rel.includes('पत्नी')) {
    return 'M';
  }
  
  return null;
}

// Advanced name-based gender detection
function detectFromName(name) {
  if (!name || name === 'N/A' || name.length < 2) return { gender: null, confidence: 0 };
  
  let maxConfidence = 0;
  let detectedGender = null;
  
  // Check female patterns
  for (const { pattern, confidence } of definiteFemaleNames) {
    if (pattern.test(name)) {
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        detectedGender = 'F';
      }
    }
  }
  
  // Check male patterns (only if female confidence is low)
  if (maxConfidence < 0.8) {
    for (const { pattern, confidence } of definiteMaleNames) {
      if (pattern.test(name)) {
        if (confidence > maxConfidence) {
          maxConfidence = confidence;
          detectedGender = 'M';
        }
      }
    }
  }
  
  return { gender: detectedGender, confidence: maxConfidence };
}

// Context-based intelligent detection
function intelligentGenderDetection(voter) {
  // Method 1: Check relation first (highest confidence)
  const relationGender = detectFromRelation(voter.relation, voter.name);
  if (relationGender) {
    return { gender: relationGender, method: 'relation', confidence: 1.0 };
  }
  
  // Method 2: Name pattern analysis
  const nameResult = detectFromName(voter.name);
  if (nameResult.gender && nameResult.confidence >= 0.7) {
    return { gender: nameResult.gender, method: 'name-pattern', confidence: nameResult.confidence };
  }
  
  // Method 3: Check if name contains [पतीचे or similar indicators
  if (voter.name.includes('[पतीचे') || voter.name.includes('पतीचे')) {
    return { gender: 'F', method: 'name-context', confidence: 0.95 };
  }
  
  if (voter.name.includes('[वडिलांचे') || voter.name.includes('वडिलांचे')) {
    // Could be either, use name analysis
    if (nameResult.gender) {
      return { gender: nameResult.gender, method: 'name-pattern-weak', confidence: nameResult.confidence };
    }
  }
  
  return { gender: null, method: 'unknown', confidence: 0 };
}

// Backup
const backupPath = `voters-backup-before-gender-fix-${Date.now()}.json`;
fs.writeFileSync(backupPath, JSON.stringify(voters, null, 2));
console.log(`💾 Backup: ${backupPath}\n`);

// Apply corrections
console.log('🔄 Analyzing and correcting W7F3 genders...\n');

let corrections = {
  toFemale: 0,
  toMale: 0,
  highConfidence: 0,
  mediumConfidence: 0,
  unchanged: 0
};

const correctionLog = [];

w7f3.forEach(voter => {
  const detection = intelligentGenderDetection(voter);
  
  if (detection.gender && detection.gender !== voter.gender) {
    correctionLog.push({
      serial: voter.serial,
      name: voter.name,
      oldGender: voter.gender,
      newGender: detection.gender,
      method: detection.method,
      confidence: detection.confidence
    });
    
    voter.gender = detection.gender;
    
    if (detection.gender === 'F') {
      corrections.toFemale++;
    } else {
      corrections.toMale++;
    }
    
    if (detection.confidence >= 0.9) {
      corrections.highConfidence++;
    } else {
      corrections.mediumConfidence++;
    }
  } else {
    corrections.unchanged++;
  }
});

console.log('📊 Correction Statistics:');
console.log(`  Changed to Female: ${corrections.toFemale}`);
console.log(`  Changed to Male: ${corrections.toMale}`);
console.log(`  High confidence (>=0.9): ${corrections.highConfidence}`);
console.log(`  Medium confidence (0.7-0.9): ${corrections.mediumConfidence}`);
console.log(`  Unchanged: ${corrections.unchanged}\n`);

// Show sample corrections
console.log('📋 Sample Corrections (first 30):');
correctionLog.slice(0, 30).forEach(c => {
  const icon = c.newGender === 'F' ? '👩' : '👨';
  const oldIcon = c.oldGender === 'F' ? '👩' : '👨';
  console.log(`  ${oldIcon}→${icon} ${c.serial}. ${c.name} (${c.oldGender}→${c.newGender}) [${c.method}, ${(c.confidence*100).toFixed(0)}%]`);
});

// Save correction log
fs.writeFileSync('gender-corrections-log.json', JSON.stringify(correctionLog, null, 2));
console.log(`\n💾 Saved detailed log: gender-corrections-log.json\n`);

// Save updated database
fs.writeFileSync('./public/data/voters.json', JSON.stringify(voters, null, 2));

// Final statistics
const w7f3Updated = voters.filter(v => v.ward === '7' && v.booth === '3');
const males = w7f3Updated.filter(v => v.gender === 'M').length;
const females = w7f3Updated.filter(v => v.gender === 'F').length;
const unknown = w7f3Updated.filter(v => !v.gender || (v.gender !== 'M' && v.gender !== 'F')).length;

console.log('📊 W7F3 Final Gender Distribution:');
console.log(`  Males: ${males} (${(males/w7f3Updated.length*100).toFixed(1)}%)`);
console.log(`  Females: ${females} (${(females/w7f3Updated.length*100).toFixed(1)}%)`);
console.log(`  Unknown: ${unknown}\n`);

console.log('📋 Sample W7F3 voters after correction:');
w7f3Updated.slice(0, 30).forEach(v => {
  const icon = v.gender === 'M' ? '👨' : v.gender === 'F' ? '👩' : '❓';
  console.log(`  ${icon} ${v.serial}. ${v.name} (${v.age}/${v.gender})`);
});

console.log('\n✅ Gender correction complete!');
console.log('\nTo verify, run: node final-quality-check.js\n');
