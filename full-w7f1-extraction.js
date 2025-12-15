/**
 * PRODUCTION - Full Ward 7 Booth 1 extraction and merge (all 73 pages)
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

const execAsync = promisify(exec);

const votersPath = './public/data/voters.json';
const TESSERACT_PATH = 'C:\\Program Files\\Tesseract-OCR\\tesseract.exe';
const TESSDATA_PREFIX = 'D:\\web\\election\\voter';

function convertDevanagariToArabic(text) {
  if (!text) return text;
  const devanagariMap = {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
  };
  return text.replace(/[०-९]/g, match => devanagariMap[match] || match);
}

function cleanVoterID(text) {
  if (!text) return '';
  let cleaned = text.replace(/[~|—\-\s]/g, '');
  cleaned = convertDevanagariToArabic(cleaned);
  cleaned = cleaned.replace(/^(xua|crm|xrm)/i, match => match.toUpperCase());
  const match = cleaned.match(/(XUA|CRM|XRM)(\d{7})/);
  return match ? match[1] + match[2] : cleaned;
}

async function runOCR(imagePath) {
  try {
    const command = `"${TESSERACT_PATH}" "${imagePath}" stdout -l mar+eng --psm 6`;
    const env = { ...process.env, TESSDATA_PREFIX };
    const { stdout } = await execAsync(command, { 
      env,
      maxBuffer: 10 * 1024 * 1024,
      encoding: 'utf8'
    });
    return stdout;
  } catch (error) {
    console.error(`OCR Error: ${error.message}`);
    return '';
  }
}

function extractVoterData(ocrText, pageNum) {
  const voters = [];
  
  const voterIDPattern = /\b([XC][RU][MAR][\d०-९]{7})\b/g;
  const voterIDs = [];
  let match;
  while ((match = voterIDPattern.exec(ocrText)) !== null) {
    const cleaned = cleanVoterID(match[1]);
    if (cleaned && cleaned.match(/^(XUA|CRM|XRM)\d{7}$/)) {
      voterIDs.push(cleaned);
    }
  }
  
  const segments = ocrText.split(/मतदाराचे\s+पूर्ण/);
  const names = [];
  
  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i];
    const nameMatch = segment.match(/[:]*\s*([\u0900-\u097F\s]+?)\s+नांव/);
    if (nameMatch) {
      const name = nameMatch[1].trim().replace(/\s+/g, ' ');
      if (name.length > 2 && !name.includes('वडिलांचे') && !name.includes('पतीचे')) {
        names.push(name);
      }
    }
  }
  
  const agePattern = /वय\s*[:\s]*([०-९\d]{1,3})/g;
  const ages = [];
  while ((match = agePattern.exec(ocrText)) !== null) {
    const age = convertDevanagariToArabic(match[1]);
    const ageNum = parseInt(age);
    if (ageNum >= 18 && ageNum <= 120) {
      ages.push(age);
    }
  }
  
  const genderPattern = /लिंग\s*[:\s]*(पुरुष|पु|स्त्री|स्री|M|F|खसत्री|सत्री|of)/g;
  const genders = [];
  while ((match = genderPattern.exec(ocrText)) !== null) {
    let gender = match[1];
    if (gender === 'पुरुष' || gender === 'पु' || gender === 'M') gender = 'M';
    if (gender === 'स्त्री' || gender === 'स्री' || gender === 'F' || gender === 'खसत्री' || gender === 'सत्री' || gender === 'of') gender = 'F';
    genders.push(gender);
  }
  
  const maxCount = Math.max(voterIDs.length, names.length);
  
  for (let i = 0; i < maxCount; i++) {
    voters.push({
      voterId: voterIDs[i] || '',
      name: names[i] || '',
      age: ages[i] || '',
      gender: genders[i] || '',
      pageNum: pageNum
    });
  }
  
  return voters;
}

async function fullExtraction() {
  console.log('🚀 PRODUCTION - Full Ward 7 Booth 1 Extraction');
  console.log('='.repeat(60));
  console.log('⏱️  Estimated time: 3-4 minutes\n');
  
  const imagesDir = './pdflist/images/prabhag7ward1';
  const imageFiles = (await fs.readdir(imagesDir))
    .filter(f => f.endsWith('.jpg'))
    .sort();
  
  console.log(`📁 Processing ALL ${imageFiles.length} pages\n`);
  
  const outputDir = './ward7-production-output';
  await fs.mkdir(outputDir, { recursive: true });
  
  const allExtractedVoters = [];
  const startTime = Date.now();
  
  for (let i = 0; i < imageFiles.length; i++) {
    const imageFile = imageFiles[i];
    const pageNum = i + 2;
    const imagePath = path.join(imagesDir, imageFile);
    
    process.stdout.write(`\r📄 Page ${pageNum}/73... `);
    
    const ocrText = await runOCR(imagePath);
    const pageVoters = extractVoterData(ocrText, pageNum);
    allExtractedVoters.push(...pageVoters);
    
    if (pageNum % 10 === 0) {
      const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
      console.log(`(${elapsed} min elapsed)`);
    }
  }
  
  console.log(`\n\n✅ Extraction Complete!`);
  console.log(`   Total: ${allExtractedVoters.length} voters`);
  console.log(`   With names: ${allExtractedVoters.filter(v => v.name).length}`);
  console.log(`   Time: ${((Date.now() - startTime) / 1000 / 60).toFixed(1)} minutes\n`);
  
  await fs.writeFile(
    path.join(outputDir, 'all_extracted_voters.json'),
    JSON.stringify(allExtractedVoters, null, 2)
  );
  
  console.log(`💾 Saved: ${outputDir}/all_extracted_voters.json\n`);
  
  // Now merge
  console.log(`🔄 Merging with database...\n`);
  
  let voters = JSON.parse(fsSync.readFileSync(votersPath, 'utf8'));
  
  // Backup
  const backupPath = './public/data/voters.json.backup-production-' + Date.now();
  fsSync.writeFileSync(backupPath, JSON.stringify(voters, null, 2));
  console.log(`✓ Backup: ${backupPath}`);
  
  const blankVoters = voters.filter(v => 
    v.uniqueSerial && 
    v.uniqueSerial.startsWith('W7F1') &&
    (!v.name || v.name.trim() === '')
  );
  
  console.log(`📊 Blank W7F1 voters: ${blankVoters.length}\n`);
  
  const extractedWithNames = allExtractedVoters.filter(v => v.name && v.voterId);
  let filled = 0;
  
  voters = voters.map(voter => {
    if (!voter.uniqueSerial || 
        !voter.uniqueSerial.startsWith('W7F1') ||
        (voter.name && voter.name.trim() !== '')) {
      return voter;
    }
    
    for (const extracted of extractedWithNames) {
      if (extracted._used) continue;
      
      if (extracted.name && !extracted._used) {
        voter.voterId = extracted.voterId;
        voter.name = extracted.name;
        voter.age = extracted.age || voter.age;
        voter.gender = extracted.gender || voter.gender;
        voter.ocrFailed = false;
        voter.pendingManualEntry = false;
        
        extracted._used = true;
        filled++;
        
        if (filled % 50 === 0) {
          process.stdout.write(`\r   Filled: ${filled}...`);
        }
        break;
      }
    }
    
    return voter;
  });
  
  console.log(`\n\n📊 FINAL RESULTS:`);
  console.log(`   Blank voters filled: ${filled}/${blankVoters.length}`);
  console.log(`   Success rate: ${((filled / blankVoters.length) * 100).toFixed(1)}%`);
  console.log(`   Remaining blank: ${blankVoters.length - filled}\n`);
  
  // Save
  fsSync.writeFileSync(votersPath, JSON.stringify(voters, null, 2));
  console.log(`✅ Database updated!`);
  console.log(`\n🎉 Ward 7 Booth 1 correction complete!`);
  console.log(`   Check results at: http://localhost:3000/search`);
  console.log(`   Filter: "Any Issue" to see remaining blank cards`);
}

fullExtraction().catch(console.error);
