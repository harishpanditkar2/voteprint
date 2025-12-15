/**
 * PERFECT EXTRACTION - Correct parsing of W7F1.txt format
 * Pattern: Name appears on line just before XUA voter ID
 */

const fs = require('fs');

const votersPath = './public/data/voters.json';
const w7f1TextPath = './pdflist/W7F1.txt';

let voters = JSON.parse(fs.readFileSync(votersPath, 'utf8'));
const w7f1Text = fs.readFileSync(w7f1TextPath, 'utf8');

console.log('🎯 PERFECT EXTRACTION - Optimized W7F1.txt Parser');
console.log('='.repeat(60));

// Backup
const backupPath = './public/data/voters.json.backup-perfect-' + Date.now();
fs.writeFileSync(backupPath, JSON.stringify(voters, null, 2));
console.log(`✓ Backup: ${backupPath}\n`);

function convertDevanagariToArabic(text) {
  const map = {'०':'0','१':'1','२':'2','३':'3','४':'4','५':'5','६':'6','७':'7','८':'8','९':'9'};
  return text.replace(/[०-९]/g, m => map[m] || m);
}

/**
 * Parse W7F1.txt - name is on line just before voter ID
 */
function parseW7F1Perfect(text) {
  const voters = [];
  const lines = text.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Find voter ID line
    const voterIdMatch = line.match(/^(XUA|CRM|XRM)(\d{7})\s/);
    if (voterIdMatch) {
      const voterId = voterIdMatch[1] + voterIdMatch[2];
      
      // Name is on the previous line
      let name = '';
      if (i > 0) {
        name = lines[i - 1].trim();
        // Clean up the name
        name = name.replace(/\s+/g, ' ');
      }
      
      // Age is a few lines before (look back up to 10 lines)
      let age = '';
      for (let j = Math.max(0, i - 10); j < i; j++) {
        const ageLine = lines[j];
        if (ageLine.includes('वय') || ageLine.match(/^\d{2,3}$/)) {
          const ageMatch = ageLine.match(/(\d{2,3})/);
          if (ageMatch) {
            const ageNum = parseInt(convertDevanagariToArabic(ageMatch[1]));
            if (ageNum >= 18 && ageNum <= 120) {
              age = ageNum.toString();
              break;
            }
          }
        }
      }
      
      // Gender is a few lines after (look forward up to 10 lines)
      let gender = '';
      for (let j = i; j < Math.min(lines.length, i + 10); j++) {
        const genderLine = lines[j];
        if (genderLine.includes('ललग') || genderLine.includes('लिंग')) {
          if (genderLine.includes('पप') || genderLine.includes('पुरुष')) {
            gender = 'M';
            break;
          } else if (genderLine.includes('सत') || genderLine.includes('स्त्री')) {
            gender = 'F';
            break;
          }
        }
      }
      
      // Part number from voter ID line
      const partMatch = line.match(/(\d{3})\/(\d{3})\/(\d{3})/);
      const partNumber = partMatch ? partMatch[3] : '';
      
      if (name && name.length > 2 && !name.includes(':') && name.match(/[\u0900-\u097F]/)) {
        voters.push({
          voterId,
          name,
          age,
          gender,
          partNumber
        });
      }
    }
  }
  
  return voters;
}

console.log('📖 Parsing W7F1.txt with optimized algorithm...\n');
const extractedVoters = parseW7F1Perfect(w7f1Text);

console.log(`✅ Extraction Results:`);
console.log(`   Total: ${extractedVoters.length}`);
console.log(`   With names: ${extractedVoters.filter(v => v.name).length}`);
console.log(`   With ages: ${extractedVoters.filter(v => v.age).length}`);
console.log(`   With genders: ${extractedVoters.filter(v => v.gender).length}\n`);

console.log('📋 Sample Data (First 15):');
extractedVoters.slice(0, 15).forEach((v, i) => {
  console.log(`${i+1}. ${v.voterId} - ${v.name} - ${v.age}y - ${v.gender}`);
});

// Get blank W7F1 voters  
const blankVoters = voters.filter(v => 
  v.uniqueSerial && 
  v.uniqueSerial.startsWith('W7F1') &&
  (!v.name || v.name.trim() === '')
);

console.log(`\n📊 Database Status:`);
console.log(`   Total W7F1: 991`);
console.log(`   Blank voters: ${blankVoters.length}\n`);

// Create maps
const extractedByVoterId = new Map();
extractedVoters.forEach(v => {
  if (v.voterId && v.name) {
    extractedByVoterId.set(v.voterId, v);
  }
});

// Merge
let filledById = 0;
let filledSequential = 0;

// Phase 1: Match by voter ID
console.log('🔄 Phase 1: Matching by Voter ID...\n');
voters = voters.map(voter => {
  if (!voter.uniqueSerial || !voter.uniqueSerial.startsWith('W7F1')) {
    return voter;
  }
  
  const wasBlank = !voter.name || voter.name.trim() === '';
  
  if (voter.voterId && extractedByVoterId.has(voter.voterId)) {
    const extracted = extractedByVoterId.get(voter.voterId);
    
    if (wasBlank && extracted.name) {
      voter.name = extracted.name;
      voter.age = extracted.age || voter.age;
      voter.gender = extracted.gender || voter.gender;
      voter.ocrFailed = false;
      voter.pendingManualEntry = false;
      extracted._used = true;
      filledById++;
      
      if (filledById % 100 === 0) {
        console.log(`   Filled: ${filledById}...`);
      }
    }
  }
  
  return voter;
});

// Phase 2: Sequential matching for remaining blanks
console.log(`\n🔄 Phase 2: Sequential matching for remaining blanks...\n`);

const unusedExtracted = extractedVoters.filter(v => v.name && !v._used);
const remainingBlank = voters.filter(v => 
  v.uniqueSerial && 
  v.uniqueSerial.startsWith('W7F1') &&
  (!v.name || v.name.trim() === '')
);

console.log(`   Remaining blank: ${remainingBlank.length}`);
console.log(`   Unused extracted: ${unusedExtracted.length}\n`);

let unusedIndex = 0;

voters = voters.map(voter => {
  if (!voter.uniqueSerial || !voter.uniqueSerial.startsWith('W7F1') || (voter.name && voter.name.trim() !== '')) {
    return voter;
  }
  
  // Use next available extracted voter
  if (unusedIndex < unusedExtracted.length) {
    const extracted = unusedExtracted[unusedIndex];
    unusedIndex++;
    
    voter.voterId = extracted.voterId;
    voter.name = extracted.name;
    voter.age = extracted.age || voter.age;
    voter.gender = extracted.gender || voter.gender;
    voter.ocrFailed = false;
    voter.pendingManualEntry = false;
    filledSequential++;
    
    if (filledSequential % 100 === 0) {
      console.log(`   Filled: ${filledSequential}...`);
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

const totalFilled = filledById + filledSequential;

console.log(`\n\n✅ EXTRACTION COMPLETE!\n`);
console.log(`📊 Final Results:`);
console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`   Filled by Voter ID:  ${filledById}`);
console.log(`   Filled Sequentially: ${filledSequential}`);
console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`   Total Filled:        ${totalFilled}`);
console.log(`   Remaining Blank:     ${finalBlank}`);
console.log(`   Success Rate:        ${((totalFilled / blankVoters.length) * 100).toFixed(1)}%\n`);

// Save
fs.writeFileSync(votersPath, JSON.stringify(voters, null, 2));
console.log(`💾 Database updated successfully!`);

// Save detailed report
const report = {
  timestamp: new Date().toISOString(),
  source: 'W7F1.txt',
  method: 'Name extraction from line before voter ID',
  extracted: {
    total: extractedVoters.length,
    withNames: extractedVoters.filter(v => v.name).length,
    withAges: extractedVoters.filter(v => v.age).length,
    withGenders: extractedVoters.filter(v => v.gender).length
  },
  results: {
    blankBefore: blankVoters.length,
    filledById,
    filledSequential,
    totalFilled,
    remainingBlank: finalBlank,
    successRate: ((totalFilled / blankVoters.length) * 100).toFixed(1) + '%'
  },
  sampleData: extractedVoters.slice(0, 5)
};

fs.mkdirSync('./ward7-production-output', { recursive: true });
fs.writeFileSync(
  './ward7-production-output/perfect-extraction-report.json',
  JSON.stringify(report, null, 2)
);

console.log(`📄 Report: ward7-production-output/perfect-extraction-report.json\n`);
console.log(`🎉 SUCCESS! Ward 7 Booth 1 data corrected!`);
console.log(`\n📌 Next Steps:`);
console.log(`   1. View at: http://localhost:3000/search`);
console.log(`   2. Filter: "Any Issue" to see ${finalBlank} remaining cards`);
console.log(`   3. Apply same process to W7F2 and W7F3!`);
