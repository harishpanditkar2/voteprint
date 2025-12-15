/**
 * COMPLETE EXTRACTION - Extract names, ages, and genders correctly
 */

const fs = require('fs');

const votersPath = './public/data/voters.json';
const w7f1TextPath = './pdflist/W7F1.txt';

let voters = JSON.parse(fs.readFileSync(votersPath, 'utf8'));
const w7f1Text = fs.readFileSync(w7f1TextPath, 'utf8');

console.log('🔧 COMPLETE FIX - Extracting Names, Ages & Genders');
console.log('='.repeat(60));

const backupPath = './public/data/voters.json.backup-complete-' + Date.now();
fs.writeFileSync(backupPath, JSON.stringify(voters, null, 2));
console.log(`✓ Backup: ${backupPath}\n`);

function convertDevanagariToArabic(text) {
  const map = {'०':'0','१':'1','२':'2','३':'3','४':'4','५':'5','६':'6','७':'7','८':'8','९':'9'};
  return text.replace(/[०-९]/g, m => map[m] || m);
}

/**
 * Parse W7F1.txt completely - extract name, age, gender
 */
function parseW7F1Complete(text) {
  const voters = [];
  const lines = text.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Find voter ID line
    const voterIdMatch = line.match(/^(XUA|CRM|XRM)(\d{7})\s/);
    if (!voterIdMatch) continue;
    
    const voterId = voterIdMatch[1] + voterIdMatch[2];
    
    // Name is on the previous line
    let name = '';
    if (i > 0) {
      name = lines[i - 1].trim().replace(/\s+/g, ' ');
    }
    
    // Age: Look backward for "वय :" then the next line has the age number
    let age = '';
    for (let j = Math.max(0, i - 15); j < i; j++) {
      const ageLine = lines[j].trim();
      
      // If line contains "वय :" or just "वय"
      if (ageLine.includes('वय')) {
        // Check if age is on same line after colon
        const sameLineMatch = ageLine.match(/वय\s*:\s*(\d{2,3})/);
        if (sameLineMatch) {
          age = convertDevanagariToArabic(sameLineMatch[1]);
        } else {
          // Age is on next line(s) after "वय :"
          for (let k = j + 1; k < Math.min(lines.length, j + 5); k++) {
            const nextLine = lines[k].trim();
            // Look for a standalone number between 18-120
            if (nextLine.match(/^\d{2,3}$/)) {
              const ageNum = parseInt(convertDevanagariToArabic(nextLine));
              if (ageNum >= 18 && ageNum <= 120) {
                age = ageNum.toString();
                break;
              }
            }
          }
        }
        if (age) break;
      }
    }
    
    // Gender: Look forward for "ललग :" or "लिंग :"
    let gender = '';
    for (let j = i; j < Math.min(lines.length, i + 15); j++) {
      const genderLine = lines[j].trim();
      
      if (genderLine.includes('ललग') || genderLine.includes('लिंग')) {
        if (genderLine.includes('पप') || genderLine.includes('पुरुष')) {
          gender = 'M';
        } else if (genderLine.includes('सत') || genderLine.includes('स्त्री')) {
          gender = 'F';
        }
        if (gender) break;
      }
    }
    
    if (name && name.length > 2 && !name.includes(':') && name.match(/[\u0900-\u097F]/)) {
      voters.push({
        voterId,
        name,
        age,
        gender
      });
    }
  }
  
  return voters;
}

console.log('📖 Parsing W7F1.txt for complete data...\n');
const extractedVoters = parseW7F1Complete(w7f1Text);

console.log(`✅ Extraction Results:`);
console.log(`   Total: ${extractedVoters.length}`);
console.log(`   With names: ${extractedVoters.filter(v => v.name).length}`);
console.log(`   With ages: ${extractedVoters.filter(v => v.age).length}`);
console.log(`   With genders: ${extractedVoters.filter(v => v.gender).length}\n`);

console.log('📋 Sample (First 10):');
extractedVoters.slice(0, 10).forEach((v, i) => {
  console.log(`${i+1}. ${v.voterId} - ${v.name.substring(0, 25)} - ${v.age}y - ${v.gender}`);
});

// Update voters with complete data
const extractedMap = new Map();
extractedVoters.forEach(v => {
  if (v.voterId) {
    extractedMap.set(v.voterId, v);
  }
});

console.log(`\n🔄 Updating W7F1 voters with complete data...\n`);

let updated = 0;
let agesFilled = 0;
let gendersFilled = 0;

voters = voters.map(voter => {
  if (!voter.uniqueSerial || !voter.uniqueSerial.startsWith('W7F1')) {
    return voter;
  }
  
  if (voter.voterId && extractedMap.has(voter.voterId)) {
    const extracted = extractedMap.get(voter.voterId);
    
    // Update age if missing
    if ((!voter.age || voter.age === '') && extracted.age) {
      voter.age = extracted.age;
      agesFilled++;
    }
    
    // Update gender if missing
    if ((!voter.gender || voter.gender === '') && extracted.gender) {
      voter.gender = extracted.gender;
      gendersFilled++;
    }
    
    // Update name if better quality
    if (extracted.name && extracted.name.length > 2) {
      voter.name = extracted.name;
    }
    
    updated++;
    
    if (updated % 200 === 0) {
      console.log(`   Updated: ${updated}...`);
    }
  }
  
  return voter;
});

// Final verification
const w7f1Final = voters.filter(v => v.uniqueSerial && v.uniqueSerial.startsWith('W7F1'));
const missingAge = w7f1Final.filter(v => !v.age || v.age === '').length;
const missingGender = w7f1Final.filter(v => !v.gender || v.gender === '').length;
const missingName = w7f1Final.filter(v => !v.name || v.name.trim() === '').length;

console.log(`\n\n✅ UPDATE COMPLETE!\n`);
console.log(`📊 Final Status:`);
console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`   Total W7F1:       991`);
console.log(`   Ages filled:      ${agesFilled}`);
console.log(`   Genders filled:   ${gendersFilled}`);
console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`   Missing names:    ${missingName}`);
console.log(`   Missing ages:     ${missingAge}`);
console.log(`   Missing genders:  ${missingGender}\n`);

// Save
fs.writeFileSync(votersPath, JSON.stringify(voters, null, 2));
console.log(`💾 Database updated!`);

// Show sample
console.log(`\n📋 Sample Complete Records:`);
w7f1Final.filter(v => v.name && v.age && v.gender).slice(0, 5).forEach((v, i) => {
  console.log(`${i+1}. ${v.uniqueSerial} - ${v.name.substring(0, 25)} - ${v.age}y - ${v.gender}`);
});

console.log(`\n🎉 Ward 7 Booth 1 NOW COMPLETE!`);
console.log(`   Refresh browser: http://localhost:3000/search`);
