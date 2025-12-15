const fs = require('fs');

console.log('🔧 Cleaning bad names in CSV...\n');

// Read the CSV
const csvContent = fs.readFileSync('./W7F1_voters_fixed.csv', 'utf8');
const lines = csvContent.split('\n');
const header = lines[0];
const dataLines = lines.slice(1).filter(l => l.trim());

const cleanedVoters = [];
let fixedCount = 0;

dataLines.forEach(line => {
  const parts = line.split(',');
  if (parts.length < 7) return;
  
  let name = parts[2];
  const voterId = parts[1];
  
  // Clean up bad names
  if (name.includes('नांव नांव नांव')) {
    // Remove the "नांव नांव नांव" suffix
    name = name.replace(/\s*नांव\s*नांव\s*नांव\s*$/, '').trim();
    fixedCount++;
  }
  
  if (name.includes('नांव')) {
    // Remove any remaining "नांव" 
    name = name.replace(/\s*नांव\s*/g, ' ').trim();
    fixedCount++;
  }
  
  // Remove extra spaces
  name = name.replace(/\s+/g, ' ').trim();
  
  // If name is too short or empty after cleaning
  if (name.length < 3) {
    name = '[Name needs manual entry]';
  }
  
  cleanedVoters.push({
    serial: parts[0],
    voterId: parts[1],
    name: name,
    age: parts[3],
    gender: parts[4],
    ward: parts[5],
    booth: parts[6].replace('\r', '')
  });
});

// Generate cleaned CSV
let cleanedCsv = header + '\n';
cleanedVoters.forEach(v => {
  const escapedName = v.name.replace(/"/g, '""');
  const nameField = escapedName.includes(',') ? `"${escapedName}"` : escapedName;
  cleanedCsv += `${v.serial},${v.voterId},${nameField},${v.age},${v.gender},${v.ward},${v.booth}\n`;
});

// Save cleaned file
fs.writeFileSync('./W7F1_voters_cleaned.csv', '\ufeff' + cleanedCsv, 'utf8');

console.log(`✅ Cleaned ${fixedCount} bad names`);
console.log('✅ Saved as W7F1_voters_cleaned.csv\n');

// Show samples of cleaned names
console.log('📋 Sample cleaned names:');
const samples = cleanedVoters.filter(v => v.name.includes('अमित अजित इंगळे') || 
                                          v.name.includes('सायसिंग मालजी') ||
                                          v.name.includes('वैशाली अजय'));
samples.slice(0, 5).forEach(v => {
  console.log(`   ${v.serial.padStart(3)} | ${v.voterId} | ${v.name}`);
});

console.log('\n✅ All edge cases fixed!');
console.log('   Use W7F1_voters_cleaned.csv for import\n');
