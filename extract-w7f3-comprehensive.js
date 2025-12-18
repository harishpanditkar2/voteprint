const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔍 Comprehensive W7F3 Data Extraction\n');
console.log('Attempting multiple methods to extract complete W7F3 voter data...\n');

// Method 1: Parse from W7F3.txt with improved regex
function extractFromTextFile() {
  console.log('📄 Method 1: Parsing W7F3.txt with improved patterns...');
  
  try {
    const text = fs.readFileSync('./pdflist/W7F3.txt', 'utf-8');
    const voters = [];
    
    // Split into blocks - each voter has multiple lines
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Match voter ID line: serial voterID partNumber
      const idMatch = line.match(/^(\d+)\s+(XUA|CRM|TML|NBS|DMV|TGY|UZZ|NYM|ZSL|NJV)([A-B]?\d{7})\s+(\d{3}\/\d{3}\/\d{3})/);
      
      if (idMatch) {
        const serial = parseInt(idMatch[1]);
        const voterId = idMatch[2] + idMatch[3];
        const partNumber = idMatch[4];
        
        // Look ahead for name, relation, house, age, gender in next 6-8 lines
        let name = '', relation = '', house = '', age = '', gender = '';
        
        for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
          const nextLine = lines[j];
          
          // Extract name
          if (!name && nextLine.includes('मतदाराचे')) {
            const nameMatch = nextLine.match(/मतदाराचे\s*(?:पूर्ण|पुर्ण)\s*:?\s*([^\|]+)/);
            if (nameMatch) {
              name = nameMatch[1]
                .replace(/\s*नांव.*$/i, '')
                .replace(/\s*वडिलांचे.*$/i, '')
                .replace(/\s*पतीचे.*$/i, '')
                .trim();
            }
          }
          
          // Extract relation
          if (!relation && (nextLine.includes('वडिलांचे') || nextLine.includes('पतीचे'))) {
            const relMatch = nextLine.match(/(?:वडिलांचे|पतीचे|आईचे)\s*(?:नाव)?\s*:?\s*([^\|०]+)/);
            if (relMatch) {
              relation = relMatch[1]
                .replace(/\s*घर.*$/i, '')
                .replace(/[०।॥]+.*$/, '')
                .trim();
            }
          }
          
          // Extract house
          if (!house && nextLine.includes('घर')) {
            const houseMatch = nextLine.match(/घर\s*क्रमांक\s*:?\s*([^\|]+)/);
            if (houseMatch) {
              house = houseMatch[1]
                .replace(/\s*वय.*$/i, '')
                .replace(/[-।]+$/, '')
                .trim();
            }
          }
          
          // Extract age
          if (!age && nextLine.includes('वय')) {
            const ageMatch = nextLine.match(/वय\s*:?\s*([०-९\d]+)/);
            if (ageMatch) {
              age = ageMatch[1].replace(/[०-९]/g, d => String.fromCharCode(d.charCodeAt(0) - 0x0966 + 48));
            }
          }
          
          // Extract gender
          if (!gender && nextLine.includes('लिंग')) {
            const genderMatch = nextLine.match(/लिंग\s*:?\s*(पु|स्त्री|स्री)/);
            if (genderMatch) {
              gender = genderMatch[1].includes('पु') ? 'M' : 'F';
            }
          }
        }
        
        voters.push({
          voterId,
          name: name || 'N/A',
          age: age || 'N/A',
          gender: gender || 'N/A',
          ward: '7',
          booth: '3',
          serial: serial.toString(),
          serialNumber: serial.toString(),
          relation: relation || 'N/A',
          house: house || 'N/A',
          partNumber,
          actualWard: '7',
          actualBooth: '3'
        });
      }
    }
    
    console.log(`  ✅ Extracted ${voters.length} voters`);
    return voters;
  } catch (error) {
    console.log(`  ❌ Failed: ${error.message}`);
    return [];
  }
}

// Method 2: Extract from PDF using pdf-parse
function extractFromPDF() {
  console.log('\n📄 Method 2: Extracting directly from PDF...');
  
  try {
    const pdf = require('pdf-parse');
    const dataBuffer = fs.readFileSync('./pdflist/BoothVoterList_A4_Ward_7_Booth_3 - converted.pdf');
    
    return pdf(dataBuffer).then(data => {
      const text = data.text;
      const voters = [];
      
      // Parse the extracted text
      const lines = text.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Match voter line
        const match = line.match(/^(\d+)\s+(XUA|CRM|TML|NBS|DMV|TGY|UZZ|NYM|ZSL|NJV)([A-B]?\d{7})\s+(\d{3}\/\d{3}\/\d{3})/);
        
        if (match) {
          const serial = parseInt(match[1]);
          const voterId = match[2] + match[3];
          const partNumber = match[4];
          
          let name = '', age = '', gender = '';
          
          // Look ahead
          for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
            const next = lines[j];
            
            if (!name && next.includes('मतदाराचे')) {
              const nm = next.match(/मतदाराचे\s*(?:पूर्ण|पुर्ण)\s*:?\s*([^\n\|]+)/);
              if (nm) name = nm[1].trim();
            }
            
            if (!age && next.includes('वय')) {
              const ag = next.match(/वय\s*:?\s*([०-९\d]+)/);
              if (ag) age = ag[1].replace(/[०-९]/g, d => String.fromCharCode(d.charCodeAt(0) - 0x0966 + 48));
            }
            
            if (!gender && next.includes('लिंग')) {
              const gn = next.match(/लिंग\s*:?\s*(पु|स्त्री)/);
              if (gn) gender = gn[1].includes('पु') ? 'M' : 'F';
            }
          }
          
          voters.push({
            voterId,
            name: name || 'N/A',
            age: age || 'N/A',
            gender: gender || 'N/A',
            ward: '7',
            booth: '3',
            serial: serial.toString(),
            serialNumber: serial.toString(),
            relation: 'N/A',
            house: 'N/A',
            partNumber,
            actualWard: '7',
            actualBooth: '3'
          });
        }
      }
      
      console.log(`  ✅ Extracted ${voters.length} voters from PDF`);
      return voters;
    });
  } catch (error) {
    console.log(`  ❌ PDF extraction failed: ${error.message}`);
    return Promise.resolve([]);
  }
}

// Method 3: Use existing backup data and enhance it
function enhanceBackupData() {
  console.log('\n📄 Method 3: Enhancing existing backup data...');
  
  try {
    const backup = JSON.parse(fs.readFileSync('./voters-backup-w7f2-w7f3-1765880803853.json', 'utf-8'));
    const w7f3 = backup.filter(v => v.ward === '7' && v.booth === '3');
    
    console.log(`  ✅ Found ${w7f3.length} voters in backup`);
    return w7f3;
  } catch (error) {
    console.log(`  ❌ Failed: ${error.message}`);
    return [];
  }
}

// Main execution
async function main() {
  try {
    // Try all methods
    const method1Results = extractFromTextFile();
    const method2Results = await extractFromPDF();
    const method3Results = enhanceBackupData();
    
    console.log('\n📊 Extraction Results Comparison:');
    console.log(`  Method 1 (Text file): ${method1Results.length} voters`);
    console.log(`  Method 2 (PDF): ${method2Results.length} voters`);
    console.log(`  Method 3 (Backup): ${method3Results.length} voters`);
    
    // Choose best result (highest count with most complete data)
    const results = [
      { name: 'Text file', data: method1Results },
      { name: 'PDF', data: method2Results },
      { name: 'Backup', data: method3Results }
    ];
    
    // Score each method
    results.forEach(r => {
      const withAge = r.data.filter(v => v.age && v.age !== 'N/A').length;
      const withGender = r.data.filter(v => v.gender && v.gender !== 'N/A').length;
      r.score = r.data.length * 0.5 + withAge * 0.3 + withGender * 0.2;
      r.completeness = `${withAge}/${r.data.length} ages, ${withGender}/${r.data.length} genders`;
    });
    
    results.sort((a, b) => b.score - a.score);
    
    console.log('\n🏆 Best Method: ' + results[0].name);
    console.log(`  Score: ${results[0].score.toFixed(2)}`);
    console.log(`  Completeness: ${results[0].completeness}`);
    
    const bestW7F3 = results[0].data;
    
    // If best method doesn't have enough voters (expected 719), try merging
    if (bestW7F3.length < 700 && method3Results.length >= 700) {
      console.log('\n⚠️  Best method has incomplete count, using backup as base...');
      
      // Use backup as base and try to enhance with better extracted data
      const enhanced = method3Results.map(voter => {
        // Try to find better data from method 1 or 2
        const better1 = method1Results.find(v => v.voterId === voter.voterId);
        const better2 = method2Results.find(v => v.voterId === voter.voterId);
        
        // Use data from method 1 or 2 if age/gender is better
        if (better1 && better1.age !== 'N/A' && (!voter.age || voter.age === 'N/A' || voter.age === '0')) {
          return { ...voter, age: better1.age, gender: better1.gender, name: better1.name || voter.name };
        }
        if (better2 && better2.age !== 'N/A' && (!voter.age || voter.age === 'N/A' || voter.age === '0')) {
          return { ...voter, age: better2.age, gender: better2.gender, name: better2.name || voter.name };
        }
        
        return voter;
      });
      
      console.log('  ✅ Enhanced backup data with extracted information');
      
      // Now update database
      updateDatabase(enhanced);
    } else {
      updateDatabase(bestW7F3);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

function updateDatabase(w7f3Voters) {
  console.log('\n💾 Updating Database...');
  
  // Read current database
  const currentVoters = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf-8'));
  
  // Backup
  const backupPath = `voters-backup-before-w7f3-update-${Date.now()}.json`;
  fs.writeFileSync(backupPath, JSON.stringify(currentVoters, null, 2));
  console.log(`  ✅ Backup created: ${backupPath}`);
  
  // Keep W7F1 and W7F2, replace W7F3
  const w7f1 = currentVoters.filter(v => v.ward === '7' && v.booth === '1');
  const w7f2 = currentVoters.filter(v => v.ward === '7' && v.booth === '2');
  
  const updatedVoters = [...w7f1, ...w7f2, ...w7f3Voters];
  
  console.log('\n📊 Updated Database:');
  console.log(`  W7F1: ${w7f1.length} voters (unchanged)`);
  console.log(`  W7F2: ${w7f2.length} voters (unchanged)`);
  console.log(`  W7F3: ${w7f3Voters.length} voters (updated)`);
  console.log(`  Total: ${updatedVoters.length} voters`);
  
  // Quality check on W7F3
  const w7f3WithAge = w7f3Voters.filter(v => v.age && v.age !== 'N/A' && v.age !== '0').length;
  const w7f3WithGender = w7f3Voters.filter(v => v.gender && v.gender !== 'N/A' && v.gender !== 'M' && v.gender !== 'F').length;
  
  console.log('\n🔍 W7F3 Quality Check:');
  console.log(`  ✓ Names: ${w7f3Voters.filter(v => v.name && v.name !== 'N/A').length}/${w7f3Voters.length}`);
  console.log(`  ✓ Ages: ${w7f3WithAge}/${w7f3Voters.length}`);
  console.log(`  ✓ Valid Genders (M/F): ${w7f3Voters.filter(v => v.gender === 'M' || v.gender === 'F').length}/${w7f3Voters.length}`);
  
  // Save
  fs.writeFileSync('./public/data/voters.json', JSON.stringify(updatedVoters, null, 2));
  
  console.log('\n📋 Sample W7F3 voters:');
  w7f3Voters.slice(0, 5).forEach(v => {
    console.log(`  ${v.serial}. ${v.name} (${v.age}/${v.gender}) - ${v.voterId}`);
  });
  
  console.log('\n✅ Database updated successfully!');
}

// Run
main();
