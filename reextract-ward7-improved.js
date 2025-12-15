/**
 * Re-extract Ward 7 Booth 1 missing voters with BETTER name extraction
 * Handles 3-column PDF layout correctly
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

const execAsync = promisify(exec);

// Load current voter data
const votersPath = './public/data/voters.json';
let voters = JSON.parse(fsSync.readFileSync(votersPath, 'utf8'));

// Tesseract executable path
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
  if (match) {
    return match[1] + match[2];
  }
  
  return cleaned;
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
    console.error(`OCR Error on ${imagePath}:`, error.message);
    return '';
  }
}

/**
 * IMPROVED: Extract ALL entries from 3-column layout
 */
function extractVoterData(ocrText, pageNum) {
  const voters = [];
  
  // Step 1: Extract ALL voter IDs
  const voterIDPattern = /\b([XC][RU][MAR][\d०-९]{7})\b/g;
  const voterIDs = [];
  let match;
  while ((match = voterIDPattern.exec(ocrText)) !== null) {
    const cleaned = cleanVoterID(match[1]);
    if (cleaned && cleaned.match(/^(XUA|CRM|XRM)\d{7}$/)) {
      voterIDs.push(cleaned);
    }
  }
  
  // Step 2: Extract ALL names - handles multiple per line
  // Split by the pattern "मतदाराचे पूर्ण" to get segments
  const segments = ocrText.split(/मतदाराचे\s+पूर्ण/);
  const names = [];
  
  // Skip first segment (header)
  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i];
    // Extract name between start and "नांव"
    const nameMatch = segment.match(/[:]*\s*([\u0900-\u097F\s]+?)\s+नांव/);
    if (nameMatch) {
      const name = nameMatch[1].trim().replace(/\s+/g, ' ');
      if (name.length > 2 && !name.includes('वडिलांचे') && !name.includes('पतीचे')) {
        names.push(name);
      }
    }
  }
  
  // Step 3: Extract ALL ages
  const agePattern = /वय\s*[:\s]*([०-९\d]{1,3})/g;
  const ages = [];
  while ((match = agePattern.exec(ocrText)) !== null) {
    const age = convertDevanagariToArabic(match[1]);
    const ageNum = parseInt(age);
    if (ageNum >= 18 && ageNum <= 120) {
      ages.push(age);
    }
  }
  
  // Step 4: Extract ALL genders
  const genderPattern = /लिंग\s*[:\s]*(पुरुष|पु|स्त्री|स्री|M|F|खसत्री|सत्री|of)/g;
  const genders = [];
  while ((match = genderPattern.exec(ocrText)) !== null) {
    let gender = match[1];
    // Normalize
    if (gender === 'पुरुष' || gender === 'पु' || gender === 'M') gender = 'M';
    if (gender === 'स्त्री' || gender === 'स्री' || gender === 'F' || gender === 'खसत्री' || gender === 'सत्री' || gender === 'of') gender = 'F';
    genders.push(gender);
  }
  
  // Step 5: Combine data - match by index
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

async function reextractMissingVoters() {
  console.log('🔄 Ward 7 Booth 1 - IMPROVED Re-extraction');
  console.log('='.repeat(60));
  
  const w7f1Voters = voters.filter(v => 
    (v.ward === '7' || v.actualWard === '7') && 
    v.uniqueSerial && 
    v.uniqueSerial.startsWith('W7F1')
  );
  
  const withNames = w7f1Voters.filter(v => v.name && v.name.trim() !== '');
  const missing = w7f1Voters.filter(v => !v.name || v.name.trim() === '');
  
  console.log(`\n📊 Current Status:`);
  console.log(`   Total W7F1 voters: ${w7f1Voters.length}`);
  console.log(`   With names: ${withNames.length}`);
  console.log(`   Missing names: ${missing.length}\n`);
  
  const imagesDir = './pdflist/images/prabhag7ward1';
  const imageFiles = (await fs.readdir(imagesDir))
    .filter(f => f.endsWith('.jpg'))
    .sort();
  
  console.log(`📁 Found ${imageFiles.length} page images\n`);
  
  const outputDir = './ward7-reextraction-output';
  await fs.mkdir(outputDir, { recursive: true });
  
  const allExtractedVoters = [];
  
  for (let i = 0; i < imageFiles.length; i++) {
    const imageFile = imageFiles[i];
    const pageNum = i + 2;
    const imagePath = path.join(imagesDir, imageFile);
    
    console.log(`📄 Page ${pageNum}/73: ${imageFile}`);
    
    const ocrText = await runOCR(imagePath);
    
    await fs.writeFile(
      path.join(outputDir, `page${String(pageNum).padStart(3, '0')}_ocr.txt`),
      ocrText
    );
    
    const pageVoters = extractVoterData(ocrText, pageNum);
    allExtractedVoters.push(...pageVoters);
    
    console.log(`   ✓ ${pageVoters.length} voters (${pageVoters.filter(v => v.name).length} with names)`);
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n✅ Extraction complete!`);
  console.log(`   Total: ${allExtractedVoters.length} voters`);
  console.log(`   With names: ${allExtractedVoters.filter(v => v.name).length}`);
  console.log(`   With IDs: ${allExtractedVoters.filter(v => v.voterId).length}\n`);
  
  await fs.writeFile(
    path.join(outputDir, 'extracted_voters.json'),
    JSON.stringify(allExtractedVoters, null, 2)
  );
  
  console.log(`💾 Saved to: ${outputDir}/extracted_voters.json`);
  console.log(`\n📋 Next: Run merge-reextracted-data-w7f1.js`);
  
  return allExtractedVoters;
}

reextractMissingVoters().catch(console.error);
