const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Configure
const tesseractPath = 'C:\\Program Files\\Tesseract-OCR\\tesseract.exe';
const imagesDir = 'pdflist/images/prabhag7ward1';
const outputDir = 'ward7-reextraction-output';
fs.mkdirSync(outputDir, { recursive: true });

// Find all images
const imageFiles = fs.readdirSync(imagesDir)
  .filter(f => f.endsWith('.jpg') || f.endsWith('.png'))
  .sort();

console.log(`\n=== Extracting OCR Text from ${imageFiles.length} pages ===\n`);

// Process each page
for (let i = 0; i < imageFiles.length; i++) {
  const imageFile = imageFiles[i];
  const pageNumber = i + 1;
  const imagePath = path.join(imagesDir, imageFile);
  const outputTxtPath = path.join(outputDir, `page${String(pageNumber).padStart(3, '0')}.txt`);
  
  console.log(`[${pageNumber}/${imageFiles.length}] ${imageFile}`);
  
  try {
    // Use Tesseract to extract text and save to file
    const cmd = `"${tesseractPath}" "${imagePath}" "${outputTxtPath.replace('.txt', '')}" -l mar+eng --psm 6`;
    
    execSync(cmd, {
      stdio: 'inherit',
      env: { ...process.env, TESSDATA_PREFIX: 'D:\\web\\election\\voter' }
    });
    
    if (fs.existsSync(outputTxtPath)) {
      const textContent = fs.readFileSync(outputTxtPath, 'utf8');
      const voterIds = (textContent.match(/\b(XUA|CRM|XRM)\d{7}\b/g) || []).length;
      console.log(`  ✓ Extracted - ${voterIds} voter IDs, ${textContent.length} chars\n`);
    } else {
      console.log(`  ⚠ No output file created\n`);
    }
    
  } catch (error) {
    console.error(`  ✗ Error: ${error.message}\n`);
  }
}

console.log(`\n=== Extraction Complete ===`);
console.log(`OCR text files saved to: ${outputDir}/\n`);
