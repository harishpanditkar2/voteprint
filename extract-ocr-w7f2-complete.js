const fs = require('fs');
const path = require('path');

console.log('🔍 Extracting correct W7F2 voter data from OCR pages...\n');

// Read all OCR page files
const ocrDir = 'ward7-w7f2-output';
const pageFiles = fs.readdirSync(ocrDir)
  .filter(f => f.startsWith('page') && f.endsWith('.txt'))
  .sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)[0]);
    const numB = parseInt(b.match(/\d+/)[0]);
    return numA - numB;
  });

console.log(`Found ${pageFiles.length} OCR page files\n`);

// Concatenate all pages
let fullText = '';
pageFiles.forEach(file => {
  const content = fs.readFileSync(path.join(ocrDir, file), 'utf8');
  fullText += content + '\n\n' + '='.repeat(80) + '\n\n';
});

// Now extract using pattern matching
const lines = fullText.split('\n');
const voters = [];

// Pattern: serial voterId constituency on one line
const headerPattern = /^(\d+)\s+(XUA|CRM|TML|NBS|DMV|TGY|UZZ|NYM|ZSL|NJV)(\w+)\s+(\d+\/\d+\/\d+)\s*$/;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  const match = line.match(headerPattern);
  
  if (match) {
    const serial = parseInt(match[1]);
    const voterId = match[2] + match[3];
    const constituency = match[4];
    
    // Get next 3 lines for complete voter block
    const block = [
      lines[i],
      i + 1 < lines.length ? lines[i + 1] : '',
      i + 2 < lines.length ? lines[i + 2] : '',
      i + 3 < lines.length ? lines[i + 3] : ''
    ];
    
    voters.push({
      serial,
      voterId,
      constituency,
      lines: block
    });
  }
}

console.log(`Extracted ${voters.length} voters\n`);

// Sort by serial
voters.sort((a, b) => a.serial - b.serial);

// Validate
const serialSet = new Set(voters.map(v => v.serial));
const voterIdSet = new Set();
const duplicates = [];

voters.forEach(v => {
  if (voterIdSet.has(v.voterId)) {
    duplicates.push(v.voterId);
  }
  voterIdSet.add(v.voterId);
});

console.log(`📊 Statistics:`);
console.log(`  Total voters: ${voters.length}`);
console.log(`  Unique serials: ${serialSet.size}`);
console.log(`  Serial range: ${Math.min(...serialSet)} to ${Math.max(...serialSet)}`);
console.log(`  Duplicate voter IDs: ${duplicates.length}`);

// Check for gaps in important ranges
const gaps = [];
for (let i = 1; i <= 861; i++) {
  if (!serialSet.has(i)) {
    gaps.push(i);
  }
}

if (gaps.length > 0) {
  console.log(`\n⚠️  Missing serials (${gaps.length}): ${gaps.slice(0, 30).join(', ')}...`);
} else {
  console.log(`\n✅ No gaps in serials 1-861`);
}

// Compare specific serials
console.log(`\n📋 Data verification:`);

const check615 = voters.find(v => v.serial === 615);
const check705 = voters.find(v => v.serial === 705);
const check860 = voters.find(v => v.serial === 860);
const check861 = voters.find(v => v.serial === 861);

if (check615) {
  console.log(`\n615: ${check615.voterId}`);
  console.log(`  Name: ${check615.lines[1]}`);
}

if (check705) {
  console.log(`\n705: ${check705.voterId}`);
  console.log(`  Name: ${check705.lines[1]}`);
}

if (check860) {
  console.log(`\n860: ${check860.voterId}`);
  console.log(`  Name: ${check860.lines[1]}`);
}

if (check861) {
  console.log(`\n861: ${check861.voterId}`);
  console.log(`  Name: ${check861.lines[1]}`);
}

// Check if 615 and 705 are different
if (check615 && check705) {
  if (check615.voterId === check705.voterId) {
    console.log(`\n❌ ERROR: Serials 615 and 705 have same voter ID!`);
  } else {
    console.log(`\n✅ Serials 615 and 705 have different voter IDs`);
  }
}

// Generate rawW7F2Data format
const rawData = voters.map(v => v.lines.join('\n')).join('\n');

// Save
fs.writeFileSync('ocr-extracted-w7f2-complete.txt', rawData, 'utf8');
console.log(`\n✅ Saved to ocr-extracted-w7f2-complete.txt`);

// Also save voter summary
const summary = voters.map(v => ({
  serial: v.serial,
  voterId: v.voterId,
  name: v.lines[1]?.substring(0, 60)
}));

fs.writeFileSync('ocr-extracted-w7f2-summary.json', JSON.stringify(summary, null, 2), 'utf8');
console.log(`✅ Saved summary to ocr-extracted-w7f2-summary.json`);
