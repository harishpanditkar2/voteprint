const fs = require('fs');

console.log('🔍 NODE.JS COMPREHENSIVE OCR EXTRACTION\n');
console.log('Processing W7F2 and W7F3 using multiple methods...\n');

// Method 1: Direct PDF text extraction
async function extractFromPDF(pdfPath, booth) {
  console.log(`\n📄 Extracting text from Booth ${booth} PDF...`);
  
  try {
    // Try to use pdf-parse if available
    const pdf = require('pdf-parse');
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    
    console.log(`  ✅ Extracted ${data.numpages} pages, ${data.text.length} characters`);
    
    // Save raw text
    const textFile = `./pdf-extracted-w7f${booth}.txt`;
    fs.writeFileSync(textFile, data.text);
    console.log(`  💾 Saved to ${textFile}`);
    
    return data.text;
  } catch (error) {
    console.log(`  ⚠️  PDF extraction skipped: ${error.message}`);
    return '';
  }
}

// Parse voter data from text
function parseVoters(text, booth) {
  console.log(`\n🔄 Parsing voters from Booth ${booth} text...`);
  
  const voters = [];
  const lines = text.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Match voter ID line with various patterns
    const patterns = [
      /^(\d+)\s+(XUA|CRM|TML|NBS|DMV|TGY|UZZ|NYM|ZSL|NJV)([A-B]?\d{7})\s+(\d{3}\/\d{3}\/\d{3})/,
      /(\d+)\s*\|\s*(XUA|CRM|TML|NBS|DMV|TGY|UZZ|NYM|ZSL|NJV)([A-B]?\d{7})\s+(\d{3}\/\d{3}\/\d{3})/
    ];
    
    let match = null;
    for (const pattern of patterns) {
      match = line.match(pattern);
      if (match) break;
    }
    
    if (match) {
      const serial = parseInt(match[1]);
      const voterId = match[2] + match[3];
      const partNumber = match[4];
      
      // Collect next lines for voter data
      const dataLines = [];
      for (let j = i; j < Math.min(i + 12, lines.length); j++) {
        dataLines.push(lines[j]);
      }
      
      const dataBlock = dataLines.join('\n');
      const voterData = extractVoterInfo(dataBlock);
      
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
      
      i += 12;
    }
  }
  
  console.log(`  ✅ Parsed ${voters.length} voters`);
  return voters;
}

// Extract individual voter information
function extractVoterInfo(block) {
  const info = {
    name: '',
    age: '',
    gender: '',
    relation: '',
    house: ''
  };
  
  // Name extraction - multiple patterns
  const namePatterns = [
    /मतदाराचे\s*(?:पूर्ण|पुर्ण)\s*(?:नांव)?\s*:?\s*([^\n\|]+?)(?:\s*(?:नांव|वडिलांचे|पतीचे|आईचे)|\||$)/i,
    /(?:पूर्ण|पुर्ण)\s*(?:नांव)?\s*:?\s*([^\n\|]+?)(?:\s*(?:वडिलांचे|पतीचे)|\||$)/i
  ];
  
  for (const pattern of namePatterns) {
    const match = block.match(pattern);
    if (match) {
      info.name = match[1].trim()
        .replace(/\s*(?:नांव|नाव).*$/i, '')
        .replace(/\s*वडिलांचे.*$/i, '')
        .replace(/\s*पतीचे.*$/i, '')
        .replace(/\s*\[.*$/i, '')
        .trim();
      if (info.name.length > 2) break;
    }
  }
  
  // Relation extraction
  const relationPatterns = [
    /(?:वडिलांचे|पतीचे|आईचे)\s*(?:नाव|नांव)?\s*:?\s*([^\n\|०]+?)(?:\s*(?:oo|o०|०o|००|घर|घेर|चर)|\||$)/i
  ];
  
  for (const pattern of relationPatterns) {
    const match = block.match(pattern);
    if (match) {
      info.relation = match[1].trim()
        .replace(/[०।॥]+.*$/, '')
        .replace(/\s*oo.*$/i, '')
        .trim();
      if (info.relation.length > 2) break;
    }
  }
  
  // House extraction
  const housePatterns = [
    /(?:घर|घेर|चर|चिर)\s*क्रमांक\s*:?\s*([^\n\|]+?)(?:\s*(?:वय|लिंग)|\||$)/i
  ];
  
  for (const pattern of housePatterns) {
    const match = block.match(pattern);
    if (match) {
      info.house = match[1].trim()
        .replace(/\s*(?:e|ot|पडि).*$/i, '')
        .replace(/[-।]+$/, '')
        .trim();
      if (info.house && info.house !== '-' && info.house !== '।') break;
    }
  }
  
  // Age extraction - try multiple patterns
  const agePatterns = [
    /(?:वय|[Tvय])\s*:?\s*([०-९\d]{1,3})/i,
    /age\s*:?\s*(\d{1,3})/i
  ];
  
  for (const pattern of agePatterns) {
    const match = block.match(pattern);
    if (match) {
      let age = match[1];
      // Convert Devanagari numerals
      age = age.replace(/[०-९]/g, d => String.fromCharCode(d.charCodeAt(0) - 0x0966 + 48));
      const ageNum = parseInt(age);
      if (ageNum >= 18 && ageNum <= 120) {
        info.age = age;
        break;
      }
    }
  }
  
  // Gender extraction - multiple indicators
  if (block.match(/(?:ख्री|स्री|स्त्री)/i)) {
    info.gender = 'F';
  } else if (block.match(/\bपुरुष\b|\bपु\b/i)) {
    info.gender = 'M';
  } else if (block.match(/\bit\b/i) && !block.match(/\bपु\b/i)) {
    // 'it' often appears after female gender
    info.gender = 'F';
  } else if (block.match(/लिंग\s*:?\s*स्/i)) {
    info.gender = 'F';
  } else if (block.match(/(?:female|woman)/i)) {
    info.gender = 'F';
  } else if (block.match(/(?:male|man)/i)) {
    info.gender = 'M';
  }
  
  // Smart gender inference from name patterns (common endings)
  if (!info.gender || info.gender === 'N/A') {
    const name = info.name.toLowerCase();
    // Female name endings
    if (name.match(/(ता|नी|ली|री|या|बाई|देवी|कुमारी)$/)) {
      info.gender = 'F';
    }
    // Male name endings  
    else if (name.match(/(श|र|न|त|द|ल|क|ज)$/)) {
      info.gender = 'M';
    }
  }
  
  return info;
}

// Merge data from multiple sources
function mergeVoterData(sources, booth) {
  console.log(`\n🔄 Merging data for Booth ${booth}...`);
  
  const voterMap = {};
  
  sources.forEach((source, idx) => {
    console.log(`  Processing source ${idx + 1}: ${source.voters.length} voters`);
    
    source.voters.forEach(voter => {
      if (!voterMap[voter.voterId]) {
        voterMap[voter.voterId] = { ...voter };
      } else {
        const existing = voterMap[voter.voterId];
        
        // Prefer better quality data
        if (!existing.name || existing.name === 'N/A' || existing.name.length < 3) {
          if (voter.name && voter.name !== 'N/A' && voter.name.length >= 3) {
            existing.name = voter.name;
          }
        }
        
        if (!existing.age || existing.age === 'N/A') {
          if (voter.age && voter.age !== 'N/A') {
            existing.age = voter.age;
          }
        }
        
        if (!existing.gender || existing.gender === 'N/A') {
          if (voter.gender && voter.gender !== 'N/A') {
            existing.gender = voter.gender;
          }
        }
        
        if (!existing.relation || existing.relation === 'N/A' || existing.relation.length < 3) {
          if (voter.relation && voter.relation !== 'N/A' && voter.relation.length >= 3) {
            existing.relation = voter.relation;
          }
        }
        
        if (!existing.house || existing.house === 'N/A') {
          if (voter.house && voter.house !== 'N/A') {
            existing.house = voter.house;
          }
        }
      }
    });
  });
  
  const merged = Object.values(voterMap).sort((a, b) => a.serial - b.serial);
  console.log(`  ✅ Merged to ${merged.length} unique voters`);
  
  return merged;
}

// Quality report
function qualityReport(voters, label) {
  const withNames = voters.filter(v => v.name && v.name !== 'N/A' && v.name.length > 2).length;
  const withAges = voters.filter(v => v.age && v.age !== 'N/A' && parseInt(v.age) >= 18).length;
  const males = voters.filter(v => v.gender === 'M').length;
  const females = voters.filter(v => v.gender === 'F').length;
  const noGender = voters.filter(v => v.gender !== 'M' && v.gender !== 'F').length;
  
  console.log(`\n📊 ${label} Quality Report:`);
  console.log(`  Total: ${voters.length}`);
  console.log(`  Names: ${withNames}/${voters.length} (${(withNames/voters.length*100).toFixed(1)}%)`);
  console.log(`  Ages: ${withAges}/${voters.length} (${(withAges/voters.length*100).toFixed(1)}%)`);
  console.log(`  Genders: M=${males}, F=${females}, Unknown=${noGender}`);
  
  if (voters.length > 0) {
    console.log(`\n  Sample voters:`);
    voters.slice(0, 10).forEach(v => {
      const icon = v.gender === 'M' ? '👨' : v.gender === 'F' ? '👩' : '❓';
      console.log(`    ${icon} ${v.serial}. ${v.name} (${v.age}/${v.gender})`);
    });
  }
}

// Main execution
async function main() {
  try {
    // Process W7F2
    console.log('\n' + '='.repeat(60));
    console.log('PROCESSING W7F2 (Booth 2)');
    console.log('='.repeat(60));
    
    const w7f2PDF = './pdflist/BoothVoterList_A4_Ward_7_Booth_2 - converted.pdf';
    const w7f2Sources = [];
    
    // Extract from PDF
    const w7f2Text = await extractFromPDF(w7f2PDF, '2');
    if (w7f2Text) {
      const pdfVoters = parseVoters(w7f2Text, '2');
      w7f2Sources.push({ name: 'PDF Extract', voters: pdfVoters });
    }
    
    // Parse existing text file
    if (fs.existsSync('./pdflist/W7F2.txt')) {
      console.log('\n📄 Parsing existing W7F2.txt...');
      const existingText = fs.readFileSync('./pdflist/W7F2.txt', 'utf-8');
      const existingVoters = parseVoters(existingText, '2');
      w7f2Sources.push({ name: 'Existing Text', voters: existingVoters });
    }
    
    const w7f2Final = mergeVoterData(w7f2Sources, '2');
    qualityReport(w7f2Final, 'W7F2');
    
    // Process W7F3
    console.log('\n' + '='.repeat(60));
    console.log('PROCESSING W7F3 (Booth 3)');
    console.log('='.repeat(60));
    
    const w7f3PDF = './pdflist/BoothVoterList_A4_Ward_7_Booth_3 - converted.pdf';
    const w7f3Sources = [];
    
    // Extract from PDF
    const w7f3Text = await extractFromPDF(w7f3PDF, '3');
    if (w7f3Text) {
      const pdfVoters = parseVoters(w7f3Text, '3');
      w7f3Sources.push({ name: 'PDF Extract', voters: pdfVoters });
    }
    
    // Parse existing text file
    if (fs.existsSync('./pdflist/W7F3.txt')) {
      console.log('\n📄 Parsing existing W7F3.txt...');
      const existingText = fs.readFileSync('./pdflist/W7F3.txt', 'utf-8');
      const existingVoters = parseVoters(existingText, '3');
      w7f3Sources.push({ name: 'Existing Text', voters: existingVoters });
    }
    
    const w7f3Final = mergeVoterData(w7f3Sources, '3');
    qualityReport(w7f3Final, 'W7F3');
    
    // Update database
    console.log('\n' + '='.repeat(60));
    console.log('UPDATING DATABASE');
    console.log('='.repeat(60));
    
    const currentVoters = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf-8'));
    
    // Backup
    const backupPath = `voters-backup-nodejs-ocr-${Date.now()}.json`;
    fs.writeFileSync(backupPath, JSON.stringify(currentVoters, null, 2));
    console.log(`\n💾 Backup: ${backupPath}`);
    
    // Keep W7F1, replace W7F2 and W7F3
    const w7f1 = currentVoters.filter(v => v.ward === '7' && v.booth === '1');
    
    const updatedVoters = [...w7f1, ...w7f2Final, ...w7f3Final];
    
    console.log('\n📊 Database Update:');
    console.log(`  W7F1: ${w7f1.length} voters (unchanged)`);
    console.log(`  W7F2: ${w7f2Final.length} voters (new)`);
    console.log(`  W7F3: ${w7f3Final.length} voters (new)`);
    console.log(`  Total: ${updatedVoters.length} voters`);
    
    // Save
    fs.writeFileSync('./public/data/voters.json', JSON.stringify(updatedVoters, null, 2));
    
    // Save extraction results
    fs.writeFileSync('w7f2-nodejs-extraction.json', JSON.stringify(w7f2Final, null, 2));
    fs.writeFileSync('w7f3-nodejs-extraction.json', JSON.stringify(w7f3Final, null, 2));
    
    console.log('\n✅ EXTRACTION COMPLETE!');
    console.log('\nSaved results:');
    console.log('  - w7f2-nodejs-extraction.json');
    console.log('  - w7f3-nodejs-extraction.json\n');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
