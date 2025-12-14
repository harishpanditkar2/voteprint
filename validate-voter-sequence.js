const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Voter Sequence...\n');

// Read voters.json
const votersPath = path.join(__dirname, 'public', 'data', 'voters.json');
const voters = JSON.parse(fs.readFileSync(votersPath, 'utf-8'));

console.log(`Total voters: ${voters.length}\n`);

// Check 1: Serial numbers should be sequential
console.log('═══════════════════════════════════════════════════════════════════');
console.log('CHECK 1: Serial Number Sequence Validation');
console.log('═══════════════════════════════════════════════════════════════════\n');

let sequenceIssues = [];
for (let i = 0; i < voters.length; i++) {
  const expectedSerial = (i + 1).toString();
  const actualSerial = voters[i].serialNumber;
  
  if (actualSerial !== expectedSerial) {
    sequenceIssues.push({
      position: i + 1,
      expected: expectedSerial,
      actual: actualSerial,
      voterId: voters[i].voterId,
      name: voters[i].name
    });
  }
}

if (sequenceIssues.length === 0) {
  console.log('✅ All serial numbers are in correct sequence!\n');
} else {
  console.log(`❌ Found ${sequenceIssues.length} sequence issues:\n`);
  sequenceIssues.forEach(issue => {
    console.log(`Position ${issue.position}:`);
    console.log(`  Expected Serial: ${issue.expected}`);
    console.log(`  Actual Serial:   ${issue.actual}`);
    console.log(`  Voter ID:        ${issue.voterId}`);
    console.log(`  Name:            ${issue.name}\n`);
  });
}

// Check 2: Part numbers should increment by 1
console.log('═══════════════════════════════════════════════════════════════════');
console.log('CHECK 2: Part Number Sequence Validation');
console.log('═══════════════════════════════════════════════════════════════════\n');

let partNumberIssues = [];
const basePartNumber = 201;
const baseWard = 138;
const startBooth = 143;

for (let i = 0; i < voters.length; i++) {
  const expectedPartNumber = `${basePartNumber}/${baseWard}/${startBooth + i}`;
  const actualPartNumber = voters[i].partNumber;
  
  if (actualPartNumber !== expectedPartNumber) {
    partNumberIssues.push({
      position: i + 1,
      expected: expectedPartNumber,
      actual: actualPartNumber,
      voterId: voters[i].voterId,
      name: voters[i].name
    });
  }
}

if (partNumberIssues.length === 0) {
  console.log('✅ All part numbers are in correct sequence!\n');
} else {
  console.log(`❌ Found ${partNumberIssues.length} part number issues:\n`);
  partNumberIssues.forEach(issue => {
    console.log(`Position ${issue.position}:`);
    console.log(`  Expected Part: ${issue.expected}`);
    console.log(`  Actual Part:   ${issue.actual}`);
    console.log(`  Voter ID:      ${issue.voterId}`);
    console.log(`  Name:          ${issue.name}\n`);
  });
}

// Check 3: Display current order
console.log('═══════════════════════════════════════════════════════════════════');
console.log('CHECK 3: Current Voter Order (First 10)');
console.log('═══════════════════════════════════════════════════════════════════\n');

voters.slice(0, 10).forEach((voter, i) => {
  const status = voter.serialNumber === (i + 1).toString() ? '✅' : '❌';
  console.log(`${status} Pos ${i + 1}: Serial ${voter.serialNumber}, Part ${voter.partNumber}, ID ${voter.voterId}`);
  console.log(`   ${voter.name}\n`);
});

// Summary
console.log('═══════════════════════════════════════════════════════════════════');
console.log('SUMMARY');
console.log('═══════════════════════════════════════════════════════════════════\n');

const totalIssues = sequenceIssues.length + partNumberIssues.length;

if (totalIssues === 0) {
  console.log('✅ All validation checks passed! Data is correctly ordered.\n');
} else {
  console.log(`❌ Found ${totalIssues} total issues that need correction.\n`);
  console.log('💡 Run: node manual-corrections.js (to fix and sort)\n');
}
