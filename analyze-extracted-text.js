const fs = require('fs');
const path = require('path');

const outputDir = 'ward7-reextraction-output';
const votersPath = 'public/data/voters.json';

console.log('\n=== Analyzing Extracted OCR Text ===\n');

// Load existing database
const voters = JSON.parse(fs.readFileSync(votersPath, 'utf8'));
const ward7Voters = voters.filter(v => v.actualWard === '7' || v.expectedWard === '7');

console.log(`Current database: ${voters.length} total voters, ${ward7Voters.length} Ward 7`);

// Read all extracted text files
const textFiles = fs.readdirSync(outputDir)
  .filter(f => f.startsWith('page') && f.endsWith('.txt'))
  .sort();

console.log(`Found ${textFiles.length} extracted text files\n`);

const allExtractedVoters = [];
let totalVoterIds = 0;

// Parse each page
for (const textFile of textFiles) {
  const pageNumber = parseInt(textFile.match(/page(\d+)/)[1]);
  const textPath = path.join(outputDir, textFile);
  const text = fs.readFileSync(textPath, 'utf8');
  
  // Extract voter IDs
  const voterIdPattern = /\b(XUA|CRM|XRM)(\d{7})\b/g;
  const voterIds = [];
  let match;
  while ((match = voterIdPattern.exec(text)) !== null) {
    voterIds.push(match[0]);
  }
  
  // Extract part numbers (ward/booth format: XXX/XXX/XXX)
  const partNumberPattern = /\b(\d{3})\/(\d{3})\/(\d{3})\b/g;
  const partNumbers = [];
  while ((match = partNumberPattern.exec(text)) !== null) {
    partNumbers.push(match[0]);
  }
  
  // Extract ages and genders
  const lines = text.split('\n');
  const pageData = {
    pageNumber,
    voterIds,
    partNumbers: [...new Set(partNumbers)], // unique part numbers
    voterCount: voterIds.length
  };
  
  allExtractedVoters.push(pageData);
  totalVoterIds += voterIds.length;
  
  if (voterIds.length > 0) {
    console.log(`Page ${pageNumber}: ${voterIds.length} voters`);
    console.log(`  First ID: ${voterIds[0]}, Last ID: ${voterIds[voterIds.length - 1]}`);
  } else {
    console.log(`Page ${pageNumber}: No voter IDs found (likely metadata page)`);
  }
}

console.log(`\n=== Extraction Summary ===`);
console.log(`Total pages processed: ${textFiles.length}`);
console.log(`Total voter IDs found: ${totalVoterIds}`);
console.log(`Current database has: ${ward7Voters.length} Ward 7 voters`);

// Determine which file each page belongs to based on part numbers
console.log(`\n=== Determining File Assignments ===\n`);

const fileAssignments = {
  'W7F1': { booth: '1', pages: [], voterIds: [] },
  'W7F2': { booth: '2', pages: [], voterIds: [] },
  'W7F3': { booth: '3', pages: [], voterIds: [] }
};

for (const pageData of allExtractedVoters) {
  if (pageData.partNumbers.length > 0) {
    const partNumber = pageData.partNumbers[0];
    const booth = partNumber.split('/')[2];
    
    if (booth === '143') {
      fileAssignments['W7F1'].pages.push(pageData.pageNumber);
      fileAssignments['W7F1'].voterIds.push(...pageData.voterIds);
    } else if (booth === '144') {
      fileAssignments['W7F2'].pages.push(pageData.pageNumber);
      fileAssignments['W7F2'].voterIds.push(...pageData.voterIds);
    } else if (booth === '145') {
      fileAssignments['W7F3'].pages.push(pageData.pageNumber);
      fileAssignments['W7F3'].voterIds.push(...pageData.voterIds);
    }
  }
}

Object.entries(fileAssignments).forEach(([file, data]) => {
  console.log(`${file} (Booth ${data.booth}):`);
  console.log(`  Pages: ${data.pages.length} (${Math.min(...data.pages)}-${Math.max(...data.pages)})`);
  console.log(`  Voter IDs extracted: ${data.voterIds.length}`);
  console.log(`  Expected voters: ${file === 'W7F1' ? '991' : file === 'W7F2' ? '861' : '863'}`);
  console.log('');
});

// Save analysis
const analysisPath = path.join(outputDir, 'extraction-analysis.json');
fs.writeFileSync(analysisPath, JSON.stringify({
  summary: {
    totalPages: textFiles.length,
    totalVoterIds,
    databaseVoters: ward7Voters.length
  },
  fileAssignments,
  pageData: allExtractedVoters
}, null, 2));

console.log(`✓ Analysis saved to: ${analysisPath}\n`);
console.log(`Next step: Create serial correction mapping and apply to database\n`);
