const fs = require('fs');

console.log('🔍 Validating and fixing W7F1_voters.csv...\n');

const content = fs.readFileSync('./W7F1_voters.csv', 'utf8');
const lines = content.split('\n');
const header = lines[0];
const dataLines = lines.slice(1).filter(l => l.trim());

const issues = {
  duplicateNames: [],
  wrongGender: [],
  invalidAge: [],
  badNames: [],
  serialFormat: [],
  missingSerial: []
};

const voters = [];
const nameCount = {};
const serialsSeen = new Set();

// Parse CSV
dataLines.forEach((line, idx) => {
  const parts = line.split(',');
  if (parts.length < 7) return;
  
  const voter = {
    lineNum: idx + 2,
    serial: parts[0],
    voterId: parts[1],
    name: parts[2],
    age: parts[3],
    gender: parts[4],
    ward: parts[5],
    booth: parts[6].replace('\r', '')
  };
  
  voters.push(voter);
  
  // Track name frequency
  nameCount[voter.name] = (nameCount[voter.name] || 0) + 1;
  
  // Check serial format
  if (voter.serial.startsWith('0') && voter.serial.length > 1) {
    issues.serialFormat.push({
      line: voter.lineNum,
      serial: voter.serial,
      voterId: voter.voterId
    });
  }
  
  // Check for missing serial
  if (!voter.serial || voter.serial === '') {
    issues.missingSerial.push({
      line: voter.lineNum,
      voterId: voter.voterId
    });
  }
  
  // Check age
  const ageNum = parseInt(voter.age);
  if (isNaN(ageNum) || ageNum < 18 || ageNum > 120) {
    issues.invalidAge.push({
      line: voter.lineNum,
      voterId: voter.voterId,
      age: voter.age
    });
  }
  
  // Check gender
  if (voter.gender !== 'M' && voter.gender !== 'F') {
    issues.wrongGender.push({
      line: voter.lineNum,
      voterId: voter.voterId,
      gender: voter.gender
    });
  }
  
  // Check name quality
  if (voter.name.includes('नांव नांव') || 
      voter.name.includes('[Name missing]') ||
      voter.name.includes('लिंग') ||
      voter.name.includes('वय') ||
      voter.name.length < 3) {
    issues.badNames.push({
      line: voter.lineNum,
      voterId: voter.voterId,
      name: voter.name
    });
  }
});

// Check for duplicate names with different voter IDs
Object.entries(nameCount).forEach(([name, count]) => {
  if (count >= 3) {
    const votersWithName = voters.filter(v => v.name === name);
    issues.duplicateNames.push({
      name: name,
      count: count,
      voters: votersWithName.map(v => v.voterId).join(', ')
    });
  }
});

// Report issues
console.log('📊 VALIDATION RESULTS:\n');
console.log(`✅ Total voters: ${voters.length}`);
console.log(`✅ Unique voter IDs: ${new Set(voters.map(v => v.voterId)).size}`);
console.log(`✅ Unique serials: ${new Set(voters.map(v => v.serial)).size}\n`);

let totalIssues = 0;

if (issues.serialFormat.length > 0) {
  console.log(`⚠️  Serial format issues: ${issues.serialFormat.length}`);
  issues.serialFormat.slice(0, 5).forEach(i => {
    console.log(`   Line ${i.line}: Serial "${i.serial}" should be "${parseInt(i.serial)}" (${i.voterId})`);
  });
  if (issues.serialFormat.length > 5) console.log(`   ... and ${issues.serialFormat.length - 5} more`);
  console.log();
  totalIssues += issues.serialFormat.length;
}

if (issues.duplicateNames.length > 0) {
  console.log(`⚠️  Duplicate names (3+ times): ${issues.duplicateNames.length}`);
  issues.duplicateNames.slice(0, 5).forEach(i => {
    console.log(`   "${i.name}" appears ${i.count} times`);
    console.log(`      IDs: ${i.voters}`);
  });
  if (issues.duplicateNames.length > 5) console.log(`   ... and ${issues.duplicateNames.length - 5} more`);
  console.log();
  totalIssues += issues.duplicateNames.length;
}

if (issues.wrongGender.length > 0) {
  console.log(`❌ Wrong gender values: ${issues.wrongGender.length}`);
  issues.wrongGender.forEach(i => {
    console.log(`   Line ${i.line}: "${i.gender}" (${i.voterId})`);
  });
  console.log();
  totalIssues += issues.wrongGender.length;
}

if (issues.invalidAge.length > 0) {
  console.log(`❌ Invalid ages: ${issues.invalidAge.length}`);
  issues.invalidAge.slice(0, 10).forEach(i => {
    console.log(`   Line ${i.line}: Age "${i.age}" (${i.voterId})`);
  });
  if (issues.invalidAge.length > 10) console.log(`   ... and ${issues.invalidAge.length - 10} more`);
  console.log();
  totalIssues += issues.invalidAge.length;
}

if (issues.badNames.length > 0) {
  console.log(`❌ Bad name quality: ${issues.badNames.length}`);
  issues.badNames.slice(0, 10).forEach(i => {
    console.log(`   Line ${i.line}: "${i.name.substring(0, 50)}" (${i.voterId})`);
  });
  if (issues.badNames.length > 10) console.log(`   ... and ${issues.badNames.length - 10} more`);
  console.log();
  totalIssues += issues.badNames.length;
}

if (issues.missingSerial.length > 0) {
  console.log(`❌ Missing serials: ${issues.missingSerial.length}`);
  issues.missingSerial.forEach(i => {
    console.log(`   Line ${i.line}: (${i.voterId})`);
  });
  console.log();
  totalIssues += issues.missingSerial.length;
}

if (totalIssues === 0) {
  console.log('✅ No issues found! CSV is clean.\n');
} else {
  console.log(`\n🔧 FIXING ${totalIssues} issues...\n`);
  
  // Fix serial format (remove leading zeros)
  voters.forEach(v => {
    if (v.serial.startsWith('0') && v.serial.length > 1) {
      v.serial = parseInt(v.serial).toString();
    }
  });
  
  // Sort by serial number
  voters.sort((a, b) => parseInt(a.serial) - parseInt(b.serial));
  
  // Generate fixed CSV
  let fixedCsv = header + '\n';
  voters.forEach(v => {
    const escapedName = v.name.replace(/"/g, '""');
    const nameField = escapedName.includes(',') ? `"${escapedName}"` : escapedName;
    fixedCsv += `${v.serial},${v.voterId},${nameField},${v.age},${v.gender},${v.ward},${v.booth}\n`;
  });
  
  // Save fixed file
  fs.writeFileSync('./W7F1_voters_fixed.csv', '\ufeff' + fixedCsv, 'utf8');
  
  console.log('✅ Fixed CSV saved as W7F1_voters_fixed.csv');
  console.log('   - Serial format corrected (removed leading zeros)');
  console.log('   - Sorted by serial number');
  console.log();
  
  // Save issues report
  fs.writeFileSync('./csv-validation-report.json', JSON.stringify(issues, null, 2));
  console.log('📋 Detailed report saved as csv-validation-report.json\n');
}

// Gender analysis
const maleVoters = voters.filter(v => v.gender === 'M').length;
const femaleVoters = voters.filter(v => v.gender === 'F').length;
console.log('📊 STATISTICS:');
console.log(`   Male voters: ${maleVoters} (${((maleVoters/voters.length)*100).toFixed(1)}%)`);
console.log(`   Female voters: ${femaleVoters} (${((femaleVoters/voters.length)*100).toFixed(1)}%)`);
console.log(`   Age range: ${Math.min(...voters.map(v => parseInt(v.age)))} - ${Math.max(...voters.map(v => parseInt(v.age)))}`);
console.log(`   Average age: ${(voters.reduce((sum, v) => sum + parseInt(v.age), 0) / voters.length).toFixed(1)} years\n`);

console.log('💡 RECOMMENDATIONS:');
if (issues.duplicateNames.length > 0) {
  console.log('   ⚠️  Multiple voters have identical names - this is NORMAL');
  console.log('      (Different people can have same name, voter ID is unique)');
}
if (issues.badNames.length > 0) {
  console.log('   ❌ Some names need manual correction in Excel');
  console.log('      Open W7F1_voters_fixed.csv and search for:');
  console.log('      - "नांव नांव" (means "name name")');
  console.log('      - "[Name missing]"');
  console.log('      - Names with "लिंग" or "वय" (metadata leaked in)');
}
console.log();
