const fs = require('fs');

// Read the W7F3 text file
const w7f3Text = fs.readFileSync('./pdflist/W7F3.txt', 'utf-8');

// Find all voter IDs with their serial numbers
const voterPattern = /(\d+)\s+([A-Z]{3}[A-B]?\d{7})\s+(\d{3}\/\d{3}\/\d{3,4})/g;
const matches = [...w7f3Text.matchAll(voterPattern)];

console.log(`Found ${matches.length} voters with serial numbers in W7F3.txt`);

// Show first 10 and last 10
console.log('\nFirst 10:');
matches.slice(0, 10).forEach(m => {
  console.log(`${m[1].padStart(3)} ${m[2]} ${m[3]}`);
});

console.log('\nLast 10:');
matches.slice(-10).forEach(m => {
  console.log(`${m[1].padStart(3)} ${m[2]} ${m[3]}`);
});

// Check for sequential serials
const serials = matches.map(m => parseInt(m[1])).sort((a, b) => a - b);
console.log(`\nSerial range: ${serials[0]} to ${serials[serials.length - 1]}`);

// Find missing serials
const missing = [];
for (let i = serials[0]; i <= serials[serials.length - 1]; i++) {
  if (!serials.includes(i)) {
    missing.push(i);
  }
}

console.log(`Missing serials: ${missing.length}`);
if (missing.length > 0 && missing.length <= 50) {
  console.log(`Missing: ${missing.join(', ')}`);
}
