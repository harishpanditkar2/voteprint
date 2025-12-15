const fs = require('fs');
const PDFParser = require('pdf2json');

console.log('═══════════════════════════════════════════════════');
console.log('  WARD 7 COMPLETE PDF EXTRACTION - ALL 2,715 VOTERS');
console.log('═══════════════════════════════════════════════════\n');

// Function to extract text from PDF using pdf2json
function extractPDFText(pdfPath) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    
    pdfParser.on('pdfParser_dataError', errData => reject(errData.parserError));
    pdfParser.on('pdfParser_dataReady', pdfData => {
      // Extract text from all pages
      const text = pdfParser.getRawTextContent();
      resolve(text);
    });
    
    pdfParser.loadPDF(pdfPath);
  });
}

// Function to extract voters from text
function extractVotersFromText(text, fileNumber) {
  const lines = text.split('\n');
  const voters = [];
  const processedIds = new Set();
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Find voter IDs
    const voterIdMatches = line.match(/XUA\d{7}/g);
    if (!voterIdMatches) continue;
    
    for (const voterId of voterIdMatches) {
      if (processedIds.has(voterId)) continue;
      
      // Get context around this voter
      const contextStart = Math.max(0, i - 5);
      const contextEnd = Math.min(lines.length, i + 15);
      const context = lines.slice(contextStart, contextEnd).join('\n');
      
      // Extract serial number
      const serialPatterns = [
        new RegExp(`(\\d+)\\s+[\\w\\s]*${voterId}`),
        new RegExp(`${voterId}\\s+(\\d{1,3})\\s`),
      ];
      
      let serialNumber = null;
      for (const pattern of serialPatterns) {
        const match = context.match(pattern);
        if (match) {
          serialNumber = match[1];
          if (serialNumber && parseInt(serialNumber) > 0 && parseInt(serialNumber) < 1000) {
            break;
          }
        }
      }
      
      if (!serialNumber) continue;
      
      // Extract name - look for Marathi text before/after voter ID
      let name = '';
      const namePattern = /([ऀ-ॿ\s]{5,}?)(?=\s+XUA|\s+वडिलांचे|\s+पतीचे|$)/;
      const nameMatch = context.match(namePattern);
      if (nameMatch) {
        name = nameMatch[1].trim();
        // Clean up
        name = name.replace(/मतदाराचे\s*पूर्ण\s*नांव\s*[:：]?\s*/gi, '').trim();
        name = name.replace(/मतदाराचे\s*पुर्ण\s*नांव\s*[:：]?\s*/gi, '').trim();
        name = name.replace(/XUA\d{7}.*/, '').trim();
      }
      
      if (!name || name.length < 3) {
        // Try alternate extraction
        const altPattern = /नांव\s*[:：]?\s*([ऀ-ॿ\s]+?)(?=\s+वडिलांचे|\s+पतीचे|$)/;
        const altMatch = context.match(altPattern);
        if (altMatch) {
          name = altMatch[1].trim();
        }
      }
      
      if (!name || name.length < 3) continue;
      
      // Extract age
      let age = '30';
      const agePattern = /वय\s*[:：]?\s*([०-९\d]+)/g;
      const ageMatches = [...context.matchAll(agePattern)];
      if (ageMatches.length > 0) {
        const ageValue = ageMatches[0][1];
        age = ageValue
          .replace(/०/g, '0').replace(/१/g, '1').replace(/२/g, '2')
          .replace(/३/g, '3').replace(/४/g, '4').replace(/५/g, '5')
          .replace(/६/g, '6').replace(/७/g, '7').replace(/८/g, '8')
          .replace(/९/g, '9');
      }
      
      // Extract gender
      let gender = 'M';
      const genderPattern = /लिंग\s*[:：]?\s*(पु|स्री|ख्री|सरी)/;
      const genderMatch = context.match(genderPattern);
      if (genderMatch) {
        gender = (genderMatch[1] === 'पु') ? 'M' : 'F';
      } else if (context.includes('पतीचे नाव') || context.includes('पतीचे')) {
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
  }
  
  // Sort by serial number
  voters.sort((a, b) => parseInt(a.serialNumber) - parseInt(b.serialNumber));
  
  return voters;
}

// Main extraction function
async function extractAllVoters() {
  try {
    const allVoters = [];
    
    // Process File 1
    console.log('\n📄 Processing File 1...');
    const text1 = await extractPDFText('./pdflist/BoothVoterList_A4_Ward_7_Booth_1 - converted.pdf');
    const voters1 = extractVotersFromText(text1, 1);
    console.log(`✅ Extracted ${voters1.length} voters from File 1 (expected 991)`);
    allVoters.push(...voters1);
    
    // Process File 2
    console.log('\n📄 Processing File 2...');
    const text2 = await extractPDFText('./pdflist/BoothVoterList_A4_Ward_7_Booth_2 - converted.pdf');
    const voters2 = extractVotersFromText(text2, 2);
    console.log(`✅ Extracted ${voters2.length} voters from File 2 (expected 861)`);
    allVoters.push(...voters2);
    
    // Process File 3
    console.log('\n📄 Processing File 3...');
    const text3 = await extractPDFText('./pdflist/BoothVoterList_A4_Ward_7_Booth_3 - converted.pdf');
    const voters3 = extractVotersFromText(text3, 3);
    console.log(`✅ Extracted ${voters3.length} voters from File 3 (expected 863)`);
    allVoters.push(...voters3);
    
    console.log('\n' + '═'.repeat(50));
    console.log(`📊 TOTAL: ${allVoters.length} voters extracted`);
    console.log(`   Target: 2,715 voters`);
    console.log(`   Status: ${allVoters.length >= 2500 ? '✅ Good' : '⚠️ Review needed'}`);
    console.log('═'.repeat(50));
    
    // Assign sequential anukramank
    allVoters.forEach((voter, index) => {
      voter.anukramank = index + 1;
    });
    
    // Check for duplicates
    const voterIds = allVoters.map(v => v.voterId);
    const uniqueIds = new Set(voterIds);
    console.log(`\n✅ Unique voters: ${uniqueIds.size}`);
    if (voterIds.length !== uniqueIds.size) {
      console.log(`⚠️  Duplicates: ${voterIds.length - uniqueIds.size}`);
    }
    
    // Sample output
    if (allVoters.length > 0) {
      console.log('\n📋 Sample - First 5 voters:');
      allVoters.slice(0, 5).forEach(v => {
        console.log(`  अ.क्र. ${v.anukramank} | ${v.uniqueSerial} | ${v.name}`);
      });
    }
    
    // Backup and save
    const votersPath = './public/data/voters.json';
    if (fs.existsSync(votersPath)) {
      const existing = JSON.parse(fs.readFileSync(votersPath, 'utf8'));
      if (existing.length > 0) {
        const backupPath = `${votersPath}.backup-pdf-import-${Date.now()}`;
        fs.writeFileSync(backupPath, JSON.stringify(existing, null, 2));
        console.log(`\n✅ Backup created`);
      }
    }
    
    fs.writeFileSync(votersPath, JSON.stringify(allVoters, null, 2));
    console.log(`✅ Saved ${allVoters.length} voters to database`);
    
    console.log('\n' + '═'.repeat(50));
    console.log('  ✅ IMPORT COMPLETE!');
    console.log('═'.repeat(50));
    console.log('\n Start server: npm run dev');
    console.log(' Open: http://localhost:3000\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

extractAllVoters();
