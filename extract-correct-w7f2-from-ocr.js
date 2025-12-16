const fs = require('fs');
const path = require('path');

// Read all OCR page files from ward7-w7f2-output
const ocrDir = 'ward7-w7f2-output';
const files = fs.readdirSync(ocrDir).filter(f => f.startsWith('page') && f.endsWith('.txt')).sort();

console.log(`Found ${files.length} OCR page files`);

let allText = '';
files.forEach(file => {
  const content = fs.readFileSync(path.join(ocrDir, file), 'utf8');
  allText += content + '\n\n';
});

// Extract all voter entries using the pattern
const voterPattern = /^(\d+)\s+(XUA|CRM|TML|NBS|DMV|TGY|UZZ|NYM|ZSL|NJV)(\w+)\s+(\d+\/\d+\/\d+)\s*$/gm;
const matches = [...allText.matchAll(voterPattern)];

console.log(`\nFound ${matches.length} voter entries in OCR data`);

// Extract 4-line blocks for each voter
const voters = [];
const lines = allText.split('\n');

matches.forEach((match, idx) => {
  const serial = parseInt(match[1]);
  const voterId = match[2] + match[3];
  const constituency = match[4];
  
  // Find this line in the full text
  const lineIndex = lines.findIndex((line, i) => 
    i >= (idx > 0 ? voters[voters.length - 1]?.lineIndex || 0 : 0) &&
    line.includes(match[0])
  );
  
  if (lineIndex >= 0) {
    // Get the 4-line block
    const block = [];
    for (let i = 0; i < 4 && lineIndex + i < lines.length; i++) {
      block.push(lines[lineIndex + i]);
    }
    
    voters.push({
      serial,
      voterId,
      constituency,
      block: block.join('\n'),
      lineIndex
    });
  }
});

// Check for duplicates and gaps
console.log(`\n📊 Validation:`);
const serialSet = new Set();
const voterIdSet = new Set();
const duplicateSerials = [];
const duplicateVoterIds = [];

voters.forEach(v => {
  if (serialSet.has(v.serial)) {
    duplicateSerials.push(v.serial);
  }
  serialSet.add(v.serial);
  
  if (voterIdSet.has(v.voterId)) {
    duplicateVoterIds.push(v.voterId);
  }
  voterIdSet.add(v.voterId);
});

console.log(`Total unique serials: ${serialSet.size}`);
console.log(`Serial range: ${Math.min(...serialSet)} to ${Math.max(...serialSet)}`);
console.log(`Duplicate serials: ${duplicateSerials.length}`);
console.log(`Duplicate voter IDs: ${duplicateVoterIds.length}`);

// Check for gaps
const allSerials = [...serialSet].sort((a, b) => a - b);
const gaps = [];
for (let i = allSerials[0]; i <= allSerials[allSerials.length - 1]; i++) {
  if (!serialSet.has(i)) {
    gaps.push(i);
  }
}

if (gaps.length > 0) {
  console.log(`\n⚠️ Missing serials: ${gaps.slice(0, 10).join(', ')}${gaps.length > 10 ? '...' : ''}`);
} else {
  console.log(`✅ No gaps in serial numbers`);
}

// Show serials 615-620 and 705-710 for comparison
console.log(`\n📋 Sample data check:`);
console.log(`\nSerials 615-620:`);
voters.filter(v => v.serial >= 615 && v.serial <= 620).forEach(v => {
  console.log(`${v.serial}: ${v.voterId} - ${v.block.split('\n')[1]}`);
});

console.log(`\nSerials 705-710:`);
voters.filter(v => v.serial >= 705 && v.serial <= 710).forEach(v => {
  console.log(`${v.serial}: ${v.voterId} - ${v.block.split('\n')[1]}`);
});

// Generate the correct rawW7F2Data
console.log(`\n\n🔨 Generating correct rawW7F2Data...`);
const rawW7F2Data = voters.map(v => v.block).join('\n');

// Save to file
const outputFile = 'corrected-w7f2-data.txt';
fs.writeFileSync(outputFile, rawW7F2Data, 'utf8');
console.log(`\n✅ Saved corrected data to ${outputFile}`);
console.log(`Total voters: ${voters.length}`);
console.log(`\n✨ Ready to update add-w7f2-clean-fresh.js`);
