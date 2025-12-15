const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Configure Tesseract
const tesseractPath = '"C:\\Program Files\\Tesseract-OCR\\tesseract.exe"';
const tessdataPrefix = 'D:\\web\\election\\voter';
process.env.TESSDATA_PREFIX = tessdataPrefix;

// Load existing database
const votersPath = 'public/data/voters.json';
const voters = JSON.parse(fs.readFileSync(votersPath, 'utf8'));

// Find all OCR page images
const imagesDir = 'pdflist/images/prabhag7ward1';
const imageFiles = fs.readdirSync(imagesDir)
  .filter(f => f.endsWith('.jpg') || f.endsWith('.png'))
  .sort();

console.log(`\n=== Simple Ward 7 Data Extraction ===\n`);
console.log(`Found ${imageFiles.length} OCR page images\n`);

// Create backup
const backupPath = `${votersPath}.backup-before-simple-extraction-${Date.now()}`;
fs.writeFileSync(backupPath, JSON.stringify(voters, null, 2));
console.log(`✓ Backup created: ${backupPath}\n`);

// Process each page
const extractedData = [];
let pageNumber = 0;

for (const imageFile of imageFiles) {
  pageNumber++;
  const imagePath = path.join(imagesDir, imageFile);
  
  console.log(`Processing Page ${pageNumber}: ${imageFile}`);
  
  try {
    // Run Tesseract
    const cmd = `${tesseractPath} "${imagePath}" - -l mar+eng --psm 6`;
    const ocrText = execSync(cmd, { 
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
      env: { ...process.env, TESSDATA_PREFIX: tessdataPrefix }
    });
    
    // Extract voter IDs (XUA/CRM/XRM + 7 digits)
    const voterIdPattern = /\b(XUA|CRM|XRM)(\d{7})\b/g;
    const voterIds = [];
    let match;
    while ((match = voterIdPattern.exec(ocrText)) !== null) {
      voterIds.push(match[0]);
    }
    
    // Extract part numbers (XXX/XXX/XXX format)
    const partNumberPattern = /\b(\d{3})\/(\d{3})\/(\d{3})\b/g;
    const partNumbers = [];
    while ((match = partNumberPattern.exec(ocrText)) !== null) {
      partNumbers.push(match[0]);
    }
    
    // Extract ages (2-digit or 3-digit numbers near gender keywords)
    const agePattern = /\b(\d{2,3})\b/g;
    const ages = [];
    const lines = ocrText.split('\n');
    for (const line of lines) {
      if (line.includes('वय') || line.includes('Age')) {
        const ageMatch = agePattern.exec(line);
        if (ageMatch) ages.push(parseInt(ageMatch[1]));
      }
    }
    
    // Extract genders
    const maleCount = (ocrText.match(/पु(?:रुष)?/g) || []).length;
    const femaleCount = (ocrText.match(/स्त्री/g) || []).length;
    
    console.log(`  Voter IDs: ${voterIds.length}, Part Numbers: ${partNumbers.length}, Ages: ${ages.length}`);
    console.log(`  Male: ${maleCount}, Female: ${femaleCount}`);
    
    // Store extracted data
    extractedData.push({
      pageNumber,
      imageFile,
      voterIds,
      partNumbers,
      ages,
      maleCount,
      femaleCount
    });
    
  } catch (error) {
    console.error(`  ✗ Error processing page: ${error.message}`);
    extractedData.push({
      pageNumber,
      imageFile,
      error: error.message,
      voterIds: [],
      partNumbers: [],
      ages: []
    });
  }
  
  console.log('');
}

// Save extraction results
const outputPath = `ward7-reextraction-output/simple-extraction-${Date.now()}.json`;
fs.mkdirSync('ward7-reextraction-output', { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(extractedData, null, 2));

console.log(`\n=== Extraction Complete ===\n`);
console.log(`Total pages processed: ${extractedData.length}`);
console.log(`Results saved to: ${outputPath}\n`);

// Analyze results
const totalVoterIds = extractedData.reduce((sum, p) => sum + p.voterIds.length, 0);
const totalAges = extractedData.reduce((sum, p) => sum + (p.ages?.length || 0), 0);
const pagesWithErrors = extractedData.filter(p => p.error).length;

console.log(`Summary:`);
console.log(`  Total Voter IDs extracted: ${totalVoterIds}`);
console.log(`  Total Ages extracted: ${totalAges}`);
console.log(`  Pages with errors: ${pagesWithErrors}`);
console.log(`\nNext step: Run assign-serial-numbers.js to match and correct serials\n`);
