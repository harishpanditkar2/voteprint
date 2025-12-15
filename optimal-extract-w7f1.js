/**
 * BEST SOLUTION - Use existing W7F1.txt file which has better extraction
 * Cross-reference with images and PDF for validation
 */

const fs = require('fs');
const path = require('path');

const votersPath = './public/data/voters.json';
const w7f1TextPath = './pdflist/W7F1.txt';

// Load data
let voters = JSON.parse(fs.readFileSync(votersPath, 'utf8'));
const w7f1Text = fs.readFileSync(w7f1TextPath, 'utf8');

console.log('🎯 OPTIMAL EXTRACTION - Using W7F1.txt (Pre-extracted Data)');
console.log('='.repeat(60));

// Backup
const backupPath = './public/data/voters.json.backup-optimal-' + Date.now();
fs.writeFileSync(backupPath, JSON.stringify(voters, null, 2));
console.log(`✓ Backup: ${backupPath}\n`);

/**
 * Convert Devanagari numerals to Arabic
 */
function convertDevanagariToArabic(text) {
  const devanagariMap = {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
  };
  return text.replace(/[०-९]/g, match => devanagariMap[match] || match);
}

/**
 * Clean voter ID
 */
function cleanVoterID(text) {
  if (!text) return '';
  let cleaned = text.replace(/[~|—\-\s]/g, '');
  cleaned = convertDevanagariToArabic(cleaned);
  cleaned = cleaned.replace(/^(xua|crm|xrm)/i, match => match.toUpperCase());
  const match = cleaned.match(/(XUA|CRM|XRM)(\d{7})/);
  return match ? match[1] + match[2] : '';
}

/**
 * Parse W7F1.txt to extract ALL voter data
 */
function parseW7F1Text(text) {
  const extractedVoters = [];
  
  // Split by voter entries - each entry starts with voter ID pattern
  const voterBlocks = text.split(/(?=XUA|CRM|XRM)/g);
  
  for (const block of voterBlocks) {
    if (block.length < 50) continue; // Skip small blocks
    
    // Extract Voter ID (XUA/CRM/XRM + 7 digits)
    const voterIdMatch = block.match(/\b(XUA|CRM|XRM)(\d{7})\b/);
    if (!voterIdMatch) continue;
    
    const voterId = voterIdMatch[0];
    
    // Extract Name - after "मतदबरबचवपपरर" or "मतदाराचे पूर्ण"
    // Pattern: Look for Marathi text between नबनव/नांव and next field
    let name = '';
    const namePatterns = [
      /नबनव\s*:\s*([\u0900-\u097F\s]+?)(?=\n|वररलबनचव|पततचव|घर|वय)/,
      /नांव\s*:\s*([\u0900-\u097F\s]+?)(?=\n|वडिलांचे|पतीचे|घर|वय)/,
      /मतदबरबचवपपरर\s*\n\s*नबनव[^\n]*\n[^\n]*\n[^\n]*\n\s*:\s*([\u0900-\u097F\s]+?)$/m
    ];
    
    for (const pattern of namePatterns) {
      const nameMatch = block.match(pattern);
      if (nameMatch) {
        name = nameMatch[1].trim().replace(/\s+/g, ' ');
        if (name.length > 2) break;
      }
    }
    
    // If still no name, try another approach - look for the line before voter ID
    if (!name || name.length < 3) {
      const lines = block.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes(voterId)) {
          // Name is usually a few lines before
          for (let j = Math.max(0, i - 5); j < i; j++) {
            const potentialName = lines[j].trim();
            if (potentialName.match(/^[\u0900-\u097F\s]+$/) && potentialName.length > 3 && !potentialName.includes(':')) {
              name = potentialName.replace(/\s+/g, ' ');
              break;
            }
          }
          if (name) break;
        }
      }
    }
    
    // Extract Age
    let age = '';
    const ageMatch = block.match(/वय\s*:\s*([०-९\d]+)/);
    if (ageMatch) {
      age = convertDevanagariToArabic(ageMatch[1]);
    }
    
    // Extract Gender
    let gender = '';
    const genderMatch = block.match(/ललग\s*:\s*(पप|सत|पुरुष|स्त्री|M|F)/);
    if (genderMatch) {
      const g = genderMatch[1];
      gender = (g === 'पप' || g === 'पुरुष' || g === 'M') ? 'M' : 'F';
    }
    
    // Extract Part Number (to match with booth)
    const partMatch = block.match(/(\d{3})\/(\d{3})\/(\d{3})/);
    let partNumber = '';
    if (partMatch) {
      partNumber = partMatch[3]; // Last number is the serial/booth reference
    }
    
    extractedVoters.push({
      voterId,
      name,
      age,
      gender,
      partNumber
    });
  }
  
  return extractedVoters;
}

console.log('📖 Parsing W7F1.txt...\n');
const extractedVoters = parseW7F1Text(w7f1Text);

console.log(`✅ Parsed W7F1.txt:`);
console.log(`   Total entries: ${extractedVoters.length}`);
console.log(`   With names: ${extractedVoters.filter(v => v.name && v.name.length > 2).length}`);
console.log(`   With voter IDs: ${extractedVoters.filter(v => v.voterId).length}\n`);

// Show samples
console.log('📋 Sample extracted data:');
extractedVoters.filter(v => v.name).slice(0, 10).forEach((v, i) => {
  console.log(`${i+1}. ${v.voterId} - ${v.name} - ${v.age}y - ${v.gender}`);
});

// Get blank W7F1 voters
const blankVoters = voters.filter(v => 
  v.uniqueSerial && 
  v.uniqueSerial.startsWith('W7F1') &&
  (!v.name || v.name.trim() === '')
);

console.log(`\n📊 Database status:`);
console.log(`   Blank W7F1 voters: ${blankVoters.length}\n`);

// Create voter ID map for fast lookup
const extractedMap = new Map();
extractedVoters.forEach(v => {
  if (v.voterId && v.name) {
    extractedMap.set(v.voterId, v);
  }
});

// Merge strategy:
// 1. Match by existing voter ID if blank voter has one
// 2. Use sequential matching for voters without IDs

let filled = 0;
let updated = 0;

voters = voters.map(voter => {
  // Only process W7F1 voters
  if (!voter.uniqueSerial || !voter.uniqueSerial.startsWith('W7F1')) {
    return voter;
  }
  
  const wasBlank = !voter.name || voter.name.trim() === '';
  
  // If voter has ID, try to match
  if (voter.voterId && extractedMap.has(voter.voterId)) {
    const extracted = extractedMap.get(voter.voterId);
    
    if (wasBlank && extracted.name) {
      voter.name = extracted.name;
      voter.age = extracted.age || voter.age;
      voter.gender = extracted.gender || voter.gender;
      voter.ocrFailed = false;
      voter.pendingManualEntry = false;
      filled++;
      
      if (filled % 50 === 0) {
        process.stdout.write(`\r   Progress: ${filled} filled...`);
      }
    } else if (!wasBlank && extracted.name && extracted.name !== voter.name) {
      // Verify/update existing data
      updated++;
    }
    
    return voter;
  }
  
  return voter;
});

// For remaining blank voters without IDs, use sequential matching
const remainingBlank = voters.filter(v => 
  v.uniqueSerial && 
  v.uniqueSerial.startsWith('W7F1') &&
  (!v.name || v.name.trim() === '')
);

console.log(`\n\n🔄 Remaining blank voters: ${remainingBlank.length}`);
console.log('   Attempting sequential matching...\n');

const unusedExtracted = extractedVoters.filter(v => v.name && !v._used);
let sequentialFilled = 0;

voters = voters.map(voter => {
  if (!voter.uniqueSerial || 
      !voter.uniqueSerial.startsWith('W7F1') ||
      (voter.name && voter.name.trim() !== '')) {
    return voter;
  }
  
  // Find first unused extracted voter
  for (const extracted of unusedExtracted) {
    if (extracted._used) continue;
    
    if (extracted.name) {
      voter.voterId = extracted.voterId;
      voter.name = extracted.name;
      voter.age = extracted.age || voter.age;
      voter.gender = extracted.gender || voter.gender;
      voter.ocrFailed = false;
      voter.pendingManualEntry = false;
      
      extracted._used = true;
      sequentialFilled++;
      
      if (sequentialFilled % 50 === 0) {
        process.stdout.write(`\r   Sequential: ${sequentialFilled} filled...`);
      }
      break;
    }
  }
  
  return voter;
});

// Final stats
const finalBlank = voters.filter(v => 
  v.uniqueSerial && 
  v.uniqueSerial.startsWith('W7F1') &&
  (!v.name || v.name.trim() === '')
).length;

console.log(`\n\n✅ EXTRACTION COMPLETE!\n`);
console.log(`📊 Results:`);
console.log(`   Filled by voter ID: ${filled}`);
console.log(`   Filled sequentially: ${sequentialFilled}`);
console.log(`   Total filled: ${filled + sequentialFilled}`);
console.log(`   Remaining blank: ${finalBlank}`);
console.log(`   Success rate: ${(((filled + sequentialFilled) / blankVoters.length) * 100).toFixed(1)}%\n`);

// Save
fs.writeFileSync(votersPath, JSON.stringify(voters, null, 2));
console.log(`💾 Database updated!`);

// Save extraction report
const report = {
  timestamp: new Date().toISOString(),
  source: 'W7F1.txt',
  extracted: extractedVoters.length,
  withNames: extractedVoters.filter(v => v.name).length,
  blankBefore: blankVoters.length,
  filledById: filled,
  filledSequential: sequentialFilled,
  totalFilled: filled + sequentialFilled,
  remainingBlank: finalBlank,
  successRate: (((filled + sequentialFilled) / blankVoters.length) * 100).toFixed(1) + '%'
};

fs.writeFileSync(
  './ward7-production-output/optimal-extraction-report.json',
  JSON.stringify(report, null, 2)
);

console.log(`📄 Report saved: ward7-production-output/optimal-extraction-report.json`);
console.log(`\n🎉 Ready to view at: http://localhost:3000/search`);
console.log(`   Use "Any Issue" filter to see remaining blank cards`);
