const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== Complete Ward 7 Data Re-extraction ===\n');
console.log('Starting comprehensive re-extraction from 73 OCR page images...\n');

// Configuration
const OCR_IMAGES_DIR = 'pdflist/images/prabhag7ward1';
const TESSERACT_LANGS = 'mar+hin+eng';
const OUTPUT_DIR = 'ward7-reextraction-output';

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Read current database
const voters = JSON.parse(fs.readFileSync('public/data/voters.json', 'utf8'));
const ward7Current = voters.filter(v => v.actualWard === '7' || v.expectedWard === '7');

console.log(`Current Ward 7 voters in database: ${ward7Current.length}`);
console.log('');

// Get all OCR images
const imageFiles = fs.readdirSync(OCR_IMAGES_DIR)
  .filter(f => f.endsWith('.jpg'))
  .sort((a, b) => {
    const numA = parseInt(a.match(/page-(\d+)/)[1]);
    const numB = parseInt(b.match(/page-(\d+)/)[1]);
    return numA - numB;
  });

console.log(`Found ${imageFiles.length} OCR page images`);
console.log('');

// Helper: Clean OCR text
function cleanOCRText(text) {
  // Fix common OCR mistakes for voter IDs
  text = text.replace(/[CG]RM/g, 'CRM');
  text = text.replace(/XU[A4]/g, 'XUA');
  text = text.replace(/\bO\b/g, '0');
  text = text.replace(/\bl\b/g, '1');
  return text;
}

// Helper: Convert Devanagari digits to Arabic
function convertDevanagariToArabic(text) {
  const devToArabic = {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
  };
  return text.replace(/[०-९]/g, digit => devToArabic[digit] || digit);
}

// Helper: Extract voter IDs from text
function extractVoterIds(text) {
  text = cleanOCRText(text);
  const pattern = /([XC][UR][AMU]\d{7,10})/g;
  const ids = [];
  let match;
  while ((match = pattern.exec(text)) !== null) {
    ids.push(match[1]);
  }
  return [...new Set(ids)]; // Remove duplicates
}

// Helper: Extract part numbers (format: 201/138/143)
function extractPartNumbers(text) {
  const pattern = /(\d{3}\/\d{3}\/\d{3})/g;
  const parts = [];
  let match;
  while ((match = pattern.exec(text)) !== null) {
    parts.push(match[1]);
  }
  return parts;
}

// Helper: Extract names (Marathi text)
function extractNames(text) {
  // Pattern: मतदाराचे पूर्ण नांव : <name>
  const pattern = /मतदाराचे\s+पूर्ण\s+(?:नांव|नाव)\s*[:：-]?\s*([\u0900-\u097F\s]+?)(?=\s*(?:पती|वडि|Photo|लिंग|वय|मतदाराचे|\n\n|$))/g;
  const names = [];
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const name = match[1].trim().replace(/\s+/g, ' ');
    if (name.length > 2 && !name.includes('Not Available')) {
      names.push(name);
    }
  }
  return names;
}

// Helper: Extract ages
function extractAges(text) {
  const pattern = /वय\s*[:：=-]?\s*([\u0966-\u096f\d]+)/g;
  const ages = [];
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const age = convertDevanagariToArabic(match[1]);
    if (parseInt(age) >= 18 && parseInt(age) <= 120) {
      ages.push(age);
    }
  }
  return ages;
}

// Helper: Extract genders
function extractGenders(text) {
  const pattern = /लिंग\s*[:：=-]?\s*(पुरुष|स्त्री|पु|स्री|M|F)/g;
  const genders = [];
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const g = match[1];
    if (g.includes('पुरुष') || g.includes('पु') || g === 'M') {
      genders.push('M');
    } else if (g.includes('स्त्री') || g.includes('स्री') || g === 'F') {
      genders.push('F');
    }
  }
  return genders;
}

// Process each page
console.log('Processing OCR images...\n');

const extractedData = [];
let processedPages = 0;

for (const imageFile of imageFiles) {
  const imagePath = path.join(OCR_IMAGES_DIR, imageFile);
  const pageNum = parseInt(imageFile.match(/page-(\d+)/)[1]);
  
  console.log(`Processing Page ${pageNum}: ${imageFile}`);
  
  try {
    // Run Tesseract OCR
    const tesseractPath = 'C:\\Program Files\\Tesseract-OCR\\tesseract.exe';
    const tessdataPath = path.join(process.cwd()); // Use local tessdata files
    const ocrOutput = execSync(
      `"${tesseractPath}" "${imagePath}" stdout -l mar+eng`,
      { 
        encoding: 'utf8', 
        maxBuffer: 10 * 1024 * 1024,
        env: { ...process.env, TESSDATA_PREFIX: tessdataPath }
      }
    );
    
    // Extract all data from this page
    const voterIds = extractVoterIds(ocrOutput);
    const partNumbers = extractPartNumbers(ocrOutput);
    const names = extractNames(ocrOutput);
    const ages = extractAges(ocrOutput);
    const genders = extractGenders(ocrOutput);
    
    console.log(`  Voter IDs: ${voterIds.length}, Names: ${names.length}, Ages: ${ages.length}, Genders: ${genders.length}`);
    
    // Match data sequentially
    const pageVoters = [];
    const maxVoters = Math.max(voterIds.length, names.length);
    
    for (let i = 0; i < maxVoters; i++) {
      const voter = {
        pageNumber: pageNum,
        voterId: voterIds[i] || null,
        partNumber: partNumbers[i] || null,
        name: names[i] || null,
        age: ages[i] || null,
        gender: genders[i] || null,
        extractionQuality: {
          hasVoterId: !!voterIds[i],
          hasName: !!names[i],
          hasAge: !!ages[i],
          hasGender: !!genders[i]
        }
      };
      
      pageVoters.push(voter);
    }
    
    extractedData.push({
      page: pageNum,
      imageFile: imageFile,
      voters: pageVoters,
      rawText: ocrOutput.substring(0, 500) // Save first 500 chars for debugging
    });
    
    processedPages++;
    
    // Save intermediate results every 10 pages
    if (processedPages % 10 === 0) {
      fs.writeFileSync(
        path.join(OUTPUT_DIR, `extraction-progress-page${pageNum}.json`),
        JSON.stringify(extractedData, null, 2)
      );
      console.log(`  ✓ Saved progress (${processedPages} pages)`);
    }
    
  } catch (error) {
    console.log(`  ✗ Error processing page ${pageNum}: ${error.message}`);
    extractedData.push({
      page: pageNum,
      imageFile: imageFile,
      error: error.message,
      voters: []
    });
  }
  
  console.log('');
}

// Save complete extraction results
console.log('Saving extraction results...\n');
fs.writeFileSync(
  path.join(OUTPUT_DIR, 'complete-extraction.json'),
  JSON.stringify(extractedData, null, 2)
);

// Analyze extraction quality
console.log('=== Extraction Quality Analysis ===\n');

let totalExtracted = 0;
let withVoterId = 0;
let withName = 0;
let withAge = 0;
let withGender = 0;

extractedData.forEach(page => {
  page.voters.forEach(voter => {
    totalExtracted++;
    if (voter.voterId) withVoterId++;
    if (voter.name) withName++;
    if (voter.age) withAge++;
    if (voter.gender) withGender++;
  });
});

console.log(`Total voters extracted: ${totalExtracted}`);
console.log(`With Voter ID: ${withVoterId} (${((withVoterId/totalExtracted)*100).toFixed(1)}%)`);
console.log(`With Name: ${withName} (${((withName/totalExtracted)*100).toFixed(1)}%)`);
console.log(`With Age: ${withAge} (${((withAge/totalExtracted)*100).toFixed(1)}%)`);
console.log(`With Gender: ${withGender} (${((withGender/totalExtracted)*100).toFixed(1)}%)`);

console.log('\n✓ Extraction complete!');
console.log(`\nResults saved to: ${OUTPUT_DIR}/complete-extraction.json`);
console.log('\nNext step: Run assign-serial-numbers.js to assign correct serial numbers');
