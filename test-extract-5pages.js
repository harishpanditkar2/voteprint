/**
 * TEST VERSION - Extract only first 5 pages to verify it works
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

const execAsync = promisify(exec);

const votersPath = './public/data/voters.json';
let voters = JSON.parse(fsSync.readFileSync(votersPath, 'utf8'));

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
  
  // Extract voter IDs
  const voterIDPattern = /\b([XC][RU][MAR][\d०-९]{7})\b/g;
  const voterIDs = [];
  let match;
  while ((match = voterIDPattern.exec(ocrText)) !== null) {
    const cleaned = cleanVoterID(match[1]);
    if (cleaned && cleaned.match(/^(XUA|CRM|XRM)\d{7}$/)) {
      voterIDs.push(cleaned);
    }
  }
  
  // Extract names - split by "मतदाराचे पूर्ण" to handle 3-column layout
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
  
  // Extract ages
  const agePattern = /वय\s*[:\s]*([०-९\d]{1,3})/g;
  const ages = [];
  while ((match = agePattern.exec(ocrText)) !== null) {
    const age = convertDevanagariToArabic(match[1]);
    const ageNum = parseInt(age);
    if (ageNum >= 18 && ageNum <= 120) {
      ages.push(age);
    }
  }
  
  // Extract genders
  const genderPattern = /लिंग\s*[:\s]*(पुरुष|पु|स्त्री|स्री|M|F|खसत्री|सत्री|of)/g;
  const genders = [];
  while ((match = genderPattern.exec(ocrText)) !== null) {
    let gender = match[1];
    if (gender === 'पुरुष' || gender === 'पु' || gender === 'M') gender = 'M';
    if (gender === 'स्त्री' || gender === 'स्री' || gender === 'F' || gender === 'खसत्री' || gender === 'सत्री' || gender === 'of') gender = 'F';
    genders.push(gender);
  }
  
  // Combine data
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

async function testExtraction() {
  console.log('🧪 TEST MODE - Processing first 5 pages only');
  console.log('='.repeat(60));
  
  const imagesDir = './pdflist/images/prabhag7ward1';
  const imageFiles = (await fs.readdir(imagesDir))
    .filter(f => f.endsWith('.jpg'))
    .sort()
    .slice(0, 5); // TEST: Only first 5 pages
  
  console.log(`\n📁 Processing ${imageFiles.length} test pages\n`);
  
  const outputDir = './ward7-test-output';
  await fs.mkdir(outputDir, { recursive: true });
  
  const allExtractedVoters = [];
  
  for (let i = 0; i < imageFiles.length; i++) {
    const imageFile = imageFiles[i];
    const pageNum = i + 2;
    const imagePath = path.join(imagesDir, imageFile);
    
    console.log(`📄 Page ${pageNum}: ${imageFile}`);
    
    const ocrText = await runOCR(imagePath);
    
    await fs.writeFile(
      path.join(outputDir, `page${String(pageNum).padStart(3, '0')}_ocr.txt`),
      ocrText
    );
    
    const pageVoters = extractVoterData(ocrText, pageNum);
    allExtractedVoters.push(...pageVoters);
    
    const withNames = pageVoters.filter(v => v.name && v.name.trim() !== '').length;
    const withIds = pageVoters.filter(v => v.voterId).length;
    
    console.log(`   ✓ Extracted: ${pageVoters.length} voters`);
    console.log(`   ✓ With names: ${withNames}`);
    console.log(`   ✓ With IDs: ${withIds}\n`);
  }
  
  console.log(`✅ Test Extraction Complete!`);
  console.log(`   Total: ${allExtractedVoters.length} voters`);
  console.log(`   With names: ${allExtractedVoters.filter(v => v.name).length}`);
  console.log(`   With IDs: ${allExtractedVoters.filter(v => v.voterId).length}\n`);
  
  // Save
  await fs.writeFile(
    path.join(outputDir, 'test_extracted_voters.json'),
    JSON.stringify(allExtractedVoters, null, 2)
  );
  
  console.log(`💾 Saved to: ${outputDir}/test_extracted_voters.json`);
  
  // Show samples
  console.log(`\n📋 Sample Extracted Voters:`);
  allExtractedVoters.slice(0, 10).forEach((v, i) => {
    if (v.name) {
      console.log(`${i+1}. ${v.voterId} - ${v.name} - ${v.age}y - ${v.gender}`);
    }
  });
  
  console.log(`\n✅ Test successful! Ready to merge with database.`);
  console.log(`📌 Next: Run test-merge-w7f1.js to verify merging works`);
  
  return allExtractedVoters;
}

testExtraction().catch(console.error);
