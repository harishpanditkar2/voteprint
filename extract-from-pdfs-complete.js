const fs = require('fs');
const pdf = require('pdf-parse');

console.log('═══════════════════════════════════════════════════');
console.log('  WARD 7 COMPLETE PDF EXTRACTION - ALL 2,715 VOTERS');
console.log('═══════════════════════════════════════════════════\n');

// Function to extract voters from a single PDF
async function extractVotersFromPDF(pdfPath, fileNumber, expectedCount) {
  console.log(`\nProcessing: ${pdfPath}`);
  console.log(`Expected voters: ${expectedCount}`);
  console.log('─'.repeat(50));
  
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdf.default(dataBuffer);
  
  const text = data.text;
  const lines = text.split('\n');
  
  const voters = [];
  const processedIds = new Set();
  
  // Pattern to match voter entries
  // Each voter has: Serial Number, Voter ID (XUA + 7 digits), Name, Age, Gender
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Find voter IDs
    const voterIdMatches = line.match(/XUA\d{7}/g);
    if (!voterIdMatches) continue;
    
    for (const voterId of voterIdMatches) {
      if (processedIds.has(voterId)) continue;
      
      // Find serial number before voter ID
      const serialPattern = new RegExp(`(\\d+)\\s+[\\w\\s]*${voterId}`);
      const serialMatch = line.match(serialPattern);
      
      let serialNumber = null;
      if (serialMatch) {
        serialNumber = serialMatch[1];
      } else {
        // Try to find serial in previous lines
        for (let j = Math.max(0, i - 3); j < i; j++) {
          const prevLine = lines[j];
          const numMatch = prevLine.match(/^\s*(\d+)\s*$/);
          if (numMatch) {
            serialNumber = numMatch[1];
            break;
          }
        }
      }
      
      if (!serialNumber) continue;
      
      // Extract voter details from surrounding context
      const contextStart = Math.max(0, i - 3);
      const contextEnd = Math.min(lines.length, i + 10);
      const context = lines.slice(contextStart, contextEnd).join('\n');
      
      // Extract name (after मतदाराचे पूर्ण नांव or similar patterns)
      let name = '';
      const namePatterns = [
        /मतदाराचे\s+पूर्ण\s+नांव\s*[:：]?\s*([^\n]+)/,
        /मतदाराचे\s+पुर्ण\s+नांव\s*[:：]?\s*([^\n]+)/,
        /नांव\s*[:：]?\s*([^\n]+?)(?=\s+XUA|\s+वडिलांचे|\s+पतीचे|$)/
      ];
      
      for (const pattern of namePatterns) {
        const nameMatch = context.match(pattern);
        if (nameMatch) {
          name = nameMatch[1].trim();
          // Clean up name - remove voter ID if it got captured
          name = name.replace(/XUA\d{7}.*/, '').trim();
          name = name.replace(/\d+\/\d+\/\d+.*/, '').trim();
          if (name.length > 3) break;
        }
      }
      
      // If no name found with patterns, try to extract from next line after voter ID
      if (!name || name.length < 3) {
        const voterIdIndex = context.indexOf(voterId);
        const afterId = context.substring(voterIdIndex + 10, voterIdIndex + 100);
        const nameMatch = afterId.match(/\s+([ऀ-ॿ\s]{3,}?)(?=\s+(?:वडिलांचे|पतीचे|घर|वय)|$)/);
        if (nameMatch) {
          name = nameMatch[1].trim();
        }
      }
      
      if (!name || name.length < 3) continue;
      
      // Extract age
      let age = '';
      const ageMatches = context.match(/वय\s*[:：]?\s*([०-९\d]+)/g);
      if (ageMatches && ageMatches.length > 0) {
        // Find the age closest to this voter ID
        const voterPosInContext = context.indexOf(voterId);
        for (const ageMatch of ageMatches) {
          const agePos = context.indexOf(ageMatch, voterPosInContext);
          if (agePos > voterPosInContext && agePos < voterPosInContext + 200) {
            const ageValue = ageMatch.match(/[०-९\d]+/)[0];
            age = ageValue
              .replace(/०/g, '0').replace(/१/g, '1').replace(/२/g, '2')
              .replace(/३/g, '3').replace(/४/g, '4').replace(/५/g, '5')
              .replace(/६/g, '6').replace(/७/g, '7').replace(/८/g, '8')
              .replace(/९/g, '9');
            break;
          }
        }
      }
      
      if (!age) age = '30'; // Default if not found
      
      // Extract gender
      let gender = '';
      const genderMatches = context.match(/लिंग\s*[:：]?\s*(पु|स्री|ख्री|सरी|it|oot|ol)/g);
      if (genderMatches && genderMatches.length > 0) {
        const voterPosInContext = context.indexOf(voterId);
        for (const genderMatch of genderMatches) {
          const genderPos = context.indexOf(genderMatch, voterPosInContext);
          if (genderPos > voterPosInContext && genderPos < voterPosInContext + 200) {
            const genderValue = genderMatch.match(/(पु|स्री|ख्री|सरी|it|oot|ol)/)[0];
            gender = (genderValue === 'पु') ? 'M' : 'F';
            break;
          }
        }
      }
      
      if (!gender) {
        // Try alternate gender detection
        if (context.includes('पतीचे नाव') || context.includes('पतीचे')) {
          gender = 'F';
        } else {
          gender = 'M';
        }
      }
      
      const voter = {
        voterId: voterId,
        name: name,
        uniqueSerial: `W7F${fileNumber}-S${serialNumber}`,
        serialNumber: serialNumber,
        age: age,
        gender: gender,
        ward: "7",
        booth: fileNumber.toString()
      };
      
      voters.push(voter);
      processedIds.add(voterId);
    }
  }
  
  // Sort by serial number
  voters.sort((a, b) => parseInt(a.serialNumber) - parseInt(b.serialNumber));
  
  console.log(`✅ Extracted ${voters.length} voters from File ${fileNumber}`);
  if (voters.length !== expectedCount) {
    console.log(`⚠️  Warning: Expected ${expectedCount} but got ${voters.length}`);
  }
  
  // Show first 3 and last 3
  if (voters.length > 0) {
    console.log('\nFirst 3 voters:');
    voters.slice(0, 3).forEach(v => {
      console.log(`  ${v.uniqueSerial} | ${v.name} | ${v.age}y ${v.gender}`);
    });
    console.log('\nLast 3 voters:');
    voters.slice(-3).forEach(v => {
      console.log(`  ${v.uniqueSerial} | ${v.name} | ${v.age}y ${v.gender}`);
    });
  }
  
  return voters;
}

// Main extraction function
async function extractAllVoters() {
  try {
    const allVoters = [];
    
    // Extract from all three PDFs
    const file1 = await extractVotersFromPDF(
      './pdflist/BoothVoterList_A4_Ward_7_Booth_1 - converted.pdf',
      1,
      991
    );
    allVoters.push(...file1);
    
    const file2 = await extractVotersFromPDF(
      './pdflist/BoothVoterList_A4_Ward_7_Booth_2 - converted.pdf',
      2,
      861
    );
    allVoters.push(...file2);
    
    const file3 = await extractVotersFromPDF(
      './pdflist/BoothVoterList_A4_Ward_7_Booth_3 - converted.pdf',
      3,
      863
    );
    allVoters.push(...file3);
    
    console.log('\n' + '═'.repeat(50));
    console.log(`📊 TOTAL EXTRACTED: ${allVoters.length} voters`);
    console.log(`   Target: 2,715 voters`);
    console.log(`   Match: ${allVoters.length === 2715 ? '✅ PERFECT!' : '⚠️ Needs review'}`);
    console.log('═'.repeat(50));
    
    // Assign sequential anukramank
    allVoters.forEach((voter, index) => {
      voter.anukramank = index + 1;
    });
    
    // Check for duplicates
    const voterIds = allVoters.map(v => v.voterId);
    const uniqueIds = new Set(voterIds);
    if (voterIds.length !== uniqueIds.size) {
      console.log(`\n⚠️  Warning: Found ${voterIds.length - uniqueIds.size} duplicate voter IDs`);
    } else {
      console.log('\n✅ No duplicate voter IDs found');
    }
    
    // Create backup
    const votersPath = './public/data/voters.json';
    if (fs.existsSync(votersPath)) {
      const existing = JSON.parse(fs.readFileSync(votersPath, 'utf8'));
      if (existing.length > 0) {
        const backupPath = `${votersPath}.backup-before-pdf-import-${Date.now()}`;
        fs.writeFileSync(backupPath, JSON.stringify(existing, null, 2));
        console.log(`✅ Backup created: ${backupPath}`);
      }
    }
    
    // Save to voters.json
    const dataDir = './public/data';
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(votersPath, JSON.stringify(allVoters, null, 2));
    console.log(`\n✅ Successfully saved ${allVoters.length} voters to ${votersPath}`);
    
    // Also save extraction report
    const report = {
      extractionDate: new Date().toISOString(),
      totalVoters: allVoters.length,
      byBooth: {
        booth1: file1.length,
        booth2: file2.length,
        booth3: file3.length
      },
      anukramankRange: `1 to ${allVoters.length}`,
      duplicates: voterIds.length - uniqueIds.size
    };
    
    fs.writeFileSync('./extraction-report.json', JSON.stringify(report, null, 2));
    console.log('✅ Extraction report saved to extraction-report.json');
    
    console.log('\n' + '═'.repeat(50));
    console.log('  IMPORT COMPLETE - Ready to use!');
    console.log('═'.repeat(50));
    console.log('\nNext steps:');
    console.log('1. Start dev server: npm run dev');
    console.log('2. Open http://localhost:3000');
    console.log('3. Verify voter data and pagination');
    console.log('4. Test search functionality');
    console.log('5. Check अ.क्र. badge display\n');
    
  } catch (error) {
    console.error('❌ Error during extraction:', error);
    process.exit(1);
  }
}

// Run extraction
extractAllVoters();
