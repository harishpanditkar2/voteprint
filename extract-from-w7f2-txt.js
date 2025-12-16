const fs = require('fs');

// Read the W7F2.txt file
const content = fs.readFileSync('pdflist/W7F2.txt', 'utf8');

// Extract all voter entries - match serial + voter ID + constituency on same line
const voterPattern = /^(\d+)\s+(XUA|CRM|TML|NBS|DMV|TGY|UZZ|NYM|ZSL|NJV)(\w+)\s+(\d+\/\d+\/\d+)\s*$/gm;
const matches = [...content.matchAll(voterPattern)];

console.log(`Found ${matches.length} voter ID lines`);

// Now extract 4-line blocks for each voter
const lines = content.split('\n');
const voters = [];

let lastProcessedLine = 0;

for (const match of matches) {
  const serial = parseInt(match[1]);
  const voterId = match[2] + match[3];
  const constituency = match[4];
  const fullMatch = match[0];
  
  // Find this line after the last processed line
  let lineIndex = -1;
  for (let i = lastProcessedLine; i < lines.length; i++) {
    if (lines[i].trim() === fullMatch.trim() || lines[i].includes(fullMatch.trim())) {
      lineIndex = i;
      break;
    }
  }
  
  if (lineIndex >= 0) {
    // Extract 4-line block
    const block = [];
    for (let i = 0; i < 4 && lineIndex + i < lines.length; i++) {
      block.push(lines[lineIndex + i]);
    }
    
    voters.push({
      serial,
      voterId,
      constituency,
      block: block.join('\n')
    });
    
    lastProcessedLine = lineIndex + 4;
  }
}

console.log(`Extracted ${voters.length} complete voter entries\n`);

// Validate
const serialSet = new Set();
const voterIdSet = new Set();
const duplicateSerials = new Map();
const duplicateVoterIds = new Map();

voters.forEach(v => {
  if (serialSet.has(v.serial)) {
    if (!duplicateSerials.has(v.serial)) {
      duplicateSerials.set(v.serial, []);
    }
    duplicateSerials.get(v.serial).push(v);
  }
  serialSet.add(v.serial);
  
  if (voterIdSet.has(v.voterId)) {
    if (!duplicateVoterIds.has(v.voterId)) {
      duplicateVoterIds.set(v.voterId, []);
    }
    duplicateVoterIds.get(v.voterId).push(v);
  }
  voterIdSet.add(v.voterId);
});

console.log(`📊 Validation:`);
console.log(`Total unique serials: ${serialSet.size}`);
const allSerials = [...serialSet].sort((a, b) => a - b);
console.log(`Serial range: ${allSerials[0]} to ${allSerials[allSerials.length - 1]}`);
console.log(`Duplicate serials: ${duplicateSerials.size}`);
console.log(`Duplicate voter IDs: ${duplicateVoterIds.size}`);

// Check for gaps
const gaps = [];
for (let i = allSerials[0]; i <= allSerials[allSerials.length - 1]; i++) {
  if (!serialSet.has(i)) {
    gaps.push(i);
  }
}

if (gaps.length > 0) {
  console.log(`\n⚠️ Missing serials (${gaps.length}): ${gaps.slice(0, 20).join(', ')}${gaps.length > 20 ? '...' : ''}`);
} else {
  console.log(`✅ No gaps in serial numbers 1-${allSerials[allSerials.length - 1]}`);
}

// Show samples
console.log(`\n📋 Sample comparison:`);
console.log(`\nSerial 615:`);
const v615 = voters.find(v => v.serial === 615);
if (v615) {
  console.log(v615.block.split('\n').slice(0, 2).join('\n'));
}

console.log(`\nSerial 705:`);
const v705 = voters.find(v => v.serial === 705);
if (v705) {
  console.log(v705.block.split('\n').slice(0, 2).join('\n'));
}

console.log(`\nSerial 860:`);
const v860 = voters.find(v => v.serial === 860);
if (v860) {
  console.log(v860.block.split('\n').slice(0, 2).join('\n'));
}

console.log(`\nSerial 861:`);
const v861 = voters.find(v => v.serial === 861);
if (v861) {
  console.log(v861.block.split('\n').slice(0, 2).join('\n'));
}

// Save corrected data
const rawW7F2Data = voters.map(v => v.block).join('\n');
fs.writeFileSync('corrected-w7f2-from-pdf.txt', rawW7F2Data, 'utf8');

console.log(`\n✅ Saved corrected data to corrected-w7f2-from-pdf.txt`);
console.log(`Total voters: ${voters.length}`);
