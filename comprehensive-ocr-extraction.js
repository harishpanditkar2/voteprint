const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

console.log('🔍 COMPREHENSIVE W7F2 & W7F3 OCR EXTRACTION\n');
console.log('Using multiple methods:');
console.log('  1. PDF to Images + Tesseract OCR');
console.log('  2. Direct PDF text extraction');
console.log('  3. Existing text files');
console.log('  4. Data merging and validation\n');

// Check prerequisites
function checkPrerequisites() {
  console.log('📋 Checking prerequisites...');
  
  const checks = {
    tesseract: false,
    pdftoppm: false,
    pdftotext: false
  };
  
  try {
    execSync('tesseract --version', { stdio: 'ignore' });
    checks.tesseract = true;
    console.log('  ✅ Tesseract OCR found');
  } catch {
    console.log('  ❌ Tesseract OCR not found');
  }
  
  try {
    execSync('pdftoppm -h', { stdio: 'ignore' });
    checks.pdftoppm = true;
    console.log('  ✅ pdftoppm (poppler) found');
  } catch {
    console.log('  ❌ pdftoppm not found');
  }
  
  try {
    execSync('pdftotext -h', { stdio: 'ignore' });
    checks.pdftotext = true;
    console.log('  ✅ pdftotext found');
  } catch {
    console.log('  ❌ pdftotext not found');
  }
  
  console.log('');
  return checks;
}

// Method 1: Convert PDF to images and OCR
async function extractFromImages(pdfPath, booth) {
  console.log(`\n📷 Method 1: PDF → Images → OCR for Booth ${booth}`);
  
  const outputDir = `./temp-images-w7f${booth}`;
  
  try {
    // Create temp directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log('  Converting PDF to images...');
    
    // Convert PDF to PNG images using pdftoppm
    execSync(`pdftoppm -png -r 300 "${pdfPath}" "${outputDir}/page"`, { stdio: 'inherit' });
    
    console.log('  ✅ PDF converted to images');
    
    // Get all image files
    const imageFiles = fs.readdirSync(outputDir)
      .filter(f => f.endsWith('.png'))
      .sort();
    
    console.log(`  Found ${imageFiles.length} pages`);
    console.log('  Running Tesseract OCR on each page...\n');
    
    let allText = '';
    
    for (const imageFile of imageFiles) {
      const imagePath = path.join(outputDir, imageFile);
      const outputBase = path.join(outputDir, imageFile.replace('.png', ''));
      
      console.log(`    Processing ${imageFile}...`);
      
      try {
        // Run Tesseract with Devanagari + English
        execSync(`tesseract "${imagePath}" "${outputBase}" -l hin+eng --psm 6`, { stdio: 'ignore' });
        
        // Read OCR result
        const textFile = `${outputBase}.txt`;
        if (fs.existsSync(textFile)) {
          const pageText = fs.readFileSync(textFile, 'utf-8');
          allText += pageText + '\n';
          console.log(`      ✅ ${pageText.split('\n').length} lines extracted`);
        }
      } catch (error) {
        console.log(`      ⚠️  OCR failed: ${error.message}`);
      }
    }
    
    // Save combined text
    const outputTextFile = `./ocr-images-w7f${booth}-complete.txt`;
    fs.writeFileSync(outputTextFile, allText);
    console.log(`\n  💾 Saved to ${outputTextFile}`);
    
    // Parse voters from text
    const voters = parseVoterText(allText, booth);
    console.log(`  ✅ Extracted ${voters.length} voters from images\n`);
    
    return voters;
    
  } catch (error) {
    console.log(`  ❌ Image extraction failed: ${error.message}\n`);
    return [];
  }
}

// Method 2: Direct PDF text extraction
function extractFromPDF(pdfPath, booth) {
  console.log(`\n📄 Method 2: Direct PDF text extraction for Booth ${booth}`);
  
  try {
    const outputFile = `./pdf-text-w7f${booth}.txt`;
    
    console.log('  Extracting text with pdftotext...');
    execSync(`pdftotext -layout "${pdfPath}" "${outputFile}"`, { stdio: 'ignore' });
    
    const text = fs.readFileSync(outputFile, 'utf-8');
    console.log(`  ✅ Extracted ${text.split('\n').length} lines`);
    
    const voters = parseVoterText(text, booth);
    console.log(`  ✅ Parsed ${voters.length} voters from PDF\n`);
    
    return voters;
    
  } catch (error) {
    console.log(`  ❌ PDF extraction failed: ${error.message}\n`);
    return [];
  }
}

// Method 3: Parse existing text files
function extractFromExistingText(booth) {
  console.log(`\n📄 Method 3: Parsing existing W7F${booth}.txt`);
  
  try {
    const textFile = `./pdflist/W7F${booth}.txt`;
    const text = fs.readFileSync(textFile, 'utf-8');
    
    const voters = parseVoterText(text, booth);
    console.log(`  ✅ Parsed ${voters.length} voters from existing text\n`);
    
    return voters;
    
  } catch (error) {
    console.log(`  ❌ Failed: ${error.message}\n`);
    return [];
  }
}

// Universal voter text parser
function parseVoterText(text, booth) {
  const voters = [];
  const lines = text.split('\n');
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    
    // Match voter ID line
    const idMatch = line.match(/^(\d+)\s+(XUA|CRM|TML|NBS|DMV|TGY|UZZ|NYM|ZSL|NJV)([A-B]?\d{7})\s+(\d{3}\/\d{3}\/\d{3})/);
    
    if (idMatch) {
      const serial = parseInt(idMatch[1]);
      const voterId = idMatch[2] + idMatch[3];
      const partNumber = idMatch[4];
      
      // Collect next 8-10 lines for voter data
      const dataBlock = [];
      for (let j = 0; j < 10 && i + j < lines.length; j++) {
        dataBlock.push(lines[i + j]);
      }
      
      const voterData = extractVoterData(dataBlock.join('\n'));
      
      voters.push({
        serial,
        voterId,
        partNumber,
        name: voterData.name || 'N/A',
        age: voterData.age || 'N/A',
        gender: voterData.gender || 'N/A',
        relation: voterData.relation || 'N/A',
        house: voterData.house || 'N/A',
        ward: '7',
        booth: booth,
        serialNumber: serial.toString(),
        actualWard: '7',
        actualBooth: booth
      });
      
      i += 10;
    } else {
      i++;
    }
  }
  
  return voters;
}

// Extract voter data from text block
function extractVoterData(block) {
  const data = {
    name: '',
    age: '',
    gender: '',
    relation: '',
    house: ''
  };
  
  // Extract name
  const nameMatch = block.match(/मतदाराचे\s*(?:पूर्ण|पुर्ण)\s*(?:नांव)?\s*:?\s*([^\n\|]+?)(?:\s*(?:नांव|वडिलांचे|पतीचे)|\||$)/);
  if (nameMatch) {
    data.name = nameMatch[1].trim()
      .replace(/\s*नांव.*$/i, '')
      .replace(/\s*वडिलांचे.*$/i, '')
      .replace(/\s*पतीचे.*$/i, '')
      .trim();
  }
  
  // Extract relation
  const relationMatch = block.match(/(?:वडिलांचे|पतीचे|आईचे)\s*(?:नाव|नांव)?\s*:?\s*([^\n\|०]+?)(?:\s*(?:oo|o०|०o|००|घर)|\||$)/);
  if (relationMatch) {
    data.relation = relationMatch[1].trim()
      .replace(/[०।॥]+.*$/, '')
      .trim();
  }
  
  // Extract house
  const houseMatch = block.match(/(?:घर|घेर|चर|चिर)\s*क्रमांक\s*:?\s*([^\n\|]+?)(?:\s*(?:वय|लिंग)|\||$)/);
  if (houseMatch) {
    data.house = houseMatch[1].trim()
      .replace(/\s*(?:e|ot|पडि).*$/i, '')
      .replace(/[-।]+$/, '')
      .trim();
    if (data.house === '-' || data.house === '।') data.house = '';
  }
  
  // Extract age
  const ageMatch = block.match(/(?:वय|[Tvय])\s*:?\s*([०-९\d]{1,3})/);
  if (ageMatch) {
    let age = ageMatch[1];
    // Convert Devanagari to Arabic numerals
    age = age.replace(/[०-९]/g, d => String.fromCharCode(d.charCodeAt(0) - 0x0966 + 48));
    const ageNum = parseInt(age);
    if (ageNum >= 18 && ageNum <= 120) {
      data.age = age;
    }
  }
  
  // Extract gender
  if (block.includes('ख्री') || block.includes('स्री') || block.includes('स्त्री')) {
    data.gender = 'F';
  } else if (block.includes('पुरुष') || /\bपु\b/.test(block)) {
    data.gender = 'M';
  } else if (block.includes('it')) {
    // 'it' often appears after female gender in OCR
    data.gender = 'F';
  }
  
  return data;
}

// Merge multiple extraction results
function mergeResults(results, booth) {
  console.log(`\n🔄 Merging results for Booth ${booth}...`);
  
  const voterMap = {};
  
  // Process all results
  results.forEach((result, idx) => {
    console.log(`  Processing method ${idx + 1}: ${result.voters.length} voters`);
    
    result.voters.forEach(voter => {
      if (!voterMap[voter.voterId]) {
        voterMap[voter.voterId] = { ...voter };
      } else {
        // Merge data - prefer non-empty values
        const existing = voterMap[voter.voterId];
        
        if (!existing.name || existing.name === 'N/A') existing.name = voter.name;
        if (!existing.age || existing.age === 'N/A') existing.age = voter.age;
        if (!existing.gender || existing.gender === 'N/A') existing.gender = voter.gender;
        if (!existing.relation || existing.relation === 'N/A') existing.relation = voter.relation;
        if (!existing.house || existing.house === 'N/A') existing.house = voter.house;
      }
    });
  });
  
  const merged = Object.values(voterMap);
  console.log(`  ✅ Merged to ${merged.length} unique voters\n`);
  
  return merged;
}

// Main execution
async function main() {
  const checks = checkPrerequisites();
  
  // Process W7F2
  console.log('\n' + '='.repeat(60));
  console.log('PROCESSING W7F2 (Booth 2)');
  console.log('='.repeat(60));
  
  const w7f2PDF = './pdflist/BoothVoterList_A4_Ward_7_Booth_2 - converted.pdf';
  const w7f2Results = [];
  
  if (checks.tesseract && checks.pdftoppm) {
    const imageResults = await extractFromImages(w7f2PDF, '2');
    w7f2Results.push({ method: 'Images+OCR', voters: imageResults });
  }
  
  if (checks.pdftotext) {
    const pdfResults = extractFromPDF(w7f2PDF, '2');
    w7f2Results.push({ method: 'PDF Text', voters: pdfResults });
  }
  
  const textResults2 = extractFromExistingText('2');
  w7f2Results.push({ method: 'Existing Text', voters: textResults2 });
  
  const w7f2Final = mergeResults(w7f2Results, '2');
  
  // Process W7F3
  console.log('\n' + '='.repeat(60));
  console.log('PROCESSING W7F3 (Booth 3)');
  console.log('='.repeat(60));
  
  const w7f3PDF = './pdflist/BoothVoterList_A4_Ward_7_Booth_3 - converted.pdf';
  const w7f3Results = [];
  
  if (checks.tesseract && checks.pdftoppm) {
    const imageResults = await extractFromImages(w7f3PDF, '3');
    w7f3Results.push({ method: 'Images+OCR', voters: imageResults });
  }
  
  if (checks.pdftotext) {
    const pdfResults = extractFromPDF(w7f3PDF, '3');
    w7f3Results.push({ method: 'PDF Text', voters: pdfResults });
  }
  
  const textResults3 = extractFromExistingText('3');
  w7f3Results.push({ method: 'Existing Text', voters: textResults3 });
  
  const w7f3Final = mergeResults(w7f3Results, '3');
  
  // Update database
  console.log('\n' + '='.repeat(60));
  console.log('UPDATING DATABASE');
  console.log('='.repeat(60) + '\n');
  
  const currentVoters = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf-8'));
  
  // Backup
  const backupPath = `voters-backup-comprehensive-ocr-${Date.now()}.json`;
  fs.writeFileSync(backupPath, JSON.stringify(currentVoters, null, 2));
  console.log(`💾 Backup: ${backupPath}\n`);
  
  // Keep W7F1, replace W7F2 and W7F3
  const w7f1 = currentVoters.filter(v => v.ward === '7' && v.booth === '1');
  
  const updatedVoters = [...w7f1, ...w7f2Final, ...w7f3Final];
  
  console.log('📊 Database Update:');
  console.log(`  W7F1: ${w7f1.length} voters (unchanged)`);
  console.log(`  W7F2: ${w7f2Final.length} voters (new extraction)`);
  console.log(`  W7F3: ${w7f3Final.length} voters (new extraction)`);
  console.log(`  Total: ${updatedVoters.length} voters\n`);
  
  // Quality report
  const reportData = (voters, label) => {
    const withNames = voters.filter(v => v.name && v.name !== 'N/A').length;
    const withAges = voters.filter(v => v.age && v.age !== 'N/A' && parseInt(v.age) >= 18).length;
    const males = voters.filter(v => v.gender === 'M').length;
    const females = voters.filter(v => v.gender === 'F').length;
    
    console.log(`${label}:`);
    console.log(`  Names: ${withNames}/${voters.length} (${(withNames/voters.length*100).toFixed(1)}%)`);
    console.log(`  Ages: ${withAges}/${voters.length} (${(withAges/voters.length*100).toFixed(1)}%)`);
    console.log(`  Genders: M=${males}, F=${females}`);
  };
  
  console.log('📊 Quality Report:\n');
  reportData(w7f2Final, 'W7F2');
  console.log('');
  reportData(w7f3Final, 'W7F3');
  
  // Save
  fs.writeFileSync('./public/data/voters.json', JSON.stringify(updatedVoters, null, 2));
  
  console.log('\n✅ COMPREHENSIVE EXTRACTION COMPLETE!\n');
  
  // Save individual results
  fs.writeFileSync('w7f2-comprehensive.json', JSON.stringify(w7f2Final, null, 2));
  fs.writeFileSync('w7f3-comprehensive.json', JSON.stringify(w7f3Final, null, 2));
  
  console.log('💾 Saved detailed results:');
  console.log('  - w7f2-comprehensive.json');
  console.log('  - w7f3-comprehensive.json\n');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
