/**
 * Re-extract missing Ward 7 Booth 1 voter data from page images
 * This script will OCR the PDF images again and fill in the missing 372 voters
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

/**
 * Convert Devanagari numerals to Arabic
 */
function convertDevanagariToArabic(text) {
  if (!text) return text;
  const devanagariMap = {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
  };
  return text.replace(/[०-९]/g, match => devanagariMap[match] || match);
}

/**
 * Clean OCR noise from voter IDs
 */
function cleanVoterID(text) {
  if (!text) return '';
  
  // Remove common OCR noise
  let cleaned = text.replace(/[~|—\-\s]/g, '');
  
  // Convert Devanagari numbers
  cleaned = convertDevanagariToArabic(cleaned);
  
  // Fix lowercase prefixes
  cleaned = cleaned.replace(/^(xua|crm|xrm)/i, match => match.toUpperCase());
  
  // Pattern: XUA followed by 7 digits
  const match = cleaned.match(/(XUA|CRM|XRM)(\d{7})/);
  if (match) {
    return match[1] + match[2];
  }
  
  return cleaned;
}

/**
 * Run Tesseract OCR on a single image
 */
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
 * Extract voter data from OCR text
 */
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
  
  // Extract names (Marathi text between "मतदाराचे पूर्ण" and "नांव")
  const namePattern = /मतदाराचे\s+पूर्ण\s*[:]*\s*([\u0900-\u097F\s]+?)\s*नांव/g;
  const names = [];
  while ((match = namePattern.exec(ocrText)) !== null) {
    const name = match[1].trim().replace(/\s+/g, ' ');
    if (name.length > 2 && !name.includes('वडिलांचे') && !name.includes('पतीचे')) {
      names.push(name);
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
  const genderPattern = /लिंग\s*[:\s]*(पुरुष|पु|स्त्री|स्री|M|F)/g;
  const genders = [];
  while ((match = genderPattern.exec(ocrText)) !== null) {
    let gender = match[1];
    if (gender === 'पुरुष' || gender === 'पु' || gender === 'M') gender = 'M';
    if (gender === 'स्त्री' || gender === 'स्री' || gender === 'F') gender = 'F';
    genders.push(gender);
  }
  
  // Map data together (approximately - OCR extraction isn't perfect)
  const maxCount = Math.max(voterIDs.length, names.length, ages.length, genders.length);
  
  for (let i = 0; i < maxCount; i++) {
    if (voterIDs[i]) {
      voters.push({
        voterId: voterIDs[i],
        name: names[i] || '',
        age: ages[i] || '',
        gender: genders[i] || '',
        pageNum: pageNum
      });
    }
  }
  
  return voters;
}

/**
 * Main re-extraction process
 */
async function reextractMissingVoters() {
  console.log('🔄 Ward 7 Booth 1 - Missing Voter Re-extraction');
  console.log('='.repeat(60));
  
  // Get W7F1 voters
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
  console.log(`   Missing names: ${missing.length}`);
  console.log(`   Missing percentage: ${((missing.length/w7f1Voters.length)*100).toFixed(1)}%\n`);
  
  // Get page images
  const imagesDir = './pdflist/images/prabhag7ward1';
  const imageFiles = (await fs.readdir(imagesDir))
    .filter(f => f.endsWith('.jpg'))
    .sort();
  
  console.log(`📁 Found ${imageFiles.length} page images\n`);
  
  // Create output directory for extracted data
  const outputDir = './ward7-reextraction-output';
  await fs.mkdir(outputDir, { recursive: true });
  
  // Process each page and extract voter data
  const allExtractedVoters = [];
  
  for (let i = 0; i < imageFiles.length; i++) {
    const imageFile = imageFiles[i];
    const pageNum = i + 2; // Pages start from 2 (page 1 is header)
    const imagePath = path.join(imagesDir, imageFile);
    
    console.log(`📄 Processing page ${pageNum}/73: ${imageFile}`);
    
    // Run OCR
    const ocrText = await runOCR(imagePath);
    
    // Save raw OCR output for debugging
    await fs.writeFile(
      path.join(outputDir, `page${String(pageNum).padStart(3, '0')}_ocr.txt`),
      ocrText
    );
    
    // Extract voter data
    const pageVoters = extractVoterData(ocrText, pageNum);
    allExtractedVoters.push(...pageVoters);
    
    console.log(`   ✓ Extracted ${pageVoters.length} voters`);
    
    // Small delay to avoid overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n✅ Extraction complete!`);
  console.log(`   Total extracted: ${allExtractedVoters.length} voters`);
  
  // Save extracted data
  await fs.writeFile(
    path.join(outputDir, 'extracted_voters.json'),
    JSON.stringify(allExtractedVoters, null, 2)
  );
  
  console.log(`\n💾 Saved to: ${outputDir}/extracted_voters.json`);
  console.log(`\n📋 Next step: Run merge script to match and fill missing data`);
  
  return allExtractedVoters;
}

// Run the extraction
reextractMissingVoters().catch(console.error);
