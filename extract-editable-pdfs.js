const fs = require('fs');
const { getDocument } = require('pdfjs-dist/legacy/build/pdf.js');

console.log('═══════════════════════════════════════════════════');
console.log('  EXTRACTING TEXT FROM EDITABLE PDFs');
console.log('═══════════════════════════════════════════════════\n');

async function extractTextFromPDF(pdfPath) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const loadingTask = getDocument({ data });
  const pdfDocument = await loadingTask.promise;
  
  let fullText = '';
  console.log(`  Pages: ${pdfDocument.numPages}`);
  
  for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText;
}

async function extractVotersFromText(text, fileNumber) {
  const lines = text.split('\n');
  const voters = [];
  const processedIds = new Set();
  
  // Join lines to handle text split across lines
  const fullText = text.replace(/\n/g, ' ');
  
  // Find all voter IDs
  const voterIdPattern = /XUA\d{7}/g;
  const voterIds = [...fullText.matchAll(voterIdPattern)].map(m => m[0]);
  
  console.log(`  Found ${voterIds.length} voter IDs`);
  
  for (const voterId of voterIds) {
    if (processedIds.has(voterId)) continue;
    
    // Get text around this voter ID
    const voterIndex = fullText.indexOf(voterId);
    const contextStart = Math.max(0, voterIndex - 200);
    const contextEnd = Math.min(fullText.length, voterIndex + 300);
    const context = fullText.substring(contextStart, contextEnd);
    
    // Extract serial number (usually a 1-3 digit number before the voter ID)
    const serialPattern = /(\d{1,3})\s+(?:[A-Z\s]*)?XUA\d{7}/;
    const serialMatch = context.match(serialPattern);
    const serialNumber = serialMatch ? serialMatch[1] : null;
    
    if (!serialNumber) continue;
    
    // Extract name (Devanagari text after "मतदाराचे पूर्ण नांव" or similar)
    let name = '';
    const namePatterns = [
      /मतदाराचे\s*पूर्ण\s*नांव\s*[:：]?\s*([ऀ-ॿ\s]+?)(?=\s+वडिलांचे|\s+पतीचे|\s+घर|\s+XUA|$)/,
      /पूर्ण\s*नांव\s*[:：]?\s*([ऀ-ॿ\s]+?)(?=\s+वडिलांचे|\s+पतीचे|\s+घर|\s+XUA|$)/,
      /नांव\s*[:：]?\s*([ऀ-ॿ\s]+?)(?=\s+वडिलांचे|\s+पतीचे|$)/
    ];
    
    for (const pattern of namePatterns) {
      const match = context.match(pattern);
      if (match && match[1].trim().length > 3) {
        name = match[1].trim();
        break;
      }
    }
    
    if (!name) continue;
    
    // Clean name
    name = name.replace(/\s+/g, ' ').substring(0, 100);
    
    // Extract age
    const agePattern = /वय\s*[:：]?\s*([०-९\d]+)/;
    const ageMatch = context.match(agePattern);
    let age = '30';
    if (ageMatch) {
      age = ageMatch[1]
        .replace(/०/g, '0').replace(/१/g, '1').replace(/२/g, '2')
        .replace(/३/g, '3').replace(/४/g, '4').replace(/५/g, '5')
        .replace(/६/g, '6').replace(/७/g, '7').replace(/८/g, '8')
        .replace(/९/g, '9');
    }
    
    // Extract gender
    const genderPattern = /लिंग\s*[:：]?\s*(पु|स्री|ख्री|सरी)/;
    const genderMatch = context.match(genderPattern);
    let gender = 'M';
    if (genderMatch) {
      gender = genderMatch[1] === 'पु' ? 'M' : 'F';
    } else if (context.includes('पतीचे')) {
      gender = 'F';
    }
    
    voters.push({
      voterId,
      name,
      uniqueSerial: `W7F${fileNumber}-S${serialNumber}`,
      serialNumber,
      age,
      gender,
      ward: "7",
      booth: fileNumber.toString()
    });
    
    processedIds.add(voterId);
  }
  
  // Sort by serial number
  voters.sort((a, b) => parseInt(a.serialNumber) - parseInt(b.serialNumber));
  
  return voters;
}

async function main() {
  try {
    const allVoters = [];
    
    // File 1
    console.log('\n📄 Processing Booth 1 PDF...');
    const text1 = await extractTextFromPDF('./pdflist/BoothVoterList_A4_Ward_7_Booth_1 - converted.pdf');
    const voters1 = await extractVotersFromText(text1, 1);
    console.log(`✅ Extracted ${voters1.length} voters (expected 991)`);
    allVoters.push(...voters1);
    
    // File 2
    console.log('\n📄 Processing Booth 2 PDF...');
    const text2 = await extractTextFromPDF('./pdflist/BoothVoterList_A4_Ward_7_Booth_2 - converted.pdf');
    const voters2 = await extractVotersFromText(text2, 2);
    console.log(`✅ Extracted ${voters2.length} voters (expected 861)`);
    allVoters.push(...voters2);
    
    // File 3
    console.log('\n📄 Processing Booth 3 PDF...');
    const text3 = await extractTextFromPDF('./pdflist/BoothVoterList_A4_Ward_7_Booth_3 - converted.pdf');
    const voters3 = await extractVotersFromText(text3, 3);
    console.log(`✅ Extracted ${voters3.length} voters (expected 863)`);
    allVoters.push(...voters3);
    
    console.log('\n' + '═'.repeat(50));
    console.log(`📊 TOTAL EXTRACTED: ${allVoters.length} voters`);
    console.log(`   Target: 2,715 voters`);
    console.log('═'.repeat(50));
    
    // Assign anukramank
    allVoters.forEach((voter, index) => {
      voter.anukramank = index + 1;
    });
    
    // Check duplicates
    const ids = allVoters.map(v => v.voterId);
    const unique = new Set(ids);
    console.log(`\n✅ Unique voters: ${unique.size}`);
    if (ids.length !== unique.size) {
      console.log(`⚠️  Removed ${ids.length - unique.size} duplicates`);
    }
    
    // Sample
    console.log('\n📋 First 5 voters:');
    allVoters.slice(0, 5).forEach(v => {
      console.log(`  अ.क्र. ${v.anukramank} | ${v.uniqueSerial} | ${v.name}`);
    });
    
    // Save
    const votersPath = './public/data/voters.json';
    if (fs.existsSync(votersPath)) {
      const existing = JSON.parse(fs.readFileSync(votersPath, 'utf8'));
      if (existing.length > 0) {
        fs.writeFileSync(`${votersPath}.backup-${Date.now()}`, JSON.stringify(existing, null, 2));
        console.log('\n✅ Backup created');
      }
    }
    
    fs.writeFileSync(votersPath, JSON.stringify(allVoters, null, 2));
    console.log(`✅ Saved ${allVoters.length} voters to database`);
    
    console.log('\n' + '═'.repeat(50));
    console.log('  ✅ IMPORT COMPLETE!');
    console.log('═'.repeat(50));
    console.log('\n  Start: npm run dev');
    console.log('  Open: http://localhost:3000\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  }
}

main();
